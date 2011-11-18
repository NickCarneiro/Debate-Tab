/*
============================
DebateTab.com Tab Client
(C) 2011 Trillworks LLC
Nick Carneiro
============================
*/



//module pattern
//see http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
var tab = (function (){

	//one var per declaration helps protect against accidental globals
	var model = {};
	var view = {};
	//currently unused
	var router = {};
	var collection = {};

	//contains helpful functions for pairing rounds
	var pairing = {};
	pairing.name2debate = {};
	// define HashMap of round names to num_debates_that_take_place
	pairing.name2debate["triple octafinals"] = 32;
	pairing.name2debate["double octafinals"] = 16;
	pairing.name2debate["octafinals"] = 8;
	pairing.name2debate["quarterfinals"] = 4;
	pairing.name2debate["semifinals"] = 2;
	pairing.name2debate["finals"] = 1;

	pairing.debate2name = {};
	//define HashMap of num_debates_that_take_place to round names
	pairing.debate2name["32"] = "triple octafinals";
	pairing.debate2name["16"] = "double octafinals";
	pairing.debate2name["8"] = "octafinals";
	pairing.debate2name["4"] = "quarterfinals";
	pairing.debate2name["2"] = "semifinals";
	pairing.debate2name["1"] = "finals";

	//debug console
	var con = {};
	//functions to maniulate the interface and ui state
	
	var ui = {};


	//functions for working with pdfs
	var pdf = {};


/*
=========================================
Define Console Functions
=========================================
*/	
con.write = function(text){
	$("#console_window").append("<span>" + text + "</span> <br />");
	//TODO: scroll to bottom
	$("#console_window").scrollTop($("#console_window")[0].scrollHeight);
}


/*
=========================================
Define Backbone Models
=========================================
*/	

model.Tournament = Backbone.Model.extend({
	default: {
		tournament_name: "Debate Tournament"
	},
	initialize: function() {
		if(this.id === undefined){
			this.set({
				id: (new ObjectId()).toString()
			});
		}	
	}
});

model.Competitor = Backbone.Model.extend({
	default: {
		name: "",
		total_speaks: 0,
		adjusted_speaks: 0,
		total_ranks: 0
	}
});

model.Team = Backbone.Model.extend({
	default: {
		id			: null ,
		team_code	: "default team_code" ,
		division	: null , //reference to division
		school	: null , //reference to school
		wins:	0,
		losses:	0,

		stop_scheduling : false ,
		competitors : []

	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				competitors: new collection.Competitors() ,
				id: (new ObjectId()).toString()
			});
		}
		
	} 
});

model.School = Backbone.Model.extend({
	default: {
		id: null,
		school_name: "DEFAULT_SCHOOL_NAME",
		division: null

	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				id: (new ObjectId()).toString()
			});
		}
	}
});

model.Room = Backbone.Model.extend({
	default: {
		id: null,
		school_name: "DEFAULT_ROOM_NAME",
		division: null,
		name: null

	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				id: (new ObjectId()).toString()
			});
		}
	}
});

model.Judge = Backbone.Model.extend({
	default: {
		id			: null,
		name		: null,
		school		: null
	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				id: (new ObjectId()).toString()
			});
		}	
	}
    
});



model.Round = Backbone.Model.extend({
	default: {
		division	: null, //ref to division
		team1		: null, //reference to team1 in teams collection
		team2		: null, //
		aff			: null, //team1 or team2
		result		: null,
		room        : null,
		team1_points : null,
		team2_points : null
		/*
		result can be: 0 - 7:
		0 AFF_WIN_NEG_LOSS
		1 AFF_BYE_NEG_FORFEIT
		2 NEG_WIN_AFF_LOSS
		3 NEG_BYE_AFF_FORFEIT
		4 DOUBLE_WIN
		5 DOUBLE_LOSS
		6 DOUBLE_BYE
		7 DOUBLE_FORFEIT
		*/


	} ,
	initialize: function(){
		if(this.id === undefined){
			this.set({
			id: (new ObjectId()).toString()
			});
		}	
	},

	//returns winning team, false if no winner
	getWinner: function(){
		//if round is a bye, the real team is the winner.
		if(this.get("team1").get("team_code") === "BYE"){
			return this.get("team2");
		} else if(this.get("team2").get("team_code") === "BYE"){
			return this.get("team1");
		} else if(this.get("result") === undefined){
			return false;
		} else if(this.get("result") == 0 || this.get("result") == 1){
			return this.get("aff") == 0 ? this.get("team1") : this.get("team2");
		} else if(this.get("result") == 2 || this.get("result") == 3){
			return this.get("aff") == 0 ? this.get("team2") : this.get("team1"); 
		} else {
			con.write("fatal error: invalid round result: " + this.get("result"));
		}
	},
	getLoser: function(){
		if(this.get("result") === undefined){
			return false;
		} else if(this.get("result") == 0 || this.get("result") == 1){
			return this.get("aff") == 0 ? this.get("team2") : this.get("team1");
		} else if(this.get("result") == 2 || this.get("result") == 3){
			return this.get("aff") == 0 ? this.get("team1") : this.get("team2"); 
		} else {
			con.write("fatal error: invalid round result: " + this.get("result"));
		}
	}
});



model.Division = Backbone.Model.extend({
	default: {
		id				: null ,
		division_name	: "VCX" ,  //eg: VCX, NLD
		comp_per_team	: 2 , //number of competitors per team. 2 in CX, 1 in LD
		break_to		: "quarterfinals" , //quarterfinals, octofinals, etc.
		prelim_judges	: 1 , //number of judges in prelims
		record_ranks	: true ,
		max_speaks		: 30 , //maximum speaker points possible
		flighted_rounds : false ,
		prelims			: -1 , //
		prelim_matching : [] ,
		schedule		: [] //array of round info objects that contain a round_number and powermatching_method
	} ,
	initialize: function(){
		if(!this.id == undefined){
			this.set({
				id: new ObjectId().toString()
			});
		}
	}
});



/*
=========================================
Define Backbone Collections
=========================================
*/	

collection.Competitors = Backbone.Collection.extend({
		model: model.Competitor
});



collection.Teams = Backbone.Collection.extend({
	model: model.Team ,

	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("team_code"));
		}));
	} ,
	//keep sorted in descending order of wins
	//overwrite this to change method of ranking for TFA vs UIL vs NFL or other league rules
	comparator : function(team){
		return team.get("wins") * -1;
	} ,
	localStorage: new Store("Teams")
});	


collection.Judges = Backbone.Collection.extend({
		model: model.Judge ,

		search : function(letters){
			if(letters == "") return this;

			var pattern = new RegExp(letters,"gi");
			return _(this.filter(function(data) {
			  	return pattern.test(data.get("name"));
			}));
		} ,
		localStorage: new Store("Judges")
});	

collection.Schools = Backbone.Collection.extend({
	model: model.School ,
	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("school_name"));
		}));
	} ,
	localStorage: new Store("Schools")
});	

collection.Rooms = Backbone.Collection.extend({
	model: model.Room ,
	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("name"));
		}));
	} ,
	localStorage: new Store("Rooms")
});	

collection.Divisions = Backbone.Collection.extend({
		model: model.Division ,
		localStorage: new Store("Divisions")
});	

collection.Rounds = Backbone.Collection.extend({
		model: model.Round ,
		localStorage: new Store("Rounds"),
		filterRounds: function(round_number, division){
			return _(this.filter(function(data){
				
				if(data.get("division") === division && data.get("round_number") == round_number){
					
					return true;
				} else {
					return false;
				}
			}));
		}
});	

/*
=========================================
BEGIN: Define Pairing Functions
=========================================
*/	

//deletes everything.
pairing.clearStorage = function(){
	localStorage.clear();
}
// all functions for tab below this point
pairing.getSchoolFromId = function(school_id){
	for(var i = 0; i < collection.schools.length; i++){
		if(school_id === collection.schools.at(i).get("id")){
			return collection.schools.at(i);
		}
	}
	return undefined;
}

pairing.getDivisionFromId = function(division_id){
	for(var i = 0; i < collection.divisions.length; i++){
		if(division_id === collection.divisions.at(i).get("id")){
			return collection.divisions.at(i);
		}
	}
	return undefined;
}

pairing.getTeamFromId = function(team_id){
	for(var i = 0; i < collection.teams.length; i++){
		if(team_id === collection.teams.at(i).get("id")){
			return collection.teams.at(i);
		}
	}
	return undefined;
}

pairing.getRoomFromId = function(room_id){
	for(var i = 0; i < collection.rooms.length; i++){
		if(room_id === collection.rooms.at(i).get("id")){
			return collection.rooms.at(i);
		}
	}
	return undefined;
}

pairing.getJudgeFromId = function(judge_id){
	for(var i = 0; i < collection.judges.length; i++){
		if(judge_id === collection.judges.at(i).get("id")){
			return collection.judges.at(i);
		}
	}
	return undefined;
}

pairing.getRoundFromId = function(round_id){
	for(var i = 0; i < collection.rounds.length; i++){
		if(round_id === collection.rounds.at(i).get("id")){
			return collection.rounds.at(i);
		}
	}
	return undefined;
}
//returns true if round has already been paired
pairing.alreadyPaired = function(round_number, division){
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("division") === division && collection.rounds.at(i).get("round_number") === round_number){
			return true;
		}
	}
	return false;
}
//object references to backbone models get turned into plain old objects 
//when they are loaded from localstorage.
//this function looks at the ObjectIds of the objects and turns the plain old
//objects back into references to the backbone models
pairing.restoreReferences = function(){
	var fixed = 0;
	for(var i = 0; i < collection.teams.length; i++){
		//######
		//restore references for teams
		//######
		//restore school reference
		var school_id = collection.teams.at(i).get("school").id;
		if(school_id != undefined){
			var school = pairing.getSchoolFromId(school_id);
			if(school != undefined){
				fixed++;
				collection.teams.at(i).set({school: school});
			}
		}

		//restore division reference
		var division_id = collection.teams.at(i).get("division").id;
		if(school_id != undefined){
			var division = pairing.getDivisionFromId(division_id);
			if(division != undefined){
				
				collection.teams.at(i).set({division: division});
			}
		}
	}
	
	//######
	//restore references for rounds
	//######
	for(var i = 0; i < collection.rounds.length; i++){
		//fix team references
		if(collection.rounds.at(i).get("team1") != undefined){
			var team1_id = collection.rounds.at(i).get("team1").id;
			var team1 = pairing.getTeamFromId(team1_id);
		} else {
			var team1 = null;
		}
		if(collection.rounds.at(i).get("team2") != undefined){
			var team2_id = collection.rounds.at(i).get("team2").id;
			var team2 = pairing.getTeamFromId(team2_id);
		} else {
			var team2 = null;
		}
		
		collection.rounds.at(i).set({team1: team1});
		collection.rounds.at(i).set({team2: team2});

		//fix division reference
		var division_id = collection.rounds.at(i).get("division").id;
		if(division_id != undefined){
			var division = pairing.getDivisionFromId(division_id);
			if(division != undefined){
				
				collection.rounds.at(i).set({division: division});
				//re-add bye team if any null references found.
				//happens because bye teams don't get saved to localstorage
				if(collection.rounds.at(i).get("team1") === undefined){
					var bye_team = new model.Team();
					bye_team.set({team_code: "BYE"});
					bye_team.set({division: division});
					collection.rounds.at(i).set({team1: bye_team});
				} else if (collection.rounds.at(i).get("team2") === undefined){
					var bye_team = new model.Team();
					bye_team.set({team_code: "BYE"});
					bye_team.set({division: division});
					collection.rounds.at(i).set({team2: bye_team});
				}
				
			}
		} else {
			con.write("WARNING: division id was undefined when restoring reference for round");
		}
		//fix room references
		if(collection.rounds.at(i).get("room")!= undefined){
			var room_id = collection.rounds.at(i).get("room").id;
			if(room_id != undefined){
				var room = pairing.getRoomFromId(room_id);
				if(room != undefined){
					collection.rounds.at(i).set({room: room});
				} else {
					con.write("WARNING: room was undefined when searching for id");
				}
			} else {
				con.write("WARNING: room id was undefined when restoring reference for round")
			} 
		}

		//fix judge references
		if(collection.rounds.at(i).get("judge") != undefined){
			var judge_id = collection.rounds.at(i).get("judge").id;
			if(judge_id != undefined){
				var judge = pairing.getJudgeFromId(judge_id);
				if(judge != undefined){
					collection.rounds.at(i).set({judge: judge});
				} else {
					con.write("WARNING: judge was undefined when searching for id");
				}
			} else {
				con.write("WARNING: judge id was undefined when restoring reference for round")
			} 
		}

	}

	//######
	//restore references for judges
	//######
	for(var i = 0; i < collection.judges.length; i++){
		if(collection.judges.at(i).get("school") != undefined){
			var school_id = collection.judges.at(i).get("school").id;
			var school = pairing.getSchoolFromId(school_id);
		} else {
			var school = undefined;
		}
		collection.judges.at(i).set({school: school});

		if(collection.judges.at(i).get("divisions") != null){
			var divisions = collection.judges.at(i).get("divisions");
			for(var j = 0; j < divisions.length; j++){
				var div_id = divisions[j].id;
				var div = pairing.getDivisionFromId(div_id);
				divisions[j] = div;
			}
		}
		
	}
	
		//######
	//restore references for Rooms
	//######
	for(var i = 0; i < collection.rooms.length; i++){
		if(collection.rooms.at(i).get("division") != undefined){
			var div_id = collection.rooms.at(i).get("division").id;
			var div = pairing.getDivisionFromId(div_id);
			collection.rooms.at(i).set({division: div});
		}

	}
}

pairing.prelimRoundValid = function (team1, team2, round){
		//this case is for round 1 or a tournament with no power matching
		
		if(team1.get("division") != team2.get("division")){
			//are from the same school
			con.write("WARNING: checked for valid round between teams from different divisions.");
		} 
		if(team1.get("school") === team2.get("school")){
			return false;
		} else {
			if(round === 1 || round === undefined){
				return true;
			} else {
				if(pairing.alreadyDebated(team1, team2)){
					return false;
				} else {
					return true;
				}		
			}
		}
}
//sort teams in descending order of wins
pairing.sortTeams = function(){
	collection.teams.sort();
}

pairing.compareTeams = function(team){
	//comparison function used when sorting teams
	con.write("wins: " + team.get("wins"));
	return team.get("wins");

}

//iterates over round collection and sets wins, losses in each team model
//in the teams collection
pairing.updateRecords = function(){
//update win loss records for each team
	for(var i = 0; i < collection.teams.length; i++){
		collection.teams.at(i).set({wins:  0});
		collection.teams.at(i).set({losses: 0});
		for(var j = 0; j < collection.rounds.length; j++){
			if(collection.rounds.at(j).getWinner() === collection.teams.at(i)){
				var new_wins = collection.teams.at(i).get("wins") + 1;
				collection.teams.at(i).set({wins: new_wins});
			} else if(collection.rounds.at(j).getLoser() === collection.teams.at(i)){
				var new_losses = collection.teams.at(i).get("losses") + 1;
				collection.teams.at(i).set({losses: new_losses});
			}
		}
		collection.teams.at(i).save();
	}
}

pairing.deleteAllRounds = function(){
	
	con.write("rounds length " + collection.rounds.length);
	while(collection.rounds.at(0) != undefined){
	
		con.write("removing round " + collection.rounds.at(0).get("team1"));
		collection.rounds.at(0).destroy();
		//collection.rounds.remove(round);
	}
}
//generate random results for specified round
pairing.simulateRound = function(round_number){
	//generate results for specified round
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("round_number") === round_number){	
		
			
			//result is 0 thru 3
			collection.rounds.at(i).set({result: Math.floor(Math.random() * 4)});
		}
	}
}


//set the sides in a debate round by setting Round.aff to 0 (team1) or 1 (team2)
//TODO: make better than random
pairing.setSides = function(round_number, division){

	//if round_number is one, choose sides randomly
	if(round_number === 1){
		for(var i = 0; i < collection.rounds.length; i++){
			//skip irrelevant rounds
			if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
				continue;
			}
			collection.rounds.at(i).set({aff: Math.floor(Math.random() * 2)});
		}
		
	} else{
		//give aff to the team with fewer aff rounds
		var sides = [];
		//one pass over teams to initialize affs and negs to zero
		for(var i = 0; i < collection.teams.length; i++){
			if(collection.teams.at(i).get("division") != division){
				continue;
			}
			sides[collection.teams.at(i).get("id")] = {aff: 0, neg: 0};
		}

		for(var i = 0; i < collection.rounds.length; i++){
			//one pass over previous rounds to count affs and negs for each team
			if(collection.rounds.at(i).get("round_number") >= round_number || collection.rounds.at(i).get("division") != division){
				continue;
			}
			if(collection.rounds.at(i).get("team1").get("team_code") != "BYE" 
				&& collection.rounds.at(i).get("team2").get("team_code") != "BYE"){
					
				if(collection.rounds.at(i).get("aff") === 0){
					sides[collection.rounds.at(i).get("team1").get("id")].aff++;
					sides[collection.rounds.at(i).get("team2").get("id")].neg++;
				} else if(collection.rounds.at(i).get("aff") === 1){
					sides[collection.rounds.at(i).get("team1").get("id")].neg++;
					sides[collection.rounds.at(i).get("team2").get("id")].aff++;
				} else {
					con.write("WARNING: previous round had no side set");
				}
			
			}
		}
		
		//set sides according to past records
		for(var i = 0; i < collection.rounds.length; i++){
			//skip irrelevant rounds
			if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
				continue;
			}
			//skip bye rounds
			if(collection.rounds.at(i).get("team1").get("team_code") === "BYE" 
				|| collection.rounds.at(i).get("team2").get("team_code") === "BYE"){
				continue;
			}
			if(sides[collection.rounds.at(i).get("team1").get("id")] > sides[collection.rounds.at(i).get("team2").get("id")]){
				//team2 should be aff
				collection.rounds.at(i).set({aff: 1});
			} else {
				//team1 should be aff
				collection.rounds.at(i).set({aff: 0});
			}

		} 
	}
	
}


pairing.roundCount = function(round_number){
	var count = 0;
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("round_number") === round_number){
			count++;
		}
	}
	//con.write("roundCount " + count);
	return count;
};
pairing.printRecords = function(division){

	con.write("############## TEAM RECORDS IN " + division.get("division_name") + " ###############");
	for(var i = 0; i < collection.teams.length; i++){
		if(collection.teams.at(i).get("division") != division){
			continue;
		}
		var padding = 20 - collection.teams.at(i).get("team_code").length;
			var spaces = "";
			for(var j = 0; j < padding; j++){
				spaces = spaces + "&nbsp;";
			}
		con.write(collection.teams.at(i).get("team_code") + " : " +  
			spaces + collection.teams.at(i).get("wins") + "-" + collection.teams.at(i).get("losses"));
	}	
}

//returns true if two teams have already debated each other in prelims

pairing.alreadyDebated = function(team1, team2){
	for(var i = 0; i < rounds.length; i++){
		if(collection.rounds.at(i).get("team1") == team1 && collection.rounds.at(i).get("team2") == team2){
			return true;
		} else if(collection.rounds.at(i).get("team1") == team2 && collection.rounds.at(i).get("team2") == team1){
			return true;
		} 
	}
	//if we get here, they have never debated.
	return false;
}

/**
Print pairings in the debug console. Does not modify anything. Just prints.
**/
pairing.printPairings = function(round_number, division){
	con.write("############## ROUND " + round_number +" in " + division.get("division_name") + "###############");
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("round_number") === round_number
			&& collection.rounds.at(i).get("division") === division){
			if(collection.rounds.at(i).get("aff") === 0 || 
				collection.rounds.at(i).get("aff") === undefined){
				var left_team = collection.rounds.at(i).get("team1");
				var right_team = collection.rounds.at(i).get("team2");
			}else {
				var left_team = collection.rounds.at(i).get("team2");
				var right_team = collection.rounds.at(i).get("team1");
			}
			
			var padding = 30 - left_team.get("team_code").length;
			var spaces = "";
			for(var j = 0; j < padding; j++){
				spaces = spaces + "&nbsp;";
			}
			var room = "";
			if(collection.rounds.at(i).get("room") != undefined){
				room = collection.rounds.at(i).get("room").get("name");
			}

			var judge = "#";
			if(collection.rounds.at(i).get("judge") != undefined){
				judge = collection.rounds.at(i).get("judge").get("name");
			}
			con.write(left_team.get("team_code") + spaces + 
				right_team.get("team_code") + " " + room + " " + judge);
			}
		
	}

}

/*
Make sure no team gets a BYE if they have already had one in a previous round
*/
pairing.fixRepeatedByes = function(round_number, division){
	var bye = undefined; //team that has a bye
	for(var i = 0; i < collection.rounds.length; i++){
		//skip all irrelevant rounds
		if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
			//con.write("skipping.");
			continue;
		}

		var team1 = collection.rounds.at(i).get("team1");
		var team2 = collection.rounds.at(i).get("team2");



		if(team1 === undefined || team2 === undefined){
			con.write("FATAL ERROR: a team was found to be undefined in fixRepeatedByes");
		} else {
			//check to see if round is a bye
			var bye;
			if(team1.get("team_code") === "BYE"){
				bye = team2;
				//round with one real team and one fake bye team


			} else if (team2.get("team_code") === "BYE"){
				bye = team1;
				//round with one real team and one fake bye team


			} else {
				//this round is not a bye. go to the next one.
				continue;
			}

			var bye_round = collection.rounds.at(i);
			var bye_index = i;
			break; //we found the bye round. stop searching.

		}
	}

	if(bye != undefined){
		//con.write("bye found: " + bye.get("team_code"));
		if(pairing.alreadyHadBye(bye, round_number, division) === true){
			//find someone who can debate against bye in bye_round
			//con.write(bye.get("team_code") + " has already had a bye. Finding valid opponent.");
			//this code is run after the power match so rounds are in sorted order of most wins to fewest.
			//first try to go downwards to find a valid opponent.
			//con.write("going downward to find team to swap for bye");
			for(var i = bye_index + 1; i < collection.rounds.length; i++){
				//try to take team1
				if(pairing.prelimRoundValid(bye, collection.rounds.at(i).get("team1"))){
					if(!pairing.alreadyHadBye(collection.rounds.at(i).get("team2"))){
						//found a valid switch. 
						pairing.replaceByeWithTeam(bye_round, collection.rounds.at(i).get("team1"));
						return;
					}
				}
				//couldn't take team1. try team2.
				if(!pairing.prelimRoundValid(bye, collection.rounds.at(i).get("team2"))){
					if(!pairing.alreadyHadBye(collection.rounds.at(i).get("team1"))){
						//found a valid switch. 
						pairing.replaceByeWithTeam(bye_round, collection.rounds.at(i).get("team2"));
						return;
					}
				}
			}

			//con.write("going upward to find team to swap for bye");
			//try going upward from the bye round if nothing below works.
			for(var i = bye_index - 1; i >= 0; i--){
				//try to take team1
				if(pairing.prelimRoundValid(bye, collection.rounds.at(i).get("team1"))){
					if(!pairing.alreadyHadBye(collection.rounds.at(i).get("team2"))){
						//found a valid switch. 
						pairing.replaceByeWithTeam(bye_round, collection.rounds.at(i).get("team1"));
						//over write source team with bye
						//create BYE team to put in place
						var bye_team = new model.Team();
						bye_team.set({"team_code": "BYE"});
						collection.rounds.at(i).set({"team1": bye_team});

						return;
					}
				}
				//couldn't take team1. try team2.
				if(!pairing.prelimRoundValid(bye, collection.rounds.at(i).get("team2"))){
					if(!pairing.alreadyHadBye(collection.rounds.at(i).get("team1"))){
						//found a valid switch. 
						pairing.replaceByeWithTeam(bye_round, collection.rounds.at(i).get("team2"));
						//over write source team with bye
						//create BYE team to put in place
						var bye_team = new model.Team();
						bye_team.set({"team_code": "BYE"});
						collection.rounds.at(i).set({"team2": bye_team});

						return;
					}
				}
			}

			con.write("ERROR: could not fix bye by switching teams");

		}
	} else {
		//no byes found
	}

}

//@round is the bye round that is being modified
//@team is the real team replacing the bye team in @round
pairing.replaceByeWithTeam = function(round, team){
	
	
	if(round.get("team1").get("team_code") === "BYE"){
		//replace team1
		round.set({team1: team});
		con.write("Replacing bye for " + round.get("team2").get("team_code") + " with " + team.get("team_code"));
	} else if(round.get("team2").get("team_code") === "BYE"){
		//replace team 2
		round.set({team2: team});
		con.write("Replacing bye for " + round.get("team1").get("team_code") + " with " + team.get("team_code"));

	} else {
		console.log(round);
		con.write("FATAL ERROR: bye round in replaceByeWithTeam was not actually a bye round. See chrome console.")
	}
}
/*
return true if @team has already had a bye.
@division is the division that @team is competing in
@round is the round that the caller is currently attempting to pair
*/
pairing.alreadyHadBye = function(team, round_number, division){
	//found a bye. check the other rounds.
		for(var i = 0; i < collection.rounds.length; i++){
			if(collection.rounds.at(i).get("round_number") < round_number && collection.rounds.at(i).get("division") === division){
				//only check previous rounds in the division this team is entered.
				var team1 = collection.rounds.at(i).get("team1");
				var team2 = collection.rounds.at(i).get("team2");
				if(team1 === team && team2.get("team_code") === "BYE"){
					//team has had a bye previously
					return true;

				} else if(team2 === team && team1.get("team_code") === "BYE"){
					//team has had a bye previously
					return true
				} 
			}
		}
		//didn't find any previous byes
		return false;
}

pairing.teamsInDivision = function(division){
	var teamcount = 0;
	for(var i = 0; i < collection.teams.length; i++){
		if(collection.teams.at(i).get("division") === division){
			teamcount++;	
		}
	}
	return teamcount;
}
/*
Creates round models for specified round_number and division.
*/

pairing.pairRound = function(round_number, division){
	pairing.updateRecords(division);
	pairing.sortTeams(division);
	pairing.printRecords(division);
	var toDelete =[];
	//delete all rounds in this round number and division
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("division") === division && collection.rounds.at(i).get("round_number") === round_number){
			toDelete.push(collection.rounds.at(i));
		}
	}

	for(var i = 0; i < toDelete.length; i++){
		toDelete[i].destroy();
	}

	var total_teams = pairing.teamsInDivision(division);
	var total_rounds = Math.ceil(total_teams / 2);

	if(round_number === 1){


		con.write("Total teams: " + total_teams);
		con.write("Creating total rounds: " + total_rounds);
		//shuffle teams to produce different pairing
		collection.teams = $.shuffle(collection.teams);
		//copy teams into temporary array
		temp_teams = [];
		for(var i = 0; i < collection.teams.length; i++){
			if(collection.teams.at(i).get("division") === division){
				temp_teams.push(collection.teams.at(i));
			}

		}
		for (var i = 0; i < total_rounds; i++){

			var team = temp_teams.pop();
			var round = new model.Round();
			round.set({"round_number": round_number});
			round.set({"team1": team});
			round.set({"division": division});
			//team1 is left unset
			//round.team2 = null;
			collection.rounds.add(round);
		}

		con.write("temp_teams " + temp_teams.length);
		var unpaired = []
		//have created every round with 1 team. find opponents
		for(var i = 0; i < collection.rounds.length; i++){ //iterate through rounds
			//skip rounds not in this division or not for this round number
			if(collection.rounds.at(i).get("division") != division || collection.rounds.at(i).get("round_number") != round_number){
				continue;
			}
			for(var j = 0; j < temp_teams.length; j++){ //interate through unpaired remaining teams

				//find a team2 if one isn't set yet
				if(collection.rounds.at(i).get("team2") === undefined){

					var team2 = temp_teams[j];
					//con.write("placing " + team2.get("team_code") + " with " + collection.rounds.at(i).get("team1").get("team_code"));
					if(pairing.prelimRoundValid(collection.rounds.at(i).get("team1"), team2) === true){
						collection.rounds.at(i).set({"team2":team2});
						temp_teams.splice(j,1);//remove team from unpaired temp teams
						//found a match for this round, break and go to next round
						break;
					} else {
						//con.write("cannot pair " + collection.rounds.at(i).get("team1").get("team_code") + " and " + team2.get("team_code"));
					}
				} else {
					con.write("round already paired");
				}
			}
		}

		//check for empty team slots and insert bye teams there.
		for(var i = 0; i< collection.rounds.length; i++){
			//skip rounds not in this division or this round number
			if(collection.rounds.at(i).get("division") != division || collection.rounds.at(i).get("round_number") != round_number){
				continue;
			}
			//insert a fake "bye" team if necessary
			if(collection.rounds.at(i).get("team2") === undefined){
				//set team2 in this round to a fake bye team
				var bye_team = new model.Team();
				bye_team.set({team_code: "BYE"});
				bye_team.set({division: division});
				collection.rounds.at(i).set({team2: bye_team});
			}
		}


		//at this point an initial pairing has been created but it may have more than one bye
		con.write("");

		//determine if there are unnecessary byes
		var byes = 0;
		for(var k = 0; k < rounds.length; k++){
			//skip irrelevant rounds
			if(collection.rounds.at(i).get("division") != division || collection.rounds.at(i).get("round_number") != round_number){
				continue;
			}
			if(collection.rounds.at(k).get("team2").get("team_code") === "BYE"){
				byes++;
			}
		}		


		if((byes > 1) || (total_teams % 2 == 0 && byes > 0)){
			//if there are an even number of teams but someone has a bye, fix it.
			con.write("fixing byes");	
			con.write("temp_teams: " + temp_teams.length);
			con.write("byes: " + byes);

			//Teams that haven't been paired are still in temp_teams 
			for(var i = 0; i < temp_teams.length; i++){


				//find the first bye round
				var bye;
				for(var k = 0; k < collection.rounds.length; k++){
					//skip irrelevant rounds
					if(collection.rounds.at(i).get("division") != division || collection.rounds.at(i).get("round_number") != round_number){
						continue;
					}
					if(collection.rounds.at(k).get("team2").get("team_code") === "BYE"){
						bye = collection.rounds.at(k);
					}
				}

				con.write("fixing bye for " + bye.get("team1").get("team_code"));

				//need to find two sets of teams that are compatible.
				for(var j = 0; j < collection.rounds.length; j++){
					//skip previous rounds
					if(collection.rounds.at(i).get("division") != division || collection.rounds.at(i).get("round_number") != round_number){
						continue;
					}
					if(pairing.prelimRoundValid(collection.rounds.at(j).get("team1"), temp_teams[i]) 
						&& pairing.prelimRoundValid(bye.get("team1"), collection.rounds.at(j).get("team2"))){
						//replace bye team with already paired team2
						bye.set({"team2": collection.rounds.at(j).get("team2")});
						// and replace team2 with unpaired team
						collection.rounds.at(j).set({"team2": temp_teams[i]});

						break; // go to next unpaired team
					}	
				}

				if(j == collection.rounds.length - 1){

					con.write("failed to settle bye for " + bye.get("team1").get("team_code"));
				}

			}

		}
	} else {
		//attempt to power match round
		pairing.updateRecords();
		pairing.sortTeams();
		//TODO: account for teams in multiple divisions
		var paired = [];
		//O(n^2) method of pairing teams
		for(var i = 0; i < collection.teams.length - 1; i++){

			//skip team if it's already paired
			if(paired.indexOf(collection.teams.at(i)) != -1){
				continue;
			}
			//skip team if it isn't in this division
			if(collection.teams.at(i).get("division") != division){
				continue;
			}

			for(var j = i; j < collection.teams.length; j++){

				//skip team if it's already paired
				if(paired.indexOf(collection.teams.at(j)) != -1){
					continue;
				}
				//skip team if it isn't in this division
				if(collection.teams.at(j).get("division") != division){
					continue;
				}
				//con.write("comparing " + collection.teams.at(i).get("team_code") + " and " + collection.teams.at(j).get("team_code"));
				if(pairing.prelimRoundValid(collection.teams.at(i), collection.teams.at(j), round_number)){
					var round = new model.Round();
					round.set({"team1": collection.teams.at(i)});
					round.set({"team2": collection.teams.at(j)});
					round.set({"round_number": round_number});
					round.set({"division": division});
					collection.rounds.add(round);
					//keep track of teams that have been paired
					paired.push(collection.teams.at(i));
					paired.push(collection.teams.at(j));
					//go to next team to pair
					break;
				} else {
					//con.write("pair invalid: " + teams[i].name + " " + teams[j].name);
				}
			}
		}

		//array of models
		var unpaired = [];
		//count unpaired teams
		for(var i = 0; i < collection.teams.length; i++){
			//ignore teams not in this division
			if(collection.teams.at(i).get("division") != division){
				continue;
			}
			if(paired.indexOf(collection.teams.at(i)) === -1){
				//team has not been paired

				//create a round with only one team
				//but only if we don't have the desired amount of rounds created
				if(pairing.roundCount(round_number) < total_rounds){
					var round = new model.Round();
					round.set({"team1": collection.teams.at(i)});
					var bye_team = new model.Team();
					bye_team.set({"team_code": "BYE"});
					round.set({"team2":  bye_team});
					round.set({"round_number": round_number});
					round.set({"division": division});
					paired.push(collection.teams.at(i));
					collection.rounds.add(round);

				} else {
					unpaired.push(collection.teams.at(i));

				}

			}


		}

		var byes = 0;
		for(var k = 0; k < collection.rounds.length; k++){
			//This addresses byes in  order that they appear
			if(collection.rounds.at(k).get("team2").get("team_code") === "BYE"){
				if(collection.rounds.at(k).get("round_number") === round_number){
					byes++;
				}

			}
		}

		if(unpaired.length > 0){
			con.write(unpaired.length + " teams were left unpaired:");
			//print out unpared teams
			for(var i = 0; i < unpaired.length; i++){
				con.write(unpaired[i].get("team_code"));
			}
		}



		//if there are an even number of teams OR
		//there are an odd number but more than 1 is unpaired, fix pairings
		if((collection.teams.length % 2 === 0  && unpaired.length > 0 ) || unpaired.length > 1 || byes > 1){
			con.write("fixing broken power match");
			//rounds are in order of best to worst
			//unpaired in unsorted are also in order of best to worst. 

			//now we have some teams with no opponents sitting at the bottom of the pairing
				// as well as some unpaired teams

				for(var i = 0; i < unpaired.length; i++){

					con.write("trying to pair unpaired team " + unpaired[i].get("team_code"));
					//find the first bye round
					var bye;
					for(var k = 0; k < collection.rounds.length; k++){
						//This addresses byes in  order that they appear
						if(collection.rounds.at(k).get("team2").get("team_code") === "BYE"){
							bye = collection.rounds.at(k);
						}
					}

					if(bye === undefined){
						con.write("FATAL ERROR: bye is undefined");
						//can't fix this here
						break;
					}
					//need to find two sets of teams that are compatible.
					for(var j = collection.rounds.length - 1; j >= 0; j--){
						//skip previous rounds
						if(!collection.rounds.at(j).get("round_number") === round_number){
							con.write("round number is " + collection.rounds.at(j).get("round_number") 
								+ " and desired is " + round_number);
							continue;
						}
						//skip rounds not in this division
						if(collection.rounds.at(j).get("division") != division){
							continue;
						}

						//con.write("check round for swap: " + collection.rounds.at(j).get("team1").get("team_code") + " " 
						//	+ collection.rounds.at(j).get("team2").get("team_code"));
						//console.log(bye);
						if(pairing.prelimRoundValid(collection.rounds.at(j).get("team1"), unpaired[i]) 
							&& pairing.prelimRoundValid(bye.get("team1"), collection.rounds.at(j).get("team2"))){
							//replace bye team with already paired team2
							bye.set({"team2": collection.rounds.at(j).get("team2")});
							// and replace team2 with unpaired team
							collection.rounds.at(j).set({"team2": unpaired[i]});

							con.write("moving " + bye.get("team2").get("team_code") + " and adding " + unpaired[i].get("team_code") );
							break; // go to next unpaired team
						}	
					}
			}


		}

	}

	//count and print number of rounds
	var round_count = 0;
	for(var i = 0; i < collection.rounds.length; i++){
		//con.write(collection.rounds.at(i).get("team1").get("team_code"));
		if(collection.rounds.at(i).get("round_number") === round_number){
			round_count++;
		}
	}

	pairing.fixRepeatedByes(round_number, division);
	pairing.setSides(round_number, division);
	pairing.pairRooms(round_number, division);
	pairing.pairJudges(round_number, division);
}


pairing.pairJudges = function(round_number, division){
	//shuffle the judges
	collection.judges = $.shuffle(collection.judges);
	//copy judges into working array
	var paired_judges = [];
	

	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("division") != division 
			|| collection.rounds.at(i).get("round_number") != round_number){
			continue;
		}
		//don't give byes a judge
		if(collection.rounds.at(i).get("team1").get("team_code") === "BYE" ||
			collection.rounds.at(i).get("team2").get("team_code") === "BYE"){
			continue;
		}

		for(var j = 0; j < collection.judges.length; j++){
			var judge = collection.judges.at(j);
			//don't pair judges that have already been placed in a round
			if(paired_judges.indexOf(judge) != -1){
				//console.log("judge has already been paired.");
				continue;
			}
			//don't pair judges that can't judge this division
			if(judge.get("divisions").indexOf(division) === -1){
				continue;
			}
			

			if(pairing.canJudge(collection.rounds.at(i).get("team1"), collection.rounds.at(i).get("team2"), judge, round_number, division)){
				//con.write("successfully paired " + judge.get("name"));
				collection.rounds.at(i).set({judge: judge});
				paired_judges.push(judge);
				
				break; //successfully paired a judge to this round. go to next round.
			} else {
				//con.write("could not pair " + judge.get("name"));
			}

		}

	}
}

//
pairing.canJudge = function(team1, team2, judge, round_number, division){
	//check for school affiliations
	var school1 = team1.get("school");
	var school2 = team2.get("school");
	if(judge.get("school") === school1 || judge.get("school") === school2){
		return false;
	}
	for(var i = 0; i < collection.rounds.length; i++){
		//check to see if judge has judged the either of the teams before
		if(collection.rounds.at(i).get("team1") === team1 && collection.rounds.at(i).get("judge") === judge){
			return false;
		}
		else if(collection.rounds.at(i).get("team2") === team1 && collection.rounds.at(i).get("judge") === judge){
			return false;
		}
		else if(collection.rounds.at(i).get("team1") === team2 && collection.rounds.at(i).get("judge") === judge){
			return false;
		}
		else if(collection.rounds.at(i).get("team2") === team2 && collection.rounds.at(i).get("judge") === judge){
			return false;
		}
	}
	
	return true;	
}
pairing.pairRooms = function(round_number, division){
	//put all available rooms into an array.
	var rooms = [];
	for(var i = 0; i < collection.rooms.length; i++){
		if(collection.rooms.at(i).get("division") === division){
			rooms.push(collection.rooms.at(i));
		}
	}

	//minimize room moves by keeping team1 in the same room.
	if(round_number === 1){
		//just randomly assign rooms


		
		var room_count = rooms.length;
		var round_count = 0;
		//stick a room in every round in this division with the right round number
		for(var i = 0; i < collection.rounds.length; i++){
			//only give out rooms to valid rounds
			if(collection.rounds.at(i).get("division") != division 
				|| collection.rounds.at(i).get("round_number") != round_number){
				continue;
			}
			//don't give byes a room
			if(collection.rounds.at(i).get("team1").get("team_code") === "BYE" ||
				collection.rounds.at(i).get("team2").get("team_code") === "BYE"){
				continue;
			}

			round_count++;
			if(rooms.length > 0){
				room = rooms.pop();
				collection.rounds.at(i).set({room: room});
			} else {
				con.write("WARNING: Needed another room.")
			}


		}

		if(room_count < round_count){
			con.write("WARNING: Only had " + room_count + " rooms. Needed " + round_count);
		}
	} else {
		//construct associative array of team1's and rooms.
		var prev_rooms = {};
		for(var i = 0; i < collection.rounds.length; i++){
			//only look at previous round in this division
			if(collection.rounds.at(i).get("division") != division 
				|| collection.rounds.at(i).get("round_number") != round_number - 1){
				continue;
			}
			//byes don't have rooms to get
			if(collection.rounds.at(i).get("team1").get("team_code") === "BYE" ||
				collection.rounds.at(i).get("team2").get("team_code") === "BYE"){
				continue;
			}
			var team1_id = collection.rounds.at(i).get("team1").get("id");
			prev_rooms[team1_id] = collection.rounds.at(i).get("room");
		}
		//now dish out rooms based on where team1 was last round

		for(var i = 0; i < collection.rounds.length; i++){
			//only give out rooms to valid rounds
			if(collection.rounds.at(i).get("division") != division 
				|| collection.rounds.at(i).get("round_number") != round_number){
				continue;
			}
			//don't give byes a room
			if(collection.rounds.at(i).get("team1").get("team_code") === "BYE" ||
				collection.rounds.at(i).get("team2").get("team_code") === "BYE"){
				continue;
			}

			round_count++;
			var team1_id = collection.rounds.at(i).get("team1").get("id");
			var team2_id = collection.rounds.at(i).get("team2").get("id");
			var room1 = prev_rooms[team1_id];
			var room2 = prev_rooms[team2_id];
			if(room1 != undefined && rooms.indexOf(room1) > -1){
				//team1 stays in same room		
				var room_index = rooms.indexOf(room1);
				
				collection.rounds.at(i).set({room: room1});
				rooms.splice(room_index, 1);
				
				
			} else if(room2 != undefined && rooms.indexOf(room2) > -1){
				//team2 stays in same room
				var room_index = rooms.indexOf(room2);
				collection.rounds.at(i).set({room: room2});
				rooms.splice(room_index, 1);
				
			} else {
				//neither team had a previous room.
				//con.write("neither team had previous room");
				
				if(rooms.length > 0){
					collection.rounds.at(i).set({room: rooms.pop()});
				} else {
					con.write("WARNING: Needed another room");
				} 
			}


		}

	}
};

pairing.dedicatedJudges = function(division){
	var judges = 0;
	
	for(var i = 0; i < collection.judges.length; i++){
		var divisions = collection.judges.at(i).get("divisions");
		if(divisions.indexOf(division) != -1 && divisions.length === 1){
			judges++;
		}
	}

	return judges;
};

pairing.totalJudges = function(division){
	var judges = 0;
	
	for(var i = 0; i < collection.judges.length; i++){
		var divisions = collection.judges.at(i).get("divisions");
		if(divisions.indexOf(division) != -1){
			judges++;
		}
	}

	return judges;
};

pairing.requiredJudges = function(division){
	//TODO support paneled prelims
	var teams = pairing.teamsInDivision(division);
	return Math.floor(teams / 2);
}

pairing.totalRooms = function(division){
	var rooms = 0;
	
	for(var i = 0; i < collection.rooms.length; i++){

		if(collection.rooms.at(i).get("division") === division){
			rooms++;
		}
	}

	return rooms;
};

pairing.requiredRooms = function(division){
	var teams = pairing.teamsInDivision(division);
	return Math.floor(teams / 2);
}



/*
=========================================
END: Define Pairing Functions
=========================================
*/	


/*
=========================================
BEGIN: Define PDF Function
=========================================
*/	

pdf.bracketsDataPDF = function() {
	const date = '11/18/11';
	const round_number = 'quarterfinals';
	const title = 'Round Rock Tournament';
	const division = 'div1';

	pdf.generatePDF_Brackets(round_number, division, date, title);
}

pdf.generatePairingSheet = function(headers, titles, round_number, division){
	// generate a blank document
	var doc = new jsPDF();
	var max_page_length = 280;
	var page_start_y_value = 50;

	doc.text(20, 20, headers.tournament_name);
	doc.text(20, 30, headers.date);
	var round_text = 'Round: ' + headers.round_number;
	doc.text(20, 40, round_text);
	doc.text(20, 50, headers.division.get("division_name") + " : " + headers.start_time_text);
	doc.text(20, 60, headers.message);
	
	var spacing = 52;


	pdf.printTitles(doc, titles, 20, 80, spacing);
	var flight_at_i = 0;			//REMOVE
	var data_y_value = 90;
	var j = 0;

	//loop through every round and print it out into the pdf if it's applicable
	if(division.get("flighted_rounds") == false){		//no flighted rounds
		for(var i = 0; i < collection.rounds.length; i++){
			//don't print irrelevant rounds
			if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
				continue;
			}
			var x_value = 20;
			var team1 = collection.rounds.at(i).get("team1").get("team_code");
			var team2 = collection.rounds.at(i).get("team2").get("team_code");
			var aff;
			var neg;
			if(collection.rounds.at(i).get("aff") === 0){
				aff = team1;
				neg = team2;
			} else {
				aff = team2;
				neg = team1;
			}
			doc.setFontSize(10);
			//print out round info
			doc.text(x_value, data_y_value, aff); //AFF
			x_value = x_value + spacing;		// add a spacing between each column
			doc.text(x_value, data_y_value, neg); //NEG
			x_value = x_value + spacing;
			var judge_name = collection.rounds.at(i).get("judge") != undefined ? collection.rounds.at(i).get("judge").get("name") : "";
			doc.text(x_value, data_y_value, judge_name); //JUDGE
			x_value = x_value + spacing;

			var room_name = collection.rounds.at(i).get("room") != undefined ? collection.rounds.at(i).get("room").get("name") : "";
			doc.text(x_value, data_y_value, room_name); //ROOM
			x_value = x_value + spacing;

			data_y_value = data_y_value + 10;
			if(data_y_value > max_page_length) {
				doc.addPage();
				data_y_value = page_start_y_value;
				pdf.printTitles(doc, titles, 20, 30, spacing);	// where to start printing
									// of titles on new page
			}
		}
	}else{		//flighted rounds true
		
	doc.setFontSize(14);
	doc.text(20, 70, 'Flight A');	//print 'flight A'
	doc.text(20, 71, '_______');
	
	for(var i = 0; i < collection.rounds.length; i++){
		if(flight_at_i == 0) {  //say 0 is flight A, print those only here   collection.rounds.at(i).get("division").get("flight") etc
	
				//don't print irrelevant rounds
				if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
					continue;
				}
				var x_value = 20;
				var team1 = collection.rounds.at(i).get("team1").get("team_code");
				var team2 = collection.rounds.at(i).get("team2").get("team_code");
				var aff;
				var neg;
				if(collection.rounds.at(i).get("aff") === 0){
					aff = team1;
					neg = team2;
				} else {
					aff = team2;
					neg = team1;
				}
				doc.setFontSize(10);
				//print out round info
				doc.text(x_value, data_y_value, aff); //AFF
				x_value = x_value + spacing;		// add a spacing between each column
				doc.text(x_value, data_y_value, neg); //NEG
				x_value = x_value + spacing;
				var judge_name = collection.rounds.at(i).get("judge") != undefined ? collection.rounds.at(i).get("judge").get("name") : "";
				doc.text(x_value, data_y_value, judge_name); //JUDGE
				x_value = x_value + spacing;

				var room_name = collection.rounds.at(i).get("room") != undefined ? collection.rounds.at(i).get("room").get("name") : "";
				doc.text(x_value, data_y_value, room_name); //ROOM
				x_value = x_value + spacing;

				data_y_value = data_y_value + 10;
				if(data_y_value > max_page_length) {
					doc.addPage();
					data_y_value = page_start_y_value;
					pdf.printTitles(doc, titles, 20, 30, spacing);	// where to start printing
										// of titles on new page
				}
				
				if(i == Math.floor(collection.rounds.length/4))	//REMOVE ONCE FLIGHTS ARE IMPLEMENTED
				{
					flight_at_i = 1;
					
				}
				
			}
		}
		
		doc.setFontSize(14);
		doc.text(20, data_y_value, 'Flight B');
		doc.text(20, data_y_value + 1, '_______');
		data_y_value = data_y_value + 10;

		for(var i = 0; i < collection.rounds.length; i++){
		flight_at_i = 1;
			if(flight_at_i == 1) {  //say 1 is flight B, collection.rounds.at(i).get("division").get("flight") etc
				//don't print irrelevant rounds
				if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
					continue;
				}
				var x_value = 20;
				var team1 = collection.rounds.at(i).get("team1").get("team_code");
				var team2 = collection.rounds.at(i).get("team2").get("team_code");
				var aff;
				var neg;
				if(collection.rounds.at(i).get("aff") === 0){
					aff = team1;
					neg = team2;
				} else {
					aff = team2;
					neg = team1;
				}
				doc.setFontSize(10);
				//print out round info
				doc.text(x_value, data_y_value, aff); //AFF
				x_value = x_value + spacing;		// add a spacing between each column
				doc.text(x_value, data_y_value, neg); //NEG
				x_value = x_value + spacing;
				var judge_name = collection.rounds.at(i).get("judge") != undefined ? collection.rounds.at(i).get("judge").get("name") : "";
				doc.text(x_value, data_y_value, judge_name); //JUDGE
				x_value = x_value + spacing;

				var room_name = collection.rounds.at(i).get("room") != undefined ? collection.rounds.at(i).get("room").get("name") : "";
				doc.text(x_value, data_y_value, room_name); //ROOM
				x_value = x_value + spacing;

				data_y_value = data_y_value + 10;
				if(data_y_value > max_page_length) {
					doc.addPage();
					data_y_value = page_start_y_value;
					pdf.printTitles(doc, titles, 20, 30, spacing);	// where to start printing
										// of titles on new page
				}
				
			}
		}
	
	}

	// Output as Data URI so that it can be downloaded / viewed
	doc.output('datauri');
}

pdf.generateLDBallot = function(round_number, division){
	// generate a blank document
	var doc = new jsPDF();

	for(var i = 0; i < collection.rounds.length ; i++) {
		if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
			continue;
		}
		doc.setFontSize(18);
		var round = collection.rounds.at(i);
		doc.text(20, 20, 'Lincoln Douglas Debate Ballot');
		doc.setFontSize(13);
		doc.text(124, 20, 'Room #:__________');
		doc.text(20, 30, 'Round:___________'); 
		doc.text(124,30, 'Judge:___________');
		var affCode = "";
		if (round != undefined) {
			affCode = round.get("aff");
		}
		//var affCode = collection.rounds.at(i).get("aff") || "";
		var affTeam = "";
		var negTeam = "";
		var affCompetitors ;
		var negCompetitors ;
		if (affCode == 0){
			affTeam = round.get("team1");
			if (affTeam != undefined) {
				affTeam = affTeam.get("team_code");
				affCompetitors = round.get("team1").get("competitors");
				if (affCompetitors === undefined) {
					affCompetitors = "";
				}
			}
			negTeam = round.get("team2");
			if (negTeam != undefined) {
				negTeam = negTeam.get("team_code");
				negCompetitors = round.get("team2").get("competitors");
				if (negCompetitors === undefined) {
					negCompetitors = "";
				}
			}
		}
		else if (affCode == 1){
			affTeam = round.get("team2");
			if (affTeam != undefined) {
				affTeam = affTeam.get("team_code");
				affCompetitors = round.get("team2").get("competitors");
				if (affCompetitors === undefined) {
					affCompetitors = "";
				}
			}
			negTeam = round.get("team1");
			if (negTeam != undefined) {
				negTeam = negTeam.get("team_code");
				negCompetitors = round.get("team1").get("competitors");
				if (negCompetitors === undefined) {
					negCompetitors = "";
				}
			}
		}

		var roundName = "";
		console.log("here");
		if (round != undefined) {
			console.log("here");
			roundNo = round.get("round_number");
			if (roundNo != undefined) {
				roundName = roundNo.toString();
			}
			else {
				roundName = "";
			}
		}
		doc.text(39,30,roundName);
		//const round_text = 'Round: ' + headers.round_number;
		doc.text(20, 40, 'Affirmative Code:___________'); doc.text(124,40, 'Negative Code:___________');
		//doc.text(20, 50, headers.start_time_text); 
		//doc.text(20, 60, headers.message);
		doc.setFontSize(10);
		doc.text(59, 40 ,affTeam);
		doc.text(158, 40, negTeam);
		var judgeName = round.get("judge");
		if (judgeName === undefined) {
			judgeName = "";
		}
		else {
			judgeName = judgeName.get("name");
		}
		doc.text(140,30, judgeName);

		var room =  "";
		
		if (round != undefined) {
			room = round.get("room");
			console.log( "ROhan " + room);
			if (room != undefined) {	//do nothing
				console.log("here1");
				room = room.get("name");
				console.log("here");
			}
			else {
				room = "";
			}
		}

		doc.text(149, 20, room);
		doc.setFontSize(9);
		doc.text(85,52, 'Points');
		doc.text(169,52, 'Points');
		doc.setFontSize(11);
		doc.text(23,55, 'AFF');
		doc.text(107,55, 'NEG');
		doc.text(37, 60, affCompetitors[0]);
		doc.text(121, 60, negCompetitors[0]);
		doc.text(20, 60, '1st  2nd ______________________  _____       1st  2nd ______________________  _____  ');
		//doc.text(20, 70, '2nd AFF. __________________  _____  _____    2nd NEG. __________________  _____  _____');
		doc.setFontSize(9);
		doc.text(20,75, 'Speakers should be rated on a scale from 20-30 points.  Half points (.5) are allowed.You may have a tie in points,'); 
		doc.text(20,79, 'but you must indicate the person doing the better job of debating');
		doc.setFontSize(13);
		doc.text(20,94, 'COMMENTS AND REASON(S) FOR DECISION');
		doc.text(20,94, '_______________________________________');
		doc.setFontSize(11);
		doc.text(20,240, 'In my opinion, the better debating was done by  AFFIRMATIVE  NEGATIVE  representing  __________');
		doc.text(121,245, '(Circle One)');
		doc.text(184,245, '(Team Code)');
		doc.text(20, 265, '___________________________________                             _______________________________');
		doc.text(20, 270, 'Judge Signature');
		doc.text(128,270, 'Affiliation (School)');
		if (i != collection.rounds.length -1) {
			doc.addPage();
		}
	}
	// Output as Data URI so that it can be downloaded / viewed
	doc.output('datauri');
}

//lists teams in order
pdf.generateTeams = function(division) {	

	//sort teams in order
	collection.teams.sort();	
	
	var doc = new jsPDF();
	var team = 20;
	var wins = team + 50;
	var adjusted = wins + 30;
	var total = adjusted + 35;
	var ranks = total + 35;
	doc.text(team, 30, 'Team Code'); 
	doc.text(wins,30,'Wins');
	doc.text(adjusted,30,'Adjusted');
	doc.text(total,30,'Total');
	doc.text(ranks,30,'Ranks');
	doc.setFontSize(10);
	var y = 40;
	for(var i = 0; i < collection.teams.length; i++){
		if(collection.teams.at(i).get("division") != division){
			continue;
		}
		doc.text(team, y, collection.teams.at(i).get("team_code")); 
		doc.text(wins,y, collection.teams.at(i).get("wins") + "-" + collection.teams.at(i).get("losses"));
		doc.text(adjusted,y, collection.teams.at(i).get("adjusted_speaks") || "");
		doc.text(total,y, collection.teams.at(i).get("total_speaks") || "");
		doc.text(ranks,y, collection.teams.at(i).get("ranks") || "");
		y += 5;

	}
	
	doc.output('datauri');
}

pdf.generateCXBallot = function(round_number, division){

	// generate a blank document
	var doc = new jsPDF();
	//collection.rounds.at(0).get("team1".get("team_code"));
	console.log('Size: ' + collection.rounds.length);
	//console.log('adfasfads');
	for(var i = 0; i < collection.rounds.length ; i++){
		//skip irrelevant rounds
		if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
			continue;
		}
		var round = collection.rounds.at(i);
		var affCode = "";
		if (round != undefined) {
			affCode = round.get("aff");
		}
		//var affCode = collection.rounds.at(i).get("aff") || "";
		var affTeam = "";
		var negTeam = "";
		var affCompetitors ;
		var negCompetitors ;
		if (affCode == 0){
			affTeam = round.get("team1");
			if (affTeam != undefined) {
				affTeam = affTeam.get("team_code");
				affCompetitors = round.get("team1").get("competitors");
				if (affCompetitors === undefined) {
					affCompetitors = "";
				}
			}
			negTeam = round.get("team2");
			if (negTeam != undefined) {
				negTeam = negTeam.get("team_code");
				negCompetitors = round.get("team2").get("competitors");
				if (negCompetitors === undefined) {
					negCompetitors = "";
				}
			}
		}
		else if (affCode == 1){
			affTeam = round.get("team2");
			if (affTeam != undefined) {
				affTeam = affTeam.get("team_code");
				affCompetitors = round.get("team2").get("competitors");
				if (affCompetitors === undefined) {
					affCompetitors = "";
				}
			}
			negTeam = round.get("team1");
			if (negTeam != undefined) {
				negTeam = negTeam.get("team_code");
				negCompetitors = round.get("team1").get("competitors");
				if (negCompetitors === undefined) {
					negCompetitors = "";
				}
			}
		}

		//console.log(affTeam);
		//console.log(negTeam);
		doc.setFontSize(18);
		doc.text(20, 20, 'Cross Examination Debate Ballot');

		doc.setFontSize(13);
		doc.text(130, 20, 'Room #:________');
		
		var room =  "";
		if (round != undefined) {
			room = round.get("room");
			console.log( "Room: " + room);
			if (room != undefined) {	//do nothing
				room = room.get("name");
			}
			else {
				room = "";
			}
		}
		
		//console.log(room);
		//doc.text(149, 20, 'Fill Room');
		doc.text(149, 20, room);
		doc.text(20, 30, 'Round:___________'); 
		doc.text(130,30, 'Judge:___________');
		//doc.text(38,30,'Fill Round');
		var roundName = "";
		if (round != undefined) {
			roundNo = round.get("round_number");
			if (roundNo != undefined) {
				roundName = roundNo.toString();
			}
			else {
				roundName = "";
			}
		}
		//var roundName = collection.rounds.at(i).get("round_number").toString();
		doc.text(38,30, roundName);
		console.log('Round: ' + roundName);

		var judgeName = round.get("judge");
		if (judgeName === undefined) {
			judgeName = "";
		}
		else {
			judgeName = judgeName.get("name");
		}
		console.log('Judge: ' + judgeName);
		doc.text(146,30, judgeName);

		//const round_text = 'Round: ' + headers.round_number;
		doc.text(20, 40, 'Affirmative Code:___________'); doc.text(130,40, 'Negative Code:___________');
		//doc.text(59, 40 ,'Fill aff code');
		//doc.text(164, 40, 'Fill neg code');
		doc.text(59, 40, affTeam);
		doc.text(164, 40, negTeam);
		//doc.text(20, 50, headers.start_time_text); 
		//doc.text(20, 60, headers.message);
		doc.setFontSize(9);
		doc.text(77,52, 'Points    Ranks');
		doc.text(164,52, 'Points    Ranks');
		doc.setFontSize(11);
		doc.text(23,55, 'AFF');
		doc.text(107,55, 'NEG');
		doc.text(37, 60, affCompetitors[0]);
		doc.text(37, 70, affCompetitors[1]);
		doc.text(123, 60, negCompetitors[0]);
		doc.text(123, 70, negCompetitors[1]);
		doc.text(20, 60, '1st  2nd __________________  _____  _____     1st  2nd __________________  _____  _____');
		doc.text(20, 70, '1st  2nd __________________  _____  _____     1st  2nd __________________  _____  _____');
		doc.setFontSize(9);
		doc.text(20,80, 'Speakers should be rated on a scale from 20-30 points.  Half points (.5) are allowed.You may have a tie in points,'); 
		doc.text(20,84, 'but you must indicate the person doing the better job of debating');
		doc.setFontSize(13);
		doc.text(20,94, 'COMMENTS AND REASON(S) FOR DECISION');
		doc.text(20,94, '_______________________________________');
		doc.setFontSize(11);
		doc.text(20,240, 'In my opinion, the better debating was done by  AFFIRMATIVE  NEGATIVE  representing  __________');
		doc.text(115,245, '(Circle One)');
		doc.text(176,245, '(Team Code)');
		doc.text(20, 265, '___________________________________                             _______________________________');
		doc.text(20, 270, 'Judge Signature');
		doc.text(128,270, 'Affiliation (School)');
		if (i != collection.rounds.length -1) {
			doc.addPage();
		}
	// Output as Data URI so that it can be downloaded / viewed
}
	doc.output('datauri');
}

pdf.generatePFBallot = function(round_number, division){
	// generate a blank document
	var doc = new jsPDF();
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	for(var i = 0; i < collection.rounds.length ; i++){
		if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
			continue;
		}
		var round = collection.rounds.at(i);
		doc.setFontSize(18);
		doc.text(20, 20, 'Public Forum Debate Ballot');
		doc.setFontSize(13);
		var roundName = "";
		if (round != undefined) {
			roundNo = round.get("round_number");
			if (roundNo != undefined) {
				roundName = roundNo.toString();
			}
			else {
				roundName = "";
			}
		}

		var room =  "";
		if (round != undefined) {
			room = round.get("room");
			console.log( "ROhan " + room);
			if (room != undefined) {	//do nothing
				console.log("here1");
				room = room.get("name");
				console.log("here");
			}
			else {
				room = "";
			}
		}

		var judgeName = round.get("judge");
		if (judgeName === undefined) {
			judgeName = "";
		}
		else {
			judgeName = judgeName.get("name");
		}

		doc.text(20, 30, 'Round:___________'); doc.text(130,30, 'Judge:___________');
		doc.text(39,30,roundName);
		doc.text(40, 37 ,room);
		doc.text(142, 37, month + "/" + day + "/" + year);
		doc.text(146,30, judgeName);
		//const round_text = 'Round: ' + headers.round_number;
		doc.text(20, 37, 'Room #:___________'); doc.text(130,37, 'Date:___________');
		//doc.text(20, 50, headers.start_time_text);
		doc.setFontSize(10);
		doc.text(35, 45, '________________________________________________________________________');
		doc.text(35,45.4, '________________________________________________________________________');
		//doc.text(20, 60, headers.message);
		doc.setFontSize(9);
		doc.text(25,51, 'Code _________________ Side _________________');
		doc.text(29,56, 'AFF');
		doc.text(25,60, '1st   2nd ___________________________________');
		doc.text(25,65, '1st   2nd ___________________________________');

		doc.text(115,51, 'Code _________________ Side _________________');
		doc.text(119,56, 'NEG');
		doc.text(115,60, '1st   2nd ___________________________________');
		doc.text(115,65, '1st   2nd ___________________________________');
		//doc.setFontSize(11);
		//doc.text(20, 60, 'AFFIRMATIVE ______________________  _____       NEGATIVE ______________________  _____  ');
		//doc.text(20, 70, '2nd AFF. __________________  _____  _____    2nd NEG. __________________  _____  _____');
		doc.setFontSize(9);
		doc.text(25,73, 'Team Points _______'); 
		var startY = 79;
		doc.setFontSize(11);
		doc.text(88, 75, 'Points Scale');
		doc.setFontSize(10);
		doc.text(85,startY, '29-30 Outstanding');
		doc.text(85,startY+4, '27-28 Above Average');
		doc.text(85,startY+8, '24-26 Average');
		doc.text(85,startY+12, '20-23 Below Average');
		doc.text(135,73, 'Team Points _______'); 
		//doc.text(20,79, 'but you must indicate the person doing the better job of debating');

		doc.setFontSize(10);
		doc.text(20, 105, 'The team that won this debate is _______________ representing the PRO/CON (please circle the winning side)');
		doc.text(83, 110, '(Code)');
		doc.setFontSize(9);
		doc.text(25, 120, 'Comments to debaters');
		doc.text(130, 120, 'Comments to debaters');
		doc.setFontSize(12);
		startY = 123;		//draw a vertical line
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 3.7;
		doc.text(100, startY, '|');
		startY += 4;
		doc.text(100, startY, '|');
		startY += 4;
		doc.text(100, startY, '|');
		startY += 4;
		doc.text(100, startY, '|');
		startY += 4;
		doc.text(100, startY, '|');
		startY += 4;
		doc.text(100, startY, '|');
		startY += 4;
		doc.text(100, startY, '|');
		startY += 4;

		doc.setFontSize(10);
		doc.text(20, 200, 'These are the reasons for my decision:');
		doc.text(20, 280, 'Judge Signature: _____________________________ Affiliation/Occupation _____________________________');
		if (i != collection.rounds.length -1) {
			doc.addPage();
		}
	}

	// Output as Data URI so that it can be downloaded / viewed
	doc.output('datauri');
}

// generate Brackets PDF
// TODO for now the params are treated as arrays -- but we should change it to Linked List
pdf.generatePDF_Brackets = function(round_number, division, date, title) {
	var teamsArray = new Array();

	// pairing.name2debate returns the number of debates that takes place. so number of teams = number of debates x 2
	const num_initial_teams = pairing.name2debate[round_number] * 2;

	// number of separations. i.e. log2(num_initial_teams) + 1 (for the winner)
	const num_cols = Math.log(num_initial_teams)/Math.log(2) + 1;
	
	// make an array to keep track of the counters of the indexes as we add to teamsArray
	var teamsArrayIndexCounters = new Array(num_cols);
	
	// create new arrays in teamsArray based on num_initial_teams
	//teamsArray[len - 1] = finals
	for(var i=0; i<num_cols; i++) {		
		// set length in a quadratic fashion based on which column it is in
		teamsArray[i] = new Array( Math.pow(2, num_cols - i - 1) );
		//set counter for teamsArray[i] to 0
		teamsArrayIndexCounters[i] = 0;
		//con.write('teamsArray[' + i + '].length: ' + teamsArray[i].length);
	}

	// iterate through rounds and fill up teamsArray
	// this will be adding two teams per iteration, if at all -- round.get("team1") and round.get("team2")
	for(var i = 0; i < collection.rounds.length; i++) {
		//get i-th round
		const round = collection.rounds.at(i);

		if(round.get("division") === division) {
			//get the number of the round
			const number = pairing.name2debate(round.get("round_number")) * 2;		// multiply by 2 to get number of teams in round

			// check if the round should be included
			// if it is a round equal to or after the initial round, then include it
			if(num_initial_teams >= number) {
				// add to teamsArray
				// the teamsArrays is organized in this way..
				// 	index num_cols-1 is for finals
				//	index num_cols-2 is for semifinals etc.

				// formula explanation => maxColumns - 1 - log2(number_of_teams_in_this_round)
				//this tells us what the index is for teamsArray i.e. what index does the array correspond to
				const index_to_add_at = num_cols - 1 - Math.log(number)/Math.log(2);

				// add first team to the brackets
				teamsArray[index_to_add_at][teamsArrayIndexCounters[index_to_add_at]] = round.get("team1");
				teamsArrayIndexCounters[index_to_add_at] += 1;

				// add second team to brackets
				teamsArray[index_to_add_at][teamsArrayIndexCounters[index_to_add_at]] = round.get("team2");
				teamsArrayIndexCounters[index_to_add_at] += 1;
			}
		}
	}

	// now we have teamsArray set. Now we just need to convert it to PDF

	var doc = new jsPDF();

	// max page length in pixels after which we need a new page (trial and error)
	const max_page_length = 285;

	// max pixels of PDF file (trial and error)
	const max_page_width = 210;

	doc.text(20, 20, title);
	doc.text(20, 30, date);
	
	//start writing at this x and y value pixel
	const page_start_x_value = 20;
	const page_start_y_value = 40;

	var y_value;
	var x_value;

	const spacing_x = (max_page_width - page_start_x_value)/num_cols;
	var spacing_y;

	// set text for document	
	x_value = page_start_x_value;

	const vertical_line_pixels = 4;
	
	if(teamsArray != undefined) {
		for(var i=0; i<teamsArray.length; i++) {
			if(teamsArray[i] != undefined) {
				spacing_y = (max_page_length - page_start_y_value)/teamsArray[i].length;
				y_value = page_start_y_value;

				for(var j = 0; j< teamsArray[i].length; j++) {
					if(teamsArray[i][j] != undefined) {
						y_value = y_value + spacing_y;
						con.write('teamsArray['+i+']['+j+'] = ' + teamsArray[i][j]);	// debug print

						doc.text(x_value, y_value - spacing_y/2, teamsArray[i][j]);
						doc.text(x_value - 2, y_value - spacing_y/2, '____________');

						// do for all columns except the first
						if(i!=0) {
							// print the line for the bracket
							for(var k = 0; k< spacing_y/4; k = k + vertical_line_pixels ) { 	//above
								doc.text(x_value - 2.5, y_value - spacing_y/2 - k, '|');
							}
							for(var k = 0; k< spacing_y/4; k = k + vertical_line_pixels ) { 	//below
								doc.text(x_value - 2.5, y_value - spacing_y/2 + k + vertical_line_pixels, '|');
							}
						}
					}
				}
				x_value = x_value + spacing_x;
			}
		}
	}

	// Output as Data URI so that it can be downloaded / viewed
	doc.output('datauri');
}

pdf.printTitles = function(doc, titles, x_value, title_y_value, spacing) {
	var i = 0;
	for(i=0; i< titles.length; i++) {
	
		doc.text(x_value, title_y_value, titles[i]);
		x_value = x_value + spacing;		// add a spacing between each column
	}
}
/*
=========================================
END: Define PDF Functions
=========================================
*/	


/*
=========================================
BEGIN: Define UI Functions
=========================================
*/	

/*
Valid values for menu_item:
	rounds
	teams
	judges
	rooms
	schools
	divisions
	enter_ballot
	settings
	debug
*/

/*
=========================================
END: Define UI Functions
=========================================
*/	

ui.showMenu = function(menu_item){

	$(".container").slideUp(100);
	$("#" + menu_item + "_container").slideDown(100);

	$(".menu_item").removeClass("menu_item_selected");
	$("#menu_" + menu_item).addClass("menu_item_selected");

	$(".sub_menu").hide();
	$("#sub_menu_" + menu_item).show();	
	localStorage.setItem("selected", menu_item);
	//ui.state.save({"selected": menu_item});
}


/*
=========================================
jQuery.ready everything below this point.
=========================================
*/
$(function(){

con.write("Welcome to the DebateTab debug console!");


/*
=========================================
Define Backbone Views
=========================================
*/


//An individual division option 
//managed by view.TeamTable
//also used in roundsTable filter
view.DivisionOption = Backbone.View.extend({
	tagName: "option",
	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		//associate data element "id" with ObjectId in case we want to use this later
		$(this.el).data("id", this.model.get("id"));
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.get("id"));
		$(this.el).html(this.model.get("division_name"));
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});



//An individual school option 
//managed by view.TeamTable
view.SchoolOption = Backbone.View.extend({
	tagName: "option",
	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		//associate data element "id" with ObjectId in case we want to use this later
		$(this.el).data("id", this.model.get("id"));
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.get("id"));
		$(this.el).html(this.model.get("school_name"));
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.TeamTable = Backbone.View.extend({
	el: $("#teams") , // attaches `this.el` to an existing element.
	events: {
		"click #add_team_button": "addTeam",
		"keyup #teams_search": "search",
		"change #newteam_division": "showCompetitors",
		"focus #newteam_name": "generateTeamName",
		"keyup #newteam_name":		"keyupTeamName",
		"click #toggle_team_form": "showNewForm"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addTeam", "appendTeam", 
			"renderSearch", "search", "addDivSelect");
		
		
		collection.teams.bind("add", this.appendTeam);
		collection.teams.bind("reset", this.render, this);

		//keep division and schools dropdown boxes up to date
		collection.divisions.bind("add", this.addDivSelect);
		collection.schools.bind("add", this.addSchoolSelect);

		//populate dropdowns with initial divisions and schools
		collection.divisions.bind("reset", this.render, this);
		collection.divisions.bind("reset", this.showCompetitors, this);
		collection.schools.bind("reset", this.render, this);
		
		this.render();
		
	} ,

	showNewForm: function(){
		//team controls
		$("#team_form_overlay").fadeToggle();

	} ,
	keyupTeamName: function(event){
		if(event.which === 13){
			this.addTeam();
		}
	} ,
	
	clearEditForm: function(){
		console.log("clearing teams form");
		$("#newteam_id").val("");
		$("#newteam_division").val("");
		$("#newteam_school").val("");
		$("#newteam_competitors").html("");
		$("#newteam_name").val("");
	} ,
	//called when a competitor name box is modified.
	//generate a team name if every competitor name has been entered.
	generateTeamName: function(){
		var competitors =  $("#newteam_competitors > .newteam_competitor");

		//count number of filled in competitor names to see if they are all complete
		var i = 0;
		$("#newteam_competitors > .newteam_competitor").each(function(index, comp_name){
			if($(comp_name).val().length > 0){
				i++;
			}
		});
		if(i === competitors.length){
			//generate team name and place in box
			var team_code = $("#newteam_school option:selected").text().trim();

			//case 1: 1 competitor. Use initials like
			//Nick Carneiro => Round Rock NC
			if(competitors.length === 1){
				var whole_name = $(competitors.get(0)).val();
				var names = whole_name.split(" ");
				if(names.length >= 2){
					
					team_code += " " + names[0].substr(0,1) + names[1].substr(0,1);
				}
			} else if(competitors.length >=2){		
				var whole_name = $(competitors.get(1)).val();	//TODO: fix indexing, should work for
				var names = whole_name.split(" ");				//any number of competitors
				var last_name = names[names.length-1];

				var whole_name_2 = $(competitors.get(0)).val();
				var names_2 = whole_name_2.split(" ");
				var last_name_2 = names_2[names_2.length-1];

				team_code += " " + last_name.substr(0,1).toUpperCase() 
					+ last_name_2.substr(0,1).toUpperCase();
				
			} else {
			
				//can't generate team code
			}

			$("#newteam_name").val(team_code);
			
		} else {
		console.log("failed");
			return;
		}

	} ,
	//show correct number of competitor name inputs depending on competitors
	//per team in selected division
	showCompetitors: function(){
		$("#newteam_competitors").html("");
		var division_id = $("#newteam_division").val();
		var comp_per_team = null;
		collection.divisions.each( 
			function(division){

				if(division.get("id") == division_id){

					comp_per_team = division.get("comp_per_team");
				}
			}
		); 
		if(comp_per_team === null){
				comp_per_team = 1;
		}
		
		for(var i = 0; i < comp_per_team; i++){

			$("#newteam_competitors").append('Name: <input class="newteam_competitor" type="text" /> <br />');
			$("#newteam_competitors").append('Phone: <input class="competitor_phone" type="text" /> <br /> <br />');

		}
	} ,
	//add new division to dropdown box
	addDivSelect: function(division){
		var divOptionView = new view.DivisionOption({
			model: division
		});
		$("#newteam_division", this.el).append(divOptionView.render().el);
		this.showCompetitors();
	} ,
	//add new school to dropdown box
	addSchoolSelect: function(school){
		var schoolOptionView = new view.SchoolOption({
			model: school
		});
		$("#newteam_school", this.el).append(schoolOptionView.render().el);
	} ,
	clearView: function(){
		//clear table
		$("#teams_table").empty();
		$("#newteam_division").empty();
		$("#newteam_school").empty();
	} ,
	render: function(){
		//clear everything and re-render from collections
		this.clearView();
		//populate table
		_(collection.teams.models).each(function(team){ // for pre-existing teams
        	this.appendTeam(team);
    	}, this);

    	//populate form
    	_(collection.divisions.models).each(function(division){ // pre-existing divisions
        	this.addDivSelect(division);
    	}, this);
    	_(collection.schools.models).each(function(school){ // pre-existing schools
        	this.addSchoolSelect(school);
    	}, this);

	} ,

	renderSearch: function(results){
		$("#teams_table").html("");

		results.each(function(result){
			var teamView = new view.Team({
				model: result
			});
			$("#teams_table", this.el).append(teamView.render().el);
		});
		return this;
	} ,
	
	addTeam: function(){
		//validate team code
		var id = $("#newteam_id").val();
		var team_code = $("#newteam_name").val();
		var school_id = $("#newteam_school").val();
		var team = new model.Team();
		var division_id = $("#newteam_division").val();
		var division = pairing.getDivisionFromId(division_id);
		var school = pairing.getSchoolFromId(school_id);
		var competitors = [];
		var stop_scheduling = $("#newteam_stop_scheduling").prop("checked");

		//populate competitors based on form entries
		var i = 0;
		$("#newteam_competitors").children().each(function(){
				if(($(this).hasClass("newteam_competitor")) == true)
				{
					competitors.push({name: $(this).val(), phone_number: ""});
					i++;
					$(this).val("");
				}
				else if($(this).hasClass("competitor_phone")) {
					//it's a phone number box
					competitors[i-1].phone_number = $(this).val();
					$(this).val("");

				}
				
			
		});
	
		$(".edit_model_overlay").fadeOut();
		
	if(id.length > 0){
		
		var team = pairing.getTeamFromId(id);
			team.set({
				team_code: team_code,
				school: school,
				competitors: competitors,
				division: division,
				stop_scheduling: stop_scheduling
			});
		
		}
		else{
		
		var team = new model.Team();
			team.set({
				id: (new ObjectId).toString(),
				team_code: team_code,
				school: school,
				competitors: competitors,
				division: division,
				stop_scheduling: stop_scheduling
		});
		collection.teams.add(team);
		}
		
		team.save();
		this.clearEditForm();
	} ,

	appendTeam: function(team){
		var teamView = new view.Team({
			model: team
		});
		$("#teams_table", this.el).append(teamView.render().el);
	} ,
	search: function(e){
		var letters = $("#teams_search").val();
		this.renderSearch(collection.teams.search(letters));
	}
	
});

view.Team = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
	  'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		//populate form with existing values
		$("#newteam_id").val(this.model.get("id"));
		$("#newteam_division").val(this.model.get("division").get("id"));
		$("#newteam_school").val(this.model.get("school").get("id")); 	
		$("#newteam_name").val(this.model.get("team_code"));
		$("#newteam_stop_scheduling").prop("checked", this.model.get("stop_scheduling"));
		$("#newteam_competitors").html('');
		//TODO populate competitor names and phone numbers here
		var competitors = this.model.get("competitors");
		for(var i = 0; i < competitors.length; i++){
			$("#newteam_competitors").append('Name: <input class="newteam_competitor" type="text" value="' + competitors[i].name + '"/> <br />');
			$("#newteam_competitors").append('Phone: <input class="competitor_phone" type="text" value="' + competitors[i].phone_number + '"/> <br /> <br />');
		}


		$("#team_form_overlay").fadeIn();
	} ,

	remove: function(team){
		var team = this.model;
		$.confirm({
			'title'		: 'Delete Team',
			'message'	: 'You are about to delete a team <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': team,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
					}
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	} ,
	render: function(){
		var wins = this.model.get("losses") || "0";
		var losses = this.model.get("wins") || "0";
		$(this.el).html('<td class="name">' + this.model.get("team_code") + 
			'</td> <td>'+this.model.get("division").get("division_name") +'</td><td>' + 
			wins + "-"+ losses + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.DivisionCheckbox = Backbone.View.extend({
	tagName: "li" ,
	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		//associate data element "id" with ObjectId in case we want to use this later
		$(this.el).data("id", this.model.get("id"));
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.get("id"));
		$(this.el).data("division_id", this.model.get("id"));
		$(this.el).html('<input type="checkbox" /> ' + this.model.get("division_name"));
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
	
});
view.Judge = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
	  'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		//populate form with existing values
		$("#newjudge_id").val(this.model.get("id"));
		$("#new_judge_name").val(this.model.get("name"));
		$("#newjudge_school").val(this.model.get("school") === undefined ? "no_affiliation" : this.model.get("school").get("id")); 	
		var div = this.model.get("divisions");
		
		$("#newjudge_divisions").children().each(function(i, li){
			if($(li).attr != undefined){
				//console.log($(li).find("input").attr("checked"));
				
				for(var i = 0; i < div.length; i++)
				
				if($(li).data("division_id") === div[i].id){
				
					$(li).find("input").attr("checked", true);
				}
				
			}
		});
		
		$("#newjudge_stop_scheduling").prop("checked", this.model.get("stop_scheduling"));
		$("#judge_form_overlay").fadeIn();
	} ,

	remove: function(judge){
		var judge = this.model;
		$.confirm({
			'title'		: 'Delete Judge',
			'message'	: 'You are about to delete a Judge <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': judge,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
					}
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
		
		
	} ,
	render: function(){
		var divisions = this.model.get("divisions");
		var div_string = "";
		for(var i = 0; i < divisions.length; i++){
			var div = "";
			if(divisions[i] != undefined){
				div = divisions[i].get("division_name");
			}
			
			div_string = div_string + div + " ";
		}
		var school = this.model.get("school") === undefined ? "None" : this.model.get("school").get("school_name");
		$(this.el).html('<td class="name">' + this.model.get("name") + '</td><td>'+ school +'</td><td>' + div_string + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendJudge)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

		
		//$('.simpledialog').simpleDialog();


view.JudgeTable = Backbone.View.extend({
	el: $("#judges") , // attaches `this.el` to an existing element.
	events: {
		"click #add_judge_button": "addJudge" ,
		"keyup #judges_search": "search" ,
		"keyup #new_judge_name": "keyupJudgeName"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addJudge", "appendJudge", "addSchoolSelect");
		
		collection.judges.bind("add", this.appendJudge);
		collection.schools.bind("add", this.addSchoolSelect);
		collection.divisions.bind("add", this.addDivisionCheckbox);

		collection.judges.bind("reset", this.render, this);
		collection.schools.bind("reset", this.render, this);
		collection.divisions.bind("reset", this.render, this);

		collection.schools.each(function(school){ // pre-existing schools
        	this.addSchoolSelect(school);
    	}, this);

    	$("#newjudge_school", this.el).append('<option value="no_affiliation">No Affiliation</option>');
    	collection.divisions.each(function(division){ // pre-existing schools
        	this.addDivisionCheckbox(division);
    	}, this);
		this.render();
		
	} ,
	keyupJudgeName: function(event){
		if(event.which === 13){
			this.addJudge();
		}
	} ,
	render: function(){
		_(collection.judges.models).each(function(judge){ // in case collection is not empty
        	this.appendJudge(judge);
    	}, this);
	} ,
	clearEditForm: function(){
		console.log("clearing judge form");
		$("#newjudge_id").val("");
		$("#new_judge_name").val("");
		$("#newjudge_school").val("");
		$("#newjudge_divisions").find("input").attr("checked", false);
		$("#newjudge_stop_scheduling").prop("checked", false);

	} ,
	addJudge: function(){
		//TODO: validate judge name
		var id = $("#newjudge_id").val();
		var judge_name = $("#new_judge_name").val();

		var judge = new model.Judge();
		var school_id = $("#newjudge_school").val();
		//may be undefined
		var school = pairing.getSchoolFromId(school_id);
		var divisions = [];
		var stop_scheduling = $("#newjudge_stop_scheduling").prop("checked");

		$("#newjudge_divisions").children().each(function(i, li){
			if($(li).attr != undefined){
				//console.log($(li).find("input").attr("checked"));
			
				if($(li).find("input").attr("checked") === "checked"){

					var division_id = $(li).data("division_id");
					var div = pairing.getDivisionFromId(division_id);
					divisions.push(div);
				}
			}
		});
		
		$(".edit_model_overlay").fadeOut();
		if(id.length > 0){
			var judge = pairing.getJudgeFromId(id);
			judge.set({
			
			
			name: judge_name,
			school: school,
			divisions: divisions,
			stop_scheduling: stop_scheduling

			
		});
		}else{
		
		var judge = new model.Judge();
		judge.set({
			
			id: (new ObjectId).toString(),
			name: judge_name,
			school: school,
			divisions: divisions,
			stop_scheduling: stop_scheduling

			
		});
		collection.judges.add(judge);
		}
		
		judge.save();
		this.clearEditForm();
	} ,

	appendJudge: function(judge){
		var judgeView = new view.Judge({
			model: judge
		});
		$("#judges_table", this.el).append(judgeView.render().el);
	} ,
	search: function(e){
		var letters = $("#judges_search").val();
		this.renderSearch(collection.judges.search(letters));
	} ,
	//add new school to dropdown box
	addSchoolSelect: function(school){
		
			
		
		var schoolOptionView = new view.SchoolOption({
			model: school
		});
		$("#newjudge_school", this.el).append(schoolOptionView.render().el);
		
	} ,

	addDivisionCheckbox: function(division){
		var divisionCheckboxView = new view.DivisionCheckbox({
			model: division
		});	
		$("#newjudge_divisions", this.el).append(divisionCheckboxView.render().el);
	} ,
	renderSearch: function(results){
		$("#judges_table").html("");

		results.each(function(result){
			var judgeView = new view.Judge({
				model: result
			});
			$("#judges_table", this.el).append(judgeView.render().el);
		});
		return this;
	} 
	
});


view.Room = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
	  'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		//populate form with existing values
		$("#newroom_id").val(this.model.get("id"));
		$("#newroom_name").val(this.model.get("name"));
		$("#newroom_division").val((this.model.get("division").get("id")));
		$("#newroom_stop_scheduling").prop("checked", this.model.get("stop_scheduling"));
		$("#room_form_overlay").fadeIn();
	} ,

	remove: function(room){
		var room = this.model;
		$.confirm({
			'title'		: 'Delete Room',
			'message'	: 'You are about to delete a room <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': room,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
					}
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	} ,
	render: function(){
		$(this.el).html('<td class="name">' + this.model.get("name") + '</td> <td>' +this.model.get("division").get("division_name") + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendRoom)			.get("division_name")
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.RoomTable = Backbone.View.extend({
	el: $("#rooms") , // attaches `this.el` to an existing element.
	events: {
		"click #add_room_button": "addRoom" ,
		"keyup #newroom_name": "keyupRoom" ,
		"keyup #rooms_search": "search"
	} ,

	keyupRoom: function(event){
		if(event.which === 13){
			this.addRoom();
		}
		
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addRoom", "appendRoom");
		
		collection.rooms.bind("add", this.appendRoom);
		collection.rooms.bind("reset", this.render, this);
		collection.divisions.bind("add", this.addDivSelect);
		collection.divisions.bind("reset", this.render);
		this.render();
		
	} ,
	
	render: function(){
		$("#newroom_division").empty();
		$("#room_table").empty();
		_(collection.rooms.models).each(function(room){ // in case collection is not empty
        	this.appendRoom(room);
    	}, this);

    	_(collection.divisions.models).each(function(division){ // in case collection is not empty
        	this.addDivSelect(division);
    	}, this);
	} ,
	clearEditForm: function(){
		console.log("clearing rooms form");
		$("#newroom_id").val("");
		$("#newroom_name").val("");
		$("#newroom_division").val("");
		$("#newroom_stop_scheduling").prop("checked", false);

	} ,

	//add new division to dropdown box
	addDivSelect: function(division){
		var divOptionView = new view.DivisionOption({
			model: division
		});
		$("#newroom_division", this.el).append(divOptionView.render().el);
	} ,
	addRoom: function(){
		//TODO: validate room name
			//	
		var id = $("#newroom_id").val();
		var room_name = $("#newroom_name").val();
		var div_name_id = $("#newroom_division").val();
		var division = pairing.getDivisionFromId(div_name_id);
		var stop_scheduling = $("#newroom_stop_scheduling").prop("checked");

		$(".edit_model_overlay").fadeOut();
		
		if(id.length > 0){
			
			var room = pairing.getRoomFromId(id);
			room.set({
				
				name: room_name, 
				division: division,
				stop_scheduling: stop_scheduling

		});
		}else{
		
		var room = new model.Room();
		room.set({
			id: (new ObjectId).toString(),
			name: room_name, 
			division: division,
			stop_scheduling: stop_scheduling
			
		});
		collection.rooms.add(room);
		
		
		}
		room.save();
		this.clearEditForm();
		
	} ,

	appendRoom: function(room){
		var roomView = new view.Room({
			model: room
		});
		$("#rooms_table", this.el).append(roomView.render().el);
	} ,
	search: function(e){
		var letters = $("#rooms_search").val();
		this.renderSearch(collection.rooms.search(letters));
	} ,
	renderSearch: function(results){
		$("#rooms_table").html("");

		results.each(function(result){
			var roomView = new view.Room({
				model: result
			});
			$("#rooms_table", this.el).append(roomView.render().el);
		});
		return this;
	} 
	
});

//An individual room option in the select on the Add New Room form.
//managed by view.RoomTable
view.RoomOption = Backbone.View.extend({
	tagName: "option",
	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		//associate data element "id" with ObjectId in case we want to use this later
		$(this.el).data("id", this.model.get("id"));
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.get("id"));
		$(this.el).html(this.model.get("school_name"));
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});


view.DivisionStats = Backbone.View.extend ({
	tagName: "tr" ,
	events: { 
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	render: function(){
		var teams = pairing.teamsInDivision(this.model)
		teams = (teams != undefined) ?  teams : "-";

		var ded_judges = pairing.dedicatedJudges(this.model);
		ded_judges = (ded_judges != undefined) ?  ded_judges : "-";

		var total_judges = pairing.totalJudges(this.model);
		total_judges = (total_judges != undefined) ?  total_judges : "-";

		var reqd_judges = pairing.requiredJudges(this.model);
		reqd_judges = (reqd_judges != undefined) ?  pairing.requiredJudges(this.model) : "-";

		var rooms = pairing.totalRooms(this.model)
		rooms = (rooms != undefined) ?  rooms : "-";

		var reqd_rooms = pairing.requiredRooms(this.model);
		reqd_rooms = (reqd_rooms != undefined) ?  reqd_rooms : "-";

		$(this.el).html('<td>'+ this.model.get("division_name") + '</td><td>' + teams + '</td>'+
		'<td>' + ded_judges + '</td><td>' + total_judges + '</td><td>' + reqd_judges + '</td><td>' +rooms + '</td><td>' + 
		reqd_rooms + '</td>');
		return this; //required for chainable call, .render().el ( in appendRoom)			.get("division_name")
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.StatsArea = Backbone.View.extend({
	el: $("#settings_stats") , // attaches `this.el` to an existing element.
	events: {
		
	} ,



	initialize: function(){
		_.bindAll(this, "render");
		
		this.render();
	
	} ,
	
	render: function(){
		$("#stats_schools").text("Total schools: " + collection.schools.length);
		$("#settings_stats").empty();
		$(this.el).append("<tr><td>Name</td><td>Teams</td><td>Dedicated Judges</td><td>Total Judges</td><td>Required Judges</td><td>Rooms</td><td>Required Rooms</td></tr>");
    	collection.divisions.each(function(division){ // in case collection is not empty
        	this.addDivStat(division);
    	}, this);
	} ,

	//add new division to dropdown box
	addDivStat: function(division){
		var divStatView = new view.DivisionStats({
			model: division
		});
		$(this.el).append(divStatView.render().el);
	} ,

	
});
view.Round = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
      'click td.roundrow': 'showEditForm'
    },  


	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(round){
		var round = this.model;
		$.confirm({
			'title'		: 'Delete Round',
			'message'	: 'You are about to delete a round <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': round,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
					}
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	} ,
	render: function(){
		var team1 = this.model.get("team1");
		var team2 = this.model.get("team2");
		if(team1 != undefined){
			var team1_cd = team1.get("team_code");
		} else {
			team1_cd = "Error";
		}
		if(team2 != undefined){
			var team2_cd = team2.get("team_code");
		} else {
			team2_cd = "Error";
		}
		if(this.model.get("aff") === 0){
			var aff = team1_cd;
			var neg = team2_cd;
		} else {
			var aff = team2_cd;
			var neg = team1_cd;
		}

		var judge = "";
		var room = "";

		if(this.model.get("judge") != undefined){
			judge = this.model.get("judge").get("name");
		}
		if(this.model.get("room") != undefined){
			room = this.model.get("room").get("name");
		}
		var div_name = this.model.get("division").get("division_name");
		var num = this.model.get("round_number");
		$(this.el).html('<td class="roundrow">' + aff + '</td> <td class="roundrow">' + neg + '</td><td class="roundrow">'+judge+
			'</td><td class="roundrow">'+room+'</td><td class="roundrow">' + div_name + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el
	} ,
	unrender: function(){
		$(this.el).remove();
	},
	
	//fills the rooms and judges selects on the edit round form
	populateRoomsAndJudges: function(){
		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		//empty out existing rooms and judges
		$("#editround_judge").html("");
		$("#editround_room").html("");
		for(var i = 0; i < collection.rooms.length; i++){
			//skip irrelevant rooms
			if(collection.rooms.at(i).get("division") != division){
				continue;
			}
			$("#editround_room").append('<option value="'+collection.rooms.at(i).get("id")+'">'
				+ collection.rooms.at(i).get("name") +'</option>');

		}

		for(var i = 0; i < collection.judges.length; i++){
			
			$("#editround_judge").append('<option value="'+collection.judges.at(i).get("id")+'">'
				+ collection.judges.at(i).get("name") +'</option>');

		}

	} ,
	populateTeamSelects: function(){
		//empty out existing teams
		$("#editround_team1_code").html("");
		$("#editround_team2_code").html("");

		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		for(var i = 0; i < collection.teams.length; i++){
			//skip irrelevant teams
			if(collection.teams.at(i).get("division") != division){
				continue;
			}

			$("#editround_team1_code").append('<option value="'+collection.teams.at(i).get("id")+'">'
				+ collection.teams.at(i).get("team_code") +'</option>');

			$("#editround_team2_code").append('<option value="'+collection.teams.at(i).get("id")+'">'
			+ collection.teams.at(i).get("team_code") +'</option>');
		}

		//add BYE teams to both
		$("#editround_team1_code").append('<option value="-1">BYE</option>');
		$("#editround_team2_code").append('<option value="-1">BYE</option>');

	} ,
	showEditForm: function(){
		//populate form with existing values
		//populate team 1 competitors
		$("#editround_id").val(this.model.get("id"));
		this.populateTeamSelects();
		this.populateRoomsAndJudges();
		view.roundTable.drawForm(this.model);
		
		/*
result can be: 0 - 7:
		0 AFF_WIN_NEG_LOSS
		1 AFF_BYE_NEG_FORFEIT
		2 NEG_WIN_AFF_LOSS
		3 NEG_BYE_AFF_FORFEIT
		4 DOUBLE_WIN
		5 DOUBLE_LOSS
		6 DOUBLE_BYE
		7 DOUBLE_FORFEIT
*/
		
		$(".edit_model_overlay").css("height", $(document).height());
		$("#round_form_overlay").fadeIn();
	} ,
});


view.RoundTable = Backbone.View.extend({
	el: $("#rounds") , // attaches `this.el` to an existing element.
	events: {
		
		"keyup #rounds_search": "search",
		"click #pair_round_button" : "pairRound",
		"click #print_ballots_button" : "printBallots",
		"change #rounds_division_select" : "renderRoundNumberSelect",
		"change #rounds_round_number_select" : "filterDivisions",
		"click button#save_round_button": "editRound",
		"click #add_round_button": "addEmptyRound",
		"change #editround_team1_code": "changeTeam",
		"change #editround_team2_code": "changeTeam",
		"change #editround_judge": "changeJudge",
		"change #editround_room": "changeRoom",
		"click #editround_swap_sides": "swapSides",
		"click #print_pairings": "printPairingsPrompt",
		"click #print_pairings_confirm": "printPairings",
		"click #print_teams_button": "printTeams"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addRound", "appendRound", "renderRoundNumberSelect");
		
		collection.rounds.bind("add", this.appendRound);
		collection.rounds.bind("reset", this.render, this);
		collection.rounds.bind("change", this.render, this);

		collection.divisions.bind("change", this.renderDivisionSelect, this);
		collection.divisions.bind("reset", this.renderDivisionSelect, this);
		collection.divisions.bind("add", this.renderDivisionSelect, this);
		this.render();
		
	} ,

	printTeams: function(){
		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		pdf.generateTeams(division);
	} ,
	printPairingsPrompt: function(){
		$("#print_pairings_details").fadeIn();
	} ,
	printPairings: function(){
		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		var start = $("#print_pairings_start").val();
		var message = $("#print_pairings_message").val();
		var headers = {
			tournament_name: 'Round Rock HS Tournament',
			date: '11/18/11',
			round_number: round_number,
			start_time_text: start,
			message: message,
			division: division
		};

		var titles = [ 
				"Affirmative",
				"Negative",
				"Judge",
				"Room"
		];
		
	    pdf.generatePairingSheet(headers,titles, round_number, division);
		
	} ,
	swapSides: function(){
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);
		var aff = round.get("aff");
		if(aff == 0){
			round.set({aff: 1})
		} else {
			round.set({aff: 0})
		}
		round.save();
		this.drawForm(round);
	} ,
	changeJudge: function(){
		var judge_id = $("#editround_judge").val();
		var judge = pairing.getJudgeFromId(judge_id);
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);
		round.set({judge: judge});
		round.save();
		this.drawForm(round);
	} ,
	changeRoom: function(){
		var room_id = $("#editround_room").val();
		var room = pairing.getRoomFromId(room_id);
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);
		round.set({room: room});
		round.save();
		this.drawForm(round);
	} ,
	changeTeam: function(){
		//update edit round form to reflect new team
		var aff_id = $("#editround_team1_code").val();
		var aff = pairing.getTeamFromId(aff_id);
		var neg_id = $("#editround_team2_code").val();
		var neg = pairing.getTeamFromId(neg_id);
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);

		

		if(aff === undefined){
			//create bye teams if necessary
			var bye_team = new model.Team();
			bye_team.set({team_code: "BYE"});
			aff = bye_team;
		}
		if(neg === undefined){
			var bye_team = new model.Team();
			bye_team.set({team_code: "BYE"});
			neg = bye_team;
		}

		if(round.get("aff") == 0){
			round.set({team1: aff, team2: neg});
		} else {
			round.set({team1: neg, team2: aff});
		}
		
		//change team in round
		this.drawForm(round);

	} ,

	drawForm: function(round){

		var aff;
		var neg;
		if(round.get("aff") == 0){
			aff = round.get("team1");
			neg = round.get("team2");
		} else {
			aff = round.get("team2");
			neg = round.get("team1");
		}

					
		
		//draw left side of form (aff)
		var competitors = aff.get("competitors");
		if(competitors != undefined){
			//clear out existing form data
			$("#editround_team1 > .competitors").html('');
			var aff_id = aff.get("team_code") === "BYE" ? -1 : aff.get("id");
			$("#editround_team1_code").val(aff_id);
			$("#editround_team1_id").text(aff_id);

			var points = round.get("aff_points") || []; 
			for(var i = 0; i < competitors.length; i++){
				
				var speaks = (points[i] === undefined ? "" : points[i].speaks);
				var rank = (points[i] === undefined ? "" : points[i].rank);
				var competitor_input = competitors[i].name + 
					'<br /> Points: <input class="editround_speaks" value="'+ speaks +'"/> ' +
					'Rank: <input class="editround_ranks" value="'+ rank +'"/> <br />';

				$("#editround_team1 > .competitors").append(competitor_input);
			}

		} else {
			//no competitors? team1 must have been a bye
			$("#editround_team1_code").text("BYE");
		}


		//draw right side of form
		competitors = neg.get("competitors");
		if(competitors != undefined){
			//clear out existing form data
			$("#editround_team2 > .competitors").html('');
			//id of -1 means BYE
			var neg_id = neg.get("team_code") === "BYE" ? -1 : neg.get("id");
			$("#editround_team2_code").val(neg_id);
			$("#editround_team2_id").text(neg_id);

			var points = round.get("neg_points") || []; 
			for(var i = 0; i < competitors.length; i++){
				
				var speaks = (points[i] === undefined ? "" : points[i].speaks);
				var rank = (points[i] === undefined ? "" : points[i].rank);
				var competitor_input = competitors[i].name + 
					'<br /> Points: <input class="editround_speaks" value="'+ speaks +'"/> ' +
					'Rank: <input class="editround_ranks" value="'+ rank +'"/> <br />';

				$("#editround_team2 > .competitors").append(competitor_input);
			}

		} else {
			//no competitors? team1 must have been a bye
			$("#editround_team2_code").text("BYE");
		}

		//select correct room and judge from dropdowns
		$("#editround_judge").val(round.get("judge").get("id"));
		$("#editround_room").val(round.get("room").get("id"));
		//populate result box
		
		$("#editround_result_select").val(round.get("result"));

	} ,
	addEmptyRound: function(){
		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		var round = new model.Round();
		var bye_team = new model.Team();
		bye_team.set({team_code: "BYE"});

		round.set({"round_number": round_number});
		round.set({"division": division});
		round.set({"team1": bye_team});
		round.set({"team2": bye_team});
		collection.rounds.add(round);
	} ,
	editRound: function(){
		//verify speaker points
		var team1_id = $("#editround_team1_code").val();
		var team2_id = $("#editround_team2_code").val();
		var team1 = pairing.getTeamFromId(team1_id);
		var team2 = pairing.getTeamFromId(team2_id);
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);
		var result = $("#editround_result_select").val();
		//construct points object for each row in the form
		var aff_points = [];
		var i = 0;
		$("#editround_team1 > .competitors").children().each(function(){
			if($(this).hasClass("editround_speaks")){
				aff_points.push({speaks: $(this).val(), rank: ""});
				i++;
			} else if($(this).hasClass("editround_ranks")){
				aff_points[i-1].rank = $(this).val();
			}
		});

		var neg_points = [];
		var i = 0;
		$("#editround_team2 > .competitors").children().each(function(){
			if($(this).hasClass("editround_speaks")){
				neg_points.push({speaks: $(this).val(), rank: ""});
				i++;
			} else if($(this).hasClass("editround_ranks")){
				neg_points[i-1].rank = $(this).val();
			}
		});
		round.set({"aff_points": aff_points});
		round.set({"neg_points": neg_points});
		round.set({"result": result});

		round.save()
		//speaker points are stored in the round model in aff_points, and neg_points

		//hide form
		$(".edit_model_overlay").fadeOut();
		//clear form
	} ,
	printBallots: function(){
		var div_id = $("#rounds_division_select").val();
		var div = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		var ballot_type = div.get("ballot_type");
		if(ballot_type === "TFA_CX"){
			pdf.generateCXBallot(round_number, div);
		} else if(ballot_type === "TFA_LD"){
			pdf.generateLDBallot(round_number, div);
		} else if(ballot_type === "TFA_PF") {
			pdf.generatePFBallot(round_number, div);
		} else {
			con.write("FATAL ERROR: unrecognized ballot type.")
		}
		
	},
	pairRound: function(){
		var div_id = $("#rounds_division_select").val();
		var div = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		//check if round has already been paired.
		var already_paired = pairing.alreadyPaired(round_number, div);
		if(already_paired === true){
			//pop up dialog for confirmation
			$.confirm({
				'title'		: 'Repair Confirmation',
				'message'	: 'You are about to repair a round that has already been paired. <br />It cannot be restored at a later time! Continue?',
				'buttons'	: {
					'Yes'	: {
						'class'	: 'blue',
						'action': function(){

							pairing.pairRound(round_number, div);
						}
					},
					'No'	: {
						'class'	: 'gray',
						'action': function(){}	// Nothing to do in this case. You can as well omit the action property.
					}
				}
			});
		} else {
			pairing.pairRound(round_number, div);
		}
	} ,

	renderRoundNumberSelect: function(){
		$("#rounds_round_number_select").empty();
		//show round options for selected division
		var div_id = $("#rounds_division_select").val();
		var div = pairing.getDivisionFromId(div_id);
		if(div === undefined){
			return;
		}
		if(div.get("schedule") != undefined){
			for(var i = 0; i < div.get("schedule").length; i++){
				this.appendRoundNumberOption(div.get("schedule")[i].round_number);
			}
		}

		this.filterDivisions();
	} ,
	appendRoundNumberOption: function(round_number){
		//since the objects in the schedule array are not models, we don't have a bonafide option subview.
		$("#rounds_round_number_select", this.el).append('<option value="'+round_number+'">'+round_number+'</option>');
		
	} ,
    
    	
	
	renderDivisionSelect: function(){
		$("#rounds_division_select").empty();
		collection.divisions.each(function(division){ // in case collection is not empty
        	this.appendDivisionOption(division);
    	}, this);
    	this.renderRoundNumberSelect();
	} ,

	appendDivisionOption: function(division){
		var divOptionView = new view.DivisionOption({
			model: division
		});
		$("#rounds_division_select", this.el).append(divOptionView.render().el);
		
	} ,

	render: function(){
		$("#rounds_table").empty();
		_(collection.rounds.models).each(function(round){ // in case collection is not empty
        	this.appendRound(round);
    	}, this);

    	this.renderDivisionSelect();
    	this.renderRoundNumberSelect();
    	this.filterDivisions();
	} ,

	addRound: function(){
		//TODO: validate round name
		
	} ,

	appendRound: function(round){
		var roundView = new view.Round({
			model: round
		});
		$("#rounds_table", this.el).append(roundView.render().el);
		//save round to localstorage
		round.save();
	} ,

	filterDivisions: function(){
		var division_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(division_id);
		var round_number = $("#rounds_round_number_select").val();
		this.renderSearch(collection.rounds.filterRounds(round_number, division));
	} ,
	search: function(e){
		var letters = $("#rounds_search").val();
		this.renderSearch(collection.rounds.search(letters));
	} ,
	renderSearch: function(results){
		$("#rounds_table").html("");

		results.each(function(result){
			var roundView = new view.Round({
				model: result
			});
			$("#rounds_table", this.el).append(roundView.render().el);
		});
		return this;
	} 
	
});


//part of the edit round form
view.CompetitorInput = Backbone.View.extend({
	tagName: "div" ,
	events: { 
      
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	render: function(){
		console.log("rendering competitor input");
		//these will be rendered in order that they appear in the competitors array in a team model
		var html = '<span class="competitor_name">' + this.model.get("name") + '</span> Speaker points: <input type="text" class="speaker_points" />' +
			'Rank: <input type="text" class="rank" />'
		$(this.el).html(html);
		return this; //required for chainable call, .render().el
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.School = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
	  'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	
	showEditForm: function(){
		//populate form with existing values
		$("#newschool_id").val(this.model.get("id"));
		$("#newschool_name").val(this.model.get("school_name"));
		$("#school_form_overlay").fadeIn();
	} ,
	
	remove: function(school){
		var school = this.model;
		$.confirm({
			'title'		: 'Delete School',
			'message'	: 'You are about to delete a School <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': school,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
						}
					},
					'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},

		});
			
	} ,
	render: function(){
		$(this.el).html('<td class="name">' + this.model.get("school_name") + '</td> <td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});



view.SchoolTable = Backbone.View.extend({
	el: $("#schools") , // attaches `this.el` to an existing element.
	events: {
		"click #add_school_button": "addSchool" ,
		"keyup #schools_search": "search",
		"keyup #newschool_name": "keyupSchoolName"
	} ,

	initialize: function(){
		_.bindAll(this, "render", "addSchool", "appendSchool");
		
		collection.schools.bind("add", this.appendSchool);
		collection.schools.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	keyupSchoolName: function(event){
		if(event.which === 13){
			this.addSchool();
		}
	},
	render: function(){
		_(collection.schools.models).each(function(school){ // in case collection is not empty
        	this.appendSchool(school);
    	}, this);
	} ,
	clearEditForm: function(){
		console.log("clearing school form");
		$("#newschool_id").val("");
		$("#newschool_name").val("");
	} ,
	addSchool: function(){
		//TODO: validate school name
		var id = $("#newschool_id").val();
		var school_name = $("#newschool_name").val();
		$(".edit_model_overlay").fadeOut();
		
		if(id.length > 0)
		{
			var school = pairing.getSchoolFromId(id);
			school.set({
			
			school_name: school_name
			
			});
		}
		else
		{
			var school = new model.School();
			school.set({
			
				id		   : (new ObjectId).toString(),
				school_name: school_name
			
			});
			collection.schools.add(school);
		}
		
		school.save();
		this.clearEditForm();
		
	} ,

	appendSchool: function(school){
		var schoolView = new view.School({
			model: school
		});
		$("#schools_table", this.el).append(schoolView.render().el);
	} ,
	search: function(e){
		var letters = $("#schools_search").val();
		this.renderSearch(collection.schools.search(letters));
	} ,
	renderSearch: function(results){
		$("#schools_table").html("");

		results.each(function(result){
			var schoolView = new view.School({
				model: result
			});
			$("#schools_table", this.el).append(schoolView.render().el);
		});
		return this;
	} 
	
});

view.Division = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
      'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		console.log("showing division edit form");
		//populate form with existing values
		$("#newdiv_id").val(this.model.get("id"));
		$("#newdiv_division_name").val(this.model.get("division_name"));
		$("#newdiv_comp_per_team").val(this.model.get("comp_per_team"));
		$("#newdiv_flighted_rounds").val(this.model.get("flighted_rounds"));
		$("#newdiv_combine_speaks").val(this.model.get("combine_speaks"));
		$("#newdiv_break_to").val(this.model.get("break_to"));
		$("#newdiv_max_speaks").val(this.model.get("max_speaks"));
		$("#newdiv_prelims").val(this.model.get("prelims"));
		$("#newdiv_ballot_type").val(this.model.get("ballot_type"));

		$(".edit_model_overlay").css("height", $(document).height());
		$("#division_form_overlay").fadeIn();
	} ,
	remove: function(division){
		var division = this.model;
		$.confirm({
			'title'		: 'Delete Round',
			'message'	: 'You are about to delete a Division <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': division,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
						}
					},
					'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
		
	} ,
	render: function(){
		$(this.el).html('<td class="name">' + this.model.get("division_name") + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});


view.DivisionTable = Backbone.View.extend({
	el: $("#divisions") , // attaches `this.el` to an existing element.
	events: {
		"click #add_division_button": "addDivision" 
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addDivision", "appendDivision");
		
		collection.divisions.bind("add", this.appendDivision);
		collection.divisions.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	render: function(){
		_(collection.divisions.models).each(function(division){ // in case collection is not empty
        	this.appendDivision(division);
    	}, this);
	} ,
	clearEditForm: function(){
		console.log("clearing division form");
		$("#newdiv_id").val("");
		$("#newdiv_division_name").val("");
		$("#newdiv_comp_per_team").val("");
		$("#newdiv_flighted_rounds").val(false);
		$("#newdiv_combine_speaks").val(false);
		$("#newdiv_break_to").val("4");
		$("#newdiv_max_speaks").val("30");
		$("#newdiv_prelims").val("4");
		$("#newdiv_ballot_type").val("TFA_CX");
	} ,
	addDivision: function(){
		//TODO: validate school name
	

		
		
		//TODO: verify all this input
		var division_name = $("#newdiv_division_name").val();
		var comp_per_team = parseInt($("#newdiv_comp_per_team").val(), 10);
		//TODO: verify that this boolean works
		var flighted_rounds = new Boolean($("#newdiv_flighted_rounds").val());
		var break_to = $("#newdiv_break_to").val();
		var max_speaks = parseInt($("#newdiv_max_speaks").val());
		var prelims = parseInt($("#newdiv_prelims").val());
		var schedule = [];
		var ballot_type = $("#newdiv_ballot_type").val();
		var combine_speaks = new Boolean($("#newdiv_combine_speaks").val());

		for(var i = 0; i < prelims; i++){
			var num = i + 1;
			schedule.push({round_number: num, type: "prelim", matching: "power"});
		}
		var elims = [
			{name:	"triple octafinals", debates: 32}, 
			{name: "double octafinals", debates: 16},
			{name: "octafinals", debates: 8},
			{name: "quarterfinals", debates: 4},
			{name:  "semifinals", debates: 2},
			{name: "finals", debates: 1}
		];


		for(var i = 0; i < elims.length; i++){
			if(break_to >= elims[i].debates){
				schedule.push({round_number:elims[i].name, type: "elim"});
			}
		}


		$(".edit_model_overlay").fadeOut();

		//check if we are modifying an existing division or created a new one
		var id = $("#newdiv_id").val();
		console.log(id);
		if(id.length > 0){
			console.log("updating existing model");
			//update existing model
			var division = pairing.getDivisionFromId(id);
			division.set({
			division_name	: division_name,
			comp_per_team	: comp_per_team,
			flighted_rounds	: flighted_rounds,
			break_to		: break_to,
			max_speaks		: max_speaks,
			prelims			: prelims,
			schedule		: schedule,
			ballot_type		: ballot_type

		});
		} else {
			console.log("creating new model");
			var division = new model.Division();
			division.set({
			id				: (new ObjectId).toString(),
			division_name	: division_name,
			comp_per_team	: comp_per_team,
			flighted_rounds	: flighted_rounds,
			break_to		: break_to,
			max_speaks		: max_speaks,
			prelims			: prelims,
			schedule		: schedule,
			ballot_type		: ballot_type,
			combine_speaks	: combine_speaks

		});
			collection.divisions.add(division);
		}
		
		division.save();
		this.clearEditForm();


	} ,

	appendDivision: function(division){
		var divisionView = new view.Division({
			model: division
		});
		$("#divisions_table", this.el).append(divisionView.render().el);
	}
	
});


/*
=========================================
Initialize Backbone Collections
=========================================
*/	
collection.divisions = new collection.Divisions();
collection.teams = new collection.Teams();
collection.schools = new collection.Schools();
collection.judges = new collection.Judges();
collection.rooms = new collection.Rooms();
collection.rounds = new collection.Rounds();

/*
=========================================
Load localStorage into Collections
=========================================
*/	

//note: calling fetch runs the constructors of the models.
collection.teams.fetch();
collection.divisions.fetch();
collection.schools.fetch();
collection.judges.fetch();
collection.rooms.fetch();
collection.rounds.fetch()
model.tournament = new model.Tournament();
model.tournament.set({tournament_name: localStorage.getItem("tournament_name") || "Debate Tournament"});
/*
=========================================
Initialize Backbone Views
=========================================
*/	
//turn object copies into object references to original models
pairing.restoreReferences();
view.teamTable = new view.TeamTable(); 
view.schoolTable = new view.SchoolTable(); 
view.divisionTable = new view.DivisionTable(); 
view.judgeTable = new view.JudgeTable(); 
view.roomTable = new view.RoomTable();  
view.roundTable = new view.RoundTable();
view.statsArea = new view.StatsArea();


//initialize ui menu state

if(localStorage.getItem("selected") != undefined){
	con.write("found saved menu state: " + localStorage.getItem("selected"));

	//show saved menu
	ui.showMenu(localStorage.getItem("selected"));
} 

//initialize title
$("#trn_name_title").text(model.tournament.get("tournament_name") || "Debate Tournament");

//print stats on loaded data to console
con.write("Teams: " + collection.teams.length);
con.write("Divisions: " + collection.divisions.length);
con.write("Schools: " + collection.schools.length);
con.write("Judges: " + collection.judges.length);
con.write("Rooms: " + collection.rooms.length);
con.write("Rounds: " + collection.rounds.length);
//initialize menu state

$(".container").hide();
$(".sub_menu").hide();
$("#rounds_container").show();



$(".edit_model_overlay").hide();

/*
=========================================
Main Menu Controls
=========================================
*/

/*
Valid values for menu_item:
	rounds
	teams
	judges
	rooms
	schools
	divisions
	settings
	pdf
	debug
*/



$(".menu_item").click(function(){
	//menu item ids are like: menu_judges
	var menu_item_name = $(this).attr("id").substr(5);
	//TODO: save menu state in a model so it opens to where you were if browser gets closed
	ui.showMenu(menu_item_name);
});

$("#menu_settings").click(function(){
	view.statsArea.render();
});

//client-side function call Code for sending a single text
$("#single_text").click(function(){

	var pNumber = $("#debug_sms_input_phone").val();
	if(pNumber == '' || pNumber == ' ') {
		pNumber = ' ';
		$("#debug_sms_input_phone").val("<Phone Number> for single");
		con.write("For a single text, enter phone number. There is no default. Not sending msg.");
		return;
	}

	var msg = $("#debug_sms_input_message").val();
	if($.trim(msg) == '') {
		msg = 'Hello World!';
	}

	var data = {phone_number: pNumber, message: msg};

	$.post("/text", data, function(res){
		console.log('Message sent from UI: ' + res.body);
		con.write(res);
	});
});


//client side function call Code for sending mass texts
$("#mass_texts").click(function(){
	var nick = '+15129685781';
	var data = {smsList: [
		{phone_number: nick, message: 'Hello World__1 !'},
		{phone_number: nick, message: 'Hello World__2 !'}
	]};

	//send this as a mass text
	$.post("/textMass", data, function(res){
		console.log('Message sent from UI: ' + res.body);
		con.write(res);
	});
});


//when window is resized, change overlay to match it.
//we want the gradient to always stretch over the entire screen
//behind the edit window
$(window).resize(function(){
	$(".edit_model_overlay").css("height", $(document).height());
});




//Code for PDF Menu
$("#menu_pdf").click(function(){
	$(".container").hide();
	$("#pdf_container").show();
	$("#help_text").text("This is the PDF Menu")
});






$("#ballot_gen").click(function(){
	pdf.generateCXBallot();	
});

$("#ballotLD_gen").click(function(){
	pdf.generateLDBallot();	
});
$("#ballotOF_gen").click(function(){
	pdf.generateOFBallot();	
});

//Code for PDF Brackets Generation
$("#pdf_brackets_gen").click(function(){
	pdf.bracketsDataPDF();
});


//Code for the help menu on the right
$("#menu_judges").click(function(){
		$(".container").hide();
		//$("#teams_container").hide();
		$("#judges_container").show();
		$(".sub_menu").hide();
		$("#sub_menu_judges").show();
		$("#help_text").text("Judges' context")
		
});
	
$("#judges_search").mouseover(
	function() {
			$("#help_text").text("Type in judge's name to find");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});

$("#add_team_menu").mouseover(
	function() {
			$("#help_text").text("Click to add teams");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});

$("#menu_enter_ballot").mouseover(
	function() {
			$("#help_text").text("Bring up  menu to enter ballot");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
	});


$("#menu_settings").mouseover(
	function() {
			$("#help_text").text("Bring up settings menu");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
	});

$("#menu_pdf").mouseover(
	function() {
			$("#help_text").text("Bring up PDF Generator Menu");
		});

$("#menu_divisions").mouseover(
	function() {
			$("#help_text").text("Modify Divisions here");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});


$("#menu_debug").mouseover(
	function() {
			$("#help_text").text("Secret Debug Menu");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});


$("#menu_rooms").mouseover(
	function() {
			$("#help_text").text("List available rooms");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});

$("#menu_schools").mouseover(
	function() {
			$("#help_text").text("List available Schools");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});

$("#menu_teams").mouseover(
	function() {
			$("#help_text").text("Click to list or add teams");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});

$("#menu_judges").mouseover(
	function() {
			$("#help_text").text("Click to list or add judges");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});

$("#menu_rounds").mouseover(
	function() {
			$("#help_text").text("View list of all tournaments");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});

$("#add_team_menu").click(function(){
	$("#teams").hide();
	$("#add_team").show();
});


$("#single_text").mouseover(
	function() {
			$("#help_text").text("The Cool Single SMS Message Sender");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});


$("#mass_texts").mouseover(
	function() {
			$("#help_text").text("Send Mass texts to Nick");
		}).mouseleave(function() {
			$("#help_text").text("Select menu context");
		});





/*
=========================================
Collection Controls
=========================================
*/

$(".cancel_button").click(function(){
	$(".edit_model_overlay").fadeOut();
});
$("#cancel_division_button").click(function(){
	view.divisionTable.clearEditForm();
});
$("#cancel_room_button").click(function(){
	view.roomTable.clearEditForm();
});
$("#cancel_judge_button").click(function(){
	view.judgeTable.clearEditForm();
});
$("#cancel_school_button").click(function(){
	view.schoolTable.clearEditForm();
});
$("#cancel_team_button").click(function(){
	view.teamTable.clearEditForm();
});
//school controls
$("#toggle_school_form").click(function(){
	$("#school_form_overlay").fadeToggle();
});

//judge controls

$("#toggle_judge_form").click(function(){
	$("#judge_form_overlay").fadeToggle();
});

//room controls
$("#toggle_room_form").click(function(){
	$("#room_form_overlay").fadeToggle();
});

//division controls
$("#toggle_division_form").click(function(){
	$("#division_form_overlay").fadeToggle();
});



//round controls

//cx form controls
$("#pop_cx_form").click(function(){
	$("#ld_form_overlay").fadeOut();
	$("#cx_form_overlay").fadeIn();
});

$("#pop_ld_form").click(function(){
	$("#cx_form_overlay").fadeOut();
	$("#ld_form_overlay").fadeIn();
});

//settings controls
$("#trn_save").click(function(){
	//save tournament name
	var name = $("#trn_name").val();
	model.tournament.set({tournament_name: name});
	$("#trn_name_title").text(name);
	
	localStorage.setItem("tournament_name", name);

});

	

/*
=========================================
Debug Controls
=========================================
*/
$("#save_state").click(function(){
});

$("#clear_storage").click(function(){

	$.confirm({
			'title'		: 'Clear localStorage',
			'message'	: 'You are about to delete ALL LOCAL DATA <br />This will erase the entire tournament! Continue?',
			'buttons'	: {
				'Yes'	: {
					
					'class'	: 'blue',
					'action': pairing.clearStorage
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	
});

$("#fetch_teams").click(function(){
	console.log("fetching teams");
	collection.teams.fetch();
});

$("#export_tournament").click(function(){
	console.log("exporting teams");
	//TODO: finish this feature
});

$("#pair_delete_all_rounds").click(function(){
	
	$.confirm({
			'title'		: 'Delete All Rounds',
			'message'	: 'You are about to delete ALL ROUNDS <br />This will erase the entire tournament! Continue?',
			'buttons'	: {
				'Yes'	: {
					
					'class'	: 'blue',
					'action': pairing.deleteAllRounds
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	
});

$("#pair_print_pairings").click(function(){
	//print pairings for every division and every round
	var rounds = [];
	for(var i = 0; i < collection.rounds.length; i++){
		if(rounds.indexOf(collection.rounds.at(i).get("round_number")) === -1){
			rounds.push(collection.rounds.at(i).get("round_number"));
		}
	}
	for(var i = 0; i < collection.divisions.length; i++){
		for(var j = 0; j < rounds.length; j++){
			pairing.printPairings(rounds[j], collection.divisions.at(i));
		}
	}

});

$("#pair_tests").click(function(){
	con.write("Pairing tests:");
	var div1 = collection.divisions.at(0);
	var div2 = collection.divisions.at(1);
	//teams should have been loaded from localstorage
	pairing.deleteAllRounds();
	pairing.pairRound(1, div1);

	pairing.printPairings(1, div1);
	pairing.simulateRound(1, div1);

	pairing.updateRecords(div1);
	pairing.sortTeams(div1);
	pairing.printRecords(div1);

	pairing.pairRound(2, div1);
	pairing.printPairings(2, div1);
	pairing.simulateRound(2, div1);
	pairing.updateRecords(div1);
	pairing.sortTeams(div1);
	pairing.printRecords(div1);

	pairing.pairRound(1, div2);

	pairing.printPairings(1, div2);
	pairing.simulateRound(1, div2);

	pairing.updateRecords(div2);
	pairing.sortTeams(div2);
	pairing.printRecords(div2);

	pairing.pairRound(2, div2);
	pairing.printPairings(2, div2);
	pairing.simulateRound(2, div2);
	pairing.updateRecords(div2);
	pairing.sortTeams(div2);
	pairing.printRecords(div2);
/*
	pairing.pairRound(3, div1);
	pairing.printPairings(3, div1);
	pairing.simulateRound(3, div1);
	pairing.updateRecords(div1);
	pairing.sortTeams(div1);
	//pairing.printRecords();

	pairing.pairRound(4, div1);
	pairing.printPairings(4, div1);
	pairing.simulateRound(4, div1);
	pairing.updateRecords(div1);
	pairing.sortTeams(div1);
	//pairing.printRecords();
*/

	con.write("number of teams: " + collection.teams.length);
	con.write("number of rounds: " + collection.rounds.length);
		
});



}); //I think this is the end of jquery.ready



return {collection: collection, model: model, view: view, router: router, pairing: pairing, con: con, ui: ui};

}()); //end the IIFE


