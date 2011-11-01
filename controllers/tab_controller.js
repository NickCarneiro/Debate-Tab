var Client = require('twilio').Client,
	Twiml = require('twilio').Twiml,
	t = new Client('AC89170a4e43fc4a38daed8f055879a20f', 'b6fd343fee0be8aaad34ed8df07ffb3f', 'debatetab.com');
var p = t.getPhoneNumber('+15128430409');

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

	app.post('/text' , function(req, res){
		//var test = req.body;
		//for (var i=0; i< test.length; i++) {
		console.log(req.body.phone_number);
		console.log(req.body.message);
		//}
		//console.log(req.body);

		//code for sending and receiving SMS through twilio
		    //p.setup(function() {
		        //console.log('SMS Received:');
		      	//res.append(new Twiml.Sms('Thanks! We are mapping your text right now. Have fun!'));    //sends text
		        //res.send();
		        p.sendSms(req.body.phone_number, req.body.message, null, function () {
		          console.log("SMS sent");
		        });
			//});

	});

};
