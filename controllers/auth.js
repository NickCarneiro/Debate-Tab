//every file in the controllers/ directory must be wrapped in the following function definition:

module.exports.setRoutes = function(app) {
//^^ this function definition ^^
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/test');   
	var Models = require('../models'); //include models
	var BlogPost = mongoose.model('BlogPost', Models.BlogPost);
	var User = mongoose.model('User', Models.User);
	var Tournament = mongoose.model('Tournament', Models.Tournament);
	app.post('/login', function(req, res){
	
		User.find({'username': req.body.username, 'password': req.body.password},function(err, doc){
			if(doc.length > 0){
				console.log(req.body);
				req.session.username = req.body.username;
				res.redirect('/dashboard');
			} else {
				res.render('login', {
					scripts: [ 'client.js' ],
					now: new Date(),
					title: "Debate Tab Boilerplate",
					error: "Username or password incorrect"
				});
			}
		
		});
	});
	
	app.post('/register', function(req, res){
		//insert user to database
		
			var user = new User();
			user.username = req.body.username;
			user.password = req.body.password;
			user.role = req.body.role;
			user.save();
			req.session.username = req.body.username;
			res.redirect('/dashboard');
		
	});
	
	app.get('/register', function(req, res){
		if(req.session.username === undefined){
		res.render('register', {
			scripts: [ 'client.js' ],
			now: new Date(),
			title: "Debate Tab Boilerplate",
			error: ""
		});
		} else {
			res.redirect('/dashboard');
		}
	});
	
	app.post('/registertourney', function(req, res){
		//insert tournament to database
		
			var tourney = new Tournament();
			tourney.name = req.body.name;
			tourney.start_date = req.body.start_date
			tourney.end_date = req.body.end_date;
			tourney.location = req.body.location;
			tourney.save();
			
			res.redirect('/dashboard');
		
	});
	
	app.get('/registertourney', function(req, res){
		if(req.session.username === undefined){
		res.render('login', {
			scripts: [ 'client.js' ],
			now: new Date(),
			title: "Debate Tab Boilerplate",
			error: ""
		});
		} else {
			res.render('registertourney', {
			scripts: [ 'client.js' ],
			now: new Date(),
			title: "Tournament Registration",
			error: ""
		});
		}
	});
	
	app.get('/login', function(req, res){
		if(req.session.username === undefined){
		res.render('login', {
			scripts: [ 'client.js' ],
			now: new Date(),
			title: "Debate Tab Boilerplate",
			error: ""
		});
		} else {
			res.redirect('/dashboard');
		}
	});

	app.get('/logout', function(req, res){
	
		console.log("logging out");
		delete req.session.username;
		res.redirect('/');
	});
}
