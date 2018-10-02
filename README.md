# Modern Modular Middleware Model (4M)

## What is Redux

Redux is a very powerful **state management** tool, often used with a web framework such as React.
It uses a `store` to hold a global state horizontally throughout a web platform, which makes communication between components much simpler to handle and maintain in complex systems.

### Redux Flow

This is what a Redux data flow looks like :

![redux-flow](resources/redux-flow.jpg)

This does not intend to go over the whole Redux technology by any means. If you do not fully understand this data flow please check out [Redux's documentation](https://redux.js.org/) before going through the next section.

## Middleware

Once used a couple of times, Redux becomes pretty similar accross most projects.

It's real power and complexity relies in its _middleware_.

### What is the 4M ?

The _4M_ consists in relaying **all operations**, such as complex, redondant, or asynchronous operations **to the middleware**. **It allows complex flows to be modulary, therefore better reusable, testable and maintainable over time**.

Besides, using middleware accordingly to the 4M allows one to _drastically simplify and standardize the action layer_ by reducing it to a simple **javascript object**, as intended by the native Redux implementation. This javascript object contains all the configuration / instructions needed for the middleware to run properly. All this configuration may contain optional arguments and must be held under a **unique parent key** to ensure compatibility with other _4M_ compliant middleware. It is suggested to use the name of the `npm` module. Also, it should not override any other keys, unrelated to the given middleware.

A _4M_ compliant middleware is **self sufficient** and **reusable**.

A _4M_ compliant middleware can use a new layer in the data-flow called **Reactions**. Reactions are functions executed at the end of a given middleware operation, meant to override the default behaviour of the middleware. They can be used for any purposes, such as action routing.

Reactions, if needed, are passed as arguments in the _action_ layer.

Reactions **must contain** an argument called _next_, passed by the middleware, to allow the user to forward a given action, or several actions, to the reducer (or next middleware), whenever needed. They must also contain a `dispatch` argument to be able to dispatch new actions if necessary.

- Example of simple reactions : `onSuccess`, `onError`, `onThrottle`, `onUnexpectedStatus`,..

- Detailed example of `onSuccess`, found in the _4M_ compliant middleware [Axiom](https://github.com/vbuzzegoli/axiom):

In `/reactions` :

```javascript
export const customReaction = (action, next, dispatch) => {
  console.log("SUCCESS!", action);
  dispatch({ type: `ANOTHER_ACTION`, payload: 0 });
  dispatch({ type: `YET_ANOTHER_ACTION`, payload: 0 });
  next(action);
};
```

In `/actions` :

```javascript
    import * as actions from "../constants/action-types";
    import { customReaction } from "../reactions/customReaction";

    export const fetchApi = () => {
      type: actions.FETCH_API,
      payload: [],
      axiom: {
        axios: {
          method:`get`,
          url:`https://itunes.apple.com/search?term=hello`
        },
        onSuccess: customReaction
      }
    }
```

> Note that [Axiom](https://github.com/vbuzzegoli/axiom), just like any 4M compliant middleware, only requires a set of parameters nested into its parent key to run properly. This action would trigger a call to the iTunes API and automatically fill the payload with the data fetched, in that specific case an array of objects.

### Redux 4M data-flow

![redux-4M-flow](resources/redux-4M-flow.jpg)

### Examples of use

Middleware could be used for just about anything.
Common uses could include, (not limited to) :

- encryption / decryption
- hashing
- throttling (e.g. [Hurakken](https://github.com/vbuzzegoli/hurakken))
- logging
- analytics
- performance tracking
- networking / REST (e.g. [Axiom](https://github.com/vbuzzegoli/axiom))
- multi-dispatching

### Chaining middleware for complex flows

The biggest power of the _4M_ implementation relies in its ability to chain modules and create complex flows.

Therefore you could have :

In `/actions` :

```javascript
    export const fetchApi = () => {
      type: actions.FETCH_API,
      payload: [],
      hurakken: {
        throttle: 3000,
        onRejected: actionRejected
      },
      axiom: {
        axios: {
          method:`get`,
          url:`https://itunes.apple.com/search?term=hello`
        },
        onSuccess: requestSuccess,
        onError: requestError
      },
      spy: {
        log: true
      }
    }
```

## Version

1.5.0

## Credits

Designed by Victor Buzzegoli.

[@victorbuzzegoli](https://twitter.com/victorbuzzegoli) on Twitter
