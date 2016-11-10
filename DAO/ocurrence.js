var redis = require("redis")
, filter = require("./filter.js")
, redisMap = require("./redisMap.js")
, Log = require ("log")
, log = new Log("debug")
, redisClient = redis.createClient()
, promise = require("bluebird")
;

const DATA_KEY = "ocurrence:";
const DATA_IDS = "ocurrence:ids";
const DATA_ALL = "ocurrence:all"

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

function ocurrence(){

}

/**
 * Obtiene un clip por su id
  * @param {number} id
 */
ocurrence.prototype.getById = function (id,callback){

	redisClient.hgetall(DATA_KEY + id, function(error,reply){
    reply.ocurrences = JSON.parse(reply.ocurrences);
		if(callback)
			callback(error,reply);
	});

}

/**
 * Obtiene todos los clips desde redis
 * @param {function} callback
 */
ocurrence.prototype.getAll = function (){

	return new Promise(function(resolve) {
	    redisClient.lrange(DATA_ALL, 0,-1, function (err, replies) {

					var responseList = [];

	        replies.forEach(function (reply, index) {

							redisClient.hgetall(DATA_KEY + reply,function(error,data){
								//console.log(data);
								data.clips = JSON.parse(data.clips)
								responseList.push (data);
								if(index == replies.length - 1 ){
									resolve(responseList);
								}
							});

	        });
	    });

		});

 }


 /**
  * Actualiza los datos de un
  * @param {object} pl
  * @param {function} callback
  */
ocurrence.prototype.update = function (dt, callback){

	redisClient.hmset(DATA_KEY + dt.id, redisMap.objectToArrayKeyValue(pl),function(error,reply){
		 if(callback){
			 callback(error,reply);
		 }
	 });

 }

 /**
  * Agrega una nueva ocurrence
  * @param {object} pl
  * @param {function} callback
  */
ocurrence.prototype.add = function (dt, callback){

	redisClient.watch(DATA_IDS);

	redisClient.get(DATA_IDS, function(err, reply) {
		var multi = redisClient.multi();
		var id = parseInt(reply ? reply: 0) + 1;
		dt.id = id;
	  multi.hmset( DATA_KEY + id, redisMap.objectToArrayKeyValue(dt))
	  multi.incr(DATA_IDS);
		multi.lpush(DATA_ALL, id);
	  multi.exec(function(err,data){
	  	console.log(data);
	  });

	});


}

 module.exports = new ocurrence();
