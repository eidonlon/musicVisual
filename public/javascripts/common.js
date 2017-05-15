
$(".menu li").click(function(){
	$(".menu li").removeClass("menu-active");
	$(this).addClass("menu-active");
	getMusic($(this).attr("title"));
});


var xhr = new XMLHttpRequest();
var ac = new window.AudioContext();
var gainNode = ac[ac.createGain ? "createGain" :"createGainNode"]();
gainNode.connect(ac.destination);



var size = 128;
var analyser = ac.createAnalyser();
analyser.fftSize = size * 2;
analyser.connect(gainNode);


var source = null;
var count = 0;
function getMusic(name){
	var n = ++count;
	source && source[source.stop ? "stop" : "noteOff"]();
	xhr.abort();
	xhr.open("get","media/"+name);
	xhr.responseType = "arraybuffer";
	xhr.onload = function(){
		if(n != count){
			return;
		}else{
			ac.decodeAudioData(xhr.response,function(buffer){
				if( n != count){
					return;
				}else{
					var bufferSource = ac.createBufferSource();
					bufferSource.buffer = buffer;
					bufferSource.connect(analyser);
					bufferSource[bufferSource.start ? "start" : "noteOn"](0);
					source  = bufferSource;	
				}
				
			},function(err){
				console.log(err)
			})
		}
	};
	xhr.send();
}

function changeVolume(num){
	gainNode.gain.value = num * num;
}

$("#volume").change(function(){
	changeVolume($(this).val()/$(this).attr("max"));
})

function analysis(){
	var arr = new Uint8Array(analyser.frequencyBinCount);
	requestAnimationFrame = window.requestAnimationFrame;

	function a(){
		analyser.getByteFrequencyData(arr);
		draw(arr);
		requestAnimationFrame(a);
	}
	requestAnimationFrame(a);
}

analysis();	


var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
$(".content").html(canvas);



var height = $(".content").height();
var width = $(".content").width();
function resize(){
	canvas.height = height;
	canvas.width = width;
	var line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");

	ctx.fillStyle = line;
}

resize();

function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width / size;        //平均每个柱的宽度  size 要画的柱子的个数
	for(var i=0;i<size;i++){   //柱状图的个数
		var h = arr[i] / 256 * height;              //每个柱的高度       ？？？为什么这么算
		ctx.fillRect(w*i,height - h,w *0.6, h);     //w*i 表示第i个柱子的起始点的x坐标，height - h表示第i个柱子的起始点的y坐标，w*0.6表示柱子的宽度，h是高度
	}
}


$("#type li").click(function(){
	$("#type li").removeClass("select");
	$(this).addClass("select");
})