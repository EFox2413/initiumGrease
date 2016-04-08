var $ = window.jQuery; 

var charDiv = $('.character-display-box').children(" div:nth-child(3)").children( 'a' );
var statsItems;
var statsID = ["S", "D", "I", "W"];
var href = $( '.character-display-box').children().first().attr( "rel" );

$.ajax({
    url: href,
    type: "GET",
    
    success: function(data) {
        statsItems = $(data).find('.main-item-subnote');
        
        statsItems.each(function( index ) {
            if ( index > 0 ) {
                charDiv.append( " <span style=\"font-size:small\"> " + statsID[index - 1] + ":" +  $( this ).text().split(" ")[0] + " </span>");
            }
        });
    }
});
