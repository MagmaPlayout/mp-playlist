
function redisMap(){

}


/**
 * Mapea el nombre de la propiedad y valor de un objeto en un array.
 * @param {object} obj
 */
redisMap.prototype.objectToArrayKeyValue= function(obj){
	var keyValueArray = [];
	Object.getOwnPropertyNames(obj).forEach(function(val, idx, array) {
		keyValueArray.push(val);
		keyValueArray.push(obj[val]);

	});
	return keyValueArray;
}


/**
 * Mapea el nombre de la propiedad y valor de un objeto en un array.
 * @param {object} obj
 */
redisMap.prototype.arrayKeyValueToObject = function(array){
	var obj = {};
	for(i= 0 ; i < array.length; i = i+ 2){

		obj[array[i]] = array[i+1];

	}
	return obj;
}

module.exports = new redisMap();
