var http = require("http");
var net = require("net");
var fs = require("fs");

var hr = false;

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
      socketServer.once("connection", function(socket) {
        socket.setEncoding();
        socket.on("data", function(data) {
          responseHandler(false, data);
          socket.end();
        });
      });
    }
     else {
      fs.readFile(__dirname + req.url, responseHandler);
    }
  }
  requestMapper(req, res, responseHandler);
}

var server = http.createServer(requestHandler);
var socketServer = net.createServer();
socketServer.on("connection", function(socket) {
  socket.end();
})
server.listen(8080);
socketServer.listen(8083, "localhost");
