var http = require("http");
var net = require("net");
var fs = require("fs");

var requestHandler = function(req, res) {
  var responseHandler = function(err, data) {
    if (err) {
      res.writeHead(500);
      return res.end("There was a problem on our end.");
    }

    res.writeHead(200);
    res.end(data);
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
    var map = {"goal" : [], "arena" : [], "obstacles" : []}
    var lines = data.toString().split("\n");
    lines.forEach(function(line, i) {
      if (i === 0) {
        map.goal = line.split(" ");
      } else if (i === 1) {
        map.arena = line.split(" ");
      } else if (line) {
        map.obstacles.push(line.split(" "));
      }
    })
    responseHandler(false, JSON.stringify(map));
  });
}

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
