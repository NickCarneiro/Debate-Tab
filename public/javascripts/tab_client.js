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


model.Competitor = Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new competitor");
	        }
});

model.Team = Backbone.Model.extend({
	default: {
		id			: null ,
		team_code	: "default team_code" ,
		division	: null , //reference to division
		school	: null , //reference to school

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
		result		: null
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
		prelims			: 4 , //
		prelim_matching : []
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
		localStorage: new Store("Rounds")
});	

/*
=========================================
BEGIN: Define Pairing Functions
=========================================
*/	
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
	}
}

pairing.deleteAllRounds = function(){
	con.write("rounds length " + collection.rounds.length);
	while(collection.rounds.at(0) != undefined){
	
		con.write("removing round " + collection.rounds.at(0).get("team1").get("team_code"));
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
			con.write(left_team.get("team_code") + spaces + 
				right_team.get("team_code") + " " + room);
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

		if(temp_teams.length > 0 && collection.teams.length % 2 == 0 || byes > 1){
			//if there are an even number of teams but someone has a bye, fix it.
			con.write("fixing byes");	


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
				con.write("neither team had previous room");
				console.log(team1_id);
				console.log(team2_id);
				console.log(prev_rooms);

				console.log(room1);
				console.log(room2);
				if(rooms.length > 0){
					collection.rounds.at(i).set({room: rooms.pop()});
				} else {
					con.write("WARNING: Needed another room");
				} 
			}


		}

	}
};

pairing.pairJudges = function(round_number, divisions){
	

};

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

pdf.roundDataPDF = function(headers,titles,startIndex)
{
    var rooms_array = new Array();
	
	for(x=0; x < collection.rooms.length; x++)
	{
		rooms_array[x] = collection.rooms.at(x).get("division").get("division_name"); 
	}
    var judges_array = new Array();
	
    for(y=0; y<collection.judges.length; y++)
    {
       judges_array[y] = new Array();

       if(collection.judges.at(y).get("divisions").length == 1)
       {
        judges_array[y][0] = collection.judges.at(y).get("divisions")[0].get("division_name");
       }
       if(collection.judges.at(y).get("divisions").length == 2)
       {
        judges_array[y][0] = collection.judges.at(y).get("divisions")[0].get("division_name");
        judges_array[y][1] = collection.judges.at(y).get("divisions")[1].get("division_name");
       }
       if(collection.judges.at(y).get("divisions").length == 3)
       {
        judges_array[y][0] = collection.judges.at(y).get("divisions")[0].get("division_name");
        judges_array[y][1] = collection.judges.at(y).get("divisions")[1].get("division_name");
        judges_array[y][2] = collection.judges.at(y).get("divisions")[2].get("division_name");
       }
       if(collection.judges.at(y).get("divisions").length == 4)
       {
        judges_array[y][0] = collection.judges.at(y).get("divisions")[0].get("division_name");
        judges_array[y][1] = collection.judges.at(y).get("divisions")[1].get("division_name");
        judges_array[y][2] = collection.judges.at(y).get("divisions")[2].get("division_name");
        judges_array[y][3] = collection.judges.at(y).get("divisions")[3].get("division_name");
       }
    }	
    var judge_team_forbidden = new Array();

    var judgeIndex = $.inArray("VCX", judges_array);
    console.log(judges_array);
    console.log($.inArray("VCX",judges_array[0]));

	var table_data = new Array();	//this is a 2-D array 
	if(collection.rounds.length > 0)
	{
		for(var i=0, j=startIndex; i< Math.ceil((collection.teams.length)/2) ; i++,j++) {
		//	table_data[i] = new tableRowArray();
			table_data[i] = new Array();
			if(collection.rounds.at(i).get("aff") == 0)
			{
				table_data[i][0] = collection.rounds.at(j).get("team1").get("team_code");
				table_data[i][1] = collection.rounds.at(j).get("team2").get("team_code");

			}
			else
			{
				table_data[i][0] = collection.rounds.at(j).get("team2").get("team_code");
				table_data[i][1] = collection.rounds.at(j).get("team1").get("team_code");
				
			}
			
			if((table_data[i][0] == "BYE") || (table_data[i][1] == "BYE"))
			{
				table_data[i][2] = "None";
			}
			else if(collection.rounds.at(j).get("team1").get("division").get("division_name") == "VCX")
			{
				for(x=0; x < collection.rooms.length; x++)
				{
					if(rooms_array[x] == "VCX")
					{
						table_data[i][2] = '' + collection.rooms.at(x).get("name");

						rooms_array[x] = "lol";
						break;
						
					}
				}
                for(x=0; x < collection.judges.length; x++)
                {
                    var judgeIndex = $.inArray("VCX", judges_array[x]);
                    if(judgeIndex != -1)
                    {
                        table_data[i][3] = collection.judges.at(x).get("name");
                        judges_array[x] = "lol";
                        break;
                    }
                }
                	
			}
			else if(collection.rounds.at(j).get("team1").get("division").get("division_name") == "NCX")
			{
				for(x=0; x < collection.rooms.length; x++)
				{
					if(rooms_array[x] == "NCX")
					{
						table_data[i][2] = '' + collection.rooms.at(x).get("name");
				
						rooms_array[x] = "lol";
						break;
						
					}
				}	
                for(x=0; x < collection.judges.length; x++)
                {
                    var judgeIndex = $.inArray("NCX", judges_array[x]);
                    if(judgeIndex != -1)
                    {
                        table_data[i][3] = collection.judges.at(x).get("name");
                        judges_array[x] = "lol";
                        break;
                    }
                }
			}
			else if(collection.rounds.at(j).get("team1").get("division").get("division_name") == "VLD")
			{
				for(x=0; x < collection.rooms.length; x++)
				{
					if(rooms_array[x] == "VLD")
					{
						table_data[i][2] = '' + collection.rooms.at(x).get("name");
			
						rooms_array[x] = "lol";
						break;
						
					}
				}	
                for(x=0; x < collection.judges.length; x++)
                {
                    var judgeIndex = $.inArray("VLD", judges_array[x]);
                    if(judgeIndex != -1)
                    {
                        table_data[i][3] = collection.judges.at(x).get("name");
                        judges_array[x] = "lol";
                        break;
                    }
                }
			}
			else if(collection.rounds.at(j).get("team1").get("division").get("division_name") == "NLD")
			{
				for(x=0; x < collection.rooms.length; x++)
				{
					if(rooms_array[x] == "NLD")
					{
						table_data[i][2] = '' + collection.rooms.at(x).get("name");
		
						rooms_array[x] = "lol";
						break;
						
					}
				}	
                for(x=0; x < collection.judges.length; x++)
                {
                    var judgeIndex = $.inArray("NLD", judges_array[x]);
                    if(judgeIndex != -1)
                    {
                        table_data[i][3] = collection.judges.at(x).get("name");
                        judges_array[x] = "lol";
                        break;
                    }
                }
			}

		
		}
		
			pdf.generatePDF_PairingSheet(headers, titles, table_data);	

	}
	else
	{
		alert("no rounds exist");
	}
}

pdf.generatePDF_PairingSheet = function(headers, titles, table_data){
	// generate a blank document
	var doc = new jsPDF();
	var max_page_length = 280;
	var page_start_y_value = 50;


	doc.text(20, 20, headers.tournament_name);
	doc.text(20, 30, headers.date);
	const round_text = 'Round: ' + headers.round_number;
	doc.text(20, 40, round_text);
	doc.text(20, 50, headers.start_time_text);
	doc.text(20, 60, headers.message);

	var x_value = 20;
	const title_y_value = 80;
	const spacing = 47;


	pdf.printTitles(doc, titles, x_value, title_y_value, spacing);

	var data_y_value = 90;
	var j = 0;
	for(i=0; i< table_data.length; i++) {	//for each row
		x_value = 20;
		for(j=0; j< table_data[i].length; j++) {	//for each column
			doc.text(x_value, data_y_value, table_data[i][j]);
			x_value = x_value + spacing;		// add a spacing between each column
		}	
		data_y_value = data_y_value + 10;
		if(data_y_value > max_page_length) {
			doc.addPage();
			data_y_value = page_start_y_value;
			pdf.printTitles(doc, titles, 20, 30, spacing);	// where to start printing
								// of titles on new page
		}
	}

//	doc.text(20, 30, 'This is client-side JS pumping out a PDF!');
//	doc.addPage();
//	doc.text(20, 20, 'Do you like that?');

	// Output as Data URI so that it can be downloaded / viewed
	doc.output('datauri');
}

pdf.generateLDBallot = function(){
	// generate a blank document
	var doc = new jsPDF();


	doc.setFontSize(18);
	doc.text(20, 20, 'Lincoln Douglas Debate Ballot');
	doc.setFontSize(13);
	doc.text(20, 30, 'Round:___________'); doc.text(130,30, 'Judge:___________');
	doc.text(39,30,'Fill form');
	//const round_text = 'Round: ' + headers.round_number;
	doc.text(20, 40, 'Affirmative Code:___________'); doc.text(130,40, 'Negative Code:___________');
	//doc.text(20, 50, headers.start_time_text); 
	//doc.text(20, 60, headers.message);
	doc.setFontSize(9);
	doc.text(97,52, 'Points');
	doc.text(186,52, 'Points');
	doc.setFontSize(11);
	doc.text(20, 60, 'AFFIRMATIVE ______________________  _____       NEGATIVE ______________________  _____  ');
	//doc.text(20, 70, '2nd AFF. __________________  _____  _____    2nd NEG. __________________  _____  _____');
	doc.setFontSize(9);
	doc.text(20,75, 'Speakers should be rated on a scale from 20-30 points.  Half points (.5) are allowed.You may have a tie in points,'); 
	doc.text(20,79, 'but you must indicate the person doing the better job of debating');
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

	// Output as Data URI so that it can be downloaded / viewed
	doc.output('datauri');
}

pdf.generateCXBallot = function(){
	// generate a blank document
	var doc = new jsPDF();


	doc.setFontSize(18);
	doc.text(20, 20, 'Cross Examination Debate Ballot');
	doc.setFontSize(13);
	doc.text(20, 30, 'Round:___________'); doc.text(130,30, 'Judge:___________');
	doc.text(39,30,'Fill form');
	//const round_text = 'Round: ' + headers.round_number;
	doc.text(20, 40, 'Affirmative Code:___________'); doc.text(130,40, 'Negative Code:___________');
	//doc.text(20, 50, headers.start_time_text); 
	//doc.text(20, 60, headers.message);
	doc.setFontSize(9);
	doc.text(77,52, 'Points    Ranks');
	doc.text(164,52, 'Points    Ranks');
	doc.setFontSize(11);
	doc.text(20, 60, '1st AFF. __________________  _____  _____     1st NEG. __________________  _____  _____');
	doc.text(20, 70, '2nd AFF. __________________  _____  _____    2nd NEG. __________________  _____  _____');
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
	settings
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
		"blur .newteam_competitor": "generateTeamName"
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

	//called when a competitor name box is modified.
	//generate a team name if every competitor name has been entered.
	generateTeamName: function(){
		var competitors =  $("#newteam_competitors").find("input");

		//count number of filled in competitor names to see if they are all complete
		var i = 0;
		$("#newteam_competitors").find("input").each(function(index, comp_name){
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
				var whole_name = competitors.get(0).val();
				var names = whole_name.split(" ");
				if(names.length >= 2){
					
					team_code += " " + names[0].substr(0,1) + names[1].substr(0,1);
				}
			} else if(competitors.length >=2){
				var whole_name = $(competitors.get(1)).val();
				var names = whole_name.split(" ");
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

			$("#newteam_competitors").append('<input class="newteam_competitor" type="text" /> <br />');
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
		var team_code = $("#newteam_name").val();
		var school_id = $("#newteam_school").val();
		var team = new model.Team();
		var division_id = $("#newteam_division").val();
		var division = pairing.getDivisionFromId(division_id);
		var competitors = [];
		//populate competitors based on form entries
		$("#newteam_competitors").children().each(function(){
			competitors.push($(this).val());
			$(this).val("");
		});
		var school = pairing.getSchoolFromId(school_id);
		
		team.set({
			team_code: team_code,
			school: school,
			competitors: competitors,
			division: division
		});
		collection.teams.add(team);
		team.save();
		$("#newteam_name").val("");
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
      'click td.remove': 'remove'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,

	remove: function(team){
		console.log("destroying team" + team);
		this.model.destroy();
	} ,
	render: function(){
		$(this.el).html('<td>' + this.model.get("team_code") + 
			'</td> <td>'+this.model.get("division").get("division_name") +'</td><td>' + 
			this.model.get("id") + '</td><td class="remove">Remove</td>');
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
      'click td.remove': 'remove'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,

	remove: function(judge){
	//	$(function () {
			$('.simpledialog').simpleDialog();
	//	});
	//	this.model.destroy();
		
	} ,
	render: function(){
		var school = this.model.get("school") === undefined ? "None" : this.model.get("school").get("school_name");
		$(this.el).html('<td>' + this.model.get("name") + '</td> <td>' + this.model.get("id") + 
			'</td><td>'+ school +'</td><td><a href="#" rel="dialog_content" class="simpledialog">Remove</a></td>');
		return this; //required for chainable call, .render().el ( in appendJudge)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

		
		$('.simpledialog').simpleDialog();


view.JudgeTable = Backbone.View.extend({
	el: $("#judges") , // attaches `this.el` to an existing element.
	events: {
		"click #add_judge_button": "addJudge" ,
		"keyup #judges_search": "search"
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

    	collection.divisions.each(function(division){ // pre-existing schools
        	this.addDivisionCheckbox(division);
    	}, this);
		this.render();
		
	} ,
	
	render: function(){
		_(collection.judges.models).each(function(judge){ // in case collection is not empty
        	this.appendJudge(judge);
    	}, this);
	} ,

	addJudge: function(){
		//TODO: validate judge name
		var judge_name = $("#new_judge_name").val();

		var judge = new model.Judge();
		var school_id = $("#newjudge_school").val();
		//may be undefined
		var school = pairing.getSchoolFromId(school_id);
		var divisions = [];
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
		judge.set({divisions: divisions});
		judge.set({name: judge_name, school:school});

		collection.judges.add(judge);
		judge.save();
		$("#new_judge_name").val("");
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
      'click td.remove': 'remove'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,

	remove: function(room){
		this.model.destroy();
	} ,
	render: function(){
		$(this.el).html('<td>' + this.model.get("name") + '</td> <td>' +this.model.get("division").get("division_name") + '</td> <td>' + this.model.get("id") + '</td><td class="remove">Remove</td>');
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
		"keyup #rooms_search": "search"
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
		

		var room_name = $("#newroom_name").val();
		var div_name_id = $("#newroom_division").val();
		var division = pairing.getDivisionFromId(div_name_id);
		var room = new model.Room();
		room.set({name: room_name, division: division});
		collection.rooms.add(room);
		room.save();
		$("#newroom_name").val("");
		
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

view.Round = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(round){
		this.model.destroy();
	} ,
	render: function(){
		var team1 = this.model.get("team1");
		var team2 = this.model.get("team2");
		if(team1 != undefined){
			var team1_cd = team1.get("team_code");
		} else {
			team1_cd = "BYE";
		}
		if(team2 != undefined){
			var team2_cd = team2.get("team_code");
		} else {
			team2_cd = "BYE";
		}
		$(this.el).html('<td>' + team1_cd + '</td> <td>' + team2_cd + '</td><td class="remove">Remove</td>');
		return this; //required for chainable call, .render().el
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});


view.RoundTable = Backbone.View.extend({
	el: $("#rounds") , // attaches `this.el` to an existing element.
	events: {
		
		"keyup #rounds_search": "search",
		"click #pair_round_button" : "pairRound"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addRound", "appendRound");
		
		collection.rounds.bind("add", this.appendRound);
		collection.rounds.bind("reset", this.render, this);
		collection.rounds.bind("change", this.render, this);
		this.render();
		
	} ,
	pairRound: function(){
		pairing.pairRound(1, collection.divisions.at(0));
	},
	render: function(){
		$("#rounds_table").empty();
		_(collection.rounds.models).each(function(round){ // in case collection is not empty
        	this.appendRound(round);
    	}, this);
	} ,

	addRound: function(){
		//TODO: validate round name
		var round_name = $("#newround_name").val();

		var round = new model.Round();
		round.set({round_name: round_name});

		collection.rounds.add(round);
		round.save();
		$("#newround_name").val("");
	} ,

	appendRound: function(round){
		var roundView = new view.Round({
			model: round
		});
		$("#rounds_table", this.el).append(roundView.render().el);
		//save round to localstorage
		round.save();
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

view.School = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(school){
		this.model.destroy();
	} ,
	render: function(){
		$(this.el).html('<td>' + this.model.get("school_name") + '</td> <td>' + this.model.get("id") + '</td><td class="remove">Remove</td>');
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
		"keyup #schools_search": "search"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addSchool", "appendSchool");
		
		collection.schools.bind("add", this.appendSchool);
		collection.schools.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	render: function(){
		_(collection.schools.models).each(function(school){ // in case collection is not empty
        	this.appendSchool(school);
    	}, this);
	} ,

	addSchool: function(){
		//TODO: validate school name
		var school_name = $("#newschool_name").val();

		var school = new model.School();
		school.set({school_name: school_name});

		collection.schools.add(school);
		school.save();
		$("#newschool_name").val("");
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
      'click td.remove': 'remove'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		$(this.el).html('<td>' + this.model.get("division_name") + '</td> <td>' + this.model.get("id") + '</td><td class="remove">Remove</td>');
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

	addDivision: function(){
		//TODO: validate school name
	


		var division = new model.Division();
		//TODO: verify all this input
		var division_name = $("#newdiv_division_name").val();
		var comp_per_team = parseInt($("#newdiv_comp_per_team").val(), 10);
		//TODO: verify that this boolean works
		var flighted_rounds = new Boolean($("#newdiv_flighted_rounds").val());
		var break_to = $("#newdiv_break_to").val();
		var max_speaks = parseInt($("#newdiv_max_speaks").val());
		var prelims = parseInt($("#newdiv_prelims").val());
		division.set({
			id				: (new ObjectId).toString(),
			division_name	: division_name,
			comp_per_team	: comp_per_team,
			flighted_rounds	: flighted_rounds,
			break_to		: break_to,
			max_speaks		: max_speaks,
			prelims			: prelims

		});
		collection.divisions.add(division);
		division.save();
		$("#newdiv_division_name").val("");
		$("#newdiv_comp_per_team").val("");
		$("#newdiv_division_name").val("");
		$("#newdiv_division_name").val("");
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
collection.rounds.fetch();

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



//initialize ui menu state

if(localStorage.getItem("selected") != undefined){
	con.write("found saved menu state: " + localStorage.getItem("selected"));

	//show saved menu
	ui.showMenu(localStorage.getItem("selected"));
} 


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

//Code for PDF Menu
$("#menu_pdf").click(function(){
	$(".container").hide();
	$("#pdf_container").show();
	$("#help_text").text("This is the PDF Menu")
});



//Code for Generate PDF Button
$("#pdf_gen").click(function(){
	const headers = {
		tournament_name: 'Round Rock HS Tournament',
		date: '11/18/11',
		round_number: '1',
		start_time_text: 'Start: 3:00 PM',
		message: 'Welcome to the Round Rock Tournament run by DebateTab!'
	};

	const titles = [ "Affirmative",
			"Negative",
			"Room",
			"Judge"
	];
	
    var startIndex = 0;
    pdf.roundDataPDF(headers,titles,startIndex);
	

});

$("#pdf_gen2").click(function(){
	const headers = {
		tournament_name: 'Round Rock HS Tournament',
		date: '11/18/11',
		round_number: '2',
		start_time_text: 'Start: 3:00 PM',
		message: 'Welcome to the Round Rock Tournament run by DebateTab!'
	};

	const titles = [ "Affirmative",
			"Negative",
			"Room",
			"Judge"
	];
	
	var startIndex = (Math.ceil((collection.teams.length)/2));
    pdf.roundDataPDF(headers,titles,startIndex);

});

$("#pdf_gen3").click(function(){
	const headers = {
		tournament_name: 'Round Rock HS Tournament',
		date: '11/18/11',
		round_number: '3',
		start_time_text: 'Start: 3:00 PM',
		message: 'Welcome to the Round Rock Tournament run by DebateTab!'
	};

	const titles = [ "Affirmative",
			"Negative",
			"Room",
			"Judge"
	];
	
	var startIndex = 2*(Math.ceil((collection.teams.length)/2));
    pdf.roundDataPDF(headers,titles,startIndex);

});

$("#ballot_gen").click(function(){
	pdf.generateCXBallot();	
});

$("#ballotLD_gen").click(function(){
	pdf.generateLDBallot();	
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
Team Controls
=========================================
*/

/*
=========================================
Debug Controls
=========================================
*/
$("#save_state").click(function(){
});

$("#clear_storage").click(function(){
	localStorage.clear();
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
	con.write("deleting all rounds");
	pairing.deleteAllRounds();
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


