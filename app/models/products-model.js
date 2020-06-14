let productsArray = [
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

class Products {
  constructor(params) {
    Object.assign(this, params);
  }

  static getAllProducts() {
    return productsArray;
  }

  static removeAllProducts() {
    productsArray = [];
  }

  static getProductsByBrandId(brandId) {
    const resultsArray = [];
    productsArray.forEach(product => {
      if (brandId == product.categoryId) {
        resultsArray.push(product);
      }
    })
    return resultsArray;
  }

  static searchProductsByQuery(queryString, brandId) {
    let query = queryString.toLowerCase();
    const resultsArray = [];
    productsArray.forEach(product => {
      if (product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query) || product.categoryId == brandId) {
        resultsArray.push(product);
      }
    })
    return resultsArray;

  }
}

module.exports = Products;