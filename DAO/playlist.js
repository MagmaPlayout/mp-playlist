var redis = require("redis")
, filter = require("./filter.js")
, redisMap = require("./redisMap.js")
, Log = require ("log")
, log = new Log("debug")
, redisClient = redis.createClient()
, promise = require("bluebird")
,clip = require("./clip.js")
;

const DATA_KEY = "playlist:";
const DATA_IDS = "playlist:ids";
const DATA_ALL = "playlist:all"

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

function playlist(){

}

/**
 * Obtiene un clip por su id
  * @param {number} id
 */
playlist.prototype.getById = function (id,callback){

	redisClient.hgetall(DATA_KEY + id, function(error,reply){
		if(callback)
			callback(error,reply);
	});

}

/**
 * Obtiene todos los clips desde redis
 * @param {function} callback
 */
playlist.prototype.getAll = function (){

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
playlist.prototype.update = function (pl, callback){
	pl.clips = JSON.stringify(pl.clips);
	redisClient.hmset(DATA_KEY + pl.id, redisMap.objectToArrayKeyValue(pl),function(error,reply){
		 if(callback){
			 callback(error,reply);
		 }
	 });

 }

 /**
  * Agrega una nueva playlist
  * @param {object} pl
  * @param {function} callback
  */
playlist.prototype.add = function (pl, callback){
	pl.clips = JSON.stringify(pl.clips);

	redisClient.watch(DATA_IDS);

	redisClient.get(DATA_IDS, function(err, reply) {
		var multi = redisClient.multi();
		var id = parseInt(reply ? reply: 0) + 1;
		pl.id = id;
	  multi.hmset( DATA_KEY + id, redisMap.objectToArrayKeyValue(pl))
	  multi.incr(DATA_IDS);
		multi.lpush(DATA_ALL, id);
	  multi.exec(function(err,data){
	  	console.log(data);
	  });

	});


}

 module.exports = new playlist();



 /*
 function getClipIds(clips){

 	return new Promise(function(resolve){
 		var idClips = "";
 		clips.forEach(function(item, index){
 			idClips = idClips + item .id + ",";
 			if(index = clips.length ){
 					resolve(idClips.substring(0, idClips.length - 1));
 			}
 		});
 	});

 }
 */
 /*
 function getPlaylistClips(idsConcat){
 	return new Promise(function(resolve) {

 		var idClips = idsConcat.split(',');

 		var clipList = [];
 		if(idClips.length == 0 ){
 			resolve([]);
 			return;
 		}

 		idClips.forEach(function(id, index){
 			clip.getById (id,function(error, clip){
 				clipList.push(clip);

 				if(index = idClips.length ){
 					resolve(clipList);
 				}
 			});

 		});

 	});
 }
 */
