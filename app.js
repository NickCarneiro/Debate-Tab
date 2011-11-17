/**
 * Module dependencies..
 */
var express = require('express');
var fs = require('fs');
var app = module.exports = express.createServer();
//change this to automatically set up your ports.
app.env_name = "rohan";

//io.set('log level', 1);
var Models = require('./models'); //include models
//include mongoose
var mongoose = require('mongoose'); //like include

//Change port variable to your port when testing:

var environments = {
	nick: {
		main_port: 3003,
		twilio_port: 3019
	} ,
	ali: {
		main_port: 3001,
		twilio_port: 3020
	} ,
	nikhil: {
		main_port: 3007,
		twilio_port: 3021
	} ,
	rohan: {
		main_port: 3002,
		twilio_port: 3022
	} ,
	production: {
		main_port: 3005,
		twilio_port: 3023
	}
		
}
app.env = environments[app.env_name];
var port = app.env.main_port;

/*
'ali.debatetab.com': '127.0.0.1:3001',
'rohan.debatetab.com': '127.0.0.1:3002',
'nick.debatetab.com': '127.0.0.1:3003',
'nikhil.debatetab.com': '127.0.0.1:3007',
'db.debatetab.com': '127.0.0.1:3000',	Admin UI for MongoDB
'dev.debatetab.com': '127.0.0.1:3006'	Staging
'debatetab.com': '127.0.0.1:3005'		Production
*/

//db connection only needs to be made once. Change "test" if you want to use a different database.
mongoose.connect('mongodb://localhost/test');    

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "keyboard cat" }));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(express.bodyParser());
	
});

 fs.readdirSync(__dirname + '/controllers').forEach(function(file){
    if(file.match(/\.js$/)) {
      require('./controllers/' + file).setRoutes(app, express);
    }
  });

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
