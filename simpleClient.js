var net = require('net');

var data = {"angle" : 0, "left" : 500, "top" : 250};

var handler = function() {
  var client = net.connect({port: 8083}, function() {
    data.angle = data.angle + 5;
    data.left++;
    data.top--;
    client.write(JSON.stringify(data));
  });

  client.on('data', function(data) {
    client.end();
  });
}

setInterval(handler, 50);