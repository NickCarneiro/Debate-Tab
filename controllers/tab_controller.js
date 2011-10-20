module.exports.setRoutes = function(app) {
	app.get('/tab', function(req, res){
	
		res.render('tab', {
			title: "Debate Tab Demo",
			scripts: ["javascripts/libs/tab_plugins.js",
				"javascripts/tab_client.js"],
			stylesheets: ["stylesheets/tab_style.css"]
		});
	
	});

	app.post('/export' , function(req, res){
		
		res.header('Content-Description','File Transfer');
   		res.header('Content-Disposition', 'attachment; filename=tournament.json');
   		res.header('Content-Type', 'application/text');
   		console.log(req.body);
    	res.send(req.body);

	});

};
