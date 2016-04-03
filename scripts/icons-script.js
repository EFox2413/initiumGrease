var $ = window.jQuery; 

var mapLink = "https://imgur.com/ZuUibeV";
var changelogLink = "viewChangelog()";

var greenFilter = "-webkit-filter: hue-rotate(50deg)";
var blueFilter = "-webkit-filter: hue-rotate(100deg)";
 
var insert = "<a href=\"" + mapLink + "\"><img id=\"community-map-image\" src=\"images/ui/settings.gif\" style=\"max-height:18px; " + greenFilter + "\"></a>";
$( '.header-stats' ).append( insert );

insert =  "<a onclick=\"" + changelogLink + "\"><img id=\"community-map-image\" src=\"images/ui/settings.gif\" style=\"max-height:18px; " + blueFilter + "\"></a>";
$( '.header-stats' ).append( insert );
