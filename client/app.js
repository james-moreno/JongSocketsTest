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
    return jongSocket;
});

app.controller('testController', ['$scope', '$cookies', 'gameSocket',  function($scope, $cookies, gameSocket) {

//socket stuff
    var user_cookie = $cookies.get('jongCookie');
    gameSocket.emit('cookieData', user_cookie);
    $scope.yourTurn = false;
    $scope.canPick = false;
    $scope.gameStarted = false;

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
        console.log($scope.players);
        console.log($scope.gameFullNotStarted($scope.players));
        $scope.gameFullNotStarted(data);
    });
    $scope.$on('socket:sendTiles', function(event, data) {
        $scope.gameStarted = true;
        $scope.hand = data.hand;
        $scope.draw = data.draw;
    });
    $scope.discard = function(index){
        if(typeof(index) == 'object'){
            index.playerID = $scope.position;
            gameSocket.emit('discardTile', index);
            $scope.yourTurn = false;
        }
        if($scope.yourTurn && typeof(index) == 'number'){
            var discardData = {
                tileIndex: index,
                playerID: $scope.playerID
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
    });
    $scope.$on('socket:canEat', function(event, eats){
        console.log(eats);
    });
    $scope.$on('socket:turnUpdate', function(event, data){
        if($scope.position == data.turn){
            $scope.yourTurn = true;
        }
    });
    $scope.pickup = function(){
        var data = {
            playerID: $scope.position
        };
        gameSocket.emit('pickup', data);
        $scope.canPick = false;
    };
}]);
