
//code to set up phone for sending and receiving SMS through twilio
var Client = require('twilio').Client,
    Twiml = require('twilio').Twiml,
    sys = require('sys'),
    tClient = new Client('AC89170a4e43fc4a38daed8f055879a20f', 'b6fd343fee0be8aaad34ed8df07ffb3f', 'debatetab.com');
    var phone = tClient.getPhoneNumber('+15128430409');


// set event receiver handlers
    phone.setup(function() {
	      phone.on('incomingSms', function(smsParams, res) {
			console.log('SMS Received From:  ' + smsParams.From);
			console.log('Body: ' + smsParams.Body);
			console.log();
			phone.sendSms(smsParams.From, 'Thanks! We are mapping your text right now. Have fun!', null, function () {
				  console.log("SMS standard reply sent");
			});
	    });
	});

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

// code to send a text when a post request is made to /text
	app.post('/text' , function(req, res){
	//TODO verify user logged in
		phone.sendSms(req.body.phone_number, req.body.message, null, function () {
			console.log('SMS sent');
			console.log('PhoneNumber to Send to: ' + req.body.phone_number);
			console.log('Message to Send: ' + req.body.message);
		});
		res.send('msg_sent');
	});

// code to send MASS texts
	app.post('/textMass' , function(req, res){
	//TODO verify user logged in
		var list = req.body.smsList;
		console.log('Mass Message request: ');
		console.log(list);
		for (var i=0; i< list.length; i++) {
			var number = list[i].phone_number;
			var message = list[i].message;
			console.log('Sending ith mesage where i = ' + i);
			 phone.sendSms(number, message, null, function () {
			      //  console.log('i = ' + iter);
				console.log('SMS sent to: ' + number);
				console.log('Message Sent: ' + message);
				console.log('');
		        });
		}
		res.send('msgs_sent');
	});

};
