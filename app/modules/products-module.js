
class Products {
  constructor(params) {
    Object.assign(this, params);
  }

  static getAllProducts(productsArray) {
    return productsArray;
  }

  static removeAllProducts() {
    productsArray = [];
  }

  static findProductById(productsArray, id) {
    return productsArray.find((product => product.id == id))
  }

  static getProductsByBrandId(brandId, productsArray) {
    const resultsArray = [];
    productsArray.forEach(product => {
      if (brandId == product.categoryId) {
        resultsArray.push(product);
      }
    })
    return resultsArray;
  }

  //searches the products name and description properties for a match from the query. We also searched the brands array with the same query and if a brand was found we include the id here. This way we can get matches from searching both the brands and products and returning any results in one array
  static searchProductsByQuery(queryString, brandId, productsArray) {
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