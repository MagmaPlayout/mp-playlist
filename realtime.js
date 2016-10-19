//to-do hacer un modulo como la gente...
module.exports = function(httpServer,log){
  var redis = require("redis");
  var io = require("socket.io")(httpServer);
  var client = redis.createClient();
  var clip = require("./clip.js");
  var config = require("./config.js");
  var filter = require("./filter.js");

console.log(config);
  client.on('connect', function() {
      console.log('mp-playlist -> Redis connected');
  });
  //client.set("pl1",JSON.stringify({id:"pl1", clips:[{name:"clip1", path:"/home/user/holga.mkv", order: 1}, {name: "clip2", path:"/home/user/relog.mkv", order: 2}]}));
  //client.subscribe("filterChanged");

  io.on('connection',function(socket){
  	log.info("Un cliente se conecto" );

    //todo - hacer un subscribe con redis para saber si se cambio algo en los filtros.
    filter.getAll(function(error,reply){
      socket.emit("lstFilter",reply);
    });

    //Cuando la playlist cambia, guardo la playlist en redis, aviso a los clientes conectados y public en el canal PCCP.
    socket.on('playlistChanged', function(data) {
      ///esto es medio pt -> aca hay que validar que guarde bien para continuar.
      client.set('pl1', JSON.stringify(data), function(err, reply) {

          if(!err){
            console.log("se actualizaron los datos en redis");
            client.get("pl1", function(err, playlistData) {
              	socket.broadcast.emit("playlistData",JSON.parse(playlistData));

              //aca va el publicar, pero me tira error.
              client.publish("PCCP","PLAYNOW " + data.id );
            });
          }
      });

    });



    //Obtengo una playlist y la envio al cliente conectado
    // por ahora obtengo una playlist por su id pero hay que obtener una lista de playlist por algun otra key que podria ser la del usuario.
    client.get("pl1", function(err, playlistData) {
      socket.emit("playlistData",JSON.parse(playlistData));
      clip.getFromDir(config.app.clipDirectory, function(lstClip) {
          socket.emit("lstClip",lstClip,config.app.clipDirectory);
      });

    });

    client.on("message",function(channel, message){
      if(channel=="filterChanged"){
        socket.emit('redisMessage',message);

      }

    } );
  });
}
