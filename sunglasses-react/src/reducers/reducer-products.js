import _ from "lodash";

import {
  FETCH_PRODUCTS_BY_BRAND,
  FETCH_PRODUCTS
} from "../actions";

export default function(state = {}, action) {

  if(action.payload){
    console.log(action.payload.message)
  }
  
  switch (action.type) {

    case FETCH_PRODUCTS_BY_BRAND:
      return _.mapKeys(action.payload.data, "id");

    case FETCH_PRODUCTS:
      return _.mapKeys(action.payload.data, "id");

    default:
      return state;
  }

}
