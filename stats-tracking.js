// ==UserScript==
// @name            stats-tracking
// @namespace       https://github.com/EFox2413/initiumGrease
// @version         0.3.0.0
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

jQuery.fn.reverse = [].reverse;
var enabled = false;
var saved = false;
var prevStats = JSON.parse( GM_getValue(characterName, "[]") );
var dbLength = prevStats.length;

var href = $( '.character-display-box').children().first().attr( "rel" );
var clickOnceOnly = 0;

//Check if character is enabled for tracking.
var settings = JSON.parse( GM_getValue("initium_counter_settings", "[]") );
settings.forEach(function(char) {
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
    settings.push(newSetting);
    GM_setValue("initium_counter_settings", JSON.stringify(settings));
    saved = true;
}

//Add icon to icon bar and bind to toggle function
if (enabled) {
    //Can add <div class="header-stats-caption">Counter</div> inside a tag underneath for caption.
    var htmlString = '<div style="display:inline-block; cursor: pointer;" id="statCounter"><img style="padding: 0 0 3px;" src="https://s3.amazonaws.com/imappy/3d_bar_chart.png" border="0/"></div>';
} else {
    var htmlString = '<div style="display:inline-block; cursor: pointer;" id="statCounter"><img style="padding: 0 0 3px;" src="https://s3.amazonaws.com/imappy/3d_bar_chart_off.png" border="0/"></div>';
}
$(".header-stats").prepend(htmlString);
$("#statCounter").click(showTracker);

addTracking();

//Function to toggle enabled/disabled for current character
function toggleCounter() {
    enabled = !enabled
    var settings = JSON.parse( GM_getValue("initium_counter_settings", "[]") );
    settings.forEach(function(char) {
        if(char.name == characterName) {
            console.log("StatTracking for "+characterName+" is now "+enabled);
            char.enabled = enabled;
        }
    });

    //Switch out picture
    if(enabled) {
        $("#statCounter")[0].children[0].src = "https://s3.amazonaws.com/imappy/3d_bar_chart.png";
        $("#statEnabler").text("Disable")
    } else {
        $("#statCounter")[0].children[0].src = "https://s3.amazonaws.com/imappy/3d_bar_chart_off.png";
        $("#statEnabler").text("Enable")
    }

    GM_setValue("initium_counter_settings", JSON.stringify(settings));
}


//Add Stat Tracking logic
function addTracking() {
    //Get attack buttons
    var attackButtons = $('.main-buttonbox a[href*="ServletCharacterControl?type=attack"]');

    //Iterate through attack buttons
    $.each(attackButtons, function(index,item) {

        //Save current buttons action link(right hand attack or left hand attack)
        var attackURL = item.href;

        //Remove current link
        item.href = "#";

        //Bind click to tracking with previous attack link as argument
        $(item).on("click",{ atkurl : attackURL },tracking);
    });
}

function tracking(event) {
    //Increment clickOnce counter
    clickOnceOnly++;

    if ( clickOnceOnly == 1 ) {
        if (enabled) {
            //Add stat counter status
            $(".main-buttonbox").append('<div style="text-align: center;" id="stat-counter-status">Status: Fetching stats..</div>');

            $.ajax({
                url: href,
                type: "GET",
                timeout: 2000,
                //If successful, get stats and redirect
                success: function(charPage) {
                    var statsDiv = $(charPage).find('.main-item-subnote');
                    var stats = dbLength+" ";

                    statsDiv.each(function( index ) {
                        if ( index > 0  && index < 4) {
                            stats += $( this ).text().split(" ")[0] + "  ";
                        }
                    });

                    gm_store("stats", characterName, stats);

                    $(".main-buttonbox #stat-counter-status").text("Status: Success. Redirecting..");

                    window.location.href = event.data.atkurl;
                },
                //If not successful or 2s passed(assume disconnect), update status and stop
                error: function(xhr, textStatus, errorThrown){
                    clickOnceOnly = 0;
                    $(".main-buttonbox #stat-counter-status").text("Status: Failed fetching stats. Aborting attack. Try again.");
                }
            });
        } else {
            window.location.href = event.data.atkurl;
        }
    }
}

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
$(document).on("keydown", function(event) {
    if (event.which == 220) {
        if ($(':focus').length > 0) {
            if (!($(':focus')[0].localName == "input")) {
                showTracker();
            }
        } else {
            showTracker();
        }
    }
});

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
    //Close other page-popups(including other stat-counter popups)
    closePagePopup();

    exitFullscreenChat();

    currentPopupStackIndex++;
    var pagePopupId = "page-popup"+currentPopupStackIndex;

    //No elements have z-index on the combat screen, so we cant have page-popup-glass there because it relies on z-index to not cover everything
    var structure = "<div id='"+pagePopupId+"'><div id='"+pagePopupId+"-content' style='min-height:150px;' class='page-popup'><img id='banner-loading-icon' src='javascript/images/wait.gif' border=0/></div><div class='page-popup-glass'></div><a class='page-popup-X' onclick='closePagePopup()'>X</a></div>"

    //Page popup root doesn't exist on the combat screen.
    if ($("#page-popup-root").length == 0) {
        $('<div id="page-popup-root"></div>').insertAfter(".chat_box");
    }

    //Create popup
    $("#page-popup-root").append(structure);

    //If chat box doesnt have z index, remove glass box
    if( $(".chat_box").css('z-index') != '1000100') {
        $(".page-popup-glass").remove();
    }

    //Fill popup with content
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

