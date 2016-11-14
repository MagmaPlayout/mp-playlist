//to-do hacer un modulo como la gente...
module.exports = function(httpServer,log){
  var redis = require("redis");
  var io = require("socket.io")(httpServer);
  var client = redis.createClient();
  var clip = require("./DAO/clip.js");
  var config = require("./config.js");
  var filter = require("./DAO/filter.js");
  var playlist = require("./DAO/playlist.js");
  var scheduler = require("./DAO/scheduler.js");


  client.on('connect', function() {
      console.log('mp-playlist -> Redis connected');
  });


  io.on('connection',function(socket){


    filter.getAll(function(error,reply){
  		if(!error){
  			socket.emit("lstFilter", reply);
  		}

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

    // Nueva playlist
    socket.on('playlistAdd', function(pl) {
      playlist.add(pl,function(error,reply){
          playlist.getAll().then(function(reply){
            socket.emit("plList",reply);
          }).catch(function (e) {
              console.error("Error- playlist");
          });
      });

    });

    //
    socket.on('play', function(pl) {
      client.publish("PCCP","PLAYNOW " + pl.id );

    });

    socket.on('schedulerPlay', function(sch) {

      sch.ocurrences.forEach(function(item, idx){
        //PLSCHED <pl id> <timestamp>
        client.publish("PCCP","PLSCHED " + item.plId + " " + item.start);
      })


    });


    socket.on('schedulerSave', function(sch) {
      scheduler.update(sch, function(err,reply){

        if(!err){
            //socket.broadcast.emit("playlistData",JSON.parse(playlistData));
        }
        else{
          log.info("Playlist Update failed")
        }
      })

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


    // Por ahora queda solo una.
    scheduler.getById(1, function(error, reply){
      if(reply){ // si no existe un scheduler, lo crea.
        socket.emit("schData",reply);
      }
      else{
        scheduler.add(
          {
            id:"",
            name:"Scheduler1",
            ocurrences: []
          }
        ,function(error,reply){
          socket.emit("schData",reply);
        });

      }


    });


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
  );
  */

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
/*
scheduler.add(
  {
    id:"",
    name:"Scheduler1",
    ocurrences: [
      {id:"", plId: "1", start:"2016-11-10T01:25:17.795Z", end:"2016-11-10T02:25:17.795Z"},
      {id:"", plId: "2", start:"2016-11-10T02:30:17.795Z", end:"2016-11-10T03:25:17.795Z"}
    ]
  }
);
*/
