import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import './App.css';

import { postLogin, postLogout, fetchProducts, fetchCart } from "../actions"

class Header extends Component {
  constructor(props){
    super(props)
    this.state = {
  		username: '',
  		password: '',
    	token: '',
    }
    this.loggedIn = false
  }

  clickHandler () {
    const data = {
      username: this.state.username,
      password: this.state.password
    }
    this.props.postLogin(data)
  }

  searchHandler () {
    this.props.fetchProducts()
  }

  handleSignOut () {
    this.loggedIn = false
    this.props.postLogout(this.props.token)


  }

  checkLoginStatus () {
    if (this.loggedIn){
      return (
          <div className ="content-right">
            <button
            onClick = {(e) => {
              e.preventDefault()
              this.handleSignOut()
            }}
            className="login"> Sign Out </button>
          </div>
      )

    } else {
      return (
        <div className ="content-right">
          <input className="login"
            value={this.state.username}
            onChange={event => {
              let username = event.target.value;
              this.setState({username: username})

            }}
            placeholder="Username"/>

            <input className="login" type="password"
              value={this.state.password}
              onChange={event => {
                let password = event.target.value;
                this.setState({password: password})
                // console.log(this.state.password)
              }}
              placeholder="Password"/>

          <button className = "login"
            onClick = {(e) => {
              e.preventDefault()
              this.clickHandler()
            }}
            >Sign in</button>
        </div>

      )
    }
  }


  render() {
    console.log("\nXXXXXXXXXXXXXXXXXXXXXXXX")
    console.log(this.props.brands)
    console.log(this.props.token)
    console.log(this.props.products)
    console.log(this.props.cart)
    console.log(this.loggedIn)
    console.log("XXXXXXXXXXXXXXXXXXXXXXXX\n")
    console.log(Boolean(this.props.token))

    if(Boolean(this.props.token)){
      this.loggedIn = true
      if(Boolean(!this.props.cart)){
        this.props.fetchCart(this.props.token)
      }
    }

    return (
      <div className = "container-fluid">
        <div className = "row">
          <div className = "col-sm-4">
            <Link to={`/`}>
              <h2 className = "text-white">Sunglasses</h2>
            </Link>
          </div>
          <div className = "col-sm-4 image-sunglasses">
            <Link to={`/characterList`}>
              <p className = "text-white">image sunglasses</p>
            </Link>
          </div>

          <div className = "right-options">
            <div className="">
              <h5 className ="text-white text-right"> (054) 775-5585 </h5>
              <p className ="size-10 text-white text-right"> for free deliver, call to order </p>
              <div className = " search-all py-1">
                <button
                className = " search=all"
                onClick = {() => this.searchHandler()}
                >Search All Products</button>

              </div>

            </div>
          </div>
        </div>
        <div className = "row">
          <div className = "col-sm-8 image-sunglasses">

              <button className = "">Shop</button>


              <button className = "">Delivery</button>


              <button className = "">Article</button>

              <button className = "">News</button>

          </div>

            <div className = "col-sm-4 login-options">
            {this.checkLoginStatus()}

            </div>

        </div>
      </div>

    );
  }
}
function mapStateToProps(state) {

  return {token: state.token, cart: state.cart, products: state.products, brands: state.brands};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchProducts, postLogin, postLogout, fetchCart}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
