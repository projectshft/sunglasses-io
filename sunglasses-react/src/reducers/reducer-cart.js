import _ from "lodash";

import {
  FETCH_CART,
  POST_TO_CART,
  POST_CART_QUANTITY,
  DELETE_CART_ITEM,
  POST_LOGOUT
} from "../actions";

export default function(state = '', action) {
  // console.log(action)

  switch (action.type) {

    case FETCH_CART:

      return _.mapKeys(action.payload.data, "id");

    case POST_TO_CART:

      return _.mapKeys(action.payload, "id");

    case POST_CART_QUANTITY:

      return _.mapKeys(action.payload, "id");
    case DELETE_CART_ITEM:

      return _.mapKeys(action.payload, "id");
    case POST_LOGOUT:
      return '';

    default:
      return state;
  }
}
