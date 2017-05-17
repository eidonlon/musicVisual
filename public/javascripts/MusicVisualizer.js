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

MusicVisualizer.prototype.load = function(url,fun) {
	this.xhr.abort();
	this.xhr.open("GET",url);
	this.xhr.responseType = "arraybuffer";
	var self = this;
	this.xhr.onload = function() {
		fun(self.xhr.response);
	}
	this.xhr.send();
}
MusicVisualizer.prototype.decode = function(arraybuffer,fun) {
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer) {
		fun(buffer);
	},function(err) {
		console.log(err);
	});
}

MusicVisualizer.prototype.play = function (path){
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
    		var bs = 	MusicVisualizer.ac.createBufferSource();
	    	bs.connect(self.analyser);
	    	bs.buffer = buffer;
	    	bs[bs.start?"start":"noteOn"](0);
	    	self.source = bs;
	    	
	    	self.allTime = Math.floor( Math.floor(bs.buffer.duration)/60)  +  ":"+ (Math.floor(bs.buffer.duration)%60);
	    	self.cTime = MusicVisualizer.ac.currentTime;
	    	self.second = Math.floor(bs.buffer.duration);
            
    	    $("#time")[0].innerHTML = self.allTime;

       
               var timer = null;
               var a = $("#alltime")[0];
               a.max = self.second;

    	         setTimeout(function(){
    	         	 timer = setInterval(function(){

    	         	 	a.value = Number(a.value) + 1;
    	         	 	if($("#alltime")[0].value >= self.second || n !=self.count){
    	         	 		clearInterval(timer);
    	         	 		$("#alltime")[0].value = 0;
    	         	 	}
    	         	 },1000);
                   
    	          },self.cTime);
    	});
    	
    });

   
    }
}
MusicVisualizer.prototype.stop = function(){
	this.source[this.source.stop ? "stop" : "noteOff"](0);
}

MusicVisualizer.prototype.changeValue = function(percent){
	this.gainNode.gain.value = percent * percent;
}

MusicVisualizer.prototype.visualize = function() {
	var arr = new Uint8Array(this.analyser.frequencyBinCount);
	
	requestAnimationFrame = window.requestAnimationFrame||   //创建定时器，类似于setTimeout
	                        window.webkitRequestAnimationFrame||
	                        window.mozRequestAnimationFrame;
	var self = this;
	function v() {
        self.analyser.getByteFrequencyData(arr);
        // console.log(arr);
        self.visualizer(arr);        
        requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}
