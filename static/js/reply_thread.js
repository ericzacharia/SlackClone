$("#thread-close-btn").click(function () {
    hideThreadPage();
    isThreadPageOpen = false;
});

$("#thread-page-send-btn").click(function () {
    messageThread();
});


function holdMessage(){

}

function loadMessageThread(threadMessageID) {
    $.ajax({
        async: true,
        type: "POST",
        url: "/api/loadthreadmassage",
        data: {
            "threadMessageID": threadMessageID
        },
        success: function (messages) {
            if (!messages) {
                return false;
            }
            insertThreadMessage(messages);
            return true;
        }
    });
}

function showThreadPage(message) {
    document.getElementById("thread-page").style.display = "block";
    document.getElementById("thread-page-title").innerText = message[0] + ": " + message[3];
    document.getElementById("thread-page-replyid").innerText = message[1];
}

function hideThreadPage() {
    document.getElementById("thread-page").style.display = "none";
    document.getElementById("thread-page-title").innerText = "";
    let container = document.getElementById("thread-page-container");

    while (container.childElementCount > 2) {
        container.removeChild(container.firstChild);
    }
}

function threadMessageTemplate(message) {
    let div = document.createElement("div");
    div.setAttribute("class", "thread-page-content");

    let img = document.createElement("img");
    img.setAttribute("src", "http://localhost:5000/static/images/NoBelayLogo.png");
    img.setAttribute("alt", "Avatar");
    div.appendChild(img);

    let p = document.createElement("p");
    p.innerText = message[0] + ": " + message[3];
    div.appendChild(p);

    let span = document.createElement("span");
    span.innerText = message[2];
    div.appendChild(span);

    return div;
}

function insertThreadMessage(messages) {
    let container = document.getElementById("thread-page-container");
    let closeButton = document.getElementById("thread-close-btn");

    for (var i = 0; i < messages.length; i++) {
        let template = threadMessageTemplate(messages[i]);
        container.insertBefore(template, closeButton);
    }
}

function holdMessage2(){

}
function emptyThreadChatArea() {
    let threadMessageDiv = document.getElementById("thread-page-container");

    while (threadMessageDiv.childElementCount > 2) {
        threadMessageDiv.removeChild(threadMessageDiv.firstChild);
    }
}

function messageThread() {
    let channelName = document.getElementById("chat-page-title-name").innerText;
    let replyid = document.getElementById("thread-page-replyid").innerText;
    let message = document.getElementById("thread-page-send-text-area").value;

    $.ajax({
        async: true,
        type: "POST",
        url: "/api/sendthreadmessage",
        data: {
            "email": email,
            "channelName": channelName,
            "message": message,
            "replyid": replyid
        },
        success: function (status) {
            document.getElementById("thread-page-send-text-area").value = '';
            emptyThreadChatArea();
            loadMessageThread(replyid);
        }
    });
}