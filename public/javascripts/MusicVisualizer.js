function MusicVisualizer(obj) {
	this.source = null;
	this.count = 0;
	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size;
	this.analyser.fftSize = this.size * 2;
	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();
    this.gainNode.connect(MusicVisualizer.ac.destination);
    this.analyser.connect(this.gainNode);
    this.xhr = new XMLHttpRequest();
    this.visualizer = obj.visualizer;
    this.visualize();
    
    this.allTime = 0;
    this.cTime = 0;
    this.second = 0;
}
MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext)();

MusicVisualizer.prototype = {
    constructor:MusicVisualizer,
    load:function(url,fun){
        this.xhr.abort();
        this.xhr.open("GET",url);
        this.xhr.responseType = "arraybuffer";
        var self = this;
        this.xhr.onload = function() {
            fun(self.xhr.response);
        }
        this.xhr.send();
    },
    loadOnline:function(url,fun){
        this.xhr.abort();
        this.xhr.open("GET",url);
        var self = this;
        this.xhr.onload = function() {
            fun(self.xhr.response);
        }
        this.xhr.send();
    },
    decode:function(arraybuffer,fun){
        MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer) {
            fun(buffer);
        },function(err) {
            console.log(err);
        });
    },
    play:function(path,timeLine,timeShow){
        var n = ++this.count;
        var self = this;
        this.source&& this.stop();
        if(path instanceof ArrayBuffer){
            self.decode(path,function() {
                self.source = this;
                MusicVisualizer.play(self);
            });
        }
        if(typeof(path) === "string"){
          this.load(path,function(arraybuffer) {
            if(n !=self.count)return;
            self.decode(arraybuffer, function(buffer) {
                if(n !=self.count)return;
                var bs =    MusicVisualizer.ac.createBufferSource();
                bs.connect(self.analyser);
                bs.buffer = buffer;
                bs[bs.start?"start":"noteOn"](0);

                self.source = bs;
                self.allTime = self.setTime(bs.buffer.duration);
                self.cTime = MusicVisualizer.ac.currentTime;
                self.second = Math.floor(bs.buffer.duration);
                self.vedioAllTime(timeLine,timeShow,self.allTime,self.second,self.count,self.cTime,n)
            });
        });
       }
    },
    stop:function(){
        this.source[this.source.stop ? "stop" : "noteOff"](0);
    },
    changeValue:function(percent){
        this.gainNode.gain.value = percent * percent;
    },
    visualize:function(){
        var arr = new Uint8Array(this.analyser.frequencyBinCount);
        requestAnimationFrame = window.requestAnimationFrame|| 
                                window.webkitRequestAnimationFrame||
                                window.mozRequestAnimationFrame;
        var self = this;
        function v() {
            self.analyser.getByteFrequencyData(arr);
            self.visualizer(arr);        
            requestAnimationFrame(v);
        }
        requestAnimationFrame(v);
    },
    vedioAllTime:function(timeLine,timeShow,allTime,second,count,cTime,n){
        var self = this;
           var i = 0;
           var a = $(timeLine)[0];
           a.max = second;
           a.value = 0;
           clearInterval(window.timer);

           $(timeShow)[0].innerHTML = allTime;
           $(timeShow)[0].style.display = "inline-block";
            window.timer = setInterval(function(){
                a.value = Number(a.value) + 1;
                if($(timeLine)[0].value >= second || n !=count){
                    clearInterval(timer);
                    $(timeLine)[0].value = 0;
                }
                $(timeShow)[0].innerHTML = self.setTime(Number(self.getSeconds(allTime) - a.value));
            },1000);
    },
    getSeconds:function(timestr){
        var secondLsit = timestr.split(":");
        return Number(secondLsit[0]*60) + Number(secondLsit[1]);
    },
    setTime:function(seconds){
        　var min = Math.floor( Math.floor(seconds)/60),
              sec = String(Math.floor(seconds)%60).length == 1 ? "0"+(Math.floor(seconds)%60) :　(Math.floor(seconds)%60);
       return  min+ ":"+ sec;
    }
}


