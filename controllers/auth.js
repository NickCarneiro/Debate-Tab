//every file in the controllers/ directory must be wrapped in the following function definition:

module.exports.setRoutes = function(app) {
//^^ this function definition ^^
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/test');   
	var Models = require('../models'); //include models
	var BlogPost = mongoose.model('BlogPost', Models.BlogPost);
	var User = mongoose.model('User', Models.User);
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
