var app = angular.module('app', ['btford.socket-io']);

app.factory('gameSocket', function (socketFactory){
    var jongSocket = socketFactory();
    jongSocket.forward('giveID');
    jongSocket.forward('game_start');
    jongSocket.forward('sendTiles');
    jongSocket.forward('discardUpdate');
    jongSocket.forward('playersUpdate');
    jongSocket.forward('turnUpdate');
    jongSocket.forward('canTake');
    return jongSocket;
});

app.controller('testController', ['$scope', 'gameSocket', function($scope, gameSocket) {

//socket stuff
    $scope.yourTurn = false;
    $scope.canPick = false;
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
    });
    $scope.$on('socket:sendTiles', function(event, data) {
        $scope.gameStarted = true;
        $scope.hand = data;
    });
    $scope.discard = function(index){
        if($scope.yourTurn){
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
    $scope.$on('socket:canTake', function(event){
        $scope.canPick = true;
    });
    $scope.$on('socket:turnUpdate', function(event, data){
        if($scope.playerID == data.turn){
            $scope.yourTurn = true;
        }
    });
    $scope.pickup = function(){
        var data = {
            playerID: $scope.playerID
        };
        gameSocket.emit('pickup', data);
        $scope.canPick = false;
    };
}]);
