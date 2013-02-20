var http = require("http");
var net = require("net");
var fs = require("fs");

var requestHandler = function(req, res) {
  var responseHandler = function(err, data, setHeaders) {
    if (err) {
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
}

var readMap = function(responseHandler) {
  fs.readFile(__dirname + "/map.txt", function(err, data) {
    var map = {"goal" : null, "arena" : [], "obstacles" : []}
    var lines = data.toString().split("\n");
    lines.forEach(function(line, i) {
      if (i === 0) {
        var goal = line.split(" ");
        if (goal.length < 2) {
          console.log("Invalid obstacle format.");
        } else {
          var goalMap = {
            "x" : parseFloat(goal[0]),
            "y" : parseFloat(goal[1])
          };
          map.goal = goalMap;
        }
      } else if (i === 1) {
        map.arena = line.split(" ");
      } else if (line) {
        var obstacle = line.split(" ");
        if (obstacle.length < 4) {
          console.log("Invalid obstacle format.")
        } else {
          var obstacleMap = {
            "x0" : parseFloat(obstacle[0]),
            "x1" : parseFloat(obstacle[1]),
            "y0" : parseFloat(obstacle[2]),
            "y1" : parseFloat(obstacle[3]),
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

var server = http.createServer(requestHandler);
var socketServer = net.createServer();
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
