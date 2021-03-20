$("#sidebar-create-channel-close-btn").click(function () {
    document.getElementById("sidebar-create-btn").style.display = "block";
    document.getElementById("sidebar-create-channel").style.display = "none";
});
$("#sidebar-channel").click(function () {
    channelName = $("#sidebar-channel").innerText;
    firstLoadMessage(channelName);
});
$("#sidebar-create-channel-btn").click(function () {
    let channelName = document.getElementById("sidebar-create-channel-name").value;
    if (!channelName) {
        alert("Channel name can't be empty!");
        return;
    }
    createChannel(channelName);
    document.getElementById("sidebar-create-btn").style.display = "block";
    document.getElementById("sidebar-create-channel").style.display = "none";
});

function createChannel(channelName) {
    $.ajax({
        async: true,
        type: "POST",
        url: "/api/createchannel",
        data: {
            "channelName": channelName
        },
        success: function (status) {
            getSidebarChannel();
        }
    });
}
$("#sidebar-create-btn").click(function () {
    document.getElementById("sidebar-create-channel").style.display = "block";
    document.getElementById("sidebar-create-btn").style.display = "none";
});

function channelTemplate(channel) {
    let container = document.createElement("div");
    container.setAttribute("class", "sidebar-channel-container");

    let template = document.createElement("a");
    template.setAttribute("class", "sidebar-channel");
    template.setAttribute("id", "sidebar-channel-" + channel[0]);
    template.onclick = function () {
        document.getElementById("chat-page-title-name").innerText = channel[0];
        window.push
        emptyChatArea();
        firstLoadMessage(channel[0]);
    }
    template.innerText = channel[0];
    container.appendChild(template);

    let p = document.createElement("p");
    p.setAttribute("id", "sidebar-channel-unread-count-" + channel[0]);
    p.setAttribute("class", "sidebar-channel-unread-count");
    p.innerText = 0;
    container.appendChild(p);
    return container
}

function clearAndInsertChannels(channels) {
    let sidebarCreate = document.getElementById("sidebar-create-btn");

    while (sidebarCreate.previousSibling) {
        sidebarCreate.parentNode.removeChild(sidebarCreate.previousSibling);
    }

    for (var i = 0; i < channels.length; i++) {
        lastSeenMessageDict[channels[i][0]] = 0;
        let template = channelTemplate(channels[i]);
        sidebarCreate.parentNode.insertBefore(template, sidebarCreate);
    }
}

function unreadMessages(channelName, lastMessageID) {
    $.ajax({
        async: true,
        type: "POST",
        url: "/api/getunreadmessagecount",
        data: {
            "channelName": channelName,
            "lastMessageID": lastMessageID
        },
        success: function (count) {
            if (count) {
                showUnreads(channelName, count);
            }
        }
    });
}

function showUnreads(channelName, count) {
    let sidebarChannelCount = document.getElementById("sidebar-channel-unread-count-" + channelName);
    sidebarChannelCount.innerText = count;
}

function getSidebarChannel() {
    $.ajax({
        async: true,
        type: "POST",
        url: "/api/getchannels",
        success: function (channels) {
            if (!channels) {
                return;
            } else {
                clearAndInsertChannels(channels);
                return;
            }
        }
    });
}

var messageCount;

function unreadMessages2(channelName) {
    clearInterval(messageCount);
    messageCount = setInterval(function () {
        for (var cn in lastSeenMessageDict) {
            if (cn != channelName) {
                unreadMessages(cn, lastSeenMessageDict[cn]);
            }
        }
    }, 1000);
}