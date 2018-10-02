export const customReaction = (action, next, dispatch) => {
	// Overriding the default behaviour with :
	console.log(`A new action was logged : ${action.type}`, action);
	dispatch({ type: `ACTION_LOGGED`, payload: 0 });
	next(action); // passing to next middleware / reducer
};
