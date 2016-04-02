// ==UserScript==
// @name         stat-tracker
// @version      0.2
// @match        https://www.playinitium.com/*
// @match        http://www.playinitium.com/*
// @grant        none
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

var characterName = $( '.character-display-box' ).children( 'div' ).children('a').first().text();

jQuery.fn.reverse = [].reverse;
var enabled = false;
var saved = false;
var prevStats = JSON.parse( GM_getValue(characterName, "[]") );
var dbLength = prevStats.length+1;

var href = $( '.character-display-box').children().first().attr( "rel" );
var atkButtons =  $( '.main-buttonbox' ).children( 'a' ).slice(0,2);
var clickOnceOnly = 0;


//Check if character is enabled for tracking.
var settings = JSON.parse( GM_getValue("initium_counter_settings", "[]") );
settings.forEach(function(char) {
	console.log(char);
	if(char.name == characterName) {
		saved = true;
		enabled = char.enabled;
	}
});

//If never seen before, character will be added as disabled.
if (!saved) {
	var newSetting = {
		"name":characterName,
		"enabled":false
	}
	settings.push(newSetting)
	GM_setValue("initium_counter_settings", JSON.stringify(settings))
	saved = true;
}

var htmlString = "";
//Add icon to icon bar and bind to toggle function
if (enabled) {
	addTracking()
	htmlString = '<div style="display:inline-block; cursor: pointer;" id="statCounter"><img style="padding: 0 0 3px;" src="https://s3.amazonaws.com/imappy/3d_bar_chart.png" border="0/"></div>'
} else {
	htmlString = '<div style="display:inline-block; cursor: pointer;" id="statCounter"><img style="padding: 0 0 3px;" src="https://s3.amazonaws.com/imappy/3d_bar_chart_off.png" border="0/"></div>'
}

$(".header-stats").prepend(htmlString)
$("#statCounter").click(showTracker)

//Function to toggle enabled/disabled for current character
function toggleCounter() {
	enabled = !enabled;
	var settings = JSON.parse( GM_getValue("initium_counter_settings", "[]") );

    // gets the json entry that matches charactername and sets it to
    //   the value of enabled
	settings.forEach(function(char) {
		if(char.name === characterName) {
			console.log("StatTracking for "+characterName+" is now "+enabled)
			char.enabled = enabled;
		}
	});

	//Switches picture to color or grayscale
    // adds tracking if its enabled
    // unbinds atkbuttons if disabled
	if(enabled) {
		addTracking()
		$("#statCounter")[0].children[0].src = "https://s3.amazonaws.com/imappy/3d_bar_chart.png"
		$("#statEnabler").text("Disable")
	} else {
		$("#statCounter")[0].children[0].src = "https://s3.amazonaws.com/imappy/3d_bar_chart_off.png"
		$("#statEnabler").text("Enable")
		atkButtons.unbind("click",tracking);
	}
    // saves the settings
	GM_setValue("initium_counter_settings", JSON.stringify(settings))
}

//Add Stat Tracking logic
function addTracking() {
	// Determine if Attack button was pressed
	if ( clickOnceOnly === 0 ) {
		if ( atkButtons.attr( 'href' ).includes( 'attack' ) ) {
			atkButtons.bind("click", tracking);
		}
	}
}

function tracking() {
	// increment clickOnce counter
	clickOnceOnly++;

	$.ajax({
		url: href,
		type: "GET",

		success: function(charPage) {
			var statsDiv = $(charPage).find('.main-item-subnote');
			var stats = dbLength+" ";

			statsDiv.each(function( index ) {
				if ( index > 0  && index < 4) {
					stats += $( this ).text().split(" ")[0] + "  ";
				}
			});
			gm_store("stats", characterName, stats);
		}
	});
};

function showTracker() {
	var popTitle = "<center><h3>Stat Tracker for "+characterName+"</h3></center>";
	var popContent = "";
	if(enabled) {
		var nextState = "Disable";
	} else {
		var nextState = "Enable";
	}
	popContent += '<div class="main-button-half" id="statEnabler" style="margin: 0 5% 0 5%; width: 40%; display: inline-block; line-height: 24px" shortcut="86">'+nextState+'</div>'
	popContent += '<div class="main-button-half" id="statCleaner" style="margin: 0 5% 0 5%; width: 40%; display: inline-block; line-height: 24px" shortcut="86">Clear</div>'
	popContent += '\n\n<center><h3>Saved stats:</h3></center>'

	var savedStats = JSON.parse( GM_getValue(characterName, "[]") );
	$.each(savedStats.reverse(), function(index,stat) {
		popContent += "<center>"+stat+"</center>";
	});

	statTrackPopup(popTitle+popContent)

	$("#statCleaner").click(clearStats)
	$("#statEnabler").click(toggleCounter)
}


/*
 Some shortcuts.

 - Press | to show the stats saved for this character in a popup.

 */
window.onkeypress = function( event ) {
	if (event.keyCode == 124) {
		if ($(':focus').length > 0) {
			if (!($(':focus')[0].localName == "input")) {
				showTracker();
			}
		} else {
			showTracker();
		}
	}
}

//Prints saved stats from database to console
function printStats(){
	console.log("Stats for "+characterName+":")
	var savedStats = JSON.parse( GM_getValue(characterName, "[]") );
	savedStats.forEach(function(stat) {
		console.log(stat);
	});
}

//Clears stats in database for current character
function clearStats(){
	if (confirm('You sure you want to delete the stats saved for '+characterName+'?')) {
		GM_setValue(characterName, "[]")
		closePagePopup()
		showTracker()
	}
}

//Inserts into database
function gm_store(dataname, charname, data) {
	if (dataname == "stats") {
		var stats = JSON.parse( GM_getValue(charname, "[]") );
		stats.push(data)
		GM_setValue(charname, JSON.stringify(stats))

		console.log("Added "+data+" to "+charname)
	}
}

function statTrackPopup(content)
{
	exitFullscreenChat();

	currentPopupStackIndex++;
	var pagePopupId = "page-popup"+currentPopupStackIndex;

	$("#page-popup-root").append("<div id='"+pagePopupId+"'><div id='"+pagePopupId+"-content' class='page-popup'><img id='banner-loading-icon' src='javascript/images/wait.gif' border=0/></div><div class='page-popup-glass'></div><a class='page-popup-X' onclick='closePagePopup()'>X</a></div>");
	$("#"+pagePopupId+"-content").html(content);


	if (currentPopupStackIndex==1)
	{
		$(document).bind("keydown",function(e)
		{
			if ((e.keyCode == 27))
			{
				closePagePopup();
			}
		});
	}

	if (currentPopupStackIndex>1)
		$("#page-popup"+(currentPopupStackIndex-1)).hide();
}
