$("#chat-page-more-message-btn").click(function() {
    let channelName = document.getElementById("chat-page-title-name").innerText;

    let messageIDs = document.querySelectorAll("#msg-id");
    let firstMessageDiv = messageIDs[0];

    if (firstMessageDiv) {
        firstMessageID = firstMessageDiv.innerText;
    } else {
        return;
    }

    $.ajax({
        async: true,
        type: "POST",
        url: "/api/moremessage",
        data: {
            "channelName": channelName,
            "firstLoad": false,
            "firstMessageID": firstMessageID
        },
        success: function(messages) {
            if (!messages["content"] || messages["content"].length == 0) {
                hideMoremessage();
                return;
            } else {
                insertWords(messages);
            }
        }
    });
});


$("#chat-page-send-text-area").keypress(function(e) {
    if (e.which === 13) {
        sendMessage();
    }
});


$("#chat-page-send-btn").click(function() {
    sendMessage();
});


function sendMessage() {
    let channelName = document.getElementById("chat-page-title-name").innerText;
    let message = document.getElementById("chat-page-send-text-area").value;

    $.ajax({
        async: true,
        type: "POST",
        url: "/api/postmessage",
        data: {
            "channelName": channelName,
            "email": email, // localStorage?
            "message": message
        },
        success: function(messages) {
            document.getElementById("chat-page-send-text-area").value = '';
        }
    });
}


function emptyChatArea() {
    let moreMessageDiv = document.getElementById("chat-page-more-message");

    while (moreMessageDiv.nextSibling) {
        moreMessageDiv.parentNode.removeChild(moreMessageDiv.nextSibling);
    }

    moreMessageDiv.style.display = "block";
}


function firstLoadMessage(channelName) {
    let sidebarChannelCount = document.getElementById("sidebar-channel-unread-count-" + channelName);
    sidebarChannelCount.innerText = 0;

    unreadMessages2(channelName);

    $.ajax({
        async: true,
        type: "POST",
        url: "/api/moremessage",
        data: {
            "channelName": channelName,
            "firstLoad": true
        },
        success: function(messages) {
            if (!messages || messages['content'].length == 0) {
                hideMoremessage(channelName);
            } else {
                storeLatestMessageID(channelName, messages['content']);
                insertWords(messages);
            }
            getMessage(channelName);
        }
    });
}

var lastSeenMessageDict = {};

function storeLatestMessageID(channelName, messages) {
    lastSeenMessageID = messages[0][1];
    lastSeenMessageDict[channelName] = lastSeenMessageID;
}

var countDict = {};
function insertWords(messages) {
    let moreMessageDiv = document.getElementById("chat-page-content-container").firstChild;

    for (var i = 0; i < messages["count"].length; i++) {
        countDict[messages["count"][i][0]] = messages["count"][i][1];
    }

    for (var i = 0; i < messages["content"].length; i++) {
            let template = messageTemplate(messages["content"][i], countDict);
            moreMessageDiv.parentNode.insertBefore(template, moreMessageDiv.nextSibling.nextSibling);
    }
}

function appendWords(messages) {
    if (!messages) {
        return;
    }

    var container = document.getElementById("chat-page-content-container");

    for (var i = 0; i < messages["count"].length; i++) {
        countDict[messages["count"][i][0]] = messages["count"][i][1];
    }

    for (var i = 0; i < messages['content'].length; i++) {
        let template = messageTemplate(messages['content'][i], countDict);
        container.append(template);
    }
}


var isThreadPageOpen = false;

function messageTemplate(message, countDict) {
    let div = document.createElement("div");
    div.setAttribute("class", "chat-page-content");

    let img = document.createElement("img");
    img.setAttribute("src", "http://localhost:5000/static/images/NoBelayLogo.png");
    img.setAttribute("id", "Avatar");
    div.appendChild(img);

    let messageid = document.createElement("div");
    messageid.setAttribute("id", "msg-id");
    messageid. setAttribute("hidden", true);
    messageid.innerText = message[1];
    div.appendChild(messageid);

    let url = getImageURLs(message[3]);
    if (url) {
        var chatPageImg = document.createElement("img");
        chatPageImg.setAttribute("src", url);
        chatPageImg.setAttribute("id", "chat-page-img");
        let p = document.createElement("p");
        var msg = message[3].replace(url, "");
        p.innerText = message[0] + ": " + msg;
        div.appendChild(p);
        div.append(chatPageImg);
    } else {
        let p = document.createElement("p");
        p.innerText = message[0] + ": " + message[3];
        div.appendChild(p);
    }

    let span = document.createElement("span");
    span.innerText = message[2];
    div.appendChild(span);

    div.onclick = function() {
        if (isThreadPageOpen) {
            hideThreadPage();
        }
        isLoad = loadThreadMessage(message[1]);
        isThreadPageOpen = true;
        showThreadPage(message);
    }

    if (countDict[message[1]] === undefined) {
        return div;
    }

    let replyCount = countDict[message[1]];
    if (replyCount) {
        let a = document.createElement("a");
        a.setAttribute("class", "chat-page-reply-count");
        a.innerText = "(# of reply: " + replyCount + ")";
        div.appendChild(a);
    }

    return div;
}


var curChannelGetMessage;

function getMessage(channelName) {
  clearInterval(curChannelGetMessage);
  curChannelGetMessage = setInterval(function() {
    let messageIDs = document.querySelectorAll("#msg-id");
    let lastMessageDiv = messageIDs[messageIDs.length - 1];

    if (lastMessageDiv) {
        lastMessageID = lastMessageDiv.innerText;
    } else {
        lastMessageID = 0;
    }

    $.ajax({
        async: true,
        type: "POST",
        url: "/api/getmessage",
        data: {
            "channelName": channelName,
            "lastMessageID": lastMessageID
        },
        success: function(messages) {
            if (messages && messages['content'] && messages['content'].length != 0) {
                storeLatestMessageID(channelName, messages['content']);
                appendWords(messages);
            }
        }
    });
  }, 1000);
}

function getImageURLs(message) {
    const regex = /https\:\/\/[a-zA-Z0-9.\-/]*\/[a-zA-Z_.\-]*.(jpeg|jpg|gif|png)+/g;
    let array = [...message.matchAll(regex)];
    if (array == null || array[0] == null) {
        return null;
    }
    return array[0][0];
}


function hideMoremessage(channelName) {
    let moreMessageDiv = document.getElementById("chat-page-more-message");
    moreMessageDiv.style.display = "none";
}
