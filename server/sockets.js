var webSocket = function(server){

    var game = require('./game.js');

    var io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {
        console.log('player connected');
        console.log(socket.id)
        socket.on('sit', function(position){
            game.sit(position);
        });
        socket.emit('game_start', game);
        socket.on('discard_tile', function(data){
            game.players[0].discard(data);
            socket.emit('game_update', game);
        });
    });
    return io;
};



module.exports = function(appServer) {
    return webSocket(appServer);
};
