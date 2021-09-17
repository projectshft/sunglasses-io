let brands = [
  {
      "id": "1",
      "name" : "Oakley"
  },
  {
      "id": "2",
      "name" : "Ray Ban"
  },
  {
      "id": "3",
      "name" : "Levi's"
  },
  {
      "id": "4",
      "name" : "DKNY"
  },
  {
      "id": "5",
      "name" : "Burberry"
  }
];

let products = [
  {
      "id": "1",
      "categoryId": "1",
      "name": "Superglasses",
      "description": "The best glasses in the world",
      "price":150,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "2",
      "categoryId": "1",
      "name": "Black Sunglasses",
      "description": "The best glasses in the world",
      "price":100,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "3",
      "categoryId": "1",
      "name": "Brown Sunglasses",
      "description": "The best glasses in the world",
      "price":50,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "4",
      "categoryId": "2",
      "name": "Better glasses",
      "description": "The best glasses in the world",
      "price":1500,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "5",
      "categoryId": "2",
      "name": "Glasses",
      "description": "The most normal glasses in the world",
      "price":150,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "6",
      "categoryId": "3",
      "name": "glas",
      "description": "Pretty awful glasses",
      "price":10,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "7",
      "categoryId": "3",
      "name": "QDogs Glasses",
      "description": "They bark",
      "price":1500,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "8",
      "categoryId": "4",
      "name": "Coke cans",
      "description": "The thickest glasses in the world",
      "price":110,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "9",
      "categoryId": "4",
      "name": "Sugar",
      "description": "The sweetest glasses in the world",
      "price":125,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "10",
      "categoryId": "5",
      "name": "Peanut Butter",
      "description": "The stickiest glasses in the world",
      "price":103,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
      "id": "11",
      "categoryId": "5",
      "name": "Habanero",
      "description": "The spiciest glasses in the world",
      "price":153,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  }
]

class Brand {
  constructor(params) {
    Object.assign(this,params);
  }

  // Return all brand names
  static getAll() {
    let allBrands = brands.map(b => {
      return b.name;
    })
    return allBrands
  };

  // Return products for a specific brand
  static getBrandProd(id) {
    // check if brand ID matches categoryId for any products
    // if it does, pass it into next func
    const checkId = (id => {
      products.filter(function(p) {
        if (p.categoryId !== id) {
          console.log('false');
          return false; // skip and tell our server the brand does not exist.
        } return true;
              }).map((p) => {
                console.log('true');
                return p;
              })   
    });
    checkId(id);
  };
    // let foundBrands = brands.find(b => b.id == reqBrandId);
    // const foundProducts = products.filter(function(p) {
    //   if (p.categoryId !== id) {
    //     return false; // skip
    //   } return true;
    //     }).map((p) => {
    //       return p;
    // })
    // return foundProducts;
    
  
  // Return all products regardless of brand
  static getAllProd() {
    return products
  }
}

module.exports = Brand;

 // let brandId = brand.id;
    // .find only returns the first element that matches
    // let brandProducts = products.find(p => p.categoryId == brandId);
    // use .map instead?