var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , stdin = process.stdin

app.listen(8080);

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

  debugger;
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.on('SIGINT', function () {
    console.log('Got SIGINT.  Press Control-D to exit.');
  });

  process.stdin.on('data', function (chunk) {
    process.stdout.write('data: ' + chunk);
    socket.emit('news', { data: chunk });
  });

  process.stdin.on('end', function () {
    process.stdout.write('end');
  });
  
  socket.on('my other event', function (data) {
    console.log(data);
  });
});