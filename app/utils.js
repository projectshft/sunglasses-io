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


 //function to parse token from query parameter, check for valid and current token, and finally returns the current token (or null if not found)
 const getValidTokenFromRequest = (request, accessTokens) => {
   const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

   var parsedUrl = require('url').parse(request.url,true)
   if (parsedUrl.query.accessToken) {
     // Verify the access token to make sure it's valid and not expired
     let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
    });
     if (currentAccessToken) {
       return currentAccessToken;
     } else {
       return null;
     }
   } else {
     return null;
   }
 }
 
 module.exports = {
   findProductOrBrand,
   findProductsByQueryTerms,
   getValidTokenFromRequest
 };