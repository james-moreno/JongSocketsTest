var webSocket = function(client){

    var game = require('./game.js');
    var sha1 = require('../node_modules/sha1');

    var ids = [0,1,2,3];
    var clients = [];
    var pickupActive = true;
    var wantsToEat;
    var cancel;

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
                played : game.players[idx].played,
                draw : game.players[idx].draw[0]
            };
            socket = clients[idx].socketID;
            io.to(socket).emit('sendTiles', handData);
        }
    };
    var turnUpdate = function(){
        console.log('updating turn')
        var turn = {
            turn: game.turn
        };
        io.sockets.emit("turnUpdate", turn);
    };
    var discardUpdate = function(){
        console.log('updating discards');
        var discards = {
            discards: game.discards,
            discarded: game.discarded
        };
        io.sockets.emit('discardUpdate', discards);
    };
    var discardMade = false;
    var turnTimerFunction = function(){
        var time = 5;
        console.log('timer started for player'+game.turn);
        var turnTimer = setInterval(function () {
            time --;
            io.to(clients[game.turn].socketID).emit('turnTimer', time);
            if(discardMade){
                console.log('discard made: ending timer');
                game.nextTurn();
                turnUpdate();
                sendTiles();
                clearInterval(turnTimer);
                discardMade = false;
            }
            else if(time === 0){
                console.log('timer ended');
                checkActions(game.outOfTime());
                turnUpdate();
                discardUpdate();
                clearInterval(turnTimer);
            }
        }, 1000);
    };
    var checkActions = function(actionData){
        console.log('checking actions');
        if(typeof(actionData.pung) == "number" || actionData.eats.length > 0){
            var eatable;
            var pungable;
            pickupActive = true;
            if(typeof(actionData.pung) == "number"){
                canPung(actionData.pung);
                pungable = true;
            }
            if(actionData.eats.length > 0){
                canEat(actionData.eats);
                eatable = true;
            }
            var eater = ((game.turn+1)%4);
            var timer = 15;
            var choiceTimer = setInterval(function () {
                timer--;
                if(pungable && cancel == actionData.pung){
                    pungable = false;
                    timer = 0;
                }
                if (pickupActive === false){
                    clearInterval(choiceTimer);
                }
                else {
                    if(eatable){
                        io.to(clients[eater].socketID).emit('timerUpdate', timer);
                    }
                    if(pungable){
                        io.to(clients[actionData.pung].socketID).emit('timerUpdate', timer);
                    }
                    if(!pungable && wantsToEat){
                        console.log('eating tile')
                        pickupActive = false;
                        clearInterval(choiceTimer);
                        game.pickup(wantsToEat);
                        sendTiles();
                        discardUpdate();
                        turnUpdate();
                        turnTimerFunction();
                        wantsToEat = undefined;
                        cancel = undefined;
                        io.sockets.emit('killTimer');
                    }
                    else if(timer === 0 && wantsToEat){
                        console.log('eating tile')
                        pickupActive = false;
                        clearInterval(choiceTimer);
                        game.pickup(wantsToEat);
                        sendTiles();
                        discardUpdate();
                        turnUpdate();
                        turnTimerFunction();
                        wantsToEat = undefined;
                        cancel = undefined;
                        io.sockets.emit('killTimer');
                    }
                    else if (timer === 0 || pungable && cancel == actionData.pung && eatable && cancel == eater || !pungable && cancel == eater) {
                        console.log('Timer finished or potential all actions cancelled');
                        pickupActive = false;
                        clearInterval(choiceTimer);
                        game.nextTurn();
                        turnUpdate();
                        turnTimerFunction();
                        sendTiles();
                        io.sockets.emit('killTimer');
                        cancel = undefined;
                    }
                }
            }, 1000);
        }
        else if(!discardMade){
            console.log('no actions to make')
            game.nextTurn();
            turnUpdate();
            turnTimerFunction();
            sendTiles();
        }
    };

    var canPung = function(player){
        if(typeof(player) == "number"){
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
            turnTimerFunction();
            turnUpdate();
        });
        socket.on('discardTile', function(data){
            discardMade = true;
            console.log("Player "+(game.turn)+" discarded");
            var actionData = game.discard(data);
            discardUpdate();
            checkActions(actionData);
        });
        socket.on('pickup', function(data){
            if(pickupActive){
                game.pickup(data);
                console.log("Player "+(game.turn)+" picked up a tile");
                sendTiles();
                discardUpdate();
                turnTimerFunction();
                turnUpdate();
                pickupActive = false;
                io.sockets.emit('killTimer');
            }
        });
        socket.on('eat', function(eatData){
            wantsToEat = eatData;
            socket.emit('killTimer');
        });
        socket.on('cancel', function(playerNumber){
            cancel = playerNumber;
            console.log(cancel);
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
