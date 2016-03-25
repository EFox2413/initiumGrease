// ==UserScript==
// @name         weather-script
// @namespace    https://github.com/EFox2413/initiumGrease
// @version      0.1.1.1
// @updateURL    https://raw.githubusercontent.com/EFox2413/initiumGrease/master/weather-script.js
// @downloadURL https://raw.githubusercontent.com/EFox2413/initiumGrease/master/weather-script.js
// @supportURL      https://github.com/EFox2413/initiumGrease/issues
// @match       https://www.playinitium.com/*
// @match       http://www.playinitium.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery; 

// Weather ratio from getWeather function in server js file...
var weatherInt = getWeather();
var lightning = processLightning();
var nextWeatherInt = getNextWeather();
var nextLightning = getNextLightning();

function translateToString(wRatio, LRatio) {
    if (wRatio > 0.5) {
        if ( LRatio > 0) {
            return "Stormy";
        } else {
        return"Rain";
		}
    } else if (wRatio <0.5) {
        return "Sunny";
    }
    return "N/A";
}

$( '.header-location' ).append(  '<span> ' + "       Now: " +  translateToString(weatherInt, lightning) + '<//span>' );
$( '.header-location' ).append(  '<span> ' + "       Next: " +  translateToString(nextWeatherInt, nextLightning) + '<//span>' );



// Weather calculator
function getNextWeather()
{
	// <%=GameUtils.getWeather()%>
	var serverTime = getCurrentServerTime();
	
	var date = new Date(serverTime);
	
	var behindHour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()+1);
	var aheadHour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()+2);
	var behindMs = behindHour.getTime();
	var aheadMs = aheadHour.getTime();

	
	var behindHourWeather = rnd((behindMs/3600000), 0, 1);
	var aheadHourWeather = rnd((aheadMs/3600000), 0, 1);
	
	// Now interpolate...
	var weatherDifference = aheadHourWeather-behindHourWeather;
	
	var hourProgression = (serverTime-behindHour)/3600000;
	
	var interpolationDelta = weatherDifference*hourProgression;
	
	
	return behindHourWeather+interpolationDelta;
}	

function getNextLightning()
{
	var weather = getNextWeather();
	var serverTime = getCurrentServerTime();
	
	var lightningOdds = ((0.1+(weather-0.9))/1.5);
	
	serverTime=Math.round(serverTime/(1000*1));
	
	var random = rnd(serverTime, 0, 1);
	if (random<=lightningOdds)
	{
		var lightLevel = rnd(getCurrentServerTime(), -1.5, 0.8);
		if (lightLevel<0) lightLevel = 0;
		return lightLevel;
	}
	return 0;
}
