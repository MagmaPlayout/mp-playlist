var redis = require("redis")
, redisMap = require("./redisMap.js")
, Log = require ("log")
, log = new Log("debug")
, redisClient = redis.createClient()
, promise = require("bluebird")

;

const SCHEDULER_KEY = "scheduler:";
const SCHEDULER_IDS = "scheduler:ids";
const SCHEDULER_ALL = "scheduler:all"

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

function scheduler(){

}

/**
 * Obtiene un clip por su id
  * @param {number} id
 */
scheduler.prototype.getById = function (id,callback){
	try {
		redisClient.hgetall(SCHEDULER_KEY + id, function(error,reply){
			if(reply){
				reply.ocurrences = JSON.parse(reply.ocurrences);
			}

		if(callback)
			callback(error,reply);
	});

	} catch (e) {
		if(callback)
			callback(error,null);
	}


}

 /**
  * Actualiza los datos de un
  * @param {object} pl
  * @param {function} callback
  */
scheduler.prototype.update = function (sch, callback){
	sch.ocurrences = JSON.stringify(sch.ocurrences);
	redisClient.hmset(SCHEDULER_KEY + sch.id, redisMap.objectToArrayKeyValue(sch),function(error,reply){
		 if(callback){
			 callback(error,reply);
		 }
	 });

 }

 /**
  * Agrega una nuevo scheduler
  * @param {object} pl
  * @param {function} callback
  */
scheduler.prototype.add = function (sch, callback){

  sch.ocurrences = JSON.stringify(sch.ocurrences);

	redisClient.watch(SCHEDULER_IDS);

	redisClient.get(SCHEDULER_IDS, function(err, reply) {
		var multi = redisClient.multi();
		var id = parseInt(reply ? reply: 0) + 1;
		sch.id = id;
	  multi.hmset( SCHEDULER_KEY + id, redisMap.objectToArrayKeyValue(sch))
	  multi.incr(SCHEDULER_IDS);
		multi.lpush(SCHEDULER_ALL, id);
	  multi.exec(function(err,data){
	  	console.log(data);
			if(callback){
				callback(err,data);
			}


	  });

	});


}

 module.exports = new scheduler();
