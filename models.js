var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

exports.BlogPost = new Schema({
	id			: ObjectId ,
	user_id		: Number ,
	title		: String ,
	body		: String ,
	date		: Date
});

exports.User = new Schema({
	id    		: ObjectId ,
	username	: String ,
	password	: String ,
	role		: String
});


/*===============
Models for DebateTab registration

	-Just use ObjectId for _id on every document.
================*/

exports.Coach = new Schema({
	id    		: ObjectId ,
	email		: String ,
	password	: String ,
	first_name	: String ,
	last_name	: String ,
	school		: ObjectId ,
	cell_phone	: String
});

exports.Competitor = new Schema({
	id			: ObjectId ,
	email		: String ,
	first_name	: String ,
	last_name	: String ,
	cell_phone	: String ,
	
});
