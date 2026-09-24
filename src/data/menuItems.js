// Edit this file to update your menu — prices, taglines, and items.
// Add a photo later by setting "image" to a path like "/images/classic-brownie.jpg"
// and dropping the matching file into the public/images folder.
// If "image" is left blank, the app automatically shows a category icon instead.
// "iceCream: true" means a scoop can be added to that item at the stall.

export const ICE_CREAM_PRICE = 30

export const categories = [
  {
    id: 'sizzling',
    name: 'Sizzling Brownies',
    icon: 'flame',
    items: [
      { id: 'classic-brownie', name: 'Classic Brownie', tagline: 'Picture abhi baki hai... aur Brownie bhi', price: 99, image: '', iceCream: true },
      { id: 'oreo-crunch', name: 'Oreo Crunch', tagline: 'Bade bade desserts mein aisi choto choti crunch hoti rehti hai', price: 109, image: '', iceCream: true },
      { id: 'choco-blast', name: 'Choco Blast', tagline: 'Yeh chocolate muje de de... THAKUR', price: 119, image: '', iceCream: true },
      { id: 'nutty-royale', name: 'Nutty Royale', tagline: 'Ek bite ki kimaat tum kya jano', price: 129, image: '', iceCream: true },
      { id: 'kitkat-crackle', name: 'KitKat Crackle', tagline: 'Break to banta hai... aur yeh wala zaroor', price: 139, image: '', iceCream: true },
      { id: 'double-decker', name: 'Double Decker', tagline: 'Uthale re baba... heavy hai', price: 149, image: '', iceCream: true },
      { id: 'biscoff-bliss', name: 'Biscoff Bliss', tagline: 'Dil garden - garden ho gaya', price: 149, image: '', iceCream: true },
    ],
  },
  {
    id: 'spreads',
    name: 'Brownies with Spreads',
    icon: 'sandwich',
    items: [
      { id: 'nutella-nirvana', name: 'Nutella Nirvana', tagline: 'All izz well... jab Nutella ho', price: 79, image: '', iceCream: true },
      { id: 'biscoff-royale', name: 'Biscoff Royale', tagline: 'Mogambo kush hua!', price: 79, image: '', iceCream: true },
      { id: 'kunafa-fusion', name: 'Kunafa Fusion', tagline: 'Naam to suna hi hoga... taste yaad rahega', price: 79, image: '', iceCream: true },
      { id: 'choco-3000', name: 'Choco 3000', tagline: 'Kabhi kabhi lagta hai Apun hi dessert hai...', price: 99, image: '', iceCream: true },
    ],
  },
  {
    id: 'bowls',
    name: 'Brownie Bowls',
    icon: 'soup',
    items: [
      { id: 'choco-triple-treat', name: 'Choco Triple Treat', tagline: 'Bowl ki yaad nahi ayi tuje Jassi', price: 169, image: '', iceCream: true },
      { id: 'biscoff-oreo-delight', name: 'Biscoff-Oreo Delight', tagline: 'Sethji itna kharcha ho gaya hai, to ek bowl le lete hai', price: 179, image: '', iceCream: true },
      { id: 'ferrero-fantasy', name: 'Ferrero Fantasy', tagline: 'Jhukega nahi Ferrero!', price: 199, image: '', iceCream: true },
      { id: 'choco-brownie-cup', name: 'Choco Brownie Cup', tagline: 'Chota Packet Bada Dhamaka', price: 109, image: '', iceCream: true },
    ],
  },
  {
    id: 'cookies',
    name: 'Cookies Tin',
    icon: 'cookie',
    items: [
      { id: 'viral-cookies-tin', name: 'Viral Cookies Tin', tagline: 'Cookies abhi baaki hai mere dost', price: 199, image: '', iceCream: true },
    ],
  },
  {
    id: 'bites',
    name: 'Brownie Bites',
    icon: 'cake',
    items: [
      { id: 'brownie-bites', name: 'Brownie Bites', tagline: 'Shuru majboori mein kiye the... ab maza aa raha hai', price: 149, image: '', iceCream: true },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Order',
    icon: 'plus',
    items: [],
  },
]

// Flat lookup maps, built once, used throughout the app so components
// don't need to search through `categories` every time.
export const allItems = {}
export const itemCategoryName = {}
categories.forEach((c) => {
  c.items.forEach((it) => {
    allItems[it.id] = it
    itemCategoryName[it.id] = c.name
  })
})
