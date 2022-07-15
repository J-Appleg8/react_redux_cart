<style>
th, thead {
    border-top:1pt solid;
    border-bottom: 2px solid;
    border-left: none;
    border-right: none;
}
td {
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-left: 1px solid;
    border-right: 1px solid;
}
</style>

# React Redux: Advanced

## <span style="color:lightgreen">Redux & Async Code:</span>

---

Reducers must be pure, side-effect free, and synchronous. So when we have any code that produces a side effect or is asynchronous (like sending an http request), it must NOT go into our reducer functions.

When we have a situation where we need to run such code, we have two main options:

1. Execute the code in the components
1. Create an 'action creator' to allow us to run any asynchronous or side-effect code

---

<br>

## <span style="color:lightgreen">Async/Side-Effect Code In Components:</span>

---

To make async code work with redux and sync changes to the server, we can add the async logic into one of our components.

Instead of sending the request to the server and then running the code through our reducer function:

1. Components dispatch actions
1. Redux forwards actions to reducer & reads description of the desired operation
1. Reducer then performs the operation and outputs a new state which will effectively replace the existing state in that central data store
1. Then subscribing components are notified that the data in the central store has been updated so that the component can then update the UI

We can switch the order of operations:

1. Perform the logic/work on frontend and let redux update the store
1. Get hold of our overall cart by using useSelector and listening for changes in a component state (Cart component from lecture)
1. Whenever the component state does change we can send http request to the server

In the example below, we are accessing the overall cart by using useSelector() and listening for changes to cart state. Whenever cart state does change, send an http request

- useSelector() automaticallly sets up subscription to redux store
- useEffect() listens for changes - runs whenever a dependency changes
  - PUT - will override existing data instead of storing new data in a list (POST)

```javascript
let isInitial = true;

export default function App() {
  const dispatch = useDispatch();

  const showCart = useSelector(state => state.ui.cartIsVisible);
  const notification = useSelector(state => state.ui.notification);
  const cart = useSelector(state => state.cart);

  useEffect(() => {
    const sendCartData = async () => {
      dispatch(
        uiActions.showNotification({
          status: 'pending',
          title: 'Sending',
          message: 'Sending cart data',
        })
      );
      const response = await fetch(
        'https://react-http-d8501-default-rtdb.firebaseio.com/cart.json',
        {
          method: 'PUT',
          body: JSON.stringify(cart),
        }
      );

      if (!response.ok) {
        throw new Error('Sending cart data failed');
      }
      const responseData = await response.json();

      dispatch(
        uiActions.showNotification({
          status: 'success',
          title: 'Success!',
          message: 'Sent cart data successfully!',
        })
      );
    };

    if (isInitial) {
      isInitial = false;
      return;
    }

    sendCartData().catch(error => {
      dispatch(
        uiActions.showNotification({
          status: 'error',
          title: 'Error!',
          message: 'Sending cart data failed!',
        })
      );
    });
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
```

---

<br>

## <span style="color:lightgreen">Using Action Creator Thunk:</span>

---

Action creators like the below `.showNotification()` are provided automatically by redux-toolkit, and we call them to create the action objects which we dispatch.

We can also write our own action creators to create so-called "thunks".

```javascript
    const sendCartData = async () => {
        dispatch(
            uiActions.showNotification({
                status: 'pending',
          title: 'Sending',
          message: 'Sending cart data',
        })
      );
```

### <span style="color:turquoise">What is a Thunk?:</span>

A Thunk is a function that delays an action until later--until something else is finished. We could write an action creator as a thunk, to write an action creator function that does NOT immediately return the action object itself but instead returns another function which eventually returns the action object

- So that we can run some other code before we then dispatch the actual action object that we want to create

### <span style="color:turquoise">Implementing a Custom Action Creator:</span>

What we always dispatched before were action creators (functions that return an action object), but now in cart-slice we are instead dispatching a function that returns another function. The great thing about Redux when using Redux-toolkit is that its prepared for this automatically

- It does not just accept action objects with a type property, but it also does accept action creators that return functions.

If redux-toolkit sees that you're dispatching an action which is actually a function instead of an action object, it will:

- Execute that function for you
- Provide the 'dispatch' argument automatically, so that inside of the executed function we can dispatch again

---

We can write the action creator in cart-slice like below.

- before dispatching, we can use async/side-effect code - reducer hasnt been called yet

```javascript
// cart-slice.js
export function sendCartData(cart) {
  return async dispatch => {
    dispatch(
      uiActions.showNotification({
        status: 'pending',
        title: 'Sending',
        message: 'Sending cart data',
      })
    );

    const sendRequest = async () => {
      const response = await fetch(
        'https://react-http-d8501-default-rtdb.firebaseio.com/cart.json',
        {
          method: 'PUT',
          body: JSON.stringify(cart),
        }
      );

      if (!response.ok) {
        throw new Error('Sending cart data failed');
      }
    };

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
```

Then we can call the custom action creator in App.js, replacing all the logic that was moved to cart-slice.js and dispatching custom action creator thunk sendCartData() in useEffect()

When this is dispatched:

- redux will execute the sendCartData() function for us
- all our other actions will be dispatched & http request will be sent

```javascript
let isInitial = true;

export default function App() {
  const dispatch = useDispatch();
  const showCart = useSelector(state => state.ui.cartIsVisible);
  const notification = useSelector(state => state.ui.notification);
  const cart = useSelector(state => state.cart);

  useEffect(() => {
    if (isInitial) {
      isInitial = false;
      return;
    }

    dispatch(sendCartData(cart));
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
```
