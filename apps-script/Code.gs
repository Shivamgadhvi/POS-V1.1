// ── ShivAnkita's POS → Google Sheet backend (v2) ─────────────────────────
// Paste this whole file into Extensions → Apps Script (replacing the default
// code), then deploy as a Web App. See README.md for full setup steps.
//
// Orders only reach this script once — at the moment you mark them
// "Delivered" in the app (after payment is collected). So this only ever
// needs to INSERT a row, never update one.
//
// Expects two tabs in this spreadsheet, with these exact header rows:
//
// "Orders":
//   OrderID | Timestamp | Date | Time | Weekday | Name | Phone | ItemCount |
//   Subtotal | IceCreamRevenue | Discount | Total | AmountCollected |
//   PaymentMethod | Status | ClientOrderId
//
// "OrderItems":
//   OrderID | Timestamp | ItemID | ItemName | Category | Qty | UnitPrice |
//   IceCreamScoops | LineTotal

const ORDERS_SHEET = 'Orders'
const ITEMS_SHEET = 'OrderItems'
const TIMEZONE = 'Asia/Kolkata'
const ORDERS_COLUMN_COUNT = 16
const DEDUPE_LOOKBACK_ROWS = 50 // how far back to check for a repeated submit

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const data = JSON.parse(e.postData.contents)
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const ordersSheet = ss.getSheetByName(ORDERS_SHEET)
    const itemsSheet = ss.getSheetByName(ITEMS_SHEET)

    // If this exact order was already written (e.g. the client retried after
    // a timeout), return the existing OrderID instead of writing it twice.
    const existingId = findExistingOrderId(ordersSheet, data.clientOrderId)
    if (existingId) {
      return jsonResponse({ status: 'success', orderId: existingId, duplicate: true })
    }

    const orderId = getNextOrderId(ordersSheet)
    const now = new Date() // actual real-world timestamp, not shifted to a "business day"

    ordersSheet.appendRow([
      orderId,
      now,
      Utilities.formatDate(now, TIMEZONE, 'yyyy-MM-dd'),
      Utilities.formatDate(now, TIMEZONE, 'HH:mm'),
      Utilities.formatDate(now, TIMEZONE, 'EEEE'),
      data.name || 'Walk-in',
      data.phone || '',
      data.itemCount,
      data.subtotal,
      data.iceCreamRevenue,
      data.discount || 0,
      data.total,
      data.amountCollected,
      data.paymentMethod || '',
      'Delivered',
      data.clientOrderId,
    ])

    ;(data.items || []).forEach(function (item) {
      itemsSheet.appendRow([
        orderId,
        now,
        item.itemId,
        item.itemName,
        item.category,
        item.qty,
        item.unitPrice,
        item.iceCreamScoops || 0,
        item.lineTotal,
      ])
    })

    return jsonResponse({ status: 'success', orderId: orderId })
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err) })
  } finally {
    lock.releaseLock()
  }
}

function getNextOrderId(sheet) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return 1 // only the header row exists so far
  const lastId = sheet.getRange(lastRow, 1).getValue()
  return Number(lastId) + 1
}

function findExistingOrderId(sheet, clientOrderId) {
  if (!clientOrderId) return null
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return null
  const rowsToCheck = Math.min(DEDUPE_LOOKBACK_ROWS, lastRow - 1)
  const startRow = lastRow - rowsToCheck + 1
  const values = sheet.getRange(startRow, 1, rowsToCheck, ORDERS_COLUMN_COUNT).getValues()
  const clientIdCol = ORDERS_COLUMN_COUNT - 1 // 0-indexed: last column
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][clientIdCol] === clientOrderId) return values[i][0]
  }
  return null
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
