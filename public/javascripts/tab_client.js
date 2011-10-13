/*
============================
DebateTab.com Tab Client
(C) 2011 Trillworks LLC
Nick Carneiro
============================
*/

Backbone.sync = function(method, model, success, error){ 

    success.success();
  }


//define global namespace and MVC containers
var tab = {
	model: {},
	view: {},
	router: {},
	collection: {}
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
		school		: null , //ObjectId

		stop_scheduling : false ,
		competitors : []

	} ,
	initialize: function() {
		this.set({
			competitors: new tab.collection.Competitors() ,
			id: (new ObjectId()).toString()
		});
	}
});

tab.model.School = Backbone.Model.extend({
	default: {
		id: null,
		school_name: "DEFAULT_SCHOOL_NAME"

	} ,
	initialize: function() {
		this.set({
			id: (new ObjectId()).toString()
		});
	}
});

tab.model.Judge = Backbone.Model.extend({
	default: {
		id			: null,
		name		: null,
		school		: null
	} ,
	initialize: function() {
		this.set({
			id: (new ObjectId()).toString()
		});
	}
    
});

tab.model.Round = Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new round");
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
		this.set({
			id: new ObjectId().toString()
		});
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
	}
});	


tab.collection.Judges = Backbone.Collection.extend({
		model: tab.model.Judge ,

		search : function(letters){
			if(letters == "") return this;

			var pattern = new RegExp(letters,"gi");
			return _(this.filter(function(data) {
			  	return pattern.test(data.get("name"));
			}));
		}
});	

tab.collection.Schools = Backbone.Collection.extend({
	model: tab.model.School ,
	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("school_name"));
		}));
	}
});	

tab.collection.Divisions = Backbone.Collection.extend({
		model: tab.model.Division
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
		

		//keep division and schools dropdown boxes up to date
		tab.collection.divisions.bind("add", this.addDivSelect);
		tab.collection.schools.bind("add", this.addSchoolSelect);
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
		console.log("looking for division_id " + division_id);
		var comp_per_team = null;
		console.log("divisions " + tab.collection.divisions.length);
		_.each(tab.collection.divisions.models, 
			function(division){
				if(division.get("id") == division_id){
					comp_per_team = division.get("comp_per_team");
					console.log("set comp per team to " + comp_per_team)
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
	render: function(){
		_(tab.collection.teams).each(function(team){ // for pre-existing teams
        	appendTeam(team);
    	}, this);

    	_(tab.collection.divisions).each(function(division){ // pre-existing divisions
        	addDivSelect(division);
    	}, this);

    	_(tab.collection.schools).each(function(school){ // pre-existing schools
        	addSchoolSelect(school);
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
		var school_id = $("#newteam_school").data("id");
		console.log("school_id " + school_id);
		var team = new tab.model.Team();

		var competitors = [];
		//populate competitors based on form entries
		$("#newteam_competitors").children().each(function(){
			console.log($(this).val());
		});

		team.set({
			team_code: team_code,
			school_id: school_id
		});
		tab.collection.teams.add(team);
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
		this.model.destroy();
	} ,
	render: function(){
		$(this.el).html('<td>' + this.model.get("team_code") + '</td> <td>' + this.model.get("id") + '</td><td class="remove">Remove</td>');
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
		this.render();
		
	} ,
	
	render: function(){
		_(tab.collection.judges.models).each(function(judge){ // in case collection is not empty
        	appendJudge(judge);
    	}, this);
	} ,

	addJudge: function(){
		console.log("judge");
		//TODO: validate judge name
		var judge_name = $("#new_judge_name").val();

		var judge = new tab.model.Judge();
		judge.set({name: judge_name});

		tab.collection.judges.add(judge);
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
		return this; //required for chainable call, .render().el ( in appendTeam)
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
		this.render();
		
	} ,
	
	render: function(){
		_(tab.collection.schools.models).each(function(school){ // in case collection is not empty
        	appendSchool(school);
    	}, this);
	} ,

	addSchool: function(){
		//TODO: validate school name
		var school_name = $("#new_school_name").val();

		var school = new tab.model.School();
		school.set({school_name: school_name});

		tab.collection.schools.add(school);
		$("#new_school_name").val("");
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
		this.render();
		
	} ,
	
	render: function(){
		_(tab.collection.divisions.models).each(function(division){ // in case collection is not empty
        	appendDivision(division);
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
Initialize Backbone Collections, then Views
=========================================
*/	
tab.collection.divisions = new tab.collection.Divisions();
tab.collection.teams = new tab.collection.Teams();
tab.collection.schools = new tab.collection.Schools();
tab.collection.judges = new tab.collection.Judges();

tab.view.teamTable = new tab.view.TeamTable(); 
tab.view.schoolTable = new tab.view.SchoolTable(); 
tab.view.divisionTable = new tab.view.DivisionTable(); 
tab.view.judgeTable = new tab.view.JudgeTable(); 

/*
=========================================
Initialize Backbone Collections with test data
=========================================
*/	
//creating a lot of one-time variables, so putting them in
//anonymous self executing function
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
	_(tab.collection.schools).each(function(school){ // pre-existing schools
        	console.log(school);
    	}, this);
    //tab.collection.schools.add(school1);
	tab.collection.schools.add([school1, school2, school3, school4]);
})();



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
$("#home_container").show();

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

	$(".container").hide();

	$(".menu_item").removeClass("menu_item_selected");
	$("#menu_" + menu_item).addClass("menu_item_selected");

	$("#" + menu_item + "_container").show();
	$(".sub_menu").hide();
	$("#sub_menu_" + menu_item).show();	
}
$("#menu_rounds").click(function(){
	showMenu("rounds");
});

$("#menu_teams").click(function(){
	showMenu("teams");
});	

$("#menu_judges").click(function(){
	showMenu("judges");
});	

$("#menu_schools").click(function(){
	showMenu("schools");
});	

$("#menu_divisions").click(function(){
	showMenu("divisions");
});	

/*
=========================================
Team Controls
=========================================
*/


	

});
