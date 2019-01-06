//lib.js

PrizeWinnerNumMapping = {
    "prize1" : 1,
    "prize99" : 10
}

function getdbData () {
    $.ajax({
        url: "http://luckydraw.azurewebsites.net/getdbData",
        type: 'GET',
        async: false,
        cache: false,
        timeout: 30000,
        error: function(){
            console.log("error")
            return true;
        },
        success: function(msg){ 
            if (parseFloat(msg)){
                console.log("scueess:"+msg)
                return false;
            } else {
                console.log("scueess:"+msg)
                return true;
            }
        }
    });
    // return list
}

function randomList (list, num) {
    
}

function updateWinnerToDb () {
    $.ajax({
        url:"localhost:5000/getdbData",
        type: 'PUT',
        async: false,
        cache: false,
        timeout: 30000,
        error: function(){
            console.log("error")
            return true;
        },                
        success:function(data) {
            console.log("Getdata:"+data)
        }
    });
}

function reDrawWinner(orgWinnerList, winnerNum) {
    
}

function drawWinner (prizeName) {
    candidateList = getdbData();
    winnerNum = PrizeWinnerNumMapping[prizeName];
    winnerList = randomList(rawList, winnerNum);
    updateWinnerToDb(winnerList);    
    return winnerList;
}