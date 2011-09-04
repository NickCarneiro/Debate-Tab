//every file in the controllers/ directory must be wrapped in the following function definition:

module.exports.setRoutes = function(app) {
//^^ this function definition ^^

	app.post('/login', function(req, res){
	
		User.find({'username': req.body.username, 'password': req.body.password},function(err, doc){
			if(doc.length > 0){
				console.log(req.body);
				req.session.username = "user";
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
