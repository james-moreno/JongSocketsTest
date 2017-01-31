var webSocket = function(server){

    var game = require('./game.js');

    var ids = [0,1,2,3];
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
            game.players[idx].sortHand();
            handData = {
                hand : game.players[idx].hand,
                draw : game.players[idx].draw[0]
            };
            socket = clients[idx].socketID;
            io.to(socket).emit('sendTiles', handData);
        }
    };
    var turnUpdate = function(){
        var turn = {
            turn: game.turn
        };
        io.sockets.emit("turnUpdate", turn);
    };
    // var checkTurn = function(sid){
    //     for(var idx = 0; idx < clients.length; idx++){
    //         if(clients[idx].socketID == sid){
    //             var player = clients[idx].playerID;
    //             console.log('hi');
    //             return game.players[clients[idx].playerID].turn;
    //         }
    //         else{
    //             console.log('no');
    //         }
    //     }
    // };
    var discardUpdate = function(){
        var discards = {
            discards: game.discards,
            discarded: game.discarded
        };
        io.sockets.emit('discardUpdate', discards);
    };
    var canTake = function(player){
        if(player){
            io.to(clients[player].socketID).emit('canTake');
        }
    };

    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        var playerID = giveID(socket.id);
        socket.emit('giveID', playerID);
        game.addPlayer(playerID);
        io.sockets.emit('playersUpdate', clients.length);
        socket.on('startGame', function(data){
            socket.emit('gameStarting');
            game.startGame();
            sendTiles();
            turnUpdate();
        });
        socket.on('discardTile', function(data){
            var player = game.discard(data);
            canTake(player);
            discardUpdate();
            game.nextTurn();
            turnUpdate();
            sendTiles();
        });
        socket.on('pickup', function(data){
            game.pickup(data);
            sendTiles();
            discardUpdate();
        });
        // socket.on('checkTurn', function(){
        //     var check = checkTurn(socket.id);
        // });
    });
    return io;
};


module.exports = function(appServer) {
    return webSocket(appServer);
};
