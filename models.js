var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

exports.BlogPost = new Schema({
	id		: ObjectId ,
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
	cell_phone	: String
});

exports.Competitor = new Schema({
	id			: ObjectId ,
	email		: String ,
	first_name	: String ,
	last_name	: String ,
	cell_phone	: String ,
	
});

exports.Team = new Schema({
	id			: ObjectId ,
	members		: [exports.Competitor]	
})

exports.Division = new Schema({
	id			: ObjectId ,
	name		: String,  //eg: VCX, NLD
	teams		: [exports.Team]
})

exports.Tournament = new Schema({
	id			: ObjectId ,
	name		: String ,
	start_date	: Date ,
	end_date	: Date ,
	divisions	: [exports.Division] ,
	location	: String //eg: Austin, Texas
})

exports.School = new Schema({
	id			: ObjectId ,
	name		: String ,
	coaches		: [exports.Coach] ,
	tournaments	: [exports.Tournament]
	
})
