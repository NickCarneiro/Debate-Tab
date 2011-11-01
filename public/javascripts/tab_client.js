/*
============================
DebateTab.com Tab Client
(C) 2011 Trillworks LLC
Nick Carneiro
============================
*/



//module pattern
//see http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function (){

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
Define Pairing Functions
=========================================
*/	
// all functions for tab below this point

pairing.prelimRoundValid = function (team1, team2, round){
		//this case is for round 1 or a tournament with no power matching
		if(team1.school == team2.school){
			return false;
		} else {
			if(round === 1 || round === undefined){
				return true;
			} else {
				if(alreadyDebated(team1, team2)){
					return false;
				} else {
					return true;
				}		
			}
		}
}

//returns true if two teams have already debated each other in prelims

pairing.alreadyDebated = function(team1, team2){
	for(var i = 0; i < rounds.length; i++){
		if(rounds[i].team1 == team1 && rounds[i].team2 == team2){
			return true;
		} else if(rounds[i].team1 == team2 && rounds[i].team2 == team1){
			return true;
		} 
	}
	//if we get here, they have never debated.
	return false;
}
pairing.shuffle = function(arr){
	var bucket;
	for(var i = 0; i < arr.length; i++){
		var dest = Math.floor(Math.random() * arr.length);
		var src = Math.floor(Math.random() * arr.length);
		bucket = arr[dest];
		arr[dest] = arr[src];
		arr[src] = bucket;
	}

	return teams;

}

pairing.printPairings =function(round_number){
	con.write("############## ROUND " + round_number +" ###############");
	for(var i = 0; i < rounds.length; i++){
		if(rounds[i].round_number == round_number){
			//insert a fake "bye" team if necessary
			if(rounds[i].team2 == null){
				rounds[i].team2 = {name: "BYE"};
			}
			var padding = 30 - rounds[i].team1.name.length;
			var spaces = "";
			for(var j = 0; j < padding; j++){
				spaces = spaces + "&nbsp;";
			}
			con.write(rounds[i].team1.name + spaces + rounds[i].team2.name);
			}
		
	}

}

/*
=========================================
jQuery.ready everything below this point.
=========================================
*/
$(function(){

con.write("hello word");

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
		division	: null , //ObjectId of division
		school_id	: null , //ObjectId

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
		school_name: "DEFAULT_SCHOOL_NAME"

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
		school_name: "DEFAULT_ROOM_NAME"

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
		team1		: null, //reference to team1 in teams collection
		team2		: null, //
		aff			: null, //team1 or team2
		result		: null
		/*
		result can be:
		AFF_WIN_NEG_LOSS
		NEG_WIN_AFF_LOSS
		AFF_BYE_NEG_FORFEIT
		NEG_BYE_AFF_FORFEIT
		DOUBLE_WIN
		DOUBLE_LOSS
		DOUBLE_BYE
		DOUBLE_FORFEIT
		*/


	} ,
	initialize: function(){
		if(this.id === undefined){
			this.set({
			id: (new ObjectId()).toString()
			});
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
		  	return pattern.test(data.get("room_name"));
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
Define Backbone Views
=========================================
*/


//An individual division option in the select on the Add New Team form.
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

//An individual school option in the select on the Add New Team form.
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

				team_code += " " + last_name.substr(0,1) + last_name_2.substr(0,1);
				
			} else {
				//can't generate team code
			}

			$("#newteam_name").val(team_code);
			
		} else {
			return;
		}

	} ,
	showCompetitors: function(){
		$("#newteam_competitors").html("");
		var division_id = $("#newteam_division").val();
		var comp_per_team = null;
		_.each(collection.divisions.models, 
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
		var competitors = [];
		//populate competitors based on form entries
		$("#newteam_competitors").children().each(function(){
			competitors.push($(this).val());
			$(this).val("");
		});

		team.set({
			team_code: team_code,
			school_id: school_id,
			competitors: competitors,
			division_id: division_id
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
		$(this.el).html('<td>' + this.model.get("team_code") + '</td> <td>'+this.model.get("division_id") +'</td><td>' + this.model.get("id") + '</td><td class="remove">Remove</td>');
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
		this.model.destroy();
	} ,
	render: function(){
		$(this.el).html('<td>' + this.model.get("name") + '</td> <td>' + this.model.get("id") + '</td><td class="remove">Remove</td>');
		return this; //required for chainable call, .render().el ( in appendJudge)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.JudgeTable = Backbone.View.extend({
	el: $("#judges") , // attaches `this.el` to an existing element.
	events: {
		"click #add_judge_button": "addJudge" ,
		"keyup #judges_search": "search"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addJudge", "appendJudge");
		
		collection.judges.bind("add", this.appendJudge);
		collection.judges.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	render: function(){
		_(collection.judges.models).each(function(judge){ // in case collection is not empty
        	this.appendJudge(judge);
    	}, this);
	} ,

	addJudge: function(){
		console.log("judge");
		//TODO: validate judge name
		var judge_name = $("#new_judge_name").val();

		var judge = new model.Judge();
		judge.set({name: judge_name});

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
		$(this.el).html('<td>' + this.model.get("name") + '</td> <td>' + this.model.get("id") + '</td><td class="remove">Remove</td>');
		return this; //required for chainable call, .render().el ( in appendRoom)
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
		console.log("room");
		//TODO: validate room name
		var room_name = $("#newroom_name").val();

		var room = new model.Room();
		room.set({name: room_name});

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
		if(team1 != null){
			var team1_cd = team1.get("team_code");
		} else {
			team1_cd = "BYE";
		}
		if(team2 != null){
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
		pairing.pairPrelimRound(1, "4e97dd13bd123514f7000000", false);
	},
	render: function(){
		console.log("rendering rounds");
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
Define Helper functions
=========================================
These are used to work with backbone data structures
*/	

//returns false if no team found
pairing.getTeamFromId = function(team_id){
	var found_team = false;
	for(var i = 0; i < collection.teams.length; i++){
		if(collection.teams.at(i).get("id") == team_id){
			return collection.teams.at(i);	
		}
	}
	
	console.log("returning false for team_id " + team_id)
	return false;

}

/**
takes two teams as parameters,
returns true if they can debate, false otherwise
**/
pairing.validPrelimPairing = function (team1, team2){
	

	if(team1.get("school_id") == team2.get("school_id")){
		return false;
	}

	//check if teams have debated each other before
	//check all existing rounds
	return true;
}

/*
=========================================
Initialize Backbone Collections, then Views
=========================================
*/	
collection.divisions = new collection.Divisions();
collection.teams = new collection.Teams();
collection.schools = new collection.Schools();
collection.judges = new collection.Judges();
collection.rooms = new collection.Rooms();
collection.rounds = new collection.Rounds();

view.teamTable = new view.TeamTable(); 
view.schoolTable = new view.SchoolTable(); 
view.divisionTable = new view.DivisionTable(); 
view.judgeTable = new view.JudgeTable(); 
view.roomTable = new view.RoomTable();  
view.roundTable = new view.RoundTable();

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
//TODO: initialize rounds here

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
*/
function showMenu(menu_item){

	$(".container").slideUp(100);
	$("#" + menu_item + "_container").slideDown(100);

	$(".menu_item").removeClass("menu_item_selected");
	$("#menu_" + menu_item).addClass("menu_item_selected");

	$(".sub_menu").hide();
	$("#sub_menu_" + menu_item).show();	
}
$(".menu_item").click(function(){
	//menu item ids are like: menu_judges
	var menu_item_name = $(this).attr("id").substr(5);
	showMenu(menu_item_name);
});

//client-side function call Code for sending a single text
$("#single_text").click(function(){
			var data = {phone_number: '+15129685781', message: 'Hello World!'};
			$.post("/text", data, function(res){
				console.log('Message sent from UI: ' + res.body);
				con.write(res);
			});

});


//client side function call Code for sending mass texts
$("#mass_texts").click(function(){
			var data = {smsList: [
			{phone_number: '+15129685781', message: 'Hello World__1 !'},
			{phone_number: '+15129685781', message: 'Hello World__2 !'}
			]};

			//send this as a mass text
			$.post("/textMass", data, function(res){
				console.log('Message sent from UI: ' + res.body);
			});
});


//Code for the help menu on the right
$("#menu_judges").click(function(){
			$(".container").hide();
			//$("#teams_container").hide();
			$("#judges_container").show();
			$(".sub_menu").hide();
			$("#sub_menu_judges").show();
			$("#help_text").text("Judges' context")
			var data = {phone_number: '+15124022582', message: 'Hello World'};
			$.post("/text", data, function(res){
				//something
			});
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
			$("#help_text").text("Send a single Message to Nick");
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
	console.log("fetching teams")
	collection.teams.fetch();
});

$("#export_tournament").click(function(){
	console.log("exporting teams")
	//TODO: finish this feature
});



/*
number: debate round number like 1, or 4
division: ObjectId of a division
powerMatch: boolean
*/
pairing.pairPrelimRound = function(number, division_id, powerMatch){
	//pair round without power matching
	
	var teams = [];

	collection.teams.each(function(team){
		//console.log(team.get("division_id") + " : " +  division_id);
		if(team.get("division_id") == division_id){
			//console.log(team.get("team_code"));
			teams.push(team);
		}
		
	});
	teams = $.shuffle(teams);
	console.log("Shuffling teams");

	//create every round and put one team in each
	var team_count = teams.length;
	var round_count = Math.ceil(team_count / 2);

	for(var i = 0; i < round_count; i++){
		//create new round
		var team = teams.pop();
		var round = new model.Round();
		round.set({
			team1: team
		});
		collection.rounds.add(round);

	}

	//at this point we have created all the rounds and put one team in each of them.
	//teams[] now contains n/2 or (n/2)-1 teams

	//for each round, find an appropriate team
	while(teams.length > 0){
		var team2 = teams.pop();
		for(var i = 0; i < collection.rounds.length; i++){
			//make sure round doesn't already have both teams
			if(collection.rounds.at(i).get("team1") != undefined && collection.rounds.at(i).get("team2") != undefined){
				console.log("round already paired");
				
			}
			else if(pairing.validPrelimPairing(collection.rounds.at(i).get("team1"), team2)){
				//found valid team2. Insert into this round
				collection.rounds.at(i).set({team2: team2});
				console.log("pairing team " + collection.rounds.at(i).get("team1").get("team_code") + " : "+ team2.get("team_code"));
				
				//team2 has been successfully paired. go to the next one.
				break;
			}
		}
		
	}

	if(teams.length > 0){
		console.log("unpaired teams: ");
		$.each(teams, function(i, team){
			console.log(team.get("team_code"));
		});
	}
	
	

}






}); //I think this is the end of jquery.ready


}());;


