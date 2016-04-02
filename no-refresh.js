// ==UserScript==
// @name         no-refresh
// @namespace   https://github.com/EFox2413
// @version      0.1.1
// @updateURL    https://raw.githubusercontent.com/EFox2413/initiumGrease/master/no-refresh.js
// @downloadURL    https://raw.githubusercontent.com/EFox2413/initiumGrease/master/no-refresh.js
// @supportURL      https://github.com/EFox2413/initiumGrease/issues
// @match       https://www.playinitium.com/*
// @match       http://www.playinitium.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

var buttonRight = $( '.main-button' ).first();
var buttonLeft = $( '.main-button' ).first().next();

var linkArr = [];
linkArr.push(buttonRight.attr( "href"));
linkArr.push(buttonLeft.attr( "href" ));

// disables href redirect for first 2 buttons
buttonRight.removeAttr( "href" );
buttonLeft.removeAttr( "href" );

// on click calls the get data function
buttonRight.click( function() {
    getData(linkArr[0]);
});

buttonLeft.click( function() {
    getData(linkArr[1]);
});

// gets the data from the actionURL
function getData(actionURL) {
    $.get(actionURL)
        .done(function(data) {
            processData(data);
            }
         );
}

console.log($( '.main-page' ).last().children().html());
// Gets the hp values and the battle description from the returned data
function processData(data) {
    var $data = $(data);
    var $mainPageDiv = $data.filter( '.main-page' ).last();
    var $hpObj = $mainPageDiv.find( '.character-display-box' ).children( 'div' ).children( 'div' ).children( 'p' );

    // gets the new hps
    var playerHP = $hpObj.first().text();
    var enemyHP = $hpObj.last().text();

    // gets the new combat text
    var combatHTML = parseCombatHTML($mainPageDiv.html());

    // if either the player or the enemy is dead call for refresh
    //   because of the way the HTML works if the enemy HP div is missing
    //   it will use the same div for both objects
    if( playerHP === enemyHP ) { fullpageRefresh(); }

    // data is processed, now update the relevant divs
    updateCombat(playerHP, enemyHP, combatHTML);

    // TODO REMOVE
    console.log(playerHP + ", " + enemyHP + "\n html: " + combatHTML);
}


// TODO smarter way of updating the hpObjects
/*
// this gets the player hp div
html = html.slice(html.indexOf( "<div style=\"display:inline-block;\">",
                  html.indexOf( "<div class=\"buff-pane hint"));

// this gets the enemy div
html = html.slice(html.indexOf( "<div class=\"character-display-box\"\ style=\"float:right",
                  html.indexOf( "<div calss=\"chat_box"));
 */

// parses HTML and gets the combat related HTML
function parseCombatHTML( html ){
    html = html.slice(html.indexOf( "<p" ));

    console.log( html );
    return html;
}

// updates the HTML elements on the current page with the values
function updateCombat(newPlayerHP, newEnemyHP, combatHTML) {
    var $hpObj = $( '.character-display-box' ).children( 'div' ).children( 'div' ).children( 'p' );
    var playerHP = $hpObj.first();
    var enemyHP = $hpObj.last();

    playerHP.text( newPlayerHP );
    enemyHP.text( newEnemyHP );
    $( '.main-page' ).last().append( '<div class="combat-text"> </div>' );
    $( '.combat-text' ).html( combatHTML );
}
