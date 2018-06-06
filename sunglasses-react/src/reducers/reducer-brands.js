import _ from "lodash";

import {
  FETCH_BRANDS,
} from "../actions";

export default function(state = {}, action) {
  
  if(action.payload){
    console.log(action.payload.message)
  }

  switch (action.type) {

    case FETCH_BRANDS:
      return _.mapKeys(action.payload.data, "id");

    default:
      return state;
  }

}
