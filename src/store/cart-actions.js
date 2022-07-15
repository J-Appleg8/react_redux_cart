import { uiActions } from './ui-slice';
import { cartActions } from './cart-slice';

////////////////////////////////////////////////////////////////////////////////
// Custom Action Creator: fetchCartData()
export function fetchCartData() {
  return async dispatch => {
    const fetchData = async () => {
      const response = await fetch(
        'https://react-http-d8501-default-rtdb.firebaseio.com/cart.json'
      );
      // checking for error
      if (!response.ok) {
        throw new Error('Could not fetch cart data!');
      }

      const data = await response.json();

      return data;
    };

    try {
      const cartData = await fetchData();
      dispatch(
        cartActions.replaceCart({
          items: cartData.items || [],
          totalQuantity: cartData.totalQuantity,
        })
      );
    } catch (error) {
      dispatch(
        uiActions.showNotification({
          status: 'error',
          title: 'Error!',
          message: 'Fetching cart data failed!',
        })
      );
    }
  };
}

////////////////////////////////////////////////////////////////////////////////
// Custom Action Creator: sendCartData()
export function sendCartData(cart) {
  // return { type: '', payload: ... } // What is normally provided as actions
  return async dispatch => {
    // before dispatching, we can use async/side-effect code - reducer hasnt been called yet
    dispatch(
      uiActions.showNotification({
        status: 'pending',
        title: 'Sending',
        message: 'Sending cart data',
      })
    );
    // sending async http request to server
    const sendRequest = async () => {
      const response = await fetch(
        'https://react-http-d8501-default-rtdb.firebaseio.com/cart.json',
        {
          method: 'PUT',
          body: JSON.stringify({ items: cart.items, totalQuantity: cart.totalQuantity }),
        }
      );
      // checking for error
      if (!response.ok) {
        throw new Error('Sending cart data failed');
      }
    };
    // can use await because this is still under `async dispatch`
    // dispatching the action that we want to perform
    try {
      await sendRequest();
      dispatch(
        uiActions.showNotification({
          status: 'success',
          title: 'Success!',
          message: 'Sent cart data successfully!',
        })
      );
    } catch (error) {
      dispatch(
        uiActions.showNotification({
          status: 'error',
          title: 'Error!',
          message: 'Sending cart data failed!',
        })
      );
    }
  };
}
