var webSocket = function(server){

    var game = require('./game.js');

    var ids = [1,2,3,4];
    var clients = [];

    var giveID = function(socketID){
        if(ids.length > 0){
            var id = ids.splice(0, 1);
            clients.push({
                playerID: id[0],
                socketID: socketID
            });
            return id[0];
        }
        else {
            return;
        }
    };
    var sendTiles = function(){
        var hand;
        for(var idx = 0; idx < clients.length; idx++){
            hand = game.players[idx].hand;
            socket = clients[idx].socketID;
            io.to(socket).emit('dealTiles', hand);
        }
    };

    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        var playerID = giveID(socket.id);
        socket.emit('giveID', playerID);
        game.addPlayer(playerID);
        socket.on('startGame', function(data){
            socket.emit('gameStarting');
            game.startGame();
            sendTiles();
        });
        socket.on('discardTile', function(data){
            game.discard(data);
            sendTiles();
            var discards = {
                discards: game.discards,
                discarded: game.discarded
            };
            console.log(discards);
            socket.emit('discardUpdate', discards);
        });
    });
    return io;
};



module.exports = function(appServer) {
    return webSocket(appServer);
};
