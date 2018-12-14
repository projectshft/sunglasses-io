//function to help find a given state object (product, brand)
const findProductOrBrand = (objId, state) => {
   const item = state.find(obj => obj.id === objId);
   return !item ? null : item;
 };
 
 module.exports = {
   findProductOrBrand
 };