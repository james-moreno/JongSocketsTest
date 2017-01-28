var app = angular.module('app', ['btford.socket-io']);

app.factory('gameSocket', function (socketFactory){
    var jongSocket = socketFactory();
    jongSocket.forward('giveID');
    jongSocket.forward('game_start');
    jongSocket.forward('gameStarting');
    jongSocket.forward('dealTiles');
    jongSocket.forward('discardUpdate');
    jongSocket.forward('playersUpdate');
    jongSocket.forward('check');
    return jongSocket;
});

app.controller('testController', ['$scope', 'gameSocket', function($scope, gameSocket) {

//socket stuff
    $scope.yourTurn = false;
    $scope.gameFull = function(){
        if($scope.gameStarted === true){
            return false;
        }
        else if($scope.players > 3){
            return true;
        }
        else{
            return false;
        }
    };
    $scope.$on('socket:yourTurn', function(event){
        $scope.yourTurn = true;
    });
    $scope.$on('socket:giveID', function(event, data){
        $scope.playerID = data;
    });
    $scope.startGame = function(){
        gameSocket.emit('startGame');
    };
    $scope.$on('socket:playersUpdate', function(event, data){
        $scope.players = data;
        // $scope.gameFull();
    });
    $scope.$on('socket:dealTiles', function(event, data) {
        $scope.gameStarted = true;
        $scope.hand = data;
    });
    $scope.discard = function(index){
        gameSocket.emit('checkTurn');
        $scope.$on('socket: check', function(event, check) {

        });
        if(true){
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
    $scope.pickup = function(){
        var data = {
            playerID: $scope.playerID
        };
        gameSocket.emit('pickup', data);
    };
}]);
