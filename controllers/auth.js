//every file in the controllers/ directory must be wrapped in the following function definition:

module.exports.setRoutes = function(app) {
//^^ this function definition ^^
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/test');   
	var Models = require('../models'); //include models
	var BlogPost = mongoose.model('BlogPost', Models.BlogPost);
	var User = mongoose.model('User', Models.User);
	var Tournament = mongoose.model('Tournament', Models.Tournament);
	var Coach = mongoose.model('Coach', Models.Coach);
	app.post('/login', function(req, res){
	console.log(req.body.email);
		Coach.find({'email': req.body.email, 'password': req.body.password},function(err, doc){
			if(doc.length > 0){
				console.log(req.body);
				req.session.email = req.body.email;
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
		console.log("test");
		Coach.find({'email': req.body.email},function(err, doc){
			if(doc.length > 0){
				console.log("email exists already");
				console.log(req.body.email);
				res.json(null);
				
			} else {
			console.log("success");
				var coach = new Coach();
			coach.email = req.body.email;
			coach.password = req.body.password;
			coach.first_name = req.body.first_name;
			coach.last_name = req.body.last_name;
			coach.cell_phone = req.body.cell_phone;
			coach.save();
			
			req.session.email = req.body.email;
			res.json(coach.email);
		//	res.redirect('/dashboard');
			}
		
		});	
		
	});
	
	app.get('/register', function(req, res){
		if(req.session.email === undefined){
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
			tourney.start_date = req.body.start_date;
			tourney.end_date = req.body.end_date;
			tourney.location = req.body.location;
			tourney.save();
			
			res.redirect('/dashboard');
		
	});
	
	app.get('/registertourney', function(req, res){
		if(req.session.email === undefined){
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
		if(req.session.email === undefined){
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
		delete req.session.email;
		res.redirect('/');
	});
}
