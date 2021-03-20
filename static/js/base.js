var signupPage = document.getElementById("signup-page");
var changeUsernamePage = document.getElementById("change-username-page");
var loginPage = document.getElementById("login-page");
var forgetPasswordPage = document.getElementById("forget-password-page");
var channelPage = document.getElementById("channel-page");
var changePasswordPage = document.getElementById("change-password-page");


let pathname = window.location.pathname;
console.log("pathname: ", pathname);

if (pathname == "/") {
    loginPage.style.display = "block";
} else {
    window.history.pushState(null, null, url="/");
    loginPage.style.display = "none";
    changePasswordPage.style.display = "block";
}


$("#login-login-btn").click(function() {
    email = $("#login-login-email").val();
    let password = $("#login-login-password").val();

    $.ajax({
        async: true,
        type: "POST",
        url: "/api/login",
        data: {
            "email": email,
            "password": password
        },
        success: function(repsonse) {
            if (repsonse['data'] == null) {
                alert("Unable to login");
            } else {
                document.cookie = "cookie=" + repsonse['token'];

                loginPage.style.display = "none";
                let loadPage = new Promise((resolve, reject) => {
                    channelPage.style.display = "block";
                    getSidebarChannel();
                    window.setTimeout(
                        function() {
                            resolve(repsonse);
                        }, 2000);
                })

                loadPage.then((repsonse) => {
                    let welcomeUsername = document.getElementById("sidebar-welcome-username");
                    welcomeUsername.innerText = "Welcome, " + repsonse['data'][0][1] + "!";
                    let welcomeEmail = document.getElementById("sidebar-welcome-email");
                    welcomeEmail.innerText = "Email: " + email;

                    let channelName = document.getElementById("chat-page-title-name").innerText;
                    firstLoadMessage(channelName);
                });
            }
        }
    });
});

$("#login-signup").click(function() {
    loginPage.style.display = "none";
    signupPage.style.display = "block";
});

$("#login-forget-password").click(function() {
    loginPage.style.display = "none";
    forgetPasswordPage.style.display = "block";
});



$("#login-signup-btn").click(function() {
    email = $("#login-signup-email").val();
    username = $("#login-signup-username").val();
    let password = $("#login-signup-password").val();
    let passwordAgain = $("#login-signup-password-again").val();

    if (password != passwordAgain) {
        alert("The passwords don't match!");
        return;
    }
    $.ajax({
        async: true,
        type: "POST",
        url: "/api/signup",
        data: {
            "email": email,
            "username": username,
            "password": password
        },
        success: function(status) {
            let loadPage = new Promise((resolve, reject) => {
                signupPage.style.display = "none";
                loginPage.style.display = "block";
                window.setTimeout(
                    function() {
                        resolve("Success!");
                    }, 500);
            })

            loadPage.then((successMessage) => {
                alert(status);
            });
        }
    });
});


$("#forget-password-btn").click(function() {
    console.log("the user forget the password and send link to the user");
    email = $("#forget-password-email").val();

    $.ajax({
        async: true,
        type: "POST",
        url: "/api/forgetpassword",
        data: {
            "email": email
        },
        success: function(status) {
            let loadPage = new Promise((resolve, reject) => {
                forgetPasswordPage.style.display = "none";
                loginPage.style.display = "block";
                window.setTimeout(
                    function() {
                        resolve("Success!");
                    }, 500);
            })

            loadPage.then((successMessage) => {
                alert(status);
            });
        }
    });
});


$("#change-password-btn").click(function() {
    console.log("the user change the password");
    email = $("#change-password-email").val();
    let password = $("#change-password-password").val();
    let passwordAgain = $("#change-password-password-again").val();

    if (password != passwordAgain) {
        alert("The passwords don't match!");
        return;
    }
    console.log(email, password);

    $.ajax({
        async: true,
        type: "POST",
        url: "/api/changepassword",
        data: {
            "email": email,
            "password": password
        },
        success: function(status) {
            let loadPage = new Promise((resolve, reject) => {
                changePasswordPage.style.display = "none";
                loginPage.style.display = "block";
                window.setTimeout(
                    function() {
                        resolve("Success!");
                    }, 500);
            })

            loadPage.then((successMessage) => {
                alert(status);
            });
        }
    });
});
