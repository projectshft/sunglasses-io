import _ from "lodash";
import React, { Component } from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { postCartQuantity, deleteItemfromCart } from "../actions"


class Cart extends Component {


  handleQuantity (id, quantity) {
    if (quantity > 0){
      let data = {
        productId: id,
        quantity: quantity
      }

      this.props.postCartQuantity(data, this.props.token)
    }
  }

  handleDelete (id) {
    let data = {
      productId: id,
    }

    this.props.deleteItemfromCart(data, this.props.token)
  }


  renderCart() {

    return _.map(this.props.cart, cartItem => {

      return (
        <div className="list-group-item" id={"cartItem"+cartItem.id} key={cartItem.id}>
          <li>
            <p>{cartItem.product.name}</p>
          </li>
          <li>
              <p>$ {cartItem.product.price}</p>
          </li>
          <li>
            <p>quantity: {cartItem.amount}</p>
          </li>
          <li>
            Quantity
            <input type = "number" step="1"
            className ="input-quantity"/>

            <button className="submit-quanity" value={cartItem.id}
            onClick = {(e) => {
              e.preventDefault()
              let el = document.getElementById('cartItem'+cartItem.id).getElementsByClassName('input-quantity')
              this.handleQuantity(cartItem.id, el[0].value)}}
            > Submit Quantity </button>
          </li>
          <li>
            <button className = "submit-quanity"
            onClick = {(e) => {
              e.preventDefault()
              this.handleDelete(cartItem.id)}}
            > Delete Item </button>
          </li>
        </div>

      );
    });
  }


  render() {

    if(this.props.cart){
      return (
        <ul>
          {this.renderCart()}
        </ul>
      )

    } else {
      return (
        <li>
          No items in cart
        </li>
      )
    }
  }
}

function mapStateToProps(state) {

  return {cart: state.cart, token: state.token};
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({ postCartQuantity, deleteItemfromCart }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Cart);
