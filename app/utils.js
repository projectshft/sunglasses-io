//function to help find a given state object (product, brand)
const findProductOrBrand = (objId, state) => {
   const item = state.find(obj => obj.id === objId);
   return !item ? null : item;
};

//function to help find products with an array of query terms
const findProductsByQueryTerms = (queryArray, products) => {
   let productsToReturn = [];

   queryArray.forEach(queryTerm => {
      //build array of products to match one query term
      let queryTermArray = products.filter(product => (product.name.includes(queryTerm) || product.description.includes(queryTerm)));
      
      //check each item in array for existence in return array to avoid duplicate products
      queryTermArray.forEach(product =>{
         if (!productsToReturn.includes(product)){
            productsToReturn = [...productsToReturn, product];
         }
      })
    })
    return productsToReturn
 }
 
 module.exports = {
   findProductOrBrand,
   findProductsByQueryTerms
 };