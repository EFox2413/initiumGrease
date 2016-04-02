// ==UserScript==
// @name         debuff-script
// @namespace    https://github.com/EFox2413/initiumGrease
// @version      0.1.1.0
// @updateURL    https://raw.githubusercontent.com/EFox2413/initiumGrease/master/debuff-script.js
// @downloadURL https://raw.githubusercontent.com/EFox2413/initiumGrease/master/debuff-script.js
// @supportURL      https://github.com/EFox2413/initiumGrease/issues
// @match       https://www.playinitium.com/*
// @match       http://www.playinitium.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

var charBox = $( '.character-display-box' ).first();


// buff specific variables
var buffDetailEffect = "";
var buffDetailDescript = "";
var buffDetailExpiry = "";
var buffImage = "";
var buffTitle = "";

var isRaining = getWeather() > 0.5;
var isNight = checkNight();

var isBuffed = $( '.buff-pane' ).length;

// the buffpane and div(s) we will add for our debuff


if ( isRaining || isNight ) {
    if ( !isBuffed ) {
        // buff specific divs to add
        var buffPaneStr = "<div class='buff-pane hint' rel='#buffDetails'>" + "</div>";
        var buffBoxStr = "<div class='hiddenTooltip' id='buffDetails'>" +
            "<h4 style='margin-top:0px;'> Your buffs/debuffs </h4></div>";

        // add the buff div
        charBox.append( buffPaneStr );
        charBox.append( buffBoxStr );
    }

    var buffBox = $( '#buffDetails' ).first();


    if (isRaining) {
        buffDetailEffect = "It's harder to find new monsters when it's raining.";
        buffDetailDescript = "You are having a bit of a rainy day. This happens when you are outside sometimes. The effect lasts for 30 minutes or more depending on the weather.";
        buffDetailExpiry = "Expires in ?? minutes. Maybe, you should watch the weather channel.";
        buffImage = "https://www.playinitium.com/images/small/Pixel_Art-Icons-Buffs-S_Buff14.png";
        buffTitle = "Rainy";

        // add image to buff pane
        $( '.buff-pane' ).append("<img style='-webkit-filter:hue-rotate(250deg)' src='" + buffImage + "' border='0'>");
        // add hidden cluetip div
        buffBox.append(getHTMLStr(buffDetailEffect, buffDetailDescript, buffDetailExpiry, buffImage, buffTitle));
    }

    if (isNight) {
        buffDetailEffect = "Monsters are able to find you more easily. It's harder to find new paths.";
        buffDetailDescript = "It's nighttime. This happens when the sun goes down. You feel something watching you. You are having trouble seeing The effect lasts for 30 minutes or more.";
        buffDetailExpiry = "Expires in ?? minutes. You should really buy a watch.";
        buffImage = "https://www.playinitium.com/images/small2/Pixel_Art-Armor-Icons-Moon1.png";
        buffTitle = "Night";

        // add image to buff pane
        $( '.buff-pane' ).append("<img style='-webkit-filter:hue-rotate(250deg)' src='" + buffImage + "' border='0'>");
        // add hidden cluetip div
        buffBox.append(getHTMLStr(buffDetailEffect, buffDetailDescript, buffDetailExpiry, buffImage, buffTitle));
    }
}

// returns the HTML str specific to the viariables
function getHTMLStr( effect, descript, expiry, img, title ) {
    var htmlStr = "<div class='buff-detail'>" +
        "<img style='-webkit-filter:hue-rotate(250deg)' src='" + img + "' border='0'/>" +
        "<div class='buff-detail-header'>" +
        "<h5>" + title + "</h5>" +
        "<div class='buff-detail-effect'>" + effect + "</div>" +
        "</div>" +
        "<div class='buff-detail-description item-flavor-description'>" + descript + "</div>" +
        "<div class='buff-detail-expiry'>" + expiry + "</div>" +
        "</div>" + "</div>";
    return htmlStr;
}


// returns true if it is night
function checkNight() {
    var randConstant = 318.47133757961783439490445859873;
    var serverTime = getCurrentServerTime() / (randConstant*60*60*1.5);
    var amount = Math.abs(Math.sin(serverTime)) * 3.0 - 1.56;

    return amount > 1;
}
