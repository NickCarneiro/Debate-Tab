

module.exports.setRoutes = function(app) {
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/test');   
	var Models = require('../models'); //include models
	var BlogPost = mongoose.model('BlogPost', Models.BlogPost);
	var User = mongoose.model('User', Models.User);
	var Tournament = mongoose.model('Tournament', Models.Tournament);
	var Coach = mongoose.model('Coach', Models.Coach);
	var Competitor = mongoose.model('Competitor', Models.Competitor);
	var School = mongoose.model('School', Models.School);
	
	app.get('/help', function(req, res){
		res.render('help', {
			jquery: false
		});
	});
	
	app.get('/dashboard', function(req, res){
		//get posts
		
		if(req.session.email === undefined){
			console.log("redirecting");
			res.redirect('/login');
		} else {
		
			var query = BlogPost.find({},function(err, docs){
				
				res.render('dashboard', {
					title: "Blog Dashboard" ,
					username: req.session.username ,
					posts: docs
				
					
				});
			});
		}
	});
	
	
	app.get('/createTeam', function(req, res){
		//get posts
		
		if(req.session.email === undefined){
			console.log("redirecting");
			res.redirect('/login');
		} else {
		
			var query = BlogPost.find({},function(err, docs){
				
				res.render('createTeam', {
					title: "Blog Dashboard" ,
					email: req.session.email 
					
				
					
				});
			});
		}
	});

	app.get('/createSchool', function(req, res){
		//get posts
		
		if(req.session.email === undefined){
			console.log("redirecting");
			res.redirect('/login');
		} else {
		
			var query = BlogPost.find({},function(err, docs){
				
				res.render('createSchool', {
					title: "Blog Dashboard" ,
					email: req.session.email 
					
				
					
				});
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
					tourneys: docs 
					
				});
			});
	});
	


	app.get('/', function(req, res){
		var query = BlogPost.find({},function(err, docs){
				
				res.render('index', {
					title: "Simple Node.js blog" ,
					posts: docs ,
					loggedIn: req.session.username
				});
			});
	});
	
	app.get('/post/:id', function(req, res){
		var query = BlogPost.findById(req.params.id, function(err, doc){
			console.log("found by id: "+ doc);
			res.render('post', {
					title: "Blog Dashboard" ,
					post_title: doc.title ,
					body: doc.body,
					author: doc.author
				});
		});
	});
	app.get('/specTourney/:id', function(req, res){
		var query = Tournament.findById(req.params.id, function(err, doc){
			console.log("found by id: "+ doc);
			res.render('specTourney', {
					title: "Tournament" ,
					name: doc.name ,
					location: doc.location
					
				});
		});
	});


	

	app.post('/submit', function(req, res){
		//insert post to database
		if(req.session.username === undefined){
			res.redirect('/login');
		} else {
			var post = new BlogPost();
			post.title = req.body.title;
			post.body = req.body.body;
			post.date = Date();
			post.author = req.session.username;
			post.save();
			res.redirect('/dashboard');
		}
	});
	
	app.get('/delete/:id', function(req, res){
		//insert post to database
		if(req.session.username === undefined){
			res.redirect('/login');
		} else {
			BlogPost.findById(req.params.id, function(err, doc){
				doc.remove();
				res.redirect('/dashboard');
			})
		}
	});
	

	return app;
}

