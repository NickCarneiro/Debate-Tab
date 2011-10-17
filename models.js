var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;


/*===============
Models for DebateTab registration
 
	-Just use ObjectId for _id on every document.
================*/

exports.Room = new Schema({
	id			: ObjectId ,
	room_number	: String ,
	accessible	: Boolean
})
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
	cell_phone	: String 
	
});

exports.Team = new Schema({
	id			: ObjectId ,
	team_code	: String , //An abbreviation like Round Rock AC or Hendrickson LK
							//will be displayed on pairing, so must be unique

	stop_scheduling	: Boolean , //true if team drops out of tournament 
								//and needs to be taken off pairing.
	members		: [exports.Competitor]
});

exports.Division = new Schema({
	id				: ObjectId ,
	name			: String ,  //eg: VCX, NLD
	teams			: [exports.Team] ,
	comp_per_team	: Number , //number of competitors per team. 2 in CX, 1 in LD
	break_to		: String , //quarterfinals, octofinals, etc.
	prelim_judges	: Number , //number of judges in prelims
	record_ranks	: Boolean ,
	max_speaks		: Number , //maximum speaker points possible
	flighted_rounds : Boolean ,
	combine_speaks	: Boolean ,
	prelims			: Number , //
	prelim_matching : [] ,
	rooms			: [exports.Room]
	
});

exports.Tournament = new Schema({
	id			: ObjectId ,
	name		: String ,
	start_date	: Date ,
	end_date	: Date ,
	divisions	: [exports.Division] ,
	location	: String //eg: Austin, Texas
});

exports.School = new Schema({
	id			: ObjectId ,
	name		: String ,
	coaches		: [exports.Coach] ,
	tournaments	: [exports.Tournament]
	
});
