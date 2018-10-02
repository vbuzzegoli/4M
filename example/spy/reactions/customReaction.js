export const customReaction = (action, next) => {
	// Overriding the default behaviour with :
	console.log(`A new action was logged : ${action.type}`, action);
	next(action); // passing to next middleware / reducer
};
