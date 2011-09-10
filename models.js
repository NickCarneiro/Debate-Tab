var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

exports.BlogPost = new Schema({
	id			: ObjectId ,
	user_id		: Number ,
	title		: String ,
	body		: String ,
	date		: Date,
	author		: String
});

exports.User = new Schema({
	id    		: ObjectId ,
	username	: String ,
	password	: String ,
	role		: String
});

