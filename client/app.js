var app = angular.module('app', ['ngCookies', 'btford.socket-io']);

app.factory('gameSocket', function (socketFactory){
    var jongSocket = socketFactory();
    jongSocket.forward('giveID');
    jongSocket.forward('game_start');
    jongSocket.forward('sendTiles');
    jongSocket.forward('discardUpdate');
    jongSocket.forward('playersUpdate');
    jongSocket.forward('turnUpdate');
    jongSocket.forward('canPung');
    jongSocket.forward('canEat');
    jongSocket.forward('timerUpdate');
    jongSocket.forward('killTimer');
    return jongSocket;
});

app.controller('testController', ['$scope', '$cookies', 'gameSocket',  function($scope, $cookies, gameSocket) {

//socket stuff
    var user_cookie = $cookies.get('jongCookie');
    gameSocket.emit('cookieData', user_cookie);
    $scope.yourTurn = false;
    $scope.canPick = false;
    $scope.pungable = false;
    $scope.eatable = false;
    $scope.gameStarted = false;
    $scope.timer = undefined;
    $scope.eatPressed = false;

    $scope.eatPress = function(){
        $scope.eatPressed = true;
    };

    $scope.$on('socket:timerUpdate', function(event, time){
        if($scope.eatable || $scope.pungable){
            $scope.timer = time;
        }
    });
    $scope.$on('socket:killTimer', function(event){
        $scope.timer = undefined;
    });

    $scope.gameFullNotStarted = function(players){
        if(players == 4 && $scope.gameStarted === false){
            return true;
        }
        return false;
    };

    $scope.$on('socket:yourTurn', function(event){
        $scope.yourTurn = true;
    });
    $scope.$on('socket:giveID', function(event, data){
        $scope.playerID = data.playerID;
        $scope.position = data.position;
        $cookies.put('jongCookie', $scope.playerID);
    });
    $scope.startGame = function(){
        gameSocket.emit('startGame');
    };
    $scope.$on('socket:playersUpdate', function(event, data){
        $scope.players = data;
        $scope.gameFullNotStarted(data);
    });
    $scope.$on('socket:sendTiles', function(event, data) {

        $scope.gameStarted = true;
        $scope.hand = data.hand;
        $scope.draw = data.draw;
        $scope.played = data.played;
    });
    $scope.discard = function(index){
        if(typeof(index) == 'object'){
            index.position = $scope.position;
            gameSocket.emit('discardTile', index);
            $scope.yourTurn = false;
        }
        if($scope.yourTurn && typeof(index) == 'number'){
            var discardData = {
                tileIndex: index,
                position: $scope.position
            };
            gameSocket.emit('discardTile', discardData);
            $scope.yourTurn = false;
        }
    };
    $scope.$on('socket:discardUpdate', function(event, discards){
        $scope.discards = discards.discards;
        $scope.discarded = discards.discarded;
    });
    $scope.$on('socket:canPung', function(event){
        $scope.canPick = true;
        $scope.pungable = true;
    });
    $scope.$on('socket:canEat', function(event, eats){
        $scope.canPick = true;
        $scope.eatable = true;
        $scope.eats = eats;
    });
    $scope.$on('socket:turnUpdate', function(event, data){
        if($scope.position == data.turn){
            $scope.yourTurn = true;
        }
    });
    $scope.eat = function(tiles){
        var eatData = {
            run: tiles,
            position: $scope.position
        };
        $scope.eatable = false;
        $scope.eatPressed = false;
        gameSocket.emit('eat', eatData);
        $scope.canPick = false;
    };
    $scope.pickup = function(tiles){
        var data = {
            position: $scope.position
        };
        gameSocket.emit('pickup', data);
        $scope.canPick = false;
        $scope.timer = undefined;
    };
}]);
