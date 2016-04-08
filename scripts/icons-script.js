var $ = window.jQuery;

// links to resources
var mapLink = "https://imgur.com/ZuUibeV";
var changelogLink = "viewChangelog()";

// filters to make the icons look different
// TODO make more cross-compatible
var greenFilter = "-webkit-filter: hue-rotate(50deg)";
var blueFilter = "-webkit-filter: hue-rotate(100deg)";

// html to be inserted
var insertHTML = "<a href=\"" + mapLink + "\"><img id=\"community-map-image\"" +
             "src=\"images/ui/settings.gif\" style=\"max-height:18px; " +
             greenFilter + "\"></a>";

$( '.header-stats' ).append( insertHTML );

insertHTML = "<a onclick=\"" + changelogLink + "\">" +
         "<img id=\"community-map-image\" src=\"images/ui/settings.gif\"" +
         "style=\"max-height:18px; " + blueFilter + "\"></a>";

$( '.header-stats' ).append( insertHTML );
