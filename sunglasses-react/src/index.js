import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import promise from "redux-promise";
import reducers from "./reducers";

import Header from './components/Header.js';
import BrandQuery from './components/BrandQuery.js';
import Brands from './components/Brands.js';
import Cart from './components/Cart.js';

import './index.css'
import 'bootstrap/dist/css/bootstrap.css'


const createStoreWithMiddleware = applyMiddleware(promise)(createStore);


const Home = () => (

  <div>
  <div className="">HOME</div>
  </div>
)


const Main = () => (
  <div className="main-sizing">
    <div className = "row">

      <div className ="col-md-9 py-2 products-background">
        <Switch>
          <Route path='/' component={BrandQuery}/>
        </Switch>
      </div>

      <div className = "col-md-3 py-3">
        <h3 className='text-center py-1'>Cart</h3>
        <ul className="list-group text-center">
        <Cart />
        </ul>
      </div>

    </div>
  </div>
)

const SideNav = () => (

  <div className= "">

  <Switch>
    <Route exact path='/' component={Brands}/>
    <Route path='/brand' component={Brands}/>
    <Route path='/me/cart' component={Cart}/>
  </Switch>

  </div>
)


ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <BrowserRouter>
      <div className = "bg-gray">
        <header className="App-header">
          <Header />
        </header>
        <div className = "container-fluid">
          <div className = "row">
            <div className="side-nav pt-1">
              <SideNav />
            </div>
            <Main />
          </div>
        </div>
      </div>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
