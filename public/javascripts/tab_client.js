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
			id: new ObjectId().toString()
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
			id: new ObjectId().toString()
		});
	}
});

tab.model.Judge = Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new judge");
	        }
});

tab.model.Round = Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new round");
	        }
});



tab.model.Division = Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized division");
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
		model: tab.model.Judge
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
})
tab.view.teamTable = Backbone.View.extend({
	el: $("#teams") , // attaches `this.el` to an existing element.
	events: {
		"click #add_team_button": "addTeam",
		"keyup #teams_search": "search"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addTeam", "appendTeam", "renderSearch", "search");
		
		tab.collection.teams = new tab.collection.Teams();
		tab.collection.teams.bind("add", this.appendTeam);
		this.render();
		
	} ,
	
	render: function(){
		_(tab.collection.teams).each(function(team){ // in case collection is not empty
        	appendTeam(team);
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
		var team_code = $("#new_team_name").val();
		var school_id = $("#new_team_school").data("id");
		console.log("school_id " + school_id);
		var team = new tab.model.Team();
		
		team.set({
			team_code: team_code,
			school_id: school_id
		});
		tab.collection.teams.add(team);
		$("#new_team_name").val("");
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


tab.view.schoolTable = Backbone.View.extend({
	el: $("#schools") , // attaches `this.el` to an existing element.
	events: {
		"click #add_school_button": "addSchool" ,
		"keyup #schools_search": "search"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addSchool", "appendSchool");
		
		tab.collection.schools = new tab.collection.Schools();
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


/*
=========================================
Initialize Backbone Views
=========================================
*/	

tab.view.teamTable = new tab.view.teamTable(); 
tab.view.schoolTable = new tab.view.schoolTable(); 

//initialize dropdowns
$('#new_team_school').autocomplete({
		collection: tab.collection.schools,
		attr: 'school_name',
		noCase: true,
		ul_class: 'autocomplete shadow',
		ul_css: {'z-index':1234}
	});
//initialize menu state

$(".container").hide();
$(".sub_menu").hide();
$("#home_container").show();

/*
=========================================
Main Menu Controls
=========================================
*/

$("#menu_rounds").click(function(){
	
	$(".container").hide();

	$(".menu_item").removeClass("menu_item_selected");
	$("#menu_rounds").addClass("menu_item_selected");

	$("#rounds_container").show();
	$(".sub_menu").hide();
	$("#sub_menu_rounds").show();
});

$("#menu_teams").click(function(){
	
	$(".container").hide();

	$(".menu_item").removeClass("menu_item_selected");
	$("#menu_teams").addClass("menu_item_selected");

	$("#teams_container").show();
	$(".sub_menu").hide();
	$("#sub_menu_teams").show();
});	

$("#menu_schools").click(function(){
	
	$(".container").hide();

	$(".menu_item").removeClass("menu_item_selected");
	$("#menu_schools").addClass("menu_item_selected");

	$("#schools_container").show();
	$(".sub_menu").hide();
	$("#sub_menu_schools").show();
});	



/*
=========================================
Team Controls
=========================================
*/


	

});
