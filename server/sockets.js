var webSocket = function(client){

    var game = require('./game.js');
    var sha1 = require('../node_modules/sha1');

    var ids = [0,1,2,3];
    var clients = [];

    var giveID = function(socketID){
        if(ids.length > 0){
            var id = ids.splice(0, 1);
            clients.push({
                position: id[0],
                playerID: sha1(socketID),
                socketID: socketID
            });
            return clients[id[0]];
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
    var canPung = function(player){
        if(player){
            io.to(clients[player].socketID).emit('canPung');
        }
    };
    var canEat = function(eats){
        if(game.turn == 3){
            io.to(clients[0].socketID).emit('canEat', eats);
        }
        else {
            io.to(clients[game.turn+1].socketID).emit('canEat', eats);
        }
    };
    var existingPlayer = function(cookie){
        for(var idx = 0; idx < clients.length; idx++){
            if(cookie == clients[idx].playerID){
                return idx;
            }
        }
        return false;
    };

    var checkCookie = function(cookie, socket){
        var exists = existingPlayer(cookie);
        console.log(exists);
        if(typeof(exists) == 'number') {
            clients[exists].socketID = socket.id;
            if(game.started){
                discardUpdate();
                turnUpdate();
                sendTiles();
            }
            socket.emit('playersUpdate', clients.length);
        }
        if(cookie === undefined || cookie === null){
            if(clients.length > 4){
                console.log('game is full');
            }
            else if(clients.length < 4){
                console.log('player joined');
                var player = giveID(socket.id);
                var playerInfo = {
                    position: player.position,
                    playerID: player.playerID
                };
                socket.emit('giveID', playerInfo);
                game.addPlayer(playerInfo.position);
                io.sockets.emit('playersUpdate', clients.length);
            }
        }
    };

    var io = require('socket.io').listen(client);

    io.sockets.on('connection', function (socket) {
        socket.on('cookieData', function(data){
            checkCookie(data, socket);
        });
        socket.on('startGame', function(data){
            socket.emit('gameStarting');
            game.startGame();
            sendTiles();
            turnUpdate();
        });
        socket.on('discardTile', function(data){
            var player = game.discard(data);
            canPung(player.pung);
            canEat(player.eats);
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
