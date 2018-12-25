// 모듈을 추출합니다.
var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var ejs = require('ejs');
var fs = require('fs');

// 웹 서버를 생성합니다.
var app = express();
app.use(express.static('public'));

// 웹 서버를 실행합니다.
var server = http.createServer(app);
server.listen(52274, function () {
    console.log('server running at http://127.0.0.1:52274');
});

// 라우트를 수행합니다.
app.get('/', function (request, response) {
    fs.readFile('lobby.html', function (error, data) {
        response.send(data.toString());
    });
});

app.get('/canvas/:room', function (request, response) {
    fs.readFile('canvas.html', 'utf8', function (error, data) {
        response.send(ejs.render(data, {
            room: request.params.room
        }));
    });
});

app.get('/room', function (request, response) {
    var rooms = Object.keys(io.sockets.adapter.rooms).filter(function (item) {
        return item.indexOf('/') < 0;
    });
    response.send(rooms);
});

// 소켓 서버를 생성합니다.
var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
    var roomId = "";

    socket.on('join', function (data) {
        socket.join(data);
        roomId = data;
    });
    socket.on('draw', function (data) {
        io.sockets.in(roomId).emit('line', data);
    });
    socket.on('create_room', function (data) {
        io.sockets.emit('create_room', data.toString());
    });
    /*새로운 사용자 접속*/
    socket.on('newUser',function (name) {
        console.log(name + ' 님이 접속하였습니다');

        socket.name = name;

        io.sockets.emit('update',{type:'connect',name: 'SERVER',message: name + '님이 접속하였습니다.'});
    });
    /*전송한 메시지 받기*/
    socket.on('message',function (data) {
        data.name = socket.name;
        console.log(data);
        socket.broadcast.emit('update',data);
    });
    socket.on('disconnect',function () {
        console.log(socket.name + '님이 나가셨습니다.');

        socket.broadcast.emit('update',{type: 'disconnect', name: 'SERVER',message: socket.name + '님이 나가셨습니다.'});
    });

});

