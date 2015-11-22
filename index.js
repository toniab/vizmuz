var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var osc = require('node-osc');
var oscServer = new osc.Server(3333, '127.0.0.1');

app.use(express.static(__dirname + '/public'));

// oscServer.on("message", function (msg, rinfo) {
//   console.log(msg);
// });

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  oscServer.on("message", function (msg, rinfo) {
    console.log("TouchOSC message:");
    console.log(msg);

    socket.broadcast.emit('touch', msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});