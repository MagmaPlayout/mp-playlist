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
app.use("/public/js", express.static(__dirname + "/public/js"));
app.use("/public/css", express.static(__dirname + "/public/css"));
app.use("/public/img", express.static(__dirname + "/public/img"));
app.use("/public/lib/bootstrap-3.3.7-dist/css/", express.static(__dirname + "/public/lib/bootstrap-3.3.7-dist/css/"));
app.use("/public/lib/bootstrap-3.3.7-dist/fonts/", express.static(__dirname + "/public/lib/bootstrap-3.3.7-dist/fonts/"));
app.use("/public/lib/bootstrap-3.3.7-dist/js/", express.static(__dirname + "/public/lib/bootstrap-3.3.7-dist/js/"));
app.use("/public/lib/fullcalendar-3.0.1/", express.static(__dirname + "/public/lib/fullcalendar-3.0.1/"));


app.get('/',function(req,res){
	res.redirect('index.html');
});


http.listen(port,function(){
	console.log("---------------------------------------------------------");
	console.log("---------- Magma-Playout | Playlist Editor 1.0 ----------");
	console.log("---------------------------------------------------------");
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
