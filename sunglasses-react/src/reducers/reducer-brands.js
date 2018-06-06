import _ from "lodash";

import {
  FETCH_BRANDS,
} from "../actions";

export default function(state = {}, action) {

  switch (action.type) {

    case FETCH_BRANDS:
      return _.mapKeys(action.payload.data, "id");

    default:
      return state;
  }

}
