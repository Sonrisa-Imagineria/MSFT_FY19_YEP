//lib.js
var AJAX_URL = "https://luckydraw.azurewebsites.net/luckydraw/data";
var rawData = [];
var candidates = [];
var winnerList = [];
var winnerPrizeArr = [];
var PrizeNumMapping = {
    "prize11" : 10,
    "prize12" : 10,
    "prize13" : 5,
    "prize14" : 6,
    "prize15" : 2,
    "prize21" : 10,
    "prize22" : 10,
    "prize23" : 10,
    "prize24" : 10,
    "prize25" : 5,
    "prize31" : 10,
    "prize32" : 10,
    "prize33" : 6,
    "prize34" : 2,
    "prize35" : 2,
    "prize36" : 10,
    "prize37" : 5,
    "prize41" : 10,
    "prize42" : 10,
    "prize43" : 5,
    "prize44" : 2,
    "prize45" : 2,
    "prize46" : 1,
    "prize47" : 5,
    "prize48" : 5,
    "prize49" : 1,
    "prizea1" : 10,
    "prizea2" : 1
};
var NameCardRecord = {}; 
// NameCardRecord used to record name card of drawn prizes
// format:
// {
//   'prizeName' : [{
//       'name': 'aaa',
//       'alias' : 'bbb',
//       'department' : 'dept'
//   }]
// }
var timer;
var allPerson = "蔡国瑜;曹正一;曾隆海;曾耀衡;陈观斌;陈军;陈军俊;陈倩雯;陈毓新;崔惠海;戴锦霞;段斌;樊清华;方林;符运琼;付坤;付文静;付园园;龚小龙;古冬苗;古举标;官鑫;何若兵;洪俊凯;侯斌;侯莉;胡军;胡伟澎;胡晓;黄欢茂;黄玲;黄星心;黄泽辉;黄志博;蒋明;金矿;赖礼通;赖婷婷;兰方权;李成国;李国庆;李吉庆;李兰兰;李良;李鹏程;李胜康;李涛;李未波;李咸良;李小红;李鑫;李焱;梁家寶;林珊珊;林伟俊;刘婧娟;刘玫;刘权;刘小燕;刘新星;刘曜玮;刘奕;卢丽花;罗宇峰;吕春杰;苗继业;莫忧;南良改;潘志健;彭海锋;彭科达;彭钟涛;乔新;石浩;宋超;宋浩;苏鸿;谭秀梅;田冰;田晶;田力玮;汪鑫;王刚正;王晶;王立伟;王石林;王政阳;韦振勇;吴海荣;吴家胜;吴俊;吴晏琳;向真明;徐良;许海芬;闫海燕;杨广霞;杨力平;杨涛;杨志明;叶辰;叶华浩;殷雪;张丹丹;张华宁;张辉武;张娟;张敏;张清云;张勇;张志强;郑大鹏;周萍;朱然威;李铎;崔丽洁;吴耀红;温先木;李奕邦;郭学端;李伟;刘玉灼;周成威;盛子凡;刘佳;刘宇航;曾冬资;王巍;张晶;邱东;陈龙;郑威;刘伟雄;叶丽娟;谭剑颖;丁鹏;李江洲;姜萌萌;彭华婴;李德林;黎宇;叶强;师新会;冯绍文;林海强;潘冰冰;彭见峡;卢军良;江山;王义;甘伊璇;刘倩;龚京栋;闵冬;张宜羡;徐龙瑞;邹中兴;廖华衡;胡斌;周孝雄;时攀;苏路凯;李丽冲;彭启;曹安琥;廖宜源;黄荣发;严小锋;郭春艳";
var remainPerson = allPerson.toString().split(";");

function getMember (alias) {
    for (var i = 0; i < rawData.length; i++) {
        if (rawData[i]['alias'] === alias) {
            return rawData[i];
        }
    }
}

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
        type: 'PUT',
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
    //finish drawing..
    var updateRes = updateWinnerPrizeToDb();
    if (updateRes == false) {
        console.log("Failed to update winner to db");
        return;
    }
    
    // finish updating winners to name cards
    for(var i = 0; i < winnerList.length; i++) {
        var winner = getMember(winnerList[i]);
        var cardNum = i + 1;
        $('#winner' + cardNum + ' .card-title').text(winner['name']);
        $('#winner' + cardNum + ' .card-subtitle').text(winner['alias']);
        $('#winner' + cardNum + ' .card-text').text(winner['department']);
        // updateWinnerPrize2db:stringify=[{"alias":"yvshih","isWinner":"prize1"}]
    }
    //是否先讓div預設為hide？

    return winnerList;
}

function redrawWinner (prizeName, cardId) {
    console.log('in redrqwWinner function prize='+prizeName+'....cardid='+cardId);
    var absent = false;
    var redrawAlias = $('#' + cardId + ' .card-subtitle').text();
    
    for (const winner of winnerPrizeArr) {
        if (winner["alias"] === redrawAlias) {
            console.log('winner[alias]='+winner["alias"]+"...redrawalias="+redrawAlias);
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

    // finish updating re-drawn winner to the name card
    var winner = getMember(winnerList[0]);
    $('#' + cardId + ' .card-title').text(winner['name']);
    $('#' + cardId + ' .card-subtitle').text(winner['alias']);
    $('#' + cardId + ' .card-text').text(winner['department']);
}

function randomName(){
    console.log("randomName......");
    var $showName = $("#showName"); //显示内容的input的ID
    var interTime = 30;//设置间隔时间
    timer = setInterval(function () {
        var i = GetRandomNum(0, candidates.length);
        $showName.val(candidates[i]);//输入框赋值
    }, interTime);
}

$(document).ready(function() {
    $('.slider_circle_10').EasySlides({
        'autoplay': false,
        'show': 3,
        'beforeshow': function() {
            // reset everything before rotating to next prize
            var prizeName = $('.active').attr('pid'); // get current prize name

            // keep current winners and clear name cards
            for(var i = 0; i < 10; i++) {
                var cardNum = i + 1;
                // keep current winner name cards
                if (cardNum <= winnerList.length) {
                    var nameCard = {
                        'name' : $('#winner' + cardNum + ' .card-title').text(),
                        'alias' : $('#winner' + cardNum + ' .card-subtitle').text(),
                        'department' : $('#winner' + cardNum + ' .card-text').text()
                    };
                    NameCardRecord[prizeName] = nameCard;
                };
                // clear name cards
                $('#winner' + cardNum + ' .card-title').text('');
                $('#winner' + cardNum + ' .card-subtitle').text('');
                $('#winner' + cardNum + ' .card-text').text('');
                $('#winner' + cardNum).parent('.card').fadeOut();
            }
        },
        'aftershow': function() {
            var prizeName = $('.active').attr('pid'); // get current prize name
            winnerList = [];
            winnerPrizeArr = [];
            
            $('.selected').removeClass('selected');
            $('img.card-img-top').attr("src", "/static/images/white.jpg");
            if (!NameCardRecord[prizeName]) {
                $('.lucky-card').hide();
                $('.draw-panel').show();
                $("#redrawit").hide();
                $("#showName").show();
                $('#drawit').show();
            } else {
                // show drawn winners on name cards
                $('.draw-panel').hide();
                $('.card').hide();
                $('.lucky-card').show();
                var winnerInfo = NameCardRecord[prizeName];
                for(var i = 0; i < winnerInfo.length; i++) {
                    var winner = winnerInfo[i];
                    var cardNum = i + 1;
                    $('#winner' + cardNum + ' .card-title').text(winner['name']);
                    $('#winner' + cardNum + ' .card-subtitle').text(winner['alias']);
                    $('#winner' + cardNum + ' .card-text').text(winner['department']);
                    $('#winner' + cardNum).parent('.card').fadeIn(1000);
                }
            }
        }
    });

    $('#drawit').on('click', function(){
        var classactive = $('.active');
        var pid = classactive.attr('pid');//works
        
        $("#showName").show();
        drawWinner(pid);
        console.log('drawit attr:%s',pid);
        $("#luckyDrawing").show();
        //should be hidden
        randomName();
        setTimeout(function(){
            clearInterval(timer);
            $("#showName").hide();
            $('.draw-panel').hide();
            // show name cards
            $('.card').hide();
            $('.lucky-card').show();
            for(var i = 0; i < winnerList.length; i++) {
                $('#winner' + (i+1)).parent('.card').fadeIn(1000);
            }
        }, 3000);
        console.log('draw it...');
    });

    $('#redrawit').on('click', function(){
        console.log('in to #redrawit but.....');
        randomName();
        $("#showName").show();
        setTimeout(function(){
            clearInterval(timer);
            $("#showName").hide();
            $('.selected').each(function(){
                var prizeId = $('.active').attr('pid');
                var cardId = $(this).attr('id');
                redrawWinner(prizeId, cardId);
                console.log('in to redrawWinner .....');
                // clear seleted and remove img
                $(this).removeClass('selected');
                $(this).prev('img.card-img-top').attr("src", "/static/images/white.jpg");
            });
            $('.draw-panel').hide();
        }, 3000);
    });

    $('#drawit_add').on('click', function(){
        var classactive = $('.active');
        var pid = classactive.attr('pid');//works
        classactive.attr('style','background-image:"background-image: url(/static/images/10000.jpg);')

        $("#showName").show();
        drawWinner(pid);
        console.log('drawit attr:%s',pid);
        $("#luckyDrawing").show();
        //should be hidden
        randomName();
        setTimeout(function(){
            clearInterval(timer);
            $("#showName").hide();
            $('.draw-panel').hide();
            // show name cards
            $('.card').hide();
            $('.lucky-card').show();
            for(var i = 0; i < winnerList.length; i++) {
                $('#winner' + (i+1)).parent('.card').fadeIn(1000);
            }
        }, 3000);
        console.log('draw it...');
    });
    //test card
    $(".card-img-overlay").on('click', function(){
        //do something
        console.log(' $.card-img-overlay).click(function(){:');
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            $(this).prev('img.card-img-top').attr("src", "/static/images/white.jpg");
            if ($('.selected').length == 0) {
                $('.draw-panel').hide();
            }
        } else {
            $(this).addClass('selected');
            $(this).prev('img.card-img-top').attr("src", "/static/images/absent.jpg");
            $('.draw-panel').show();
            $("#showName").show();
            $('#drawit').hide();
            $("#redrawit").show();
        }
    });

});

