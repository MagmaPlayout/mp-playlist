var express = require ("express");
var app = new express();
var http = require("http").Server(app);
var realtime = require("./realtime");
var config = require("./config.js");
var filter = require("./filter.js");


var Log = require ("log"),
	log = new Log("debug");

realtime(http,log);


var port = process.env.PORT || config.app.port;

app.use(express.static(__dirname + "/public"));

app.get('/',function(req,res){
	res.redirect('index.html');
});


http.listen(port,function(){
	log.info("Playlist editor - Welcome cats!");
	log.info("Servidor escuchando a traves del puerto %s",port)

});



/*

// Configuracion de server para API publica.
var fs = require('fs');
var express = require('express');
var cors = require('cors');

var app = express();

app.use(cors());
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  contents = fs.readFileSync('sliderImages.json', 'utf8');
  res.end(contents);
});

app.listen(process.env.PORT || 8080);
*/
