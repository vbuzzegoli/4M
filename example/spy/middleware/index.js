const clone = src => {...src};

const spy = store => next => action => {
  // Omit middleware if no related config in the action
  if (!action.spy) return next(action);

  // Get the given configuration / apply default values
  const {
    log = false,
    onLog = false,
    _skip = false // used for backward compatibility with thunk / saga
  } = action.spy;

  if (_skip) {
    // Middleware already triggered once (backward compatibility)
    // next(..) passes the action to the next middleware / reducer
    return next(action);
  } else {
    // Assigning _skip flag (backward compatibility)
    const newAction = clone(action);
    newAction.spy._skip = true;
    // Core Process
    if (log) {
      if (onLog) {
        // Custom Reaction
        onLog(newAction, next, store.dispatch);
      } else {
        // Default behaviour
        console.log(`[ACTION : ${newAction.type}]`, newAction);
      }
    }
  }
};

export default spy;
