var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , redis = require("redis");

app.listen(8080);
client = redis.createClient()

function handler (req, res) {
  var error = function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  };

  if (req.url == "/") {
    fs.readFile(__dirname + '/index.html', error);
  } else {
    fs.readFile(__dirname + req.url, error);
  }
}

io.sockets.on('connection', function (socket) {
  client.on("subscribe", function (channel, count) {
    console.log("Subscribed to channel: " + channel);
  });

  client.on("message", function (channel, message) {
    console.log("client channel " + channel + ": " + message);
    socket.emit('news', JSON.parse(message));
  });
});

client.subscribe("position updates");