import _ from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchBrands, fetchProductsByBrand } from "../actions"


class Brands extends Component {

  componentDidMount() {
    this.props.fetchBrands()
  }

  clickHandler (id) {
    this.props.fetchProductsByBrand(id)
  }

  renderBrands() {

    return _.map(this.props.brands, brand => {

      return (
        <li className="side-nav-item side-nav-buttons" key={brand.id}>
          <Link className="text-white" to={`/brand/${brand.id}`}>
            <button onClick = {() => this.clickHandler(brand.id)}
            className="side-nav-buttons btn text-white">
              {brand.name}
            </button>
          </Link>
        </li>
      );
    });
  }

  render() {
    // console.log(this.props)
    // TODO: render DOM that will contain an element that calls renderCharacters().
    return(
      <div>
      <div className="text-xs-right">
      </div>
        <h3 className='text-white text-center py-2'>Brands</h3>

        <ul className="list-group text-center">
          {this.renderBrands()}
        </ul>

        <div className="bottom-padding">

        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  // console.log(state)
  return {brands: state.brands};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchBrands, fetchProductsByBrand}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Brands);
