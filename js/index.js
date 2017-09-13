var musicRender = function () {
    var $header = $('.header'),
        $main = $('.main'),
        $wrapper = $main.find('.wrapper'),
        $footer = $('.footer'),
        musicAudio = $('#musicAudio')[0],
        $musicBtn = $header.find('.musicBtn'),
        $curTime = $footer.find('.curTime'),
        $duration = $footer.find('.duration'),
        $current = $footer.find('.current');
    
    var $plan = $.Callbacks(),
        autoTimer = null,
        step = 0,
        curTop = 0;
    //发布一个计划
    
    $plan.add(function (lyric) {
        lyric = lyric.replace(/&#(\d+);/g,function (res,num) {
            //console.log(res, num);
            switch(parseFloat(num)){
                case 32:
                    res = ' ';
                    break;
                case 40:
                    res = '(';
                    break;
                case 41:
                    res = ')';
                    break;
                case 45:
                    res = '-';
                    break;
            }
            return res;
        });
        //console.log(lyric);
    });

    var ary=[],
        reg = /\[(\d+)&#58;(\d+)&#46;(?:\d+)\]([^&#]+)(?:&#10)?/g;
    $plan.add(function (lyric) {
       lyric.replace(reg,function (res,minute,second,value) {
          ary.push({
             minute:minute,
             second:second,
             value:value
          });
       });
       //console.log(ary);
        var str = ``;
        for (var i = 0; i < ary.length; i++) {
            var item = ary[i];
            str += `<p data-minute="${item.minute}" data-second="${item.second}">${item.value}</p>`;
        }
        $wrapper.html(str);
    });

    //音乐播放
    $plan.add(function () {
        musicAudio.play();
        musicAudio.addEventListener('canplay',function () {
            $musicBtn.css('display','block').addClass('move');

            computedCurrent();
            autoTimer=setInterval(computedCurrent,1000);
            //$duration.html(formatTime(musicAudio.duration));
        },false);
    });
    //控制音乐的暂停和播放
    $plan.add(function () {
        $musicBtn.tap(function () {
            if(musicAudio.paused){
                musicAudio.play();
                $musicBtn.addClass('move');
                autoTimer=setInterval(computedCurrent,1000);
                return;
            }
           musicAudio.pause();
           $musicBtn.removeClass('move');
           clearInterval(autoTimer);
        });
    });
    //计算当前的播放量
    function computedCurrent() {
        var curTime = musicAudio.currentTime,
            durTime = musicAudio.duration;
        if(curTime>=durTime){
            clearInterval(autoTimer);
            $duration.html(formatTime(durTime));
            $curTime.html(formatTime(curTime));
            $current.css('width','100%');
            musicAudio.removeClass('move');
            return;
        }
        $duration.html(formatTime(durTime));
        $curTime.html(formatTime(curTime));
        $current.css('width',curTime/durTime*100+'%');

        //歌词对应
        var ary = formatTime(curTime).split(':'),
            minute = ary[0],
            second = ary[1];
        var $lyric = $wrapper.find('p').filter('[data-minute="'+minute+'"]').filter('[data-second="'+second+'"]');
        if($lyric.length>0){
            if(!$lyric.hasClass('select')){
                $lyric.addClass('select').siblings().removeClass('select');
                step++;
                if(step>=4){
                    curTop-=.84;
                    $wrapper.css('top',curTop+'rem');
                }
            }
        }
    }


    //格式化时间
    function formatTime(time) {
        var minute = Math.floor(time/60),
            second = Math.ceil(time- minute*60);
        minute<10? minute = '0' + minute:minute;
        second<10? second = '0' + second:second;
        return minute+':'+second;
    }
    //计算MAIN区域的高度
    function computedMain() {
        var winH = document.documentElement.clientHeight,
            font = parseFloat(document.documentElement.style.fontSize);
        $main.css('width',winH - $header[0].offsetHeight - $footer[0].offsetHeight - font * 0.8);
    }
    return{
        init:function () {
            computedMain();
            $(window).on('resize',computedMain);
            
            //获取AJAX，然后把返回值作为参数传递给其它方法，进行后续操作
            $.ajax({
               url:'json/lyric.json',
               method:'GET',
               dataType:'json',
               cache:false,
               success:function (result) {
                   var lyric = result['lyric'];
                   $plan.fire(lyric);
               } 
            });
        }
    }
}();
musicRender.init();
