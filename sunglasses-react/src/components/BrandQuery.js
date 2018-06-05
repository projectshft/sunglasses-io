import _ from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchProductsByBrand, postToCart } from "../actions"


class BrandQuery extends Component {

  componentDidMount() {
    this.props.fetchProductsByBrand(this.props.match.params.id)
  }

  addCartHandler(id) {
    console.log(id)
    if (this.props.token){
      this.props.postToCart(id, this.props.token)
    } else {
      alert('please sign in to add to cart')
    }

  }

  renderProductsByBrand() {
    return _.map(this.props.products, product => {

      return (
        <div className="col-sm-6 product-name item" key={product.id}>
          <div className = "col-sm-12 pt-3">
              <Link className="text-white" to={`/product/${product.id}`}>
                {product.name}
              </Link>
          </div>

          <div className = "col-sm-12">
              <img className = "glasses-image" alt = "sunglasses" src = {product.imageUrls[0]}/>
          </div>

          <div className="py-1 pb-3 ">
            <button className="btn add-to-cart"
            value = {product.id}
            onClick = {(e) => {
              e.preventDefault()
              this.addCartHandler(e.target.value)
            }}
            > Add to Cart </button>
          </div>
        </div>
      );
    });
  }

  render() {
// FIXME: SEARCH ALL PRODUCTS needs it's own COMPONENT
    return(
      <div>

        <h3 className='text-center py-1'>Products by Brand</h3>
        <ul className="text-center row">
          {this.renderProductsByBrand()}
        </ul>

      </div>
    )
  }
}

function mapStateToProps(state) {
  // console.log(state)
  return {products: state.products, token: state.token};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchProductsByBrand, postToCart}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BrandQuery);
