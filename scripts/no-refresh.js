var $ = window.jQuery;

$( '.main-page' ).last().append( '<div class="combat-text"> </div>' );

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
}

// parses HTML and gets the combat related HTML
function parseCombatHTML( html ){
    html = html.slice(html.indexOf( "<p>\n\t" ));
    return html;
}

// updates the HTML elements on the current page with the values
function updateCombat(newPlayerHP, newEnemyHP, combatHTML) {
    var $hpObj = $( '.character-display-box' ).children( 'div' ).children( 'div' );
    var playerHP = $hpObj.children( 'p' ).first();
    var enemyHP = $hpObj.children( 'p' ).last();
    var newPlayerHPBarWidth = parseInt(parseFloat(newPlayerHP) / parseFloat( newPlayerHP.slice(newPlayerHP.indexOf("/") + 1)) * 100);
    var newEnemyHPBarWidth = parseInt(parseFloat(newEnemyHP) / parseFloat( newEnemyHP.slice(newEnemyHP.indexOf("/") + 1)) * 100);

    $hpObj.children().first().width( newPlayerHPBarWidth + "px" );
    $hpObj.children().last().prev().width( newEnemyHPBarWidth + "px" );

    playerHP.text( newPlayerHP );
    enemyHP.text( newEnemyHP );
    $( '.combat-text' ).html( combatHTML );
}
