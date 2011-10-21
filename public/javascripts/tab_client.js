/*
============================
DebateTab.com Tab Client
(C) 2011 Trillworks LLC
Nick Carneiro
============================
*/

/*
//override sync
Backbone.sync = function(method, model, success, error){ 

    success.success();
  }
*/

//define global namespace and MVC containers
var tab = {
	model: {},
	view: {},
	router: {},
	collection: {},
	helpers: {}
};

/*
=========================================
jQuery.ready everything below this point.
=========================================
*/
$(function(){

/*
=========================================
Define Backbone Models
=========================================
*/	
tab.model.Competitor = Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new competitor");
	        }
});

tab.model.Team = Backbone.Model.extend({
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
				competitors: new tab.collection.Competitors() ,
				id: (new ObjectId()).toString()
			});
		}
		
	} 
});

tab.model.School = Backbone.Model.extend({
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

tab.model.Room = Backbone.Model.extend({
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

tab.model.Judge = Backbone.Model.extend({
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

tab.model.Round = Backbone.Model.extend({
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



tab.model.Division = Backbone.Model.extend({
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

tab.collection.Competitors = Backbone.Collection.extend({
		model: tab.model.Competitor
});



tab.collection.Teams = Backbone.Collection.extend({
	model: tab.model.Team ,

	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("team_code"));
		}));
	} ,
	localStorage: new Store("Teams")
});	


tab.collection.Judges = Backbone.Collection.extend({
		model: tab.model.Judge ,

		search : function(letters){
			if(letters == "") return this;

			var pattern = new RegExp(letters,"gi");
			return _(this.filter(function(data) {
			  	return pattern.test(data.get("name"));
			}));
		} ,
		localStorage: new Store("Judges")
});	

tab.collection.Schools = Backbone.Collection.extend({
	model: tab.model.School ,
	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("school_name"));
		}));
	} ,
	localStorage: new Store("Schools")
});	

tab.collection.Rooms = Backbone.Collection.extend({
	model: tab.model.Room ,
	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("room_name"));
		}));
	} ,
	localStorage: new Store("Rooms")
});	

tab.collection.Divisions = Backbone.Collection.extend({
		model: tab.model.Division ,
		localStorage: new Store("Divisions")
});	

tab.collection.Rounds = Backbone.Collection.extend({
		model: tab.model.Round ,
		localStorage: new Store("Rounds")
});	

/*
=========================================
Define Backbone Views
=========================================
*/


//An individual division option in the select on the Add New Team form.
//managed by tab.view.TeamTable
tab.view.DivisionOption = Backbone.View.extend({
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
//managed by tab.view.TeamTable
tab.view.SchoolOption = Backbone.View.extend({
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

tab.view.TeamTable = Backbone.View.extend({
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
		
		
		tab.collection.teams.bind("add", this.appendTeam);
		tab.collection.teams.bind("reset", this.render, this);

		//keep division and schools dropdown boxes up to date
		tab.collection.divisions.bind("add", this.addDivSelect);
		tab.collection.schools.bind("add", this.addSchoolSelect);

		//populate dropdowns with initial divisions and schools
		tab.collection.divisions.bind("reset", this.render, this);
		tab.collection.schools.bind("reset", this.render, this);
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
		_.each(tab.collection.divisions.models, 
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
		var divOptionView = new tab.view.DivisionOption({
			model: division
		});
		$("#newteam_division", this.el).append(divOptionView.render().el);
	} ,
	//add new school to dropdown box
	addSchoolSelect: function(school){
		var schoolOptionView = new tab.view.SchoolOption({
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
		_(tab.collection.teams.models).each(function(team){ // for pre-existing teams
        	this.appendTeam(team);
    	}, this);

    	//populate form
    	_(tab.collection.divisions.models).each(function(division){ // pre-existing divisions
        	this.addDivSelect(division);
    	}, this);

    	_(tab.collection.schools.models).each(function(school){ // pre-existing schools
        	this.addSchoolSelect(school);
    	}, this);

	} ,

	renderSearch: function(results){
		$("#teams_table").html("");

		results.each(function(result){
			var teamView = new tab.view.Team({
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
		var team = new tab.model.Team();
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
		tab.collection.teams.add(team);
		team.save();
		$("#newteam_name").val("");
	} ,

	appendTeam: function(team){
		var teamView = new tab.view.Team({
			model: team
		});
		$("#teams_table", this.el).append(teamView.render().el);
	} ,
	search: function(e){
		var letters = $("#teams_search").val();
		this.renderSearch(tab.collection.teams.search(letters));
	}
	
});

tab.view.Team = Backbone.View.extend({
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

tab.view.Judge = Backbone.View.extend({
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

tab.view.JudgeTable = Backbone.View.extend({
	el: $("#judges") , // attaches `this.el` to an existing element.
	events: {
		"click #add_judge_button": "addJudge" ,
		"keyup #judges_search": "search"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addJudge", "appendJudge");
		
		tab.collection.judges.bind("add", this.appendJudge);
		tab.collection.judges.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	render: function(){
		_(tab.collection.judges.models).each(function(judge){ // in case collection is not empty
        	this.appendJudge(judge);
    	}, this);
	} ,

	addJudge: function(){
		console.log("judge");
		//TODO: validate judge name
		var judge_name = $("#new_judge_name").val();

		var judge = new tab.model.Judge();
		judge.set({name: judge_name});

		tab.collection.judges.add(judge);
		judge.save();
		$("#new_judge_name").val("");
	} ,

	appendJudge: function(judge){
		var judgeView = new tab.view.Judge({
			model: judge
		});
		$("#judges_table", this.el).append(judgeView.render().el);
	} ,
	search: function(e){
		var letters = $("#judges_search").val();
		this.renderSearch(tab.collection.judges.search(letters));
	} ,
	renderSearch: function(results){
		$("#judges_table").html("");

		results.each(function(result){
			var judgeView = new tab.view.Judge({
				model: result
			});
			$("#judges_table", this.el).append(judgeView.render().el);
		});
		return this;
	} 
	
});


tab.view.Room = Backbone.View.extend({
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

tab.view.RoomTable = Backbone.View.extend({
	el: $("#rooms") , // attaches `this.el` to an existing element.
	events: {
		"click #add_room_button": "addRoom" ,
		"keyup #rooms_search": "search"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addRoom", "appendRoom");
		
		tab.collection.rooms.bind("add", this.appendRoom);
		tab.collection.rooms.bind("reset", this.render, this);
		tab.collection.divisions.bind("add", this.addDivSelect);
		tab.collection.divisions.bind("reset", this.render);
		this.render();
		
	} ,
	
	render: function(){
		$("#newroom_division").empty();
		$("#room_table").empty();
		_(tab.collection.rooms.models).each(function(room){ // in case collection is not empty
        	this.appendRoom(room);
    	}, this);

    	_(tab.collection.divisions.models).each(function(division){ // in case collection is not empty
        	this.addDivSelect(division);
    	}, this);
	} ,

	//add new division to dropdown box
	addDivSelect: function(division){
		var divOptionView = new tab.view.DivisionOption({
			model: division
		});
		$("#newroom_division", this.el).append(divOptionView.render().el);
	} ,
	addRoom: function(){
		console.log("room");
		//TODO: validate room name
		var room_name = $("#newroom_name").val();

		var room = new tab.model.Room();
		room.set({name: room_name});

		tab.collection.rooms.add(room);
		room.save();
		$("#newroom_name").val("");
	} ,

	appendRoom: function(room){
		var roomView = new tab.view.Room({
			model: room
		});
		$("#rooms_table", this.el).append(roomView.render().el);
	} ,
	search: function(e){
		var letters = $("#rooms_search").val();
		this.renderSearch(tab.collection.rooms.search(letters));
	} ,
	renderSearch: function(results){
		$("#rooms_table").html("");

		results.each(function(result){
			var roomView = new tab.view.Room({
				model: result
			});
			$("#rooms_table", this.el).append(roomView.render().el);
		});
		return this;
	} 
	
});

//An individual room option in the select on the Add New Room form.
//managed by tab.view.RoomTable
tab.view.RoomOption = Backbone.View.extend({
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

tab.view.Round = Backbone.View.extend({
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


tab.view.RoundTable = Backbone.View.extend({
	el: $("#rounds") , // attaches `this.el` to an existing element.
	events: {
		
		"keyup #rounds_search": "search",
		"click #pair_round_button" : "pairRound"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addRound", "appendRound");
		
		tab.collection.rounds.bind("add", this.appendRound);
		tab.collection.rounds.bind("reset", this.render, this);
		tab.collection.rounds.bind("change", this.render, this);
		this.render();
		
	} ,
	pairRound: function(){
		tab.helpers.pairPrelimRound(1, "4e97dd13bd123514f7000000", false);
	},
	render: function(){
		console.log("rendering rounds");
		$("#rounds_table").empty();
		_(tab.collection.rounds.models).each(function(round){ // in case collection is not empty
        	this.appendRound(round);
    	}, this);
	} ,

	addRound: function(){
		//TODO: validate round name
		var round_name = $("#newround_name").val();

		var round = new tab.model.Round();
		round.set({round_name: round_name});

		tab.collection.rounds.add(round);
		round.save();
		$("#newround_name").val("");
	} ,

	appendRound: function(round){
		var roundView = new tab.view.Round({
			model: round
		});
		$("#rounds_table", this.el).append(roundView.render().el);
	} ,
	search: function(e){
		var letters = $("#rounds_search").val();
		this.renderSearch(tab.collection.rounds.search(letters));
	} ,
	renderSearch: function(results){
		$("#rounds_table").html("");

		results.each(function(result){
			var roundView = new tab.view.Round({
				model: result
			});
			$("#rounds_table", this.el).append(roundView.render().el);
		});
		return this;
	} 
	
});

tab.view.School = Backbone.View.extend({
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


tab.view.SchoolTable = Backbone.View.extend({
	el: $("#schools") , // attaches `this.el` to an existing element.
	events: {
		"click #add_school_button": "addSchool" ,
		"keyup #schools_search": "search"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addSchool", "appendSchool");
		
		tab.collection.schools.bind("add", this.appendSchool);
		tab.collection.schools.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	render: function(){
		_(tab.collection.schools.models).each(function(school){ // in case collection is not empty
        	this.appendSchool(school);
    	}, this);
	} ,

	addSchool: function(){
		//TODO: validate school name
		var school_name = $("#newschool_name").val();

		var school = new tab.model.School();
		school.set({school_name: school_name});

		tab.collection.schools.add(school);
		school.save();
		$("#newschool_name").val("");
	} ,

	appendSchool: function(school){
		var schoolView = new tab.view.School({
			model: school
		});
		$("#schools_table", this.el).append(schoolView.render().el);
	} ,
	search: function(e){
		var letters = $("#schools_search").val();
		this.renderSearch(tab.collection.schools.search(letters));
	} ,
	renderSearch: function(results){
		$("#schools_table").html("");

		results.each(function(result){
			var schoolView = new tab.view.School({
				model: result
			});
			$("#schools_table", this.el).append(schoolView.render().el);
		});
		return this;
	} 
	
});

tab.view.Division = Backbone.View.extend({
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


tab.view.DivisionTable = Backbone.View.extend({
	el: $("#divisions") , // attaches `this.el` to an existing element.
	events: {
		"click #add_division_button": "addDivision" 
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addDivision", "appendDivision");
		
		tab.collection.divisions.bind("add", this.appendDivision);
		tab.collection.divisions.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	render: function(){
		_(tab.collection.divisions.models).each(function(division){ // in case collection is not empty
        	this.appendDivision(division);
    	}, this);
	} ,

	addDivision: function(){
		//TODO: validate school name
	


		var division = new tab.model.Division();
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
		tab.collection.divisions.add(division);
		division.save();
		$("#newdiv_division_name").val("");
		$("#newdiv_comp_per_team").val("");
		$("#newdiv_division_name").val("");
		$("#newdiv_division_name").val("");
	} ,

	appendDivision: function(division){
		var divisionView = new tab.view.Division({
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
tab.helpers.getTeamFromId = function(team_id){
	var found_team = false;
	for(var i = 0; i < tab.collection.teams.length; i++){
		if(tab.collection.teams.at(i).get("id") == team_id){
			return tab.collection.teams.at(i);	
		}
	}
	
	console.log("returning false for team_id " + team_id)
	return false;

}

/**
takes two teams as parameters,
returns true if they can debate, false otherwise
**/
tab.helpers.validPrelimPairing = function (team1, team2){
	

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
tab.collection.divisions = new tab.collection.Divisions();
tab.collection.teams = new tab.collection.Teams();
tab.collection.schools = new tab.collection.Schools();
tab.collection.judges = new tab.collection.Judges();
tab.collection.rooms = new tab.collection.Rooms();
tab.collection.rounds = new tab.collection.Rounds();

tab.view.teamTable = new tab.view.TeamTable(); 
tab.view.schoolTable = new tab.view.SchoolTable(); 
tab.view.divisionTable = new tab.view.DivisionTable(); 
tab.view.judgeTable = new tab.view.JudgeTable(); 
tab.view.roomTable = new tab.view.RoomTable();  
tab.view.roundTable = new tab.view.RoundTable();

/*
=========================================
Load localStorage into Collections
=========================================
*/	
//note: calling fetch runs the constructors of the models.
tab.collection.teams.fetch();
tab.collection.divisions.fetch();
tab.collection.schools.fetch();
tab.collection.judges.fetch();
tab.collection.rooms.fetch();
//TODO: add rounds here

/*
=========================================
Initialize Backbone Collections with test data
=========================================
*/	
//creating a lot of one-time variables, so putting them in
//anonymous self executing function
/*
(function(){
	var div1 = new tab.model.Division();
	div1.set({
		division_name			: "VCX" ,  //eg: VCX, NLD
		comp_per_team	: 2 , //number of competitors per team. 2 in CX, 1 in LD
		break_to		: "quarterfinals" , //quarterfinals, octofinals, etc.
		prelim_judges	: 1 , //number of judges in prelims
		record_ranks	: true ,
		max_speaks		: 30 , //maximum speaker points possible
		flighted_rounds : false ,
		prelims			: 4 , //
		prelim_matching : []
	});

	var div2 = new tab.model.Division();
	div2.set({
		id				: (new ObjectId).toString() ,
		division_name			: "NCX" ,  //eg: VCX, NLD
		comp_per_team	: 2 , //number of competitors per team. 2 in CX, 1 in LD
		break_to		: "quarterfinals" , //quarterfinals, octofinals, etc.
		prelim_judges	: 1 , //number of judges in prelims
		record_ranks	: true ,
		max_speaks		: 30 , //maximum speaker points possible
		flighted_rounds : false ,
		prelims			: 4 , //
		prelim_matching : []
	});
	tab.collection.divisions.add(div1);
	tab.collection.divisions.add(div2);

	var school1 = new tab.model.School();
	school1.set({
		school_name: "Round Rock"
	});
	var school2 = new tab.model.School();
	school2.set({
		school_name: "West Wood"
	});
	var school3 = new tab.model.School();
	school3.set({
		school_name: "Hendrickson"
	});
	var school4 = new tab.model.School();
	school4.set({
		school_name: "McNeil"
	});
	
	tab.collection.schools.add([school1, school2, school3, school4]);

	//create some judges
	var judge1 = new tab.model.Judge();
	judge1.set({
		name: "Alexis O'Hanahan"
	});

	var judge2 = new tab.model.Judge();
	judge2.set({
		name: "Ralph Bollinger"
	});

	var judge2 = new tab.model.Judge();
	judge2.set({
		name: "Ralph Bollinger"
	});

	tab.collection.judges.add([judge1, judge2])


})();
*/


//initialize dropdowns
/*
$('#new_team_school').autocomplete({
		collection: tab.collection.schools,
		attr: 'school_name',
		noCase: true,
		ul_class: 'autocomplete shadow',
		ul_css: {'z-index':1234}
	});
*/
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
	tab.collection.teams.fetch();
});

$("#export_tournament").click(function(){
	console.log("exporting teams")
	exportTournament();
});


//TODO: finish this
//consider this: sync local models, then have server generate file
function exportTournament(){
	//turn all collections into JSON and send to server
	//server sends back text file
	
	var trn_obj = {
		divisions: tab.collection.divisions.toJSON(),
		rooms: tab.collection.rooms.toJSON(),
		schools: tab.collection.schools.toJSON(),
		judges: tab.collection.judges.toJSON()
		//TODO: add rounds
	}
	
	
}

/*
number: debate round number like 1, or 4
division: ObjectId of a division
powerMatch: boolean
*/
tab.helpers.pairPrelimRound = function(number, division_id, powerMatch){
	//pair round without power matching
	
	var teams = [];

	tab.collection.teams.each(function(team){
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
		var round = new tab.model.Round();
		round.set({
			team1: team
		});
		tab.collection.rounds.add(round);

	}

	//at this point we have created all the rounds and put one team in each of them.
	//teams[] now contains n/2 or (n/2)-1 teams

	//for each round, find an appropriate team
	while(teams.length > 0){
		var team2 = teams.pop();
		for(var i = 0; i < tab.collection.rounds.length; i++){
			//make sure round doesn't already have both teams
			if(tab.collection.rounds.at(i).get("team1") != undefined && tab.collection.rounds.at(i).get("team2") != undefined){
				console.log("round already paired");
				
			}
			else if(tab.helpers.validPrelimPairing(tab.collection.rounds.at(i).get("team1"), team2)){
				//found valid team2. Insert into this round
				tab.collection.rounds.at(i).set({team2: team2});
				console.log("pairing team " + tab.collection.rounds.at(i).get("team1").get("team_code") + " : "+ team2.get("team_code"));
				
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






});



