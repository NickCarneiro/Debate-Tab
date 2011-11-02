module.exports.setRoutes = function(app) {
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/test');   
	var Models = require('../models'); //include models
	var Tournament = mongoose.model('Tournament', Models.Tournament);
	var Coach = mongoose.model('Coach', Models.Coach);
	var Competitor = mongoose.model('Competitor', Models.Competitor);
	var School = mongoose.model('School', Models.School);
	
	app.get('/help', function(req, res){
		res.render('help', {
			jquery: false
		});
	});
	
	
	app.get('/createTeam', function(req, res){
		//get posts
		
		if(req.session.email === undefined){
			console.log("redirecting");
			res.redirect('/login');
		} else {
		
				
			res.render('createTeam', {
				title: "Blog Dashboard" ,
				email: req.session.email,
				scripts: [ 'javascripts/libs/reg_plugins.js',
					'javascripts/reg_client.js' ],
				stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
					'stylesheets/reg_style.css' ]
						
			});
			
		}
	});

	app.get('/createSchool', function(req, res){
		//get posts
		
		if(req.session.email === undefined){
			console.log("redirecting");
			res.redirect('/login');
		} else {

				res.render('createSchool', {
					title: "Create School" ,
					scripts: [ 'javascripts/libs/reg_plugins.js',
					'javascripts/reg_client.js' ],
					stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
					'stylesheets/reg_style.css' ],
					email: req.session.email 
				});
			}
		
	});
	
	app.post('/createTeam', function(req, res){
		//get posts
		
		if(req.session.email === undefined){
			console.log("redirecting");
			res.redirect('/login');
		} 
		else{
		
			Competitor.find({'email': req.body.email},function(err, doc){
			if(doc.length > 0){
				console.log("email exists already");
				console.log(req.body.email);
				res.json(null);
				
			} else {
			console.log("success");
				var competitor = new Competitor();
			competitor.email = req.body.email;
			competitor.first_name = req.body.first_name;
			competitor.last_name = req.body.last_name;
			competitor.cell_phone = req.body.cell_phone;
			competitor.save();
			
			req.session.email = req.body.email;
			res.json(competitor);
		//	res.redirect('/dashboard');
			}
		
		});
		}
	});


	app.post('/createSchool', function(req, res){
		
		
		if(req.session.email === undefined){
			console.log("redirecting");
			res.redirect('/login');
		} 
		else{

			console.log("success");
			var school = new School();
			console.log(req.body.school);
			school.name = req.body.school;

			school.coaches.push({email: req.session.email,
								 first_name: req.session.first_name,
								 last_name: req.session.last_name,
								 cell_phone: req.session.cell_phone,
								 password: req.session.password});

			school.save();
			console.log(req.session.id);
			console.log(req.params.id)
			Coach.findOne({'email': req.session.email},function(err, doc){
				doc.remove();

			});
			console.log(school);
			res.json(school);
		//	res.redirect('/dashboard');
			
		
		
		}
	});
	
	app.get('/tourneys', function(req, res){
		//get tourneys
		
		if(req.session.email === undefined){
			console.log("redirecting to login");
			res.redirect('/login');
		} else {
		
			var query = Tournament.find({},function(err, docs){
				
				res.render('tourneys', {
					title: "Tournament List" ,
					scripts: [ 'javascripts/libs/reg_plugins.js',
					'javascripts/reg_client.js' ],
					stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
					'stylesheets/reg_style.css' ],
					username: req.session.username ,
					tourneys: docs
				});
			});
		}
	});

	app.get('/accordion1', function(req, res){
		var query = Tournament.find({},function(err, docs){
				res.render('accordion1', {
					title: "Create a Team" ,
					scripts: [ 'javascripts/libs/reg_plugins.js',
					'javascripts/reg_client.js' ],
					stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
					'stylesheets/reg_style.css' ],
					tourneys: docs 
				});
			});
	});
	


	app.get('/', function(req, res){
				
				res.render('index', {
					title: "DebateTab - Accelerating speech and debate" ,
					scripts: [ 'javascripts/libs/reg_plugins.js',
					'javascripts/reg_client.js' ],
					stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
					'stylesheets/reg_style.css' ],
					loggedIn: req.session.username
				});
			
	});
	
	app.get('/post/:id', function(req, res){
		
		console.log("found by id: "+ doc);
		res.render('post', {
				title: "Blog Dashboard" ,
				scripts: [ 'javascripts/libs/reg_plugins.js',
					'javascripts/reg_client.js' ],
				stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
					'stylesheets/reg_style.css' ],
				post_title: doc.title ,
				body: doc.body,
				author: doc.author
			});
		
	});
	app.get('/specTourney/:id', function(req, res){
		var query = Tournament.findById(req.params.id, function(err, doc){
			console.log("found by id: "+ doc);
			res.render('specTourney', {
					title: "Tournament" ,
					name: doc.name ,
					scripts: [ 'javascripts/libs/reg_plugins.js',
						'javascripts/reg_client.js' ],
					stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
						'stylesheets/reg_style.css' ],
					location: doc.location
					
				});
		});
	});

	app.post('/login', function(req, res){
	console.log(req.body.email);
		Coach.find({'email': req.body.email, 'password': req.body.password},function(err, doc){
			if(doc.length > 0){
				console.log(req.body);
				req.session.email = req.body.email;
				res.redirect('/dashboard');
			} else {
				res.render('login', {
					scripts: [ 'javascripts/libs/reg_plugins.js',
						'javascripts/reg_client.js' ],
					stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
						'stylesheets/reg_style.css' ],
					title: "Debate Tab",
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
			req.session.first_name = req.body.first_name;
			req.session.last_name = req.body.last_name;
			req.session.cell_phone = req.body.cell_phone;
			req.session.password = req.body.password
			res.json(coach);
		//	res.redirect('/dashboard');
			}
		
		});	
		
	});
	
	app.get('/dashboard', function(req, res){
		//get posts

		if(req.session.email === undefined){
			console.log("redirecting");
			res.redirect('/login');
		} else {
			res.render('dashboard', {
				title: "Blog Dashboard" ,
				username: req.session.username ,
				scripts: [ 'javascripts/libs/reg_plugins.js',
				'javascripts/reg_client.js' ],
				stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
				'stylesheets/reg_style.css' ],
			});
		}
	});

	app.get('/register', function(req, res){
		if(req.session.email === undefined){
		res.render('register', {
			scripts: [ 'javascripts/libs/reg_plugins.js',
				'javascripts/reg_client.js' ],
			stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
				'stylesheets/reg_style.css' ],
			now: new Date(),
			title: "Debate Tab Boilerplate"
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
			scripts: [ 'javascripts/libs/reg_plugins.js',
				'javascripts/reg_client.js' ],
			stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
				'stylesheets/reg_style.css' ],
			now: new Date(),
			title: "Debate Tab Boilerplate",
			error: ""
		});
		} else {
			res.render('registertourney', {
			scripts: [ 'javascripts/libs/reg_plugins.js',
				'javascripts/reg_client.js' ],
			stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
				'stylesheets/reg_style.css' ],
			now: new Date(),
			title: "Tournament Registration",
			error: ""
		});
		}
	});
	
	app.get('/login', function(req, res){
		if(req.session.email === undefined){
		res.render('login', {
			title: "Debate Tab",
			scripts: [ 'javascripts/libs/reg_plugins.js',
				'javascripts/reg_client.js' ],
			stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
				'stylesheets/reg_style.css' ],
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

	
        app.get('/about', function(req, res) {
                res.render('aboutUs', {
                        title: "About the DebateTab Team",
			scripts: [ 'javascripts/libs/reg_plugins.js',
				'javascripts/reg_client.js' ],
			stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
				'stylesheets/reg_style.css',
				"stylesheets/tab_style.css" ],
			username: req.session.username 
                });
        });

        app.get('/landing', function(req, res) {
                res.render('landing', {
                        title: "Welcome to DebateTab",
			username: req.session.username,
                        email: "john@debatetab.com",
                        first_name: "John",
                        last_name: "Doe",
			scripts: [ 'javascripts/libs/reg_plugins.js',
				'javascripts/reg_client.js' ],
			stylesheets: [ 'stylesheets/jquery-ui-1.8.16.custom.css', 
				'stylesheets/reg_style.css',
				"stylesheets/tab_style.css" ]
                });
        });


	return app;
}

