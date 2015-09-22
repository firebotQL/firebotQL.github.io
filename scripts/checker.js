var g_uDebugProblemListUrl = "http://www.udebug.com/api/UVa";
var g_uHuntProblemListUrl = "http://uhunt.felix-halim.net/api/p";
var g_uHuntNameToIdUrl = "http://uhunt.felix-halim.net/api/uname2uid/";
var g_uHuntUserProblemsByIdUrl = "http://uhunt.felix-halim.net/api/subs-user/";
var g_data = {};
var g_udata = {};

$(document).ready(function() {
    enableLoading();

    var uHuntDataLoaded = false;
    var uDebugDataLoaded = false;

    function enableCorrectTitle(enableExisting) {
        if (enableExisting) {
            $(".existingProblemTitle").show();
            $(".nonExistingProblemTitle").hide();
        } else {
            $(".nonExistingProblemTitle").show();
            $(".existingProblemTitle").hide();
        }
    };

    function isProblemACandNotInUDebug(element) {
        return element[2] == 90 && g_data[g_udata[element[1]]] == null;
    };

    function disableLoading() {
      $('.loading').hide();
      $('.check-button').attr("disabled", false);
      $('#username').attr("disabled", false);
    };

    function enableLoading() {
      $('.loading').show();
      $('.check-button').attr("disabled", true);
      $('#username').attr("disabled", true);
    }

    function checkForLoading() {
      if (!uHuntDataLoaded || !uDebugDataLoaded) {
        setTimeout(checkForLoading, 200);
      } else {
        disableLoading();
      }
    };

    $.getJSON(g_uDebugProblemListUrl, function(data) {
        for(var i = 0; i < data.length; i++) {
          var value = data[i];
          g_data[value] = data[i];
        }
        uDebugDataLoaded = true;
    });

    $.getJSON(g_uHuntProblemListUrl, function(data) {
        for(var i = 0; i < data.length; i++) {
          var value = data[i];
          g_udata[value[0]] = value[1];
        }
        uHuntDataLoaded = true;
    });

    $(".user-form").submit(function(event) {
        $('.loading-message').html("Checking solved problems. Please wait.");
        enableLoading();
        $.getJSON(g_uHuntNameToIdUrl + $("input").val(), function(userId) {
            if (userId != 0) {
                $(".nonExistingUser").hide();
                $(".problems-list").empty(); // clears our list

                $.getJSON(g_uHuntUserProblemsByIdUrl + userId, function(data) {
                    //console.log(g_udata);
                    var newData = data.subs.filter(isProblemACandNotInUDebug).map(function(e) {
                        return g_udata[e[1]];
                    });
                    var newData = newData.filter(function(value, index, self) {
                        return self.indexOf(value) === index;
                    }); // filters out duplicates
                    newData = newData.sort(function(a, b) {
                        return a - b
                    });
                    var items = newData.map(function(val, idx) {
                        return "<li id='" + idx + "'>" + val + "</li>";
                    });

                    enableCorrectTitle(newData.length > 0);

                    $("<ul/>", {
                        class: "my-new-list",
                        html: items.join("")
                    }).appendTo(".problems-list");
                    disableLoading();
                    $('.problems-result').show();
                });
            } else {
                $(".nonExistingUser").show();
                $('.problems-result').show();
            }
        });
        event.preventDefault();
    });

    checkForLoading();
});
