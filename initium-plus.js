// ==UserScript==
// @name            initium-plus
// @namespace       https://github.com/EFox2413/initiumGrease
// @version         0.0.1.0
// @updateURL       https://raw.githubusercontent.com/EFox2413/initiumGrease/master/initium-plus.meta.js
// @downloadURL     https://raw.githubusercontent.com/EFox2413/initiumGrease/master/initium-plus.js
// @supportURL      https://github.com/EFox2413/initiumGrease/issues
// @match           https://www.playinitium.com/*
// @match           http://www.playinitium.com/*
// @grant           none
// @grant           GM_setValue
// @grant           GM_listValues
// @grant           GM_getValue
// @grant           GM_deleteValue
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

//-------------------------UTILITIES-----------------------\\

// UTIL
//   mkPopup(content);
//   checkNight();
var Util = function() {
    // creates a popup with HTML content
    var mkPopup = function(content) {
        // close all other popups, increment popup counter
        closePagePopup();
        currentPopupStackIndex++;
        exitFullscreenChat();

        var pagePopupId = "page-popup" + currentPopupStackIndex;

        //No elements have z-index on the combat screen, so we
        //cant have page-popup-glass there because it relies on
        //z-index to not cover everything
        var structure = "<div id='"+pagePopupId+"'><div id='" +
            pagePopupId+"-content' style='min-height:150px;' " +
            "class='page-popup'><img id='banner-loading-icon' " +
            "src='javascript/images/wait.gif' border=0/></div>" +
            "<div class='page-popup-glass'></div><a class='page-popup-X' " +
            "onclick='closePagePopup()'>X</a></div>";

        // checks if current page is doesn't have #page-popup-root
        //  and adds the needed div if it is
        if ($("#page-popup-root").length == 0) {
            $('<div id="page-popup-root"></div>').insertAfter(".chat_box");
        }

        //Create popup
        $("#page-popup-root").append(structure);

        //If chat box doesnt have z index, remove glass box
        if( $(".chat_box").css('z-index') != '1000100') {
            $(".page-popup-glass").remove();
        }

        //Fill popup with content
        $("#"+pagePopupId+"-content").html(content);

        // pressing escape will close the popup
        if (currentPopupStackIndex === 1) {
            $(document).bind("keydown",function(e) {
                if ((e.keyCode == 27)) {
                    closePagePopup();
                }
            });
        }

        // hides previous popup if there was one
        if (currentPopupStackIndex > 1) {
            $("#page-popup" + (currentPopupStackIndex-1)).hide();
        }
    };

    // checks if current in-game time is night
    var checkNight = function() {
        var randConstant = 318.47133757961783439490445859873;
        var serverTime = getCurrentServerTime() / (randConstant*60*60*1.5);
        var amount = Math.abs(Math.sin(serverTime)) * 3.0 - 1.56;

        return amount > 1;
    };

    var oPublic = {
        mkPopup: mkPopup,
        checkNight: checkNight,
    };
    return oPublic;
}();

//-------------------------FEATURES-------------------------\\

// DEBUFF
//   init();
var Debuff = function() {
    // get the charbox div of the player
    var charBox = $( '.character-display-box' ).first();

    var isRaining = getWeather() > 0.5;
    var isNight = Util.checkNight();
    var isBuffed = $( '.buff-pane' ).length;

    // returns the HTML str specific to the viariables
    var getBuffIconHTML = function( effect, descript, expiry, img, title ) {
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
    };

    // adds the necessary buff pane and hidden tooltip divs
    var addBuffDivs = function() {
        // buff specific div HTML to add
        var buffPaneHTML = "<div class='buff-pane hint' rel='#buffDetails'>" +
            "</div>";
        var buffBoxHTML = "<div class='hiddenTooltip' id='buffDetails'>" +
            "<h4 style='margin-top:0px;'> Your buffs/debuffs </h4></div>";

        // add the divs to the document
        charBox.append( buffPaneHTML );
        charBox.append( buffBoxHTML );
    };

    // adds the rain buff to the buff pane
    var addRainBuff = function(buffBox) {
        // image for the buff, re-uses a normal buff icon
        var buffImage = "https://www.playinitium.com/images/small/Pixel_Art-" +
            "Icons-Buffs-S_Buff14.png";

        // Rain specific descriptions for the buff cluetip
        var buffDetailEffect = "It's harder to find new monsters when it's raining.";
        var buffDetailDescript = "You are having a bit of a rainy day. " +
            "This happens when you are outside sometimes. " +
            "The effect lasts for 30 minutes or more depending on the weather.";
        var buffDetailExpiry = "Expires in ?? minutes. Maybe, you should " +
            "watch the weather channel.";
        var buffTitle = "Rainy";

        // add image to buff pane
        // TODO: make cross compatible
        $( '.buff-pane' ).append("<img style='-webkit-filter:hue-rotate(250deg)' src='" +
            buffImage + "' border='0'>");

        // add hidden cluetip div
        buffBox.append(getBuffIconHTML(buffDetailEffect, buffDetailDescript,
            buffDetailExpiry, buffImage, buffTitle));
    };

    // adds the night buff to the buff pane
    var addNightBuff = function(buffBox) {
        // Image for the buff, re-uses a normal buff icon with a filter
        var buffImage = "https://www.playinitium.com/images/small2/Pixel_Art-Armor-Icons-Moon1.png";

        // Night specific descriptions for the buff cluetip
        var buffDetailEffect = "Monsters are able to find you more easily. " +
            "It's harder to find new paths.";
        var buffDetailDescript = "It's nighttime. This happens when the sun goes down. " +
            "You feel something watching you. You are having trouble seeing. " +
            "The effect lasts for 30 minutes or more.";
        var buffDetailExpiry = "Expires in ?? minutes. You should really buy a watch.";
        var buffTitle = "Night";

        // add image to buff pane
        // TODO: make cross compatible
        $( '.buff-pane' ).append("<img style='-webkit-filter:hue-rotate(250deg)' src='" +
            buffImage + "' border='0'>");

        // add hidden cluetip div
        buffBox.append(getBuffIconHTML(buffDetailEffect, buffDetailDescript,
            buffDetailExpiry, buffImage, buffTitle));
    };

    // initialize module
    var init = function() {
        if ( isRaining || isNight ) {
            // add buff divs if there aren't any
            if ( !isBuffed ) {
                addBuffDivs();
            }
            // gets the player's buffBox and not the enemy's
            var buffBox = $( '#buffDetails' ).first();

            if (isRaining) {
                addRainBuff(buffBox);
            }
            if (isNight) {
                addNightBuff(buffBox);
            }
        }
    };

    // public API
    var oPublic = {
        init: init,
    };

    return oPublic;
}();

// WEATHER FORECAST
//   init();
var WeatherForecast = function() {
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
        } else if (wRatio < 0.5) {
            // It's not sunny at night...
            if (Util.checkNight()) {
                return "Clear";
            }
            return "Sunny";
        }
        return "N/A";
    }

    var init = function() {
        $( '.header-location' ).append(  '<span ' + getColor() + '> ' +
            "Now: " +  translateToString(weatherInt, processLightning) + '<//span>' );
        $( '.header-location' ).append(  '<span ' + getColor() + '> ' +
            "Next: " +  translateToString(nextWeatherInt, getNextLightning) + '<//span>' );
    };

    // returns a color for the string based on whether it's night time or day time
    function getColor() {
        if (Util.checkNight()) return 'style="color:purple"';
        return 'style="color:yellow"';
    }

    // Weather calculator
    function getNextWeather() {
        var serverTime = getCurrentServerTime();
        var date = new Date(serverTime);

        var behindHour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()+1);
        var aheadHour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()+2);
        var behindMs = behindHour.getTime();
        var aheadMs = aheadHour.getTime();

        var behindHourWeather = rnd((behindMs/3600000), 0, 1);
        var aheadHourWeather = rnd((aheadMs/3600000), 0, 1);

        var weatherDifference = aheadHourWeather-behindHourWeather;

        var hourProgression = (serverTime-behindHour)/3600000;

        var interpolationDelta = weatherDifference*hourProgression;


        return behindHourWeather+interpolationDelta;
    }

    function getNextLightning() {
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

    var oPublic = {
        init: init,
    };
    return oPublic;
}();

// DISPLAY STATS
// TODO since this uses the same ajax call as in
//      stats tracking, might as well call the same fn
var StatDisplay = function() {
    var charDiv = $('.character-display-box').children(" div:nth-child(3)").children( 'a' );
    var statsItems;
    var statsID = ["S", "D", "I", "W"];
    var href = $( '.character-display-box').children().first().attr( "rel" );

    var init = function() {
        $.ajax({
            url: href,
            type: "GET",

            success: function(data) {
                statsItems = $(data).find('.main-item-subnote');

                statsItems.each(function( index ) {
                    if ( index > 0 ) {
                        charDiv.append( " <span style=\"font-size:small\"> " +
                            statsID[index - 1] + ":" +  $( this ).text().split(" ")[0] + " </span>");
                    }
                });
            }
        });
    };

    var oPublic = {
        init: init,
    };

    return oPublic;
}();

// ICONS
var ExtraIcons = function() {
    // links to resources
    var mapLink = "https://imgur.com/ZuUibeV";
    var changelogLink = "viewChangelog()";

    // filters to make the icons look different
    // TODO make more cross-compatible
    var greenFilter = "-webkit-filter: hue-rotate(50deg)";
    var blueFilter = "-webkit-filter: hue-rotate(100deg)";

    var init = function() {
        // html to be inserted
        var insertHTML = "<a href=\"" + mapLink + "\"><img id=\"community-map-image\"" +
        "src=\"images/ui/settings.gif\" style=\"max-height:18px; " +
        greenFilter + "\"></a>";

        $( '.header-stats' ).append( insertHTML );

        insertHTML = "<a onclick=\"" + changelogLink + "\">" +
        "<img id=\"community-map-image\" src=\"images/ui/settings.gif\"" +
        "style=\"max-height:18px; " + blueFilter + "\"></a>";

        $( '.header-stats' ).append( insertHTML );
    };

    var oPublic = {
        init: init,
    };

    return oPublic;
}();

// MUTE LIST
var MuteChat = function() {
    var banList = [];

    // add a ban
    function addBan( name ) {
        if (checkNameOnBanList( name )) {
            return;
        }
        banList.push(name);
    }

    // remove a ban from banList
    function unBan( name ) {
        var removed = false;
        banList.forEach( function( each, ind ) {
            if (name.localeCompare(each) == 0) {
                banList.splice(ind, 1);
                removed = true;
            }
        });

        if (removed === false) {
        }
    }

    // mainly for debug, prints every item on banList
    function getBanList() {
        banList.forEach( function( each ) {
        });
    }

    // check if name is on ban list
    function checkNameOnBanList( name ) {
        for (var i = 0; i < banList.length; i++) {
            if ( banList[i].localeCompare(name) == 0 ) {
                return true;
            }
        }
        return false;
    }

    // verify the sender of message is the one playing the game
    function myMessage( id ) {
        var relStr = $( '.character-display-box' ).children( 'a' ).attr( 'rel' ).toString();
        var myId = relStr.substring(relStr.search( 'Id=') + 3);

        if ( id == myId ) {
            return true;
        }
        return false;
    }

    function getNickName(name) {
        name = name.replace(/<()[^<]+>/g,"");
        return name;
    }

    var init = function() {
        messager.onChatMessage = function(chatMessage) {
            var nName = getNickName(chatMessage.nickname);

            if (checkNameOnBanList(nName) == true) {
                return;
            }

            // check if mute command is sent
            if (chatMessage.message.startsWith('/mute ')) {
                // Am I the sender of the message?
                if ( myMessage(chatMessage.characterId )) {
                    // Don't let me mute myself, while funny it prevents any mute and unmute functionality
                    //    Meaning that if I mute myself I will be unable to unmute myself or mute anyone else
                    if ( nName != chatMessage.message.substring(6) ) {
                        addBan(chatMessage.message.substring(6));
                    }
                }
            }

            // check if unmute command is sent
            if (chatMessage.message.startsWith('/unmute ')) {
                if( myMessage(chatMessage.characterId )) {
                    unBan(chatMessage.message.substring(8));
                }
            }

            var html = "<div class='chatMessage-main'>";
            if (chatMessage.createdDate!=null)
            {
                var date = new Date(chatMessage.createdDate);
                var shortTime = date.toLocaleTimeString();
                var cutoff = shortTime.length;
                if (shortTime.indexOf(":")>0)
                    cutoff = shortTime.lastIndexOf(":");
                else if (shortTime.indexOf(".")>0)
                    cutoff = shortTime.lastIndexOf(".");

                shortTime = shortTime.substring(0, cutoff);
                var longDate = date.toLocaleDateString();

                html+="<span class='chatMessage-time' title='"+longDate+"'>";
                html+="["+shortTime+"] ";
                html+="</span>";
            }
            if (chatMessage.code=="PrivateChat")
            {
                html+="<a class='chatMessage-private-nickname' onclick='setPrivateChatTo(\""+chatMessage.nickname+"\", "+chatMessage.characterId+")'>"+chatMessage.nickname+"</a>";
                html+="<span class='chatMessage-text'>";
                html+=" ";
                html+=chatMessage.message;
                html+="</div>";
            }
            else if (chatMessage.mode==null)
            {
                var meMode = chatMessage.message.startsWith("/me ");

                html+="<span class='chatMessage-text'>";

                if (chatMessage.characterId!=null && chatMessage.message.startsWith('/me  ')) {
                    html += "<a class='clue' style='color:" + '#'+(Math.random()*0xFFFFFF<<0).toString(16) + "' rel='viewcharactermini.jsp?characterId=" + chatMessage.characterId + "'>" + chatMessage.nickname + ":</a>";
                } else if (chatMessage.characterId!=null && meMode==false) {
                    html+=chatMessage.nicknameStyled;
                } else
                    html+=chatMessage.nickname;
                html+="</span>";
                html+="<span class='chatMessage-text'>";

                if (meMode)
                {
                    html+=" ";
                    chatMessage.message = chatMessage.message.substring(4);
                }
                else
                    html+=": ";
                html+=chatMessage.message;
                html+="</div>";
            }
            else if (chatMessage.mode=="admin")
            {
                html+="<span class='chatMessage-text-story'>";
                html+=chatMessage.message;
                html+="</div>";
            }
            html+="</div>";
            $("#chat_messages_"+chatMessage.code).prepend(html);

            notifyNewMessage(chatMessage.code);
        };
    };

    var oPublic = {
        init: init,
    };

    return oPublic;
}();

// NEARBY ITEMS
var ItemList = function() {
    var itemButton = $( '#main-itemlist' ).children();

    var init = function() {
        // Get rid of current onClick behavior
        itemButton.attr( 'onclick', "");

        itemButton.attr( 'rel', "ajax_moveitems.jsp?preset=location");

        // Give sticky cluetip on click
        itemButton.cluetip({
            cluetipClass: 'rounded',
            activation : 'click',
            showTitle: true,
            height: 'auto',
            width: 350,
            sticky: true,
            closePosition: 'title',
            arrows: true,
            ajaxCache: false,
            mouseOutClose: false,
            cluezIndex: 2000000,
            onShow: function(e) {
                $("#cluetip-waitimage").css('z-index', 2000000);
                $("#cluetip").css('z-index', 2000000);
                return true;
            },
            ajaxProcess : function(data) {
                var text = itemParser(data);
                var textArray = divSeparate(text);
                var newText = "";

                for( var i = 0; i < textArray.length - 2; i++) {
                    newText = newText.concat(textArray[i].pop());
                    newText = newText.concat("<br>");
                }
                // add that last div back in
                newText = newText.concat(textArray[textArray.length - 1]);

                return newText;
            }
        });
    };

    // Parse the HTML data before sending it back to ajaxProcess
    //     this will only return the items on the ground in nearby area
    function itemParser(text) {
        var returnText = text;
        returnText = returnText.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm,"").replace(/<(link|meta)[^>]+>/g,"");
        returnText = returnText.slice(returnText.indexOf("id=\'right") + 11, returnText.length);
        return returnText;
    }

    // Organizes duplicate items into a stack with most valuable items being on the top of the stack
    // cluetip will pop the stacks of duplicate items from a stack (stack of dupe item stacks)
    // Separates divs array into arrays of unique types of items
    function divSeparate(text) {
        var newText = text.split("<br>");
        var uniqItemStack = new Array([]);
        var uniqItemNameStack = [];

        // save the last entry from div organization
        var lastDiv = newText.pop();

        uniqItemNameStack = getNames(newText);

        // 2D array construction
        uniqItemNameStack.forEach(function(entry, ind) {
            uniqItemStack.push(new Array());
        });

        // foreach
        newText.forEach(function(entry, ind) {
            var itemNameBegLoc = entry.search("main-item-name\'>");
            // exclude search string from result
            itemNameBegLoc += "main-item-name\'>".length;
            var itemNameEndLoc = entry.search("</div></a>");
            var itemName = entry.substring(itemNameBegLoc, itemNameEndLoc);
            var index = 0;

            // if item name is in uniqItemStackNames
            // get index of uniqItemStackNames.equals(itemName)
            index = getIndex(itemName);

            // push the item onto the correct stack
            uniqItemStack[index].push(entry);
        });

        // push back on the lastDiv
        uniqItemStack.push(lastDiv);

        return uniqItemStack;

        //Misc. Functions

        // gets Index of value in array, if no value in the array returns -1
        function getIndex(name) {
            var index = -1;

            uniqItemNameStack.forEach(function(entry, ind) {
                if (name == entry) {
                    index = ind;
                }
            });
            return index;
        }

        function getNames(divStack) {
            var itemNameStack = [];

            divStack.forEach(function(entry, ind) {
                var itemNameBegLoc = entry.search("main-item-name\'>");
                // exclude search string from result
                itemNameBegLoc += "main-item-name\'>".length;
                var itemNameEndLoc = entry.search("</div></a>");
                var itemName = entry.substring(itemNameBegLoc, itemNameEndLoc);
                var boolAdd = true;

                if (ind === 0) {
                    itemNameStack.push(itemName);
                } else {
                    itemNameStack.forEach(function(entry) {
                        if (itemName == entry) {
                            boolAdd = false;
                        }
                    });
                }

                if (boolAdd && ind > 0) {
                    itemNameStack.push(itemName);
                }
            });

            return itemNameStack;
        }
    }

    var oPublic = {
        init: init,
    };

    return oPublic;
}();

// NO REFRESH
var NoRefresh = function() {
    var init = function() {
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
    };

    // gets the data from the actionURL
    function getData(actionURL) {
        $.get(actionURL)
         .done(function(data) {
            processData(data);
        });
    }

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

    var oPublic = {
        init: init,
    };

    return oPublic;
}();

// STATS TRACKING
var TrackStats = function() {
    var characterName = $( '.character-display-box' ).children( 'div' ).children('a').first().text();

    var enabled = false;
    var saved = false;
    var prevStats = JSON.parse( GM_getValue(characterName, "[]") );
    var dbLength = prevStats.length;

    var href = $( '.character-display-box').children().first().attr( "rel" );
    var clickOnceOnly = 0;

    //Check if character is enabled for tracking.
    var settings = JSON.parse( GM_getValue("initium_counter_settings", "[]") );

    var init = function () {
        settings.forEach(function(char) {
            if(char.name == characterName) {
                saved = true;
                enabled = char.enabled;
            }
        });

        //If never seen before, character will be added as disabled.
        if (!saved) {
            var newSetting = {
                "name":characterName,
                "enabled":false
            };
            settings.push(newSetting);
            GM_setValue("initium_counter_settings", JSON.stringify(settings));
            saved = true;
        }

        //Add icon to icon bar and bind to toggle function
        if (enabled) {
            //Can add <div class="header-stats-caption">Counter</div> inside a tag underneath for caption.
            var htmlString = '<div style="display:inline-block; cursor: pointer;" id="statCounter"><img style="padding: 0 0 3px;" src="https://s3.amazonaws.com/imappy/3d_bar_chart.png" border="0/"></div>';
        } else {
            var htmlString = '<div style="display:inline-block; cursor: pointer;" id="statCounter"><img style="padding: 0 0 3px;" src="https://s3.amazonaws.com/imappy/3d_bar_chart_off.png" border="0/"></div>';
        }
        $(".header-stats").prepend(htmlString);
        $("#statCounter").click(showTracker);

        addTracking();

        // Press | to show the stats saved for this character in a popup.
        $(document).on("keydown", function(event) {
            if (event.which == 220) {
                if ($(':focus').length > 0) {
                    if (!($(':focus')[0].localName == "input")) {
                        showTracker();
                    }
                } else {
                    showTracker();
                }
            }
        });
    };

    //Function to toggle enabled/disabled for current character
    function toggleCounter() {
        enabled = !enabled;
        var settings = JSON.parse( GM_getValue("initium_counter_settings", "[]") );
        settings.forEach(function(char) {
            if(char.name == characterName) {
                char.enabled = enabled;
            }
        });

        //Switch out picture
        if(enabled) {
            $("#statCounter")[0].children[0].src = "https://s3.amazonaws.com/imappy/3d_bar_chart.png";
            $("#statEnabler").text("Disable");
        } else {
            $("#statCounter")[0].children[0].src = "https://s3.amazonaws.com/imappy/3d_bar_chart_off.png";
            $("#statEnabler").text("Enable");
        }

        GM_setValue("initium_counter_settings", JSON.stringify(settings));
    }

    //Add Stat Tracking logic
    function addTracking() {
        //Get attack buttons
        var attackButtons = $('.main-buttonbox a[href*="ServletCharacterControl?type=attack"]');

        //Iterate through attack buttons
        $.each(attackButtons, function(index,item) {
            //Save current buttons action link(right hand attack or left hand attack)
            var attackURL = item.href;

            //Remove current link
            item.href = "#";

            //Bind click to tracking with previous attack link as argument
            $(item).on("click",{ atkurl : attackURL },tracking);
        });
    }

    function tracking(event) {
        //Increment clickOnce counter
        clickOnceOnly++;

        if ( clickOnceOnly == 1 ) {
            if (enabled) {
                //Add stat counter status
                $(".main-buttonbox").append('<div style="text-align: center;" id="stat-counter-status">Status: Fetching stats..</div>');

                $.ajax({
                    url: href,
                    type: "GET",
                    timeout: 2000,

                    //If successful, get stats and redirect
                    success: function(charPage) {
                        var statsDiv = $(charPage).find('.main-item-subnote');
                        var stats = dbLength+" ";

                        statsDiv.each(function( index ) {
                            if ( index > 0  && index < 4) {
                                stats += $( this ).text().split(" ")[0] + "  ";
                            }
                        });

                        gm_store("stats", characterName, stats);

                        $(".main-buttonbox #stat-counter-status").text("Status: Success. Redirecting..");

                        window.location.href = event.data.atkurl;
                    },
                    //If not successful or 2s passed(assume disconnect), update status and stop
                    error: function(xhr, textStatus, errorThrown){
                        clickOnceOnly = 0;
                        $(".main-buttonbox #stat-counter-status").text("Status: Failed fetching stats. Aborting attack. Try again.");
                    }
                });
            } else {
                window.location.href = event.data.atkurl;
            }
        }
    }

    function showTracker() {
        var popTitle = "<center><h3>Stat Tracker for "+characterName+"</h3></center>";
        var popContent = "";
        var nextState = "";

        if(enabled) {
            nextState = "Disable";
        } else {
            nextState = "Enable";
        }

        popContent += '<div class="main-button-half" id="statEnabler" ' +
            'style="margin: 0 5% 0 5%; width: 40%; display: inline-block; ' +
            'line-height: 24px" shortcut="86">' + nextState + '</div>' +
            '<div class="main-button-half" id="statCleaner" ' +
            'style="margin: 0 5% 0 5%; width: 40%; display: inline-block; ' +
            'line-height: 24px" shortcut="86">Clear</div>' +
            '\n\n<center><h3>Saved stats:</h3></center>';

        var savedStats = JSON.parse( GM_getValue(characterName, "[]") );

        $.each(savedStats.reverse(), function(index,stat) {
            popContent += "<center>"+stat+"</center>";
        });

        Util.mkPopup(popTitle + popContent);

        $("#statCleaner").click(clearStats);
        $("#statEnabler").click(toggleCounter);
    }

    //Prints saved stats from database to console
    function printStats(){
        console.log("Stats for " + characterName + ":");
            var savedStats = JSON.parse(GM_getValue(characterName, "[]"));
        savedStats.forEach(function(stat) {
            console.log(stat);
        });
    }

    //Clears stats in database for current character
    function clearStats(){
        if (confirm('You sure you want to delete the stats saved for '+characterName+'?')) {
            GM_setValue(characterName, "[]");
                closePagePopup();
                showTracker();
        }
    }

    //Inserts into database
    function gm_store(dataname, charname, data) {
        if (dataname === "stats") {
            var stats = JSON.parse( GM_getValue(charname, "[]") );
            stats.push(data);

            GM_setValue(charname, JSON.stringify(stats));

            console.log("Added "+data+" to "+charname);
        }
    }

    var oPublic = {
        init: init,
    };
    return oPublic;
}();

//-----------------------CONFIG-----------------\\
/*
   displays checkboxes to enable or disable each script
   accessed by pressing the letter c, or typing /config in chat
 */

// CONFIG
//    init();
var Config = function() {
    // string for database access
    var dbConfigString = "configString";
    var dbConfigStringVal = "";
    // name of all scripts / features to be enabled
    var scriptNames = [ "Debuff", "StatDisplay", "ExtraIcons", "MuteChat",
                        "NoRefresh", "TrackStats", "WeatherForecast",
                        "ItemList" ];
    var scriptObjects = [ Debuff, StatDisplay, ExtraIcons, MuteChat,
                          NoRefresh, TrackStats, WeatherForecast,
                          ItemList ];

    // changes dbConfigStringVal + updates database when there is a change
    var addChangeListener = function( id ) {
        // we had to use some clever str concatenation because strings are immutable
        $( id ).change( function() {
            var boxId = $( this ).attr( "id" );
            var index = parseInt(boxId[boxId.length - 1]);

            if ( this.checked ) {
                dbConfigStringVal = dbConfigStringVal.substr(0, index) + 'y' + dbConfigStringVal.substr(index + 1);
            } else {
                dbConfigStringVal = dbConfigStringVal.substr(0, index) + 'n' + dbConfigStringVal.substr(index + 1);
            }
            GM_setValue(dbConfigString, dbConfigStringVal);
        });
    };

    // adds a checkbox to popContent string which will be used to make menu
    //  name should begin with capital letter for style purposes
    var makeCheckboxHTML = function(name, isEnabled) {
        var nameWithoutNumber = name.substring(0, name.length - 1);
        var HTML = '<div class="setting-entry setting-entry-checkbox">' +
            '<input type="checkbox" id="checkbox' + name + '" ';

        if (isEnabled) {
            HTML += 'checked';
        }
        HTML += '>' + 'Enable' + nameWithoutNumber + '</div>';
        return HTML;
    };

    // true if the character at index of configString is a y
    //  meaning the user enabled that script in config popup
    var checkEnabled = function(index) {
        return dbConfigStringVal[index] === 'y';
    };

    // sets database string to enable the default scripts
    var setToDefault = function() {
        dbConfigStringVal = "yynynyyn";
        GM_setValue(dbConfigString, dbConfigStringVal);
    };

    // enables scripts based on dbConfigStringVal
    var enableScripts = function() {
        scriptObjects.forEach( function( entry, index) {
            if (checkEnabled(index)) {
                entry.init();
            }
        });
    };

    // makes the config Popup
    var showConfigMenu = function() {
        var popTitle = "<center><h2>Initium+ Configuration</h3></center>";
        var popSubText = "<center><h5>You will need to refresh the webpage " +
            "for the changes to take effect. Press C to bring up this menu. "</h5></center>";
        var popContent = "";

        // add checkboxes for all main features, index keeps track
        //  of place of scripts in array and in dbConfigStringVal
        scriptNames.forEach( function(entry, index) {
            popContent += makeCheckboxHTML(entry + index, checkEnabled(index));
        });

        // add content to the popup and show it
        Util.mkPopup( popTitle + popSubText + popContent );

        for (var i = 0; i < scriptNames.length; i++) {
            addChangeListener( "#checkbox" + scriptNames[i] + i);
        }

        // reset popContent
        popContent = "";
    };

    var init = function() {
        // get the value of db string, if empty set to default
        dbConfigStringVal = GM_getValue(dbConfigString);

        if ( !dbConfigStringVal || dbConfigStringVal.length !== 8 ) {
            setToDefault();
            showConfigMenu();
        }
        enableScripts();

        // Press | to show the stats saved for this character in a popup.
        $(document).on("keydown", function(event) {
            if (event.which == 99 || event.which == 67) {
                if ($(':focus').length > 0) {
                    if (!($(':focus')[0].localName == "input")) {
                        showConfigMenu();
                    }
                } else {
                    showConfigMenu();
                }
            }
        });
    };

    var oPublic = {
        init: init,
    };
    return oPublic;
}();

Config.init();
