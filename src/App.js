import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cart from './components/Cart/Cart';
import Layout from './components/Layout/Layout';
import Products from './components/Shop/Products';
import Notification from './components/UI/Notification';
import { sendCartData, fetchCartData } from './store/cart-actions';

let isInitial = true;

// switching order of operations
// first do work on frontend and let redux update the store via reducers
// then send the request to the server

export default function App() {
  const dispatch = useDispatch();
  const showCart = useSelector(state => state.ui.cartIsVisible);
  const notification = useSelector(state => state.ui.notification);
  // access overall cart by using useSelector and listening for changes to cart state
  // whenever cart state does change, send an http request
  // -- useSelector automaticallly sets up subscription to redux store
  const cart = useSelector(state => state.cart);

  useEffect(() => {
    dispatch(fetchCartData());
  }, [dispatch]);

  // use useEffect to listen for changes - runs whenever a dependency changes
  // PUT - will override existing data instead of storing new data in a list (POST)
  useEffect(() => {
    if (isInitial) {
      isInitial = false;
      return;
    }
    // When this is dispatched:
    // -- redux will execute the sendCartData() function for us
    // -- all our other actions will be dispatched & http request will be sent
    if (cart.changed) {
      dispatch(sendCartData(cart));
    }
  }, [cart, dispatch]);

  return (
    <>
      {notification && (
        <Notification
          status={notification.status}
          title={notification.title}
          message={notification.message}
        />
      )}
      <Layout>
        {showCart && <Cart />}
        <Products />
      </Layout>
    </>
  );
}
