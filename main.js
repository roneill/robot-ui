
var world = {
  "canvas" : null,
  "robot" : null,
  "goal" : null
}

var renderDashboard = function() {
  var navigation = $("#navigation");

  if (navigation) {
    renderLocalNavigation();
    renderDataPoints();
    renderEventLog();
  } else {
    $.ajax({
      "url": "http://localhost:8080/map",
      "success": function(map) {
        renderGlobalNavigation(map);
        renderDataPoints();
        renderEventLog();
      },
      "error" : function(o, b, j) {
      }, 
      "dataType": "json", 
      "complete": poll
    });
  }
}

var renderDataPoints = function() {

}

var renderEventLog = function() {

}

var renderLocalNavigation = function() {
  var height = 500; // -2.5m to 2.5m y-axis
  var width = 500; // -2.5m to 2.5m x-axis

  renderCanvas(height, width);

  var xAxis = new fabric.Line([0, height / 2, width, height / 2], { stroke: 'black' })
  var yAxis = new fabric.Line([width / 2, 0, width / 2, height], { stroke: 'black' })

  world.canvas.add(xAxis)
  world.canvas.add(yAxis)

    world.robot = new fabric.Rect({
	left: width / 2,
	top: height / 2,
	fill: "blue",
	width: 20,
	height:20
    });

  world.canvas.add(world.robot);
}

var renderGlobalNavigation = function(map) {
  var renderObstacle = function(obstacle) {
    var rect = new fabric.Rect({
      left: (width / 2) + obstacle.x0,
      top: (height / 2) + obstacle.y0,
      strokeWidth: 1,
      stroke: 'black',
      width: obstacle.x1 - obstacle.x0,
      height: obstacle.y1 - obstacle.y0,
    });

    world.canvas.add(rect);
  }

  var height = map.arena.height;
  var width = map.arena.width;

  renderCanvas(height, width);

  map.obstacles.forEach(function(obstacle) {
    renderObstacle(obstacle);
  })
}

var renderCanvas = function(height, width) {
  var canvas = new fabric.StaticCanvas('frame');
  canvas.setHeight(height);
  canvas.setWidth(width);

  world.canvas = canvas;
}

var toRadians = function(degrees) {
  return degrees * (Math.PI / 180);
};

(function poll(){
    $.ajax({
      "url": "/data",
      "success": function(data) {
        console.log(data);
        updateRobotPosition(data.angle, data.left, data.top);
        //updateGoalPosition(data.goal);
        //updateDataPoints(data.points);
        //updateEventLog(data.events);
        world.canvas.renderAll();
      },
      "error" : function(o, b, j) {
      }, 
      "dataType": "json", 
	"complete": function(jqxhr, status) {
	    if (status == "error") {
		setTimeout(poll, 1000);
	    } else {
		poll();
	    }
	}});
})();

var updateRobotPosition = function(angle, left, top) {
  world.robot.setAngle(angle);
  world.robot.setLeft(left + 250);
  world.robot.setTop(top + 250);
};

var updateGoalPosition = function(goal) {
  if (!world.goal) {
    var circle = new fabric.Circle({
      radius: 10, fill: 'black', left: goal.left, top: goal.top
    });
    world.goal = circle;
    world.canvas.add(circle);
  }
}

var updateDataPoints = function() {

}

var updateEventLog = function() {
  
}

renderLocalNavigation();

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