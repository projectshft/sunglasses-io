import {
  POST_LOGIN,
  POST_LOGOUT
} from "../actions";

export default function(state = '', action) {

  if(action.payload){
    console.log(action.payload.message)
  }

  switch (action.type) {

    case POST_LOGIN:
      console.log(action.payload)
      return action.payload

    case POST_LOGOUT:
      return null;

    default:
      return state;
  }

}
