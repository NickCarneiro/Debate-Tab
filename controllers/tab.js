module.exports.setRoutes = function(app) {
	app.get('/tab', function(req, res){
	
		res.render('tab', {
			title: "Debate Tab Demo",
			scripts: ["//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js",
				"javascripts/plugins.js",
				"javascripts/underscore-min.js", 
				"javascripts/backbone.js", 
				"javascripts/backbone.localStorage-min.js",
				"javascripts/ObjectId.js",
				"javascripts/autocomplete.js",
				"javascripts/tab_client.js"]
		});
	
	});

	app.post('/export' , function(req, res){
		
		res.header('Content-Description','File Transfer');
   		res.header('Content-Disposition', 'attachment; filename=tournament.json');
   		res.header('Content-Type', 'application/text');
   		console.log(req.body);
    	res.send(req.body);

	});

	



}
