function $(s) {
	return document.querySelectorAll(s);
}

var lis = $("#list li");
var size = 128;
var box = $("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var Dots = [];
var line;
var types = $("#type li");
var mv = new MusicVisualizer({
	size:size,
	visualizer:draw
});
for(var i = 0; i < lis.length; i++){
	lis[i].onclick = function(){
		for(var j = 0; j < lis.length;j++){
			lis[j].className = "";
		}
		this.className = "selected";
		mv.play("/media/"+this.title,"#alltime","#time");
		$("#time")[0].style.display = "none";
	}
}

box.appendChild(canvas);
resize();
window.onresize=resize;

function random(m,n) {  //返回m到n之间的整数
	return Math.round(Math.random()*(n - m) + m);
}
function getDots(){
	Dots = [];
   for(var i = 0; i < size; i++){
       var x = random(0, width);
       var y = random(0, height);
       var color = "rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0)"; 

       Dots.push({
       	x:x,
       	y:y,
       	dx:random(1,4),
       	dx2:random(1,4),
       	color:color,
       	cap:0
       });
   }
}
function resize() {
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height = height;
	canvas.width = width;

	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"#CD96CD");
	line.addColorStop(0.5,"#C6E2FF");
	line.addColorStop(1,"#00BFFF");

	 getDots();
}

function draw(arr) {
	ctx.clearRect(0, 0, width, height);
	var w = width / size;  //size == arr.length
	var cw = w * 0.7;
	var capH = cw > 10 ? 10 : cw;
	ctx.fillStyle = line;
	for(var i = 0; i < size; i++){
		var o = Dots[i];
		if(draw.type === "column"){  
			var h = arr[i] / 256 * height; 
            ctx.fillRect(w * i, height - h,cw, h);
            ctx.fillRect(w * i, height - (o.cap+capH), cw, capH);
            o.cap--;
            if(o.cap < 0){
            	o.cap = 0;
            }
            if(h > 0 && o.cap < h + 40){
            	o.cap = h + 40 >  height - capH ?height - capH : h + 40;
            }
		}else if(draw.type === "dot"){  
			ctx.beginPath();   
        	var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10;
        	ctx.arc(o.x, o.y, r, 0, Math.PI*2, true);
        	var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
        	g.addColorStop(0,"#fff");
        	g.addColorStop(1,o.color);
        	ctx.fillStyle = g;
        	ctx.fill();
        	o.x += o.dx;
        	o.x = o.x > width ? 0 : o.x;
		}else if(draw.type === "line"){
			var baseH = height/2 - 100;
			var baseW = width/4;
			if(i == 0){
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.moveTo(0,baseH);
				ctx.lineTo(width,baseH);
				ctx.stroke();
				ctx.moveTo(width/2,baseH);

				var grd=ctx.createLinearGradient(0,baseH,0,height);
				grd.addColorStop(0,"rgba(10,112,216,.2)");
				grd.addColorStop(1,"rgba(8,8,8,.0)");

				ctx.fillStyle=grd;
				ctx.fillRect(0,baseH,width,height);
			}else{
				ctx.lineTo(width/2+i*cw,baseH-arr[i]);
				ctx.lineTo(width/2+i*cw,baseH+arr[i]);
				ctx.stroke();
				ctx.beginPath();
				
				ctx.lineTo(width/2-i*cw,baseH-arr[i]);
				ctx.lineTo(width/2-i*cw,baseH+arr[i]);
				ctx.stroke();
				ctx.beginPath();
				var lines = ctx.createLinearGradient(0,0,width,height);
				// var color = "rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",1)"; 
				lines.addColorStop(0,"red");
				// if(i % 2 == 0){
	   //      		lines.addColorStop(.5,color);
				// }else{
	   //      		lines.addColorStop(0.5,"#5dad4d");
				// }
				lines.addColorStop(1,"blue");
				ctx.strokeStyle = lines;
				ctx.stroke();
			}
		}
	}
}
draw.type = "column";

for(var i = 0; i< types.length; i++){
	types[i].onclick = function() {
		for(var j = 0; j < types.length; j++){
			types[j].className = "";
		}
		this.className = "select";
		draw.type = this.getAttribute("data-type");
	}
}

$("#volume")[0].onchange = function() {
	mv.changeValue(this.value/this.max);
}
$("#volume")[0].onchange();

$("#upload").onchange = function() {
	var file = this.files[0];
	var fr = new FileReader();

	fr.onload = function(e) {
		visualizer.play(e.target.resulr,"#alltime","#time");
	}
	fr.readAsArrayBuffer(file);
	$(".play")&& ($(".play").className = "");
}
Dots.dotMode = "random";

canvas.onclick = function() {
	if(draw.type == "dot"){
		for (var i = 0; i < Dots.length; i++) {
			Dots.dotMode == "random" ? Dots[i].dx = 0: Dots[i].dx = Dots[i].dx2;
	}
	Dots.dotMode = Dots.dotMode == "static"?"random":"static"; 
  }
}
function run(files){
    var blob = window.URL.createObjectURL(files[0]),
    	fileName = files[0].name;

		$("#locale-file")[0].innerHTML = "<li class='selected' title="+fileName+">"+fileName+"</li>";
    mv.play(blob,"#alltime","#time");
}
$("#online")[0].addEventListener("click",function(){
	var datas = mv.loadOnline("https://api.imjad.cn/cloudmusic/?id=185709",function(data){
		console.log(JSON.parse(data).data[0].url)
		// var url = JSON.parse(data).data[0].url;
		// var _url = url.split(":");
		// url = _url[0].substr(0,4) + ":" + _url[1];
		mv.play(JSON.parse(data).data[0].url,"#alltime","#time");
	});
})
