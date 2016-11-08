var redis = require("redis")
, filter = require("./filter.js")
, redisMap = require("./redisMap.js")
, Log = require ("log")
, log = new Log("debug")
, promise = require("bluebird")
, redisClient = redis.createClient()
;

const CLIP_KEY = "clip:";
const CLIP_IDS = "clip:ids";
const CLIP_ALL = "clip:all";

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

function clip(){

}

/**
 * Obtiene un clip por su id
  * @param {number} id
 */
clip.prototype.getById = function (id,callback){

	redisClient.hgetall(CLIP_KEY + id, function(error,reply){
		if(callback)
			callback(error,reply);
	});
}

/**
 * Obtiene todos los clips desde redis
 * @param {function} callback
 */

clip.prototype.getAll =  function (callback){

  return new Promise(function(resolve) {
	    redisClient.lrange(CLIP_ALL, 0, -1, function (err, replies) {
	        // NOTE: code in this callback is NOT atomic
	        // this only happens after the the .exec call finishes.
	        //console.log("MULTI got " + replies.length + " replies");
					var responseList = [];
	        replies.forEach(function (reply, index) {
	            //console.log("Reply " + index + ": " + reply.toString());

							redisClient.hgetall(CLIP_KEY + reply,function(error,data){
								//console.log(data);
								responseList.push (data);
								if(index == reply.length -1){
									resolve(responseList);
								}

							});

	        });

	    });

		});

 }


 /**
  * Agrega una nuevo clip
  * @param {object} clip
  * @param {function} callback
  */
 clip.prototype.add = function (pl, callback){

  redisClient.watch(CLIP_IDS);
  redisClient.get(CLIP_IDS, function(err, reply) {

    var multi = redisClient.multi();
    var id = parseInt(reply ? reply: 0) + 1;
    pl.id = id;
    multi.hmset( CLIP_KEY + id, redisMap.objectToArrayKeyValue(pl))
    multi.incr(CLIP_IDS);
    multi.lpush(CLIP_ALL, id);
    multi.exec(function(err,data){

    if(callback)
      callback(error, data);

    });

  });
}

// Gets clip files from a directory
clip.prototype.getFromDir= function (currentDirPath, callback) {
    var fs = require('fs'),
        path = require('path');
    var lstClip = [];
    fs.readdir(currentDirPath, function (err, files) {
        if (err) {
            throw new Error(err);
        }
        files.forEach(function (name) {
            var filePath = path.join(currentDirPath, name);
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
              lstClip.push({
                id:lstClip.length,
                name:name,
                path:filePath,
                idFilter:null})
            }

        });
        callback(lstClip);
    });

}


module.exports = new clip();
