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
    jongSocket.forward('canKong');
    jongSocket.forward('timerUpdate');
    jongSocket.forward('killTimer');
    jongSocket.forward('turnTimer');
    return jongSocket;
});

app.controller('testController', ['$scope', '$cookies', 'gameSocket',  function($scope, $cookies, gameSocket) {

//socket stuff
    var user_cookie = $cookies.get('jongCookie');
    gameSocket.emit('cookieData', user_cookie);
    $scope.yourTurn = false;
    $scope.canPick = false;
    $scope.kongable = false;
    $scope.pungable = false;
    $scope.eatable = false;
    $scope.gameStarted = false;
    $scope.timer = undefined;
    $scope.turnTimer = undefined;
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
        $scope.canPick = false;
        $scope.timer = undefined;
        $scope.pungable = false;
        $scope.eats = undefined;
        $scope.eatable = false;
        $scope.eatPressed = false;
    });

    $scope.gameFullNotStarted = function(players){
        if(players == 4 && $scope.gameStarted === false){
            return true;
        }
        return false;
    };
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

        if($scope.yourTurn && typeof(index) == 'object'){
            $scope.turnTimer = undefined;
            $scope.yourTurn = false;
            index.position = $scope.position;
            gameSocket.emit('discardTile', index);
        }
        else if($scope.yourTurn && typeof(index) == 'number'){
            $scope.turnTimer = undefined;
            $scope.yourTurn = false;
            var discardData = {
                tileIndex: index,
                position: $scope.position
            };
            gameSocket.emit('discardTile', discardData);
        }
    };
    $scope.$on('socket:discardUpdate', function(event, discards){
        $scope.discards = discards.discards;
        $scope.discarded = discards.discarded;
    });
    $scope.$on('socket:canKong', function(event){
        $scope.canPick = true;
        $scope.kongable = true;
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
        else {
            $scope.yourTurn = false;
        }
    });
    $scope.$on('socket:turnTimer', function(event, turnTime){
        $scope.turnTimer = turnTime;
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
        $scope.eats = undefined;
    };
    $scope.pickup = function(){
        var data = {
            position: $scope.position
        };
        gameSocket.emit('pickup', data);
        $scope.canPick = false;
        $scope.timer = undefined;
        $scope.pungable = false;
    };
    $scope.kongPickup = function(){
        var data = {
            position: $scope.position
        };
        gameSocket.emit('kongPickup', data);
        $scope.canPick = false;
        $scope.timer = undefined;
        $scope.kongable = false;
    };
    $scope.cancel = function (){
        gameSocket.emit('cancel', $scope.position);
        $scope.canPick = false;
        $scope.timer = undefined;
        $scope.pungable = false;
        $scope.eats = undefined;
        $scope.eatable = false;
        $scope.eatPressed = false;
    };
}]);
