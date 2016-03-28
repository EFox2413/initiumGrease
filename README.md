# Initium Grease
[Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)/[Tampermonkey](http://tampermonkey.net/) scripts for the html-based game [Initium](https://www.playinitium.com)

## Last Edited 3/28/16
Status: 
-  :white_check_mark: [weather-script](https://raw.githubusercontent.com/EFox2413/initiumGrease/master/weather-script.js)
-  :white_check_mark: [display-stats](https://raw.githubusercontent.com/EFox2413/initiumGrease/master/display-stats.js)
-  :white_check_mark: [icons-script](https://raw.githubusercontent.com/EFox2413/initiumGrease/master/icons-script.js)
-  :white_check_mark: [mute-chat](https://raw.githubusercontent.com/EFox2413/initiumGrease/master/mute-chat.js)
-  :white_check_mark: [stats-tracking](https://raw.githubusercontent.com/EFox2413/initiumGrease/master/stats-tracking.js)
-  :heavy_exclamation_mark: [nearby-items](https://raw.githubusercontent.com/EFox2413/initiumGrease/master/nearby-items.js)
-  :heavy_exclamation_mark: [no-refresh](https://raw.githubusercontent.com/EFox2413/initiumGrease/master/no-refresh.js)

## weather-script
Script that displays the weather forecast for the current hour and for the next hour.

## display-stats
Displays your character's stats at the top of the page next to your name. W is for weight.

## icons-script
Displays two additional icons next to the settings one. Green for the community map and blue for the changelog.

## mute-chat
Mutes specificed playrs in the chatbox via command /mute <playername>
1 hidden easter-egg

## stats-tracking
Tracks your stats for each attack performed
### Documentation
  On attack button click, the script will record your previous stats and previous attack number in a database.
  
  To see all of the attacks and stats recorded you can press the (~) key and they will print to the console.
  
  To see the console you need to right click the web page and click on inspect.
  
  The script's name should be specific to the character you are using it with
  
  e.g. If my name was troll I would name the script troll-stats

## nearby-items
Displays the nearby items in a cluetip and stacks items of the same type.
Currently does not sort by item-type.

## no-refresh
Stops the page from refreshing everything on the page instead of just refreshing the changed elements.
