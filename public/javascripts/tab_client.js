/*
============================
DebateTab.com Tab Client
(C) 2011 Trillworks LLC
Nick Carneiro
============================
*/
//configure templating
_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};
Backbone.sync = function(method, model, success, error){ 
    success();
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
tab.model.Competitor = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new competitor");
	        }
});

tab.model.Team = Backbone.Model.extend({
	default: {
		id			: new ObjectId().toString() ,
		team_code	: "default team_code" ,
		division	: null , //ObjectId of division
		school		: null , //ObjectId

		stop_scheduling : false ,
		competitors : []

	} ,
	initialize: function() {
		this.competitors = new tab.collection.Competitors;
	}
});

tab.model.Judge = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new judge");
	        }
});

tab.model.Round = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new round");
	        }
});

tab.model.School = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new school");
	        }
});

tab.model.Division = new Backbone.Model.extend({
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
	model: tab.model.Team
});	


tab.collection.Judges = Backbone.Collection.extend({
		model: tab.model.Judge
});	

tab.collection.Schools = Backbone.Collection.extend({
		model: tab.model.School
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
		$(this.el).html('<td>' + this.model.get("team_code") + '</td> <td class="remove">Remove</td>');
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
})
tab.view.TeamsTable = Backbone.View.extend({
	el: $("#teams") , // attaches `this.el` to an existing element.
	events: {
		"click #add_team_button": "addTeam"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addTeam", "appendTeam");
		
		tab.collection.teams = new tab.collection.Teams();
		tab.collection.teams.bind("add", this.appendTeam);
		this.render();
		
	} ,
	
	render: function(){
		_(tab.collection.teams.models).each(function(team){ // in case collection is not empty
        	appendTeam(team);
    	}, this);
	} ,

	addTeam: function(){
		//validate team code
		var team_code = $("#new_team_name").val();

		var team = new tab.model.Team();
		team.set({team_code: team_code});
		tab.collection.teams.add(team);
	} ,

	appendTeam: function(team){
		var teamView = new tab.view.Team({
			model: team
		});
		$("#teams_table", this.el).append(teamView.render().el);
	} 
	
});

/*
=========================================
Define Backbone Routers
=========================================
*/

/*
=========================================
Initialize Backbone Collections, Routers
=========================================
*/	

tab.view.teamsTable = new tab.view.TeamsTable(); 

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
	$("#rounds_container").show();
	$(".sub_menu").hide();
	$("#sub_menu_rounds").show();
});

$("#menu_teams").click(function(){
	
	$(".container").hide();
	$("#teams_container").show();
	$(".sub_menu").hide();
	$("#sub_menu_teams").show();
});	



/*
=========================================
Team Controls
=========================================
*/


	

});
