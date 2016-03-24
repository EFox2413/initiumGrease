// ==UserScript==
// @name         no-refresh
// @namespace   https://github.com/EFox2413 
// @version      0.1
// @author       EFox2413
// @match       https://www.playinitium.com/*
// @match       http://www.playinitium.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery; 

doExplore = doFastExplore;

function doFastExplore(ignoreCombatSites)
{
    var urlString = "ServletCharacterControl?type=explore_ajax&ignoreCombatSites=" + ignoreCombatSites;
    var loadPage = "https://www.playinitium.com/main.jsp";

    if (ignoreCombatSites == null)
        ignoreCombatSites = false;
    showBannerLoadingIcon();
    // URL contains
    // {"isComplete":false,"timeLeft":2,"locationName":"Combat site: Hobgoblin Hunter"}

    // longOperation(eventObject, actionUrl, responseFunction, recallFunction)
    newLongOperation(null, urlString, function(action) {
        if (action.isComplete)
        {
            //fullpageRefresh();
            $( 'body' ).load(loadPage);
        }
        else
        {
            var locationName = action.locationName;
            popupPermanentOverlay_Searching(locationName, window.biome);

        }
    },function() {
        doFastExplore(ignoreCombatSites, window.biome);
    });
}

var lastLongOpEventObject = null;

function newLongOperation(eventObject, actionUrl, responseFunction, recallFunction)
{
    lastLongOpEventObject = eventObject;
    $.get(actionUrl).done(function(data){
        if (data.error != undefined)
        {
            hideBannerLoadingIcon();
            popupMessage("System Message", data.error, false);
            if (data.refresh==true)
                //fullpageRefresh();
                $( 'body' ).load(loadPage);
            return;
        }
        if (data.refresh==true)
        {
            //fullpageRefresh();
            $( 'body' ).load(loadPage);
            return;
        }
        if (responseFunction!=null)
            responseFunction(data);

        if (data.isComplete==false)
        {
            if (data.timeLeft>=0)
            {
                setTimeout(recallFunction, (data.timeLeft+1)*1000);
                if (data.timeLeft>=5)
                    popupPremiumReminder();
            }
        }
        else
        {
            if (data.description!=null)
                $("#long-operation-complete-text").html(data.description);
        }
        lastLongOpEventObject = null;
    })
        .fail(function(xhr, textStatus, errorThrown){
        if (errorThrown=="Internal Server Error")
            popupMessage(errorThrown, "There was an error when trying to perform the action. Feel free to report this on <a href='http://initium.reddit.com'>/r/initium</a>. A log has been generated.");
        else
            popupMessage(errorThrown, "There was an error when trying to perform the action.");

        lastLongOpEventObject = null;
    });

    if (eventObject!=null)
        eventObject.stopPropagation();
}




