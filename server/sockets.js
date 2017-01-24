var webSocket = function(server){

    var game = require('./game.js');

    var ids = [1,2,3,4];
    var giveID = function(){
        if(ids.length > 0){
            var id = ids.splice(0, 1);
            return id[0];
        }
        else {
            return;
        }
    };

    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        var player_id = giveID();
        socket.emit('giveID', player_id);
        socket.on('sit', function(player_data){
            game.sit(player_data);
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
