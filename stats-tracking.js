// ==UserScript==
// @name         stats-tracking
// @namespace    https://github.com/EFox2413/initiumGrease
// @version      0.1.12
// @updateURL    https://raw.githubusercontent.com/EFox2413/initiumGrease/master/stats-tracking.js
// @downloadURL    https://raw.githubusercontent.com/EFox2413/initiumGrease/master/stats-tracking.js
// @supportURL      https://github.com/EFox2413/initiumGrease/issues
// @match       https://www.playinitium.com/*
// @match       http://www.playinitium.com/*
// @grant        none
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_getValue
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery; 

var characterName = $( '.character-display-box' ).children( 'div' ).children('a').first().text();
// this will track atk#
var dbLength = GM_listValues().length;
// characterName + atk#
var nameStr = characterName + dbLength;
var href = $( '.character-display-box').children().first().attr( "rel" );
var atkButtons =  $( '.main-buttonbox' ).children( 'a' ).slice(0,2);
var clickOnceOnly = 0;

checkForSameChar();

function checkForSameChar() {
	var firstEntry = GM_listValues()[0];
	
	if ( (characterName.concat(0)) != firstEntry) {
		alert("CharacterName detected as: " + characterName + "\n Database entry: " + firstEntry + "\n Character name does not match database name.\n Are you sure you want to continue using this script?");
	}
}

// Determine if Attack button was pressed
if ( clickOnceOnly === 0 ) {
	if ( atkButtons.attr( 'href' ).includes( 'attack' ) ) {
		atkButtons.click(function (event) {
			// increment clickOnce counter
			clickOnceOnly++;
			
			$.ajax({
				url: href,
				type: "GET",
	
				success: function(charPage) {
					var statsDiv = $(charPage).find('.main-item-subnote');
					var stats = "";
	
					statsDiv.each(function( index ) {
						if ( index > 0  && index < 4) {
							stats += $( this ).text().split(" ")[0] + "  ";
						}
					});
					GM_setValue(nameStr, stats);
				}
			});
		});
	}
}

// If you press the tilde key (Shift + grave accent)
// The database will print to the console
// Shown on inspect
window.onkeypress = function( event ) {
	if (event.keyCode == 126) {
		printDatabase();
	}
}

// prints the database to console
function printDatabase(){
	var dbNames = GM_listValues();
	
	dbNames.forEach( function (entry) {
		console.log(entry + ", " + GM_getValue(entry));
	});
}



