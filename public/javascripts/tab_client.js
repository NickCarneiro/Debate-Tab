/*
============================
DebateTab.com
(C) 2011 Trillworks LLC

============================
*/
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
		if(team_name.length < 3){
			$("#add_team_error").text("Team name must be at least 4 characters");
		}
	});
	
	

});
