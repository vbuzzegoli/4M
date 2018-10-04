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

> _4M_ is a standard of implementation for Redux systems. In that sense, _4M_ does not have a core implementation on its own. _4M_ is a set of rules to follow to build much more efficient Redux systems.

The _4M_ consists in relaying **all operations**, such as complex, redondant, or asynchronous operations **to the middleware**. **It allows complex flows to be modulary, therefore better reusable, testable and maintainable over time**.

Besides, using middleware accordingly to the 4M allows one to _drastically simplify and standardize the action layer_ by reducing it to a simple **javascript object**, as intended by the native Redux implementation. This javascript object contains all the configuration / instructions needed for the middleware to run properly. All this configuration may contain optional arguments and must be held under a **unique parent key** to ensure compatibility with other _4M_ compliant middleware. It is suggested to use the name of the `npm` module. Also, it should not override any other keys, unrelated to the given middleware.

A _4M_ compliant middleware is **self sufficient** and **reusable**.

A _4M_ compliant middleware can use a new layer in the data-flow called **Reactions**. Reactions are functions executed at the end of a given middleware operation, meant to override the default behaviour of the middleware. They can be used for any purposes, such as action routing.

Reactions, if needed, are passed as arguments in the _action_ layer.

Reactions **must contain** an argument called `next`, passed by the middleware, to allow the user to forward a given action, or several actions, to the reducer (or next middleware), whenever needed. They must also contain a `dispatch` argument to be able to dispatch new actions if necessary.

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

### The 23 Commandments

To be **4M** compliant you'll need to tick all of these boxes :

1. **All operations** should be implemented in the middleware
2. Actions must remain **javascript objects**
3. Actions must be used as a configuration for the middleware
4. Each operation must be implemented in its **own dedicated module** (or middleware)
5. Each middleware must use a **unique parent key** for its configuration, to ensure cross compatibility
6. Each middleware must not override any other configuration objects, not related to its parent key
7. Each middleware must be **self sufficient** and **reusable**, it should only rely on its own configuration key and its effect must be limited to its own module
8. Each middleware must include a `_skip` filtering internally, to allow backward compatibility with _thunk_ or _saga_
9. If a middleware cannot find its own configuration key in the _action_, it should only relay the later to the next middleware / reducer without any form of action or mutation
10. Each middleware should include input validation
11. Each middleware must have a `log` parameter to enable related logs in the console (may also have a `xlog` for extended logs if needed)
12. Each middleware must allow **reactions** to be passed in its configuration object, to override the default behaviour of the middleware
13. Internally, these _reactions_ must always be called at the end of the core process of the middleware, no action or mutation can possibly come after the call a given reaction
14. _Reactions_ must at least contain these 3 arguments, passed by the middleware : `action`, `next`, `dispatch`
15. A middleware should not mutate the `action.type` and never handle routing on its own. Routing, being specific to every project, should be handled in the _Reaction_ layer
16. _Reactions_ must be available for every possible outcome in the given middleware, to allow the user to properly handle side effects based on their specific system and needs
17. Each middleware must include a `onInvalidInput` _reaction_ to allow the user to handle situations where an invalid input is encountered
18. Each middleware must by default log an error message in the console when invalid inputs are encountered and no custom _reaction_ is implemented
19. This error message has to be able to be turned off using `silentCrash: true`
20. By default, when an invalid input is encountered, transfer the action to the next middleware / reducer without mutating it
21. `silentCrash` must be checked first, if the input is invalid it should be set back to the default value _false_
22. `onInvalidInput` must be checked right after `silentCrash`
23. Live a much happier life using Redux from now on :rocket:

> Note : Check out the [example](https://github.com/vbuzzegoli/4M/tree/master/example) attached to get a real life example of such an implementation

### Examples of use

Middleware could be used for just about anything.
Common uses could include, (not limited to) :

- encryption / decryption
- hashing
- throttling (e.g. [Hurakken](https://github.com/vbuzzegoli/hurakken))
- logging (e.g. [Spy](https://github.com/vbuzzegoli/spy))
- analytics
- performance tracking
- networking / REST (e.g. [Axiom](https://github.com/vbuzzegoli/axiom))
- multi-dispatching (e.g. [Alfred](https://github.com/vbuzzegoli/alfred))

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

1.7.2

## Credits

Designed by Victor Buzzegoli.

[@victorbuzzegoli](https://twitter.com/victorbuzzegoli) on Twitter
