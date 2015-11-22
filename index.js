var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var osc = require('node-osc');
var oscServer = new osc.Server(3333, '127.0.0.1');

app.use(express.static(__dirname + '/public'));

/*oscServer.on("message", function (msg, rinfo) {
  console.log(msg);
});*/

io.on('connection', function(socket){

  // var x = 0;
  // setInterval (function () {
  //   x += 0.01;
  //   // console.log(Math.sin(x)+1);
  //   socket.emit('dial', { 'dial': Math.sin(x)+1 });
  // }, 10);

  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  oscServer.on("message", function (msg, rinfo) {
    console.log("TouchOSC message:");
    console.log(msg);

    if (msg[0].startsWith('/1/push')) {
      var val = msg[0].substr(-1);
      if (msg[1] == 1) {
        socket.emit('push', { 'button': val });
      } else if (msg[1] == 0 && val == 5) {
        socket.emit('stop', { 'button': val });
      }
    } else if (msg[0].startsWith('/1/slider')) {
      socket.emit('slider', { 'slider': msg[1] });
    } else if (msg[0].startsWith('/1/dial')) {
      socket.emit('dial', { 'dial': msg[1] });
    }
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});