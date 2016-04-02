// ==UserScript==
// @name            stats-tracking
// @namespace       https://github.com/EFox2413/initiumGrease
// @version         0.2.0.0
// @updateURL       https://raw.githubusercontent.com/EFox2413/initiumGrease/master/stats-tracking.js
// @downloadURL     https://raw.githubusercontent.com/EFox2413/initiumGrease/master/stats-tracking.js
// @supportURL      https://github.com/EFox2413/initiumGrease/issues
// @match           https://www.playinitium.com/*
// @match           http://www.playinitium.com/*
// @grant           none
// @grant           GM_setValue
// @grant           GM_listValues
// @grant           GM_getValue
// @grant           GM_deleteValue
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

var characterName = $( '.character-display-box' ).children( 'div' ).children('a').first().text();

var enabled = false;
var saved = false;
var prevStats = JSON.parse( GM_getValue(characterName, "[]") );
var dbLength = prevStats.length+1;

var href = $( '.character-display-box').children().first().attr( "rel" );
var atkButtons =  $( '.main-buttonbox' ).children( 'a' ).slice(0,2);
var clickOnceOnly = 0;

var currentStats = getStats();

jQuery.fn.reverse = [].reverse;

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

//Add icon to icon bar and bind to toggle function
if (enabled) {
    addTracking()
    //Can add <div class="header-stats-caption">Counter</div> inside a tag underneath for caption.
    var htmlString = '<div style="display:inline-block; cursor: pointer;" id="statCounter"><img style="padding: 0 0 3px;" src="https://s3.amazonaws.com/imappy/3d_bar_chart.png" border="0/"></div>'
} else {
    var htmlString = '<div style="display:inline-block; cursor: pointer;" id="statCounter"><img style="padding: 0 0 3px;" src="https://s3.amazonaws.com/imappy/3d_bar_chart_off.png" border="0/"></div>'
}

$(".header-stats").prepend(htmlString)
$("#statCounter").click(showTracker)

//Function to toggle enabled/disabled for current character
function toggleCounter() {
    enabled = !enabled
    var settings = JSON.parse( GM_getValue("initium_counter_settings", "[]") );
    settings.forEach(function(char) {
        if(char.name == characterName) {
            console.log("StatTracking for "+characterName+" is now "+enabled)
            char.enabled = enabled;
        }
    });

    //Switch out picture
    if(enabled) {
        addTracking()
        $("#statCounter")[0].children[0].src = "https://s3.amazonaws.com/imappy/3d_bar_chart.png"
        $("#statEnabler").text("Disable")
    } else {
        $("#statCounter")[0].children[0].src = "https://s3.amazonaws.com/imappy/3d_bar_chart_off.png"
        $("#statEnabler").text("Enable")
        atkButtons.unbind("click",tracking);
    }

    GM_setValue("initium_counter_settings", JSON.stringify(settings))
}

//Add Stat Tracking logic
function addTracking() {
    // Determine if Attack button was pressed
    if ( clickOnceOnly === 0 ) {
        if ( atkButtons.attr( 'href' ).includes( 'attack' ) ) {
            atkButtons.bind("click",tracking);
        }
    }
}

//Gets the stats via ajax on pageload
function getStats() {
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
            return stats;
        }
    })
    .fail(function() {
        alert("stats retrieval failed; abort script");
    });
}

function tracking() {
    // increment clickOnce counter
    clickOnceOnly++;
    gm_store("stats", characterName, currentStats);
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
    console.log("Stats for " + characterName + ":")
    var savedStats = JSON.parse(GM_getValue(characterName, "[]"));
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

function statTrackPopup(content) {
    exitFullscreenChat();

    currentPopupStackIndex++;
    var pagePopupId = "page-popup"+currentPopupStackIndex;

    $("#page-popup-root").append("<div id='"+pagePopupId+"'><div id='"+pagePopupId+"-content' class='page-popup'><img id='banner-loading-icon' src='javascript/images/wait.gif' border=0/></div><div class='page-popup-glass'></div><a class='page-popup-X' onclick='closePagePopup()'>X</a></div>");
    $("#"+pagePopupId+"-content").html(content);

    if (currentPopupStackIndex === 1)
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

