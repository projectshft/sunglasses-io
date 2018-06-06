import axios from "axios";

export const FETCH_BRANDS = "fetch_brands";
export const FETCH_PRODUCTS_BY_BRAND = "fetch_products_by_brand";
export const FETCH_PRODUCTS = "fetch_products";
export const POST_LOGIN = "post_login";
export const FETCH_CART = "fetch_cart";
export const POST_TO_CART = "post_to_cart";
export const POST_CART_QUANTITY = "post_cart_quantity";
export const DELETE_CART_ITEM = "delete_cart_item";
export const POST_LOGOUT = "post_logout";


const ROOT_URL = "http://localhost:3001/api";

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

export function fetchBrands(){

  const request = axios.get(`${ROOT_URL}/brands/`)

  console.log(request)
  return {
    type: FETCH_BRANDS,
    payload: request,

  };
}

export function fetchProductsByBrand(id){
  const request = axios.get(`${ROOT_URL}/brands/${id}/products`)

  console.log(request)
  return {
    type: FETCH_PRODUCTS_BY_BRAND,
    payload: request,

  };
}

export function fetchProducts(){

  const request = axios.get(`${ROOT_URL}/products/`)

  console.log(request)
  return {
    type: FETCH_PRODUCTS,
    payload: request,

  };
}

export function postLogin(loginData){

  const request = fetch('http://localhost:3001/api/login', {
		method: 'POST',
		body: JSON.stringify(loginData),
	  headers: {
			'content-type': 'application/json'
	  }
	})
  .then(handleErrors)
  .then(response => {
    return response.ok ? response.json() : response.statusText
  })
  .then(data => {
    return data
  })
  .catch(err => null)

  console.log(request)
  return {
    type: POST_LOGIN,
    payload: request,
  };
}

// TODO:
// export function userLogin(loginData, token){
//   return function(dispatch) {
//     Promise.all([
//       postLogin(loginData),
//       fetchCart(token)
//     ])
//   }
// }

export function fetchCart(token){

  const request = axios.get(`${ROOT_URL}/me/cart?accessToken=${token}`)

  console.log(request)
  return {
    type: FETCH_CART,
    payload: request,

  };
}

export function postToCart(id, token){

  const request = fetch(`http://localhost:3001/api/me/cart?accessToken=${token}`, {
		method: 'POST',
		body: JSON.stringify({productId: id}),
	  headers: {
			'content-type': 'application/json'
	  }
	})
  .then(response => {
  return response.ok ? response.json() : response.statusText
  })
  .then(data => {
    console.log(data)
    return data
  })
  .catch(err => null)

  console.log(request)

  return {
    type: POST_TO_CART,
    payload: request,
  };
}

export function postCartQuantity(cartData, token){
  // console.log(cartData)
  const request = fetch(`http://localhost:3001/api/me/cart/${cartData.productId}?accessToken=${token}`, {
		method: 'POST',
		body: JSON.stringify(cartData),
	  headers: {
			'content-type': 'application/json'
	  }
	})
  .then(response => {
  return response.ok ? response.json() : response.statusText
  })
  .then(data => {
    console.log(data)
    return data
  })

  console.log(request)

  return {
    type: POST_CART_QUANTITY,
    payload: request,
  };
}

export function deleteItemfromCart(cartData, token){

  const request = fetch(`http://localhost:3001/api/me/cart/${cartData.productId}?accessToken=${token}`, {
		method: 'DELETE',
		body: JSON.stringify(cartData),
	  headers: {
			'content-type': 'application/json'
	  }
	})
  .then(response => {
  return response.ok ? response.json() : response.statusText
  })
  .then(data => {
    console.log(data)
    return data
  })

  console.log(request)

  return {
    type: DELETE_CART_ITEM,
    payload: request,
  };
}

export function postLogout(token){

  const request = fetch(`http://localhost:3001/api/logout?accessToken=${token}`, {
		method: 'POST',
	  headers: {
			'content-type': 'application/json'
	  }
	})
  .then(response => {
    return response.ok ? response.json() : response.statusText
  })
  .then(data => {
    return data
  })

  console.log(request)

  return {
    type: POST_LOGOUT,
    payload: request,
  };
}
