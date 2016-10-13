window.namespace = function(namespace) {
	namespace = namespace || {};
	return namespace
		.split('.')
		.reduce(function(prevVal, currVal) {
			if(typeof prevVal[currVal] === "undefined"){
				prevVal[currVal] = {};
			}
			return prevVal[currVal];
		}, window);
}