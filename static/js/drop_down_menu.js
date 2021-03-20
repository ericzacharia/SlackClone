var changeUsername = document.getElementById("dropdown-changeUsername");
var changeEmail = document.getElementById("dropdown-changeEmail");

function dropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


$("#dropdown-content-change-username").click(function () {
  changeUsernamePage.style.display = "block";
  channelPage.style.display = "none";
});


$("#dropdown-content-change-email").click(function () {
  changeEmail.style.display = "block";
  channelPage.style.display = "none";
});

$("#change-username-btn").click(function () {
  username = $("#change-username").val();


  $.ajax({
    async: true,
    type: "POST",
    url: "/api/changeusername",
    data: {
      "email": email,
      "username": username
    },
    success: function (status) {
      let loadPage = new Promise((resolve, reject) => {
        channelPage.style.display = "block";
        changeUsernamePage.style.display = "none";
        window.setTimeout(
          function () {
            resolve("Success!");
          }, 500);
      })

      loadPage.then((successMessage) => {
        let welcomeUsername = document.getElementById("sidebar-welcome-username");
        welcomeUsername.innerText = "Username: " + username;

        let channelName = document.getElementById("chat-page-title-name").innerText;
        firstLoadMessage(channelName);
      });
    }
  });

});