import { combineReducers } from "redux";
import brandsReducer from "./reducer-brands";
import productsReducer from "./reducer-products";
import loginReducer from "./reducer-login";
import cartReducer from "./reducer-cart";


const rootReducer = combineReducers({
  brands: brandsReducer,
  products: productsReducer,
  token: loginReducer,
  cart: cartReducer,
});

export default rootReducer;
