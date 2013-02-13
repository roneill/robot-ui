var socket = io.connect('http://localhost:8080');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

var height = 1000;
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
  width: 20, height: 30, fill: 'blue', left: 500, top: 500
});

// "add" triangle onto canvas
canvas.add(triangle);

var toRadians = function(degrees) {
	return degrees * (Math.PI / 180);
};

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