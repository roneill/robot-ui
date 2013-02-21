var http = require("http");
var net = require("net");
var fs = require("fs");

/*
  The main entry point for the http server. All requests are routed through 
  this function.
  Endpoints:
  / - index.html
  /<filename> - filename
  /map - map file named map.txt
  /data - returns position data and IR points from the robot

  Client-side push is implemented HTTP long-polling. The server will not
  respond to a GET request at the /data endpoint unless the robot has
  sent new data. Conversely, if the robot sends data and there are no incoming
  requests, the data is simply discarded.
*/
var server = http.createServer(function(req, res) {
  var responseHandler = function(err, data, setHeaders) {
    if (err) {
      // There should be some granularity to this error message.
      // But for our purposes, it is ok.
      res.writeHead(500);
      return res.end("There was a problem on our end.");
    }

    try {
      if (setHeaders) {
        setHeaders(res);
      }
      res.writeHead(200);
      res.end(data);
    } catch(e) {
     console.log("Response hangup");
   }
 }

 var requestMapper = function(req, res, responseHandler) {
    if (req.url == "/") {
      fs.readFile(__dirname + '/index.html', responseHandler);
    } else if (req.url == "/data") {
      console.log("Received request for data");
      socketServer.once("connection", function(socket) {
        socket.setEncoding();
        socket.on("data", function(data) {
         console.log("Servicing request for data");
         responseHandler(false, data);
         socket.end();
        });
      });
    } else if (req.url == "/map") {
      readMap(responseHandler);
    }
    else {
     fs.readFile(__dirname + req.url, responseHandler);
   }
 }
  requestMapper(req, res, responseHandler);
});

/*
  The first line of the map file is parsed as the goal.
  The second line is parsed as the area bounds.
  The subsequent lines are parsed as the coordinates of obstacles.
  All input are assumed to be in meters.
  The client expects input in centimeters.
*/
var readMap = function(responseHandler) {
  fs.readFile(__dirname + "/map.txt", function(err, data) {
    var map = {"goal" : [], "arena" : [], "obstacles" : []}
    var lines = data.toString().split("\n");
    lines.forEach(function(line, i) {
      if (i === 0) {
        var normalized = line.replace(/\s+/g, " ");
        var goal = normalized.split(" ");
        if (goal.length < 2) {
          console.log("Invalid goal format.");
        } else {
          var goalMap = {
            "x" : parseFloat(goal[0]) * 100,
            "y" : parseFloat(goal[1]) * 100
          };
          map.goal = goalMap;
        }
      } else if (i === 1) {
        // we don't actually do anything with the arena coordinates.
        var normalized = line.replace(/\s+/g, " ");
        map.arena = normalized.split(" ");
      } else if (line) {
        var normalized = line.replace(/\s+/g, " ");
        var obstacle = normalized.split(" ");
        if (obstacle.length < 4) {
          console.log("Invalid obstacle format.")
        } else {
          var obstacleMap = {
            "x0" : parseFloat(obstacle[0]) * 100,
            "x1" : parseFloat(obstacle[1]) * 100,
            "y0" : parseFloat(obstacle[2]) * 100,
            "y1" : parseFloat(obstacle[3]) * 100
          }
        }
        map.obstacles.push(obstacleMap);
      }
    })
    responseHandler(false, JSON.stringify(map), function(r) {
      r.setHeader("Content-Type", "application/json");
    });
  });
};

var socketServer = net.createServer();

// This is the default connection event for listening to a socket
// We a way of closing a socket immediately if there are no clients
// listening for data.
socketServer.on("connection", function(socket) {
  var listeners = socketServer.listeners("connection");
  console.log("There were " + listeners.length + " event listeners.");
  if (listeners.length == 1) {
    console.log("Closing connection.");
    socket.end();
  }
});

server.listen(8080);
socketServer.listen(8083, "localhost");
