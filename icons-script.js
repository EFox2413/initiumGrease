// ==UserScript==
// @name         icons-script
// @namespace   https://github.com/EFox2413/initiumGrease
// @version      0.1.1
// @updateURL    https://raw.githubusercontent.com/EFox2413/initiumGrease/master/icons-script.js
// @downloadURL    https://raw.githubusercontent.com/EFox2413/initiumGrease/master/icons-script.js
// @supportURL      https://github.com/EFox2413/initiumGrease/issues
// @match       https://www.playinitium.com/*
// @match       http://www.playinitium.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

// Supports chrome 19+ and safari

var $ = window.jQuery; 

var mapLink = "https://imgur.com/ZuUibeV";
var changelogLink = "viewChangelog()";

var greenFilter = "-webkit-filter: hue-rotate(50deg)";
var blueFilter = "-webkit-filter: hue-rotate(100deg)";
 
var insert = "<a href=\"" + mapLink + "\"><img id=\"community-map-image\" src=\"images/ui/settings.gif\" style=\"max-height:18px; " + greenFilter + "\"></a>";
$( '.header-stats' ).append( insert );

insert =  "<a onclick=\"" + changelogLink + "\"><img id=\"community-map-image\" src=\"images/ui/settings.gif\" style=\"max-height:18px; " + blueFilter + "\"></a>";
$( '.header-stats' ).append( insert );
