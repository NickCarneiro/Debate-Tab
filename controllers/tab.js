module.exports.setRoutes = function(app) {
	app.get('/demo', function(req, res){
	
	res.render('tab', {
		title: "Debate Tab Demo"
	});
	
});
}
