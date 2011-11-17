module.exports.setRoutes = function(app) {
	//code to set up phone for sending and receiving SMS through twilio
	var Client = require('twilio').Client,
	Twiml = require('twilio').Twiml,
	sys = require('sys'),
	//tClient = new Client('AC89170a4e43fc4a38daed8f055879a20f', 'b6fd343fee0be8aaad34ed8df07ffb3f', 'debatetab.com', {port:app.env.twilio_port});
	tClient = new Client('AC89170a4e43fc4a38daed8f055879a20f', 'b6fd343fee0be8aaad34ed8df07ffb3f', 'debatetab.com');

	var phone = tClient.getPhoneNumber('+15128430409');

	app.get('/tab', function(req, res){
		res.render('tab', {
			title: "Debate Tab Demo",
			scripts: ["javascripts/libs/tab_plugins.js",
				"javascripts/tab_client.js",
				"javascripts/jot_parsing.js"
			],
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

	// code to send a text when a post request is made to /text
	// TODO verify user logged in
	app.post('/text' , function(req, res){
		try {
			var number = req.body.phone_number;
			var message = req.body.message;
			phone.sendSms(number, message, null, function () {
				console.log('SMS sent');
				console.log('PhoneNumber: ' + number);
				console.log('Message: ' + message);
			});
			res.send('single text sent to ' + number + '. and the message was: ' + message);
		} catch (e) {
			console.log('An error has occured while sending a single message: ' + e.message);
			res.send('An error has occured while sending a single message: ' + e.message);
		}
	});	

	// code to send MASS texts
	// TODO verify user logged in
	app.post('/textMass' , function(req, res){
		try {
			var list = req.body.smsList;
			console.log('Mass Message request: ');
			console.log(list);
			
			for (var i=0; i< list.length; i++) {
				var number = list[i].phone_number;
				var message = list[i].message;
				
				console.log('Sending ith message where i = ' + i);

				sendMassTexts(i, number, message);
			}
			res.send('mass texts sent');
		} catch (e) {
			console.log('An error has occured while sending the mass messages: ' + e.message);
			res.send('An error has occured while sending the mass messages: ' + e.message);
		}
	});
};

// function that sends message and provides a callback with specific log actions as well
// used by post('/textMass')
// abstracting this action into a function allows the logging to work correctly because of
// variable scope, which was an issue earlier
function sendMassTexts(i, number, message) {
	 phone.sendSms(number, message, null, function () {
		console.log('i = ' + i);
		console.log('SMS sent to: ' + number);
		console.log('Message Sent: ' + message);
		console.log('');
	});
}
