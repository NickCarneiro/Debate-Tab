module.exports.setRoutes = function(app) {
	app.get('/tab', function(req, res){
	
	res.render('tab', {
		title: "Debate Tab Demo",
		scripts: ["//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js",
			"javascripts/underscore-min.js", 
			"javascripts/backbone.js", 
			"javascripts/backbone.localStorage-min.js",
			"javascripts/ObjectId.js",
			"javascripts/autocomplete.js",
			"javascripts/tab_client.js"]
	});
	
});
}
