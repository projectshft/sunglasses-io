import {
  POST_LOGIN,
  POST_LOGOUT
} from "../actions";

export default function(state = '', action) {

  switch (action.type) {

    case POST_LOGIN:
      return action.payload

    case POST_LOGOUT:
      return null;

    default:
      return state;
  }

}
