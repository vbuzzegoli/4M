const clone = src => {...src};

const defaults = {
  log = false,
  onLog = false,
  onInvalidInput = false,
  silentCrash = false,
  _skip = false // used for backward compatibility with thunk / saga
};

const spy = store => next => action => {
  // Omit middleware if no related config in the action
  if (!action.spy) return next(action);

  // Get the given configuration / apply default values
  let {
    log = defaults.log,
    onLog = defaults.onLog,
    onInvalidInput = defaults.onInvalidInput,
    silentCrash = defaults.silentCrash,
    _skip = defaults._skip
  } = action.spy;

  // Input validation 

  if (typeof silentCrash !== "boolean") {
    console.log(`[Spy] silentCrash is invalid - boolean expected.`, action);
    if (typeof onInvalidInput !== "function" && onInvalidInput !== defaults.onInvalidInput) {
      silentCrash = defaults.silentCrash;
    } else {
      onInvalidInput(`silentCrash`, action, next, dispatch);
      return;
    }
  }

  if (typeof onInvalidInput !== "function" && onInvalidInput !== defaults.onInvalidInput) {
    if (silentCrash) console.log(`[Spy] onInvalidInput is invalid - function expected.`, action);
    onInvalidInput = defaults.onInvalidInput;
  }

  if (typeof log !== "boolean"){
    if (silentCrash) console.log(`[Spy] log is invalid - boolean expected.`, action);
    if (onInvalidInput){
      onInvalidInput(`log`, action, next, dispatch);
      return;
    } else {
      log = defaults.log;
    }
  }

  if (typeof onLog !== "function" && onLog !== defaults.onLog){
    if (silentCrash) console.log(`[Spy] onLog is invalid - function expected.`, action);
    if (onInvalidInput){
      onInvalidInput(`onLog`, action, next, dispatch);
      return;
    } else {
      onLog = defaults.onLog;
    }
  }

  if (typeof _skip !== "boolean"){
    if (silentCrash) console.log(`[Spy] _skip is invalid - boolean expected.`, action);
    if (onInvalidInput){
      onInvalidInput(`_skip`, action, next, dispatch);
      return;
    } else {
      _skip = defaults._skip;
    }
  }
  
  // Loop Protection
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
