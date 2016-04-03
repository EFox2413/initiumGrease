var $ = window.jQuery; 

var itemButton = $( '#main-itemlist' ).children();

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
    console.log(uniqItemStack.length);

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




