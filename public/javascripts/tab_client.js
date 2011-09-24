/*
============================
DebateTab.com
(C) 2011 Trillworks LLC

============================
*/

//backbone models
Competitor = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new competitor");
	        }
});
	
var Team = Backbone.Model.extend({
	
});

var Teams = Backbone.Collection.extend({
		model: Team
});	
//initialize free collections of objects
var ActiveTeams = new Teams([]);

Judge = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new judge");
	        }
});

Round = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new round");
	        }
});

School = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized new school");
	        }
});

Division = new Backbone.Model.extend({
	initialize: function(){
	            console.log("initialized division");
	        }
});

				
//backbone collections
var Competitors = Backbone.Collection.extend({
		model: Competitor
});

var Judges = Backbone.Collection.extend({
		model: Judge
});	



var Schools = Backbone.Collection.extend({
		model: School
});	

var Divisions = Backbone.Collection.extend({
		model: Division
});	




$(function(){


	$(".container").hide();
	$(".sub_menu").hide();
	$("#home_container").show();
	

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
	
	$("#add_team_menu").click(function(){
		$("#teams").hide();
		$("#add_team").show();
	});
	
	$("#add_team_button").click(function(){
		

			var team_name = $("#new_team_name").val();
			console.log("adding team " + team_name);
			if(team_name.length < 3){
				throw new Error("Team name must be longer than 3 characters");
			}
			//TODO: make sure team name is unique
			var team = new Team({team_code: team_name});
			ActiveTeams.add(team);
		
	});
	
	

});
