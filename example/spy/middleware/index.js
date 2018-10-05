const clone = src => {...src};

const defaults = {
  log = false,
  onLog = false,
  onInvalidInput = false,
  silentCrash = false,
  _skip = false // skip the given middleware (action already dispatched once)
};

const inputTypeNotValid = ({ input, inputName, type, silentCrash, onInvalidInput, middlewareName, defaults, action, next, dispatch, shouldReturn }) => {
  if (silentCrash) console.log(`[${middlewareName}] ${inputName} is invalid - ${type} expected.`, action);
  if (onInvalidInput){
    onInvalidInput(inputName, action, next, dispatch); 
    shouldReturn = true;
  } else {
    input = defaults[inputName];
  }
  return [input, shouldReturn];
}

const validateInput = (input, inputName, type, { silentCrash, onInvalidInput, middlewareName, defaults, action, next, dispatch }) => {
  let shouldReturn = false;
  const toProcess = { 
    input, inputName, type, 
    silentCrash, onInvalidInput, 
    middlewareName, defaults, 
    action, next, dispatch, 
    shouldReturn };

  switch(type){

    case `boolean`:
      if (typeof input !== `boolean`){
        let [ input, shouldReturn ] = inputTypeNotValid(toProcess);
      }
      return [input, shouldReturn];

    case `function`:
      if (typeof input !== `function` && input !== defaults[inputName]){
        let [ input, shouldReturn ] = inputTypeNotValid(toProcess);
      }
      return [input, shouldReturn];

    case `number`:
      if (typeof input !== `number` && input !== defaults[inputName]){
        let [ input, shouldReturn ] = inputTypeNotValid(toProcess);
      }
      return [input, shouldReturn];

    case `string`:
      if (typeof input !== `string` && input !== defaults[inputName]){
        let [ input, shouldReturn ] = inputTypeNotValid(toProcess);
      }
      return [input, shouldReturn];

    case `array`:
      if (!Array.isArray(input) && input !== defaults[inputName]){
        let [ input, shouldReturn ] = inputTypeNotValid(toProcess);
      }
      return [input, shouldReturn];

    case `object`:
      if (!(typeof input == `object` && input instanceof Object && !(input instanceof Array)) && input !== defaults[inputName]){
        let [ input, shouldReturn ] = inputTypeNotValid(toProcess);
      }
      return [input, shouldReturn];

    default: 
      return inputTypeNotValid(toProcess);

  }
}

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
      if (onInvalidInput) {
        onInvalidInput(`silentCrash`, action, next, dispatch);
        return;
      } else {
        silentCrash = defaults.silentCrash;
      }
    }
  }

  if (typeof onInvalidInput !== "function" && onInvalidInput !== defaults.onInvalidInput) {
    if (silentCrash) console.log(`[Spy] onInvalidInput is invalid - function expected.`, action);
    onInvalidInput = defaults.onInvalidInput;
  }

  const validationMeta = { silentCrash, onInvalidInput, `Spy`, defaults, action, next, dispatch };

  let [ log, shouldReturn ] = validateInput(log, `log`, `boolean`, validationMeta);
  if (shouldReturn) return;

  let [ onLog, shouldReturn ] = validateInput(onLog, `onLog`, `function`, validationMeta);
  if (shouldReturn) return;

  let [ _skip, shouldReturn ] = validateInput(_skip, `_skip`, `boolean`, validationMeta);
  if (shouldReturn) return;

  
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
