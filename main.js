
BASEURL = 'http://localhost:3001'

let state = {
	login: {
		username: '',
		password: ''
	},
	token: '',
	cart: [],
	products: [],
	brands: []
}

function userLogin(url, data) {
	return fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => {
			return response.ok ? response.json() : response.statusText
		})
}

$('#submitLoginInfo').on('click', () => {
	state.login.username = $('#username').val()
	state.login.password = $('#password').val()
	userLogin(`${BASEURL}/api/login`, state.login)
		.then(data => {
			state.token = data
		})
		.catch(err => err)
})

function renderCart() {
	const $container = $('.cart')
	if (!state.cart[0]) {
		const showCartButton = `<h6>Your cart is currently empty!</h6><button class="btn btn-primary btn-sm" id="get-cart" onclick="getCart()">Show Cart</button>`
		$('.cart').html(showCartButton)
		return
	}
	const hideCartButton = `<button class="btn btn-primary btn-sm" id="get-cart" onclick="hideCart()">Hide Cart</button>`
	$container.html(hideCartButton)
	const cartItems = state.cart.map((item, index) => {
		return `
				<li class="list-group-item" id="${index}"> ${item.name} - $${item.price}.00 <a class="text-danger" href="#" id="delete-${index}" onclick="deleteItem(${index})"><span class="oi oi-x text-danger ml-4" title="x" aria-hidden="true"></span></a></li>
			`
	})
	cartItems.forEach((item) => $container.append(item))
	const cartPrices = state.cart.map((item) => {
		return item.price
	})
	const cartTotal = cartPrices.reduce((accumulator, item) => accumulator + item)
	$container.append(`<li class="list-group-item"><h5> Total: $${cartTotal}.00</h5></li>`)
	const emptyCartButton = `<button class="btn btn-danger btn-sm" onclick="deleteCart()">Empty Cart</button>`
	$container.append(emptyCartButton)
}

function getCart() {
	let accessToken = state.token
	if (!accessToken) {
		const showCartButton = `<h6>You must login before you can view your cart</h6><button class="btn btn-primary btn-sm" id="get-cart" onclick="getCart()">Show Cart</button>`
		$('.cart').html(showCartButton)
		return
	}
	let url = `${BASEURL}/api/me/cart?accessToken=${accessToken}`
	return fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			state.cart = data
			renderCart()
		})
		.catch(err => console.log(err))
}

function deleteItem(cartIndex) {
	let accessToken = state.token
	const product = state.cart[cartIndex]
	let url = `${BASEURL}/api/me/cart/${product.id}?accessToken=${accessToken}`
	return fetch(url, {
		method: 'DELETE',
		headers: {

		}
	})
		.then(response => response.json())
		.then((data) => {
			getCart()
		})
		.catch(err => console.log(err))
}

function deleteCart() {
	let accessToken = state.token
	let url = `${BASEURL}/api/me/cart?accessToken=${accessToken}`
	return fetch(url, {
		method: 'DELETE',
		headers: {

		}
	})
		.then(response => response.json())
		.then(() => getCart())
		.catch(err => console.log(err))
}

function getProducts() {
	let url = `${BASEURL}/api/products`
	return fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			state.products = data
			renderProducts()
		})
		.catch(err => console.log(err))
}

function getBrands() {
	let url = `${BASEURL}/api/brands`
	return fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			state.brands = data
			renderBrands()
		})
		.catch(err => console.log(err))
}

function renderProducts(brandId) {
	const $brandNameContainer = $('.selected-brand')
	const $container = $('.products')
	let displayBrandName = "All Brands"
	$container.html("")
	let productList = []
	if (!brandId) {
		productList = state.products
	}
	else {
		productList = state.products.filter( product => product.categoryId == brandId )
		displayBrandName = state.brands.find(brand => brand.id==brandId).name
	}
	$brandNameContainer.html(displayBrandName)
	const productCards = productList.map((item, index) => {
		let brandName = state.brands.find(brand => brand.id==item.categoryId).name
		return `
				<div class="col-md-6 mb-3 product-card" id="product-${index}"><div><img class="img-fluid" src="${item.imageUrls[0]}"></div><div class="text-center">${item.name} (${brandName})<button class="btn btn-outline-primary product-item mb-1" onclick="addProductToCart(${item.id})">Add to cart<br>$${item.price}.00</button></div></div>
			`
	})
	productCards.forEach(product => $container.append(product))
}

function renderBrands() {
	const $container = $('.brands')
	const allBrands = `<li class="list-group-item list-group-item-action" id="brand-all"><a href="#" onclick="renderProducts()"> All Brands </a></li>`
	$container.html(allBrands)
	const brandItems = state.brands.map((item, index) => {
		return `
				<li class="list-group-item list-group-item-action" id="brand-${index}"><a href="#" onclick="renderProducts(${item.id})"> ${item.name} </a></li>
			`
	})
	brandItems.forEach((item) => $container.append(item))
}

function hideCart() {
	let $container = $('.cart')
	const showCartButton = `<button class="btn btn-primary btn-sm" id="get-cart" onclick="renderCart()">Show Cart</button>`
	$container.html(showCartButton)
}

function addProductToCart(productId) {
	let accessToken = state.token
	if (!accessToken) {
		const showCartButton = `<h6>You must login before you can add items to the cart</h6><button class="btn btn-primary btn-sm" id="get-cart" onclick="getCart()">Show Cart</button>`
		$('.cart').html(showCartButton)
		return
	}
	let url = `${BASEURL}/api/me/cart/${productId}?accessToken=${accessToken}`
	return fetch(url, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			state.cart = data
			renderCart()
		})
		.catch(err => console.log(err))
}

getBrands()
getProducts()
