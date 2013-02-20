
var height = 500; // -2.5m to 2.5m y-axis
var width = 1000; // -5m to 5m x-axis

var world = {
  "canvas" : null,
  "robot" : null,
  "goal" : null
}

var renderLocalNavigation = function() {
  renderCanvas(height, width);
  renderRobot();
}

var renderGlobalNavigation = function(map) {
  var renderObstacle = function(obstacle) {
      var rectWidth = obstacle.x1;
      var rectHeight = obstacle.y1 - obstacle.y0;
    var rect = new fabric.Rect({
	left: (width / 2) + obstacle.x0 + (rectWidth / 2),
	top: ((height / 2) + (rectHeight / 2)) - obstacle.y0,
      strokeWidth: 1,
      stroke: 'black',
	fill: "#fff",
	width: rectWidth,
	height: rectHeight,
    });

    world.canvas.add(rect);
  }

  renderCanvas(height, width);
  renderRobot();

  $.ajax({
    "url": "/map",
    "success": function(map) {
      renderGoal(map.goal);

      map.obstacles.forEach(function(obstacle) {
        renderObstacle(obstacle);
      });
    },
    "error" : function() {},
    "datatype": "json"
  })

};

var renderGoal = function(goal) {
  var circle = new fabric.Circle({
    radius: 10, 
    fill: 'black', 
    left: goal.x + width / 2,
    top: height / 2 - goal.y
  });
  world.goal = circle;
  world.canvas.add(circle);
}

var renderCanvas = function(height, width) {
  var canvas = new fabric.StaticCanvas('frame');
  canvas.setHeight(height);
  canvas.setWidth(width);

  var xAxis = new fabric.Line([0, height / 2, width, height / 2], { stroke: 'black' })
  var yAxis = new fabric.Line([width / 2, 0, width / 2, height], { stroke: 'black' })

  canvas.add(xAxis)
  canvas.add(yAxis)

  world.canvas = canvas;
}

var renderRobot = function() {
  var robot = new fabric.Rect({
    left: width / 2,
    top: height / 2,
    fill: "blue",
    width: 20,
    height:20
  });

  world.canvas.add(robot);
  world.robot = robot;
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
          if (data.points) {
	      updateDataPoints(data.left, data.top, data.points);
	  }
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
  world.robot.setLeft(left + width / 2);
  world.robot.setTop(top + height / 2);
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

var receivedPointsIdx = 0;

var updateDataPoints = function(left, top, points) {
    for (receivedPointsIdx; receivedPointsIdx < points.length; receivedPointsIdx++) {
	var point = points[receivedPointsIdx];
	var circle = new fabric.Circle({
	    "radius": 1, 
	    "fill": 'black', 
	    "left": left + point, 
	    "top": top - top
	});
	world.canvas.add(circle);
    }
}

var updateEventLog = function() {
  
}

$("#localnav").click(function() {
  renderLocalNavigation();
  $("#localnav").addClass("active");
  $("#globalnav").removeClass("active");
});

$("#globalnav").click(function() {
  renderGlobalNavigation();
  $("#globalnav").addClass("active");
  $("#localnav").removeClass("active");
});

renderLocalNavigation();
