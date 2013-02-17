//var socket = io.connect('http://localhost:8080');

var height = 500;
var width = 1000;

  // create a wrapper around native canvas element (with id="frame")
var canvas = new fabric.StaticCanvas('frame');
canvas.setHeight(height);
canvas.setWidth(width);

var xAxis = new fabric.Line([0, height / 2, width, height / 2], { stroke: 'black' })
var yAxis = new fabric.Line([width / 2, 0, width / 2, height], { stroke: 'black' })

canvas.add(xAxis)
canvas.add(yAxis)

var triangle = new fabric.Triangle({
	width: 20, height: 30, fill: 'blue', left: width / 2, top: height / 2
});

// "add" triangle onto canvas
canvas.add(triangle);

var toRadians = function(degrees) {
	return degrees * (Math.PI / 180);
};

(function poll(){
    $.ajax({ 
    	"url": "http://localhost:8080/data", 
    	"success": function(data) {
    		console.log(data);
    		triangle.setAngle(data.angle);
    		triangle.setLeft(data.left);
    		triangle.setTop(data.top);
    		canvas.renderAll();
    	},
    	"error" : function(o, b, j) {
    	}, 
    	"dataType": "json", 
    	"complete": poll});
})();

/*
socket.on('news', function (data) {
	console.log(data);
	triangle.setAngle(data.angle);
	triangle.setLeft(data.left);
	triangle.setTop(data.top);
	canvas.renderAll();
});
*/


document.onkeydown = function(e) {
	if (e.keyCode === 37) {
		triangle.setAngle(triangle.angle - 1);
	} else if (e.keyCode === 38) {
		triangle.setLeft(triangle.left + Math.sin(toRadians(triangle.angle)));
		triangle.setTop(triangle.top - Math.cos(toRadians(triangle.angle)));
	} else if (e.keyCode === 39) {
		triangle.setAngle(triangle.angle + 1);
	} else if (e.keyCode === 40) {
		triangle.setLeft(triangle.left - Math.sin(toRadians(triangle.angle)));
		triangle.setTop(triangle.top + Math.cos(toRadians(triangle.angle)));
	}
	canvas.renderAll();
}