// todo -> esta js es reautilizado por otras app. Ponerlo en una carpeta commmon
var redis = require("redis");
var redisClient = redis.createClient();
var Log = require ("log"),
	log = new Log("debug");

/**
 * Obtiene todos los filtros desde redis
 * @param {function} callback
 */
var getAll = function (callback){
	//todo- conseguir el length de la lista en redis.
	redisClient.lrange('filterList', 0, 1000,function(err, reply){
    var lstFilter = null;

		if(!err){
			lstFilter = JSON.parse("[" + reply +"]");
      log.info("Lista de filtros => " + lstFilter.length + " registros recuperados.");
			//socket.emit("filterList", JSON.parse(array));
		}
		else {
			console.log("No existen elementos en la lista de filtros.");
		}

    if(callback){
      callback(err,lstFilter);
    }

	});
}


/**
 * Actualiza los datos de un filtro
 * @param {object} filter
 * @param {function} callback
 */
var update = function (filter, callback){
		redisClient.lset("filterList",filter.id,JSON.stringify(filter),function(error,reply){
			log.info("Se actualizo la lista del filtro en el elemento " + filter.id);
      if(callback){
        callback(error,reply);
      }
		});

}

/**
 * Crea un nuevo filtro.
 * @param {object} filter
 * @param {function} callback
 */
var add =  function (filter,callback){
    //Agrego nuevo filtro en reedis
  	// to-do pensar como resolver la generacion del id por temas de concurrencia.
		redisClient.rpush("filterList",JSON.stringify(filter),function(error,reply){
			log.info("Se agrego un nuevo filtro llamado: " + filter.name );
      if(callback){
        callback(error,reply);
      }
		});

}

/**
 * Obtiene un filtro por su id
  * @param {number} id
 */
var get = function (id){

}

var del = function (filter){

}
var delAll = function (){

}


exports.getAll = getAll;
exports.get = get;
exports.add  = add;
exports.update = update;
exports.del = del;
exports.delAll = delAll;
