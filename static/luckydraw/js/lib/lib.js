//lib.js

var AJAX_URL = "https://luckydraw.azurewebsites.net/luckydraw/data";
var rawData = [];
var candidates = [];
var winnerList = [];
var winnerPrizeArr = [];
var PrizeNumMapping = {
    "prize1" : 1,
    "prize2" : 10,
    "prize99" : 3
};

function getdbData () {
    rawData = [];
    $.ajax({
        url: AJAX_URL,
        type: 'GET',
        async: false,
        cache: false,
        timeout: 30000,
        error: function(){
            console.log("error");
            rawData = [];
        },
        success: function(msg){
            rawData = JSON.parse(msg);
            candidates = [];
            console.log("raw: " + rawData);
            for (const member of rawData) {
                console.log("member: " + member);
                var alias = member["alias"];
                console.log("add " + alias + " to candidate list");
                candidates.push(alias);
            }
        }
    });
}

function randomList (num) {
    var newCandidates = [];

    if (num > candidates.length) {
        console.log("Failed to random because candidates are too less");
        return ;
    }

    winnerList = getRandomArrayElements(candidates, num);
    // remove winners from candidates
    for (const cand of candidates) {
        if (winnerList.indexOf(cand) != -1) {
            continue;
        }
        newCandidates.push(cand);
    }
    candidates = newCandidates;
    console.log("random winnerList:" + winnerList);
}

function drawWinnerForPrize (prizeName) {
    var winnerNum = PrizeNumMapping[prizeName];

    randomList(winnerNum);
    if (winnerList.length == 0) {
        console.log("Failed to draw candidates/winner");
        console.log("winnerList: " + winnerList);
        return;
    }

    // bind winner and prize
    winnerPrizeArr = [];
    for (const winnerAlias of winnerList) {
        winnerPrizeArr.push({
            "alias" : winnerAlias,
            "isWinner" : prizeName
        });
    }
    console.log("drawWinnerForPrize:"+winnerPrizeArr);
}


function updateWinnerPrizeToDb () {
    var res = false;
    console.log("updateWinnerPrize2db:stringify="+JSON.stringify(winnerPrizeArr));
    $.ajax({
        url: AJAX_URL,
        type: "PUT",
        async: false,
        cache: false,
        data: JSON.stringify(winnerPrizeArr),
        contentType: "application/json",
        timeout: 30000,
        error: function(){
            console.log("Failed to update winner");
            res = false;
        },                
        success:function(data) {
            console.log("update success: " + data);
            res = true;
        }
    });
    return res;
}

function drawWinner (prizeName) {
    console.log("Start Drawing..");
    getdbData();
    if (rawData.length == 0 | candidates.length == 0) {
        console.log("Failed to get raw data: " + rawData);
        console.log("candidates: " + candidates);
        return;
    }
    console.log("Start drawWinnerForPrize..");

    drawWinnerForPrize(prizeName);
    console.log("Start updateRes..");

    var updateRes = updateWinnerPrizeToDb();
    if (updateRes == false) {
        console.log("Failed to update winner to db");
        return;
    }

    return winnerList;
}

function redrawWinner (prizeName, redrawAlias) {
    var absent = false;

    for (const winner of winnerPrizeArr) {
        if (winner["alias"] === redrawAlias) {
            winner["isWinner"] = "absent";
            absent = true;
            break;
        }
    }
    if (absent == false) {
        console.log("Failed to redraw a loser: " + redrawAlias);
        return;
    }
    
    randomList(1);
    if (winnerList.length != 1) {
        console.log("Failed to draw candidates/winner");
        console.log("winnerList: " + winnerList);
        return;
    }

    // push redrew winner to winnerPrizeArr
    winnerPrizeArr.push({
        "alias" : winnerList[0],
        "isWinner" : prizeName
    });

    var updateRes = updateWinnerPrizeToDb();
    if (updateRes == false) {
        console.log("Failed to update redraw winner to db");
        return;
    }
}

$(document).ready(function() {
    
    $('.slider_circle_10').EasySlides({
        'autoplay': false,
        'show': 3
    })

    $('#drawit').on('click', function(){
        console.log('draw it...');
        var classactive = $('.active');
        var pid = classactive.attr('pid');//works
        drawWinner(pid);
        // var activeproduct =  $('div.active').getAttribute('pid');
        console.log('drawit attr:%s',pid);
        // drawWinner()
    });

});

