BASEURL = 'http://localhost:3001'

let state = {
    login: {
        username: '',
        password: ''
    },
    searchBar: '',
    brands: [],
    products: [],
    cart: []
}
//Button used for search bar
$('$submitSearch').on('click', () => {
    state.searchBar = $('#searchQuery').val()
    setProducts(`${BASEURL}/api/search`, state.searchBar)
        .then(data => {
            state.products = data
            renderProducts(state)
        })
        .catch(err=>err)
    $('#searchQuery').val('')
})

//button used for login
$('#submitLoginInfo')

//button used to add to cart
$(submit)

//button used to checkout
$(submit)

//button to add me to list to subscribe
$(submit)
