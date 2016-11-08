//to-do hacer un modulo como la gente...
module.exports = function(httpServer,log){
  var redis = require("redis");
  var io = require("socket.io")(httpServer);
  var client = redis.createClient();
  var clip = require("./clip.js");
  var config = require("./config.js");
  var filter = require("./filter.js");
  var playlist = require("./playlist.js");


  client.on('connect', function() {
      console.log('mp-playlist -> Redis connected');
  });

  io.on('connection',function(socket){
  	
    //todo - hacer un subscribe con redis para saber si se cambio algo en los filtros.
    filter.getAll(function(error,reply){
      socket.emit("lstFilter",reply);
    });

    //Cuando la playlist cambia, guardo la playlist en redis, aviso a los clientes conectados y public en el canal PCCP.
    socket.on('playlistChanged', function(pl) {

      playlist.update(pl, function(err,reply){

        if(!err){
            //socket.broadcast.emit("playlistData",JSON.parse(playlistData));
        }
        else{
          log.info("Playlist Update failed")
        }
      })

    });

    //Cuando la playlist cambia, guardo la playlist en redis, aviso a los clientes conectados y public en el canal PCCP.
    socket.on('play', function(pl) {
      client.publish("PCCP","PLAYNOW " + pl.id );

    });


    //Obtengo una playlist y la envio al cliente conectado
    socket.on('plGetById', function(id) {
      playlist.getById(id,function(error, pl) {
        socket.emit("plGetById_result",pl);
      });
    });

    // lista de todos los clips transcodeados
    clip.getAll().then(function(mediaList){
      //console.log(mediaList);
        socket.emit("mediaList", mediaList);
    }).catch(function (e) {
        console.error("Error- medialist");
    });

    playlist.getAll().then(function(reply){
      //socket.emit("playlistData",JSON.parse(playlistData));
      socket.emit("plList",reply);
    }).catch(function (e) {
        console.error("Error- playlist");
    });



    /*
    client.on("message",function(channel, message){
      if(channel=="filterChanged"){
        socket.emit('redisMessage',message);

      }

    });
    */
  });
}




/*
var playlistDePrueba =
  {
    "id":"0",
    "name":"playlist1",
    "clips":[
      {
        "id":0,
        "name":"a.mkv",
        "path":"/home/rombus/Documentos/PROYECTO_FINAL/Documents/VIDS/a.mkv",
        "duration":"PT15.43S",
        "frames":381,
        "fps":25,
        "idFilter":"0"
      },
      {
        "id":5,
      "name":"b.m4v",
      "path":"/home/rombus/Documentos/PROYECTO_FINAL/Documents/VIDS/b.mkv",
      "duration":"PT07.60S",
      "frames":190,
      "fps":25,
      "idFilter":""
      },
    ]
  }
  */


/*
  playlist.add
  (
    {
    "id":"-",
    "name":"playlist22",
    "clips":[
      {
        "id":0,
        "name":"a.mkv",
        "path":"/home/rombus/Documentos/PROYECTO_FINAL/Documents/VIDS/a.mkv",
        "duration":"PT15.43S",
        "frames":381,
        "fps":25,
        "idFilter":"0"
      },
      {
        "id":5,
      "name":"b.m4v",
      "path":"/home/rombus/Documentos/PROYECTO_FINAL/Documents/VIDS/b.mkv",
      "duration":"PT07.60S",
      "frames":190,
      "fps":25,
      "idFilter":""
      },
    ]
    }
  );

  /*
playlist.update(
  {
  "id":"2",
  "name":"playlist22",
  "clips":[1,2]
  }
)
*/

/*
clip.add({
"id":0,
"name":"b.m4v",
"path":"/home/rombus/Documentos/PROYECTO_FINAL/Documents/VIDS/b.mkv",
"duration":"PT07.60S",
"frames":190,
"fps":25,
"idFilter":""
});
*/
