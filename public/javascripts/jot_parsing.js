/*****************************************************************************************
 * Code for Parsing the JOT File format and saving it in our client-side local storage   *
 * @author: nikhil                                                                       *
 *****************************************************************************************/

function parseJotData(data) {
	var lineReader = data.split("\n");
	con.write(lineReader[0]);
	con.write(lineReader[1]);
}

var parseSegments = ["Divisions", "Schools", "Teams", "Judges"];

// holds all the values for the current parse;
var divisionsLinesArray;
var divNumCompetitors;
var schoolsParsed;
var teamsParsed;
var judgesParsed;
var divisionsParsed;


$(function() {
	$("#parse_jot").click(function(){
		divisionsLinesArray = new Array();
		divNumCompetitors = new Array();
		divNumCompetitors[0] = -1;
		divisionsParsed = new Array();
		divisionsParsed[0] = "null";
		schoolsParsed = new Array();
		teamsParsed = new Array();
		judgesParsed = new Array();

		const input = $("#parse_textarea").val();
		var readArray = input.split("\n");
		var segmentSection = -1;    //corresponds to what segment we are in from array above
		var line;
		var type;
		for( var i =0; i<readArray.length; i++ ) {
			line = readArray[i];
			if(segmentSection < 3) {
				if(line === parseSegments[segmentSection + 1]) {
					segmentSection++;
					if(line === "Judges") {
						// now we will have the number of competitors per division so we can process divisions
						processDivisions();
					}
					continue;	//line is over, so read next line by skipping code after this
				}
			}
			// segmentSection is now pointing to the type of data that is next
			
			// check that first line read was actually "Divisions" otherwise error
			if(segmentSection === -1) {
				alert("Error: Cannot parse JOT file that does not begin with \'" + parseSegments[0] + "\'");
				break;
			}
			
			type = parseSegments[segmentSection];

			// decide what type of data it is, and send it to the code that understands it
			if(type === "Divisions") {
				saveDivision(line);
			} else if(type === "Schools") {
				processSchool(line);
			} else if(type === "Teams") {
				processTeam(line);
			} else {
				processJudge(line);
			}
		}
	});
});

function saveDivision(line) {
	divisionsLinesArray.push(line);
}

function processTeam(line) {
	var i = 1;
	var ch = line.charAt(i);
	var division = 0;

	//parse number for value of division
	while( (ch - 0) == ch && ch.length > 0) {	//while is a number
		i++;
		division = (division*10) + (ch - 0);
		ch = line.charAt(i);
	}

	// split name(s) and school_code
	var part2 = line.split("   ")[1].substring(1).split(";");
	var num_competitors = part2.length - 1;		// 1 extra  for school
	var peopleNames = new Array();

	// get all the Competitors Names and store them in the array
	for(i = 0; i<num_competitors; i++) {
		peopleNames.push($.trim(part2[i]));
	}
	var school = $.trim(part2[i]);
	
	//now set the number of competitors for the divisions
	divNumCompetitors[division] = num_competitors;

	// now push this to storage
	var old_div_val = $("#newteam_division").val();
//	alert(old_div_val);

	$("#newteam_name").val(schoolsParsed[school]);
	$("#newteam_school").val(schoolsParsed[school]);
	$("#newteam_division").val(divisionsParsed[division]);

	//show number of competitor blocks
	$("#newteam_competitors").html("");
	for(var i = 0; i < num_competitors; i++){
		$("#newteam_competitors").append('<input class="newteam_competitor" type="text" /> <br />');
	}

	var counter = 0;
	$("#newteam_competitors").children().each(function(){
		$(this).val(peopleNames[counter]);
		counter++;
	});

//	TODO
//	As off 11/14/11 this code click acion caueses an error. On further analysis, I think it has something to do
//	with the the way we set value of newteam_division.val() being diffrent from the id or something etc...	
//	$("#add_team_button").click();

	$("#newteam_name").val("");
	$("#newteam_school").val("");


	//I think error could be here?
	$("#newteam_division").val(old_div_val);


	counter = 0;
	$("#newteam_competitors").children().each(function(){
		$(this).val("");
		counter++;
	});
}

function processDivisions() {
	var line;
	for(var k = 0; k<divisionsLinesArray.length; k++ ) {
		line = divisionsLinesArray[k];

		var i = 2;

		//makes sure you account for multiple digits so you can have more than 10 divisions
		var ch = line.charAt(i);
		while( (ch - 0) == ch && ch.length > 0) {
			i++;
			ch = line.charAt(i);
		}
		//now i is the first non-number

		var divName = line.substring(i);
		divisionsParsed[k+1] = divName;
		var competitors = divNumCompetitors[k+1];
		var bType = 'TFA_' + divName.charAt(divName.length-2) + divName.charAt(divName.length-2);
		
		// now push this to storage

		var old_ballot_type = $("#newdiv_ballot_type").val();

		$("#newdiv_division_name").val(divName);
		$("#newdiv_comp_per_team").val(competitors);
		$("#newdiv_ballot_type").val(bType);
	
		$("#add_division_button").click();

		$("#newdiv_division_name").val("");
		$("#newdiv_comp_per_team").val("");
		$("#newdiv_ballot_type").val(old_ballot_type);
	}
}

function processSchool(line) {
	var parts = line.split("  ");

	//save school as linked array (HashMap)
	schoolsParsed[parts[0]] = parts[1];

	//now push this to storage

	//TODO need to check if school already exists, if not, then only add
	$("#newschool_name").val(parts[1]);
	$("#add_school_button").click();
	$("#newschool_name").val("");
}

function processJudge(line) {
	var parts = line.split(";");

	//ignore parts[0] -- what is this number used for?? example: "%1001" ??
	var name = parts[1];
	var school_pointer = $.trim(parts[2]);
	var divs = new Array();

	//save divisions and extract them from parts
	for(var i = 0; i<parts.length-6; i++) {
		divs.push($.trim(parts[3+i]).substring(1));
	}
	var numDivs = divs.length;		// number of division, this is used as an offset

	// ignore part "*ALL,*Y" -- what it this part used for??

	var comments = $.trim(parts[4 + numDivs]).substring(1);		// comments for each judge, like "NOVICE ONLY" etc.
	var daysString = $.trim($.trim(parts[5 + numDivs]).split(":")[1]);	//the entire days in String (concatenated form)
	var daysArray = daysString.split(" ");		// the days in array form, like "Fri", "Sat" etc.

	// temporary to test
	//alert("name: " + name + ", school: " + schoolsParsed[school_pointer] + ", comments: " + comments + ", daysString: " + daysString);

	//TODO now push this to storage

}
