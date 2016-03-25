// ==UserScript==
// @name         mute-chat
// @namespace    https://github.com/EFox2413
// @version      0.1
// @author       EFox2413
// @match        https://www.playinitium.com/*
// @match        http://www.playinitium.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery; 

var banList = [];

// add a ban
function addBan( name ) {
    if (checkNameOnBanList( name )) {
        console.log( name + " is on ban list already.");
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
        console.log(name + " is not muted.");
    }
}

// mainly for debug, prints every item on banList
function getBanList() {
    banList.forEach( function( each ) {
        console.log(each + ";");
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

messager.onChatMessage = function(chatMessage) {
	var nName = getNickName(chatMessage.nickname);
	console.log("nName: " + nName);
    // check if sender's name is on ban list
  //  console.log(chatMessage.nickname + ", banned: " + checkNameOnBanList(chatMessage.nickname)); 

    if (checkNameOnBanList(nName) == true) {
        //        console.log("message surpressed, exit function");
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
