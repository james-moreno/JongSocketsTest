var app = angular.module('app', ['btford.socket-io']);

app.factory('gameSocket', function (socketFactory){
    var jongSocket = socketFactory();
    jongSocket.forward('giveID');
    jongSocket.forward('game_start');
    jongSocket.forward('gameStarting');
    jongSocket.forward('dealTiles');
    jongSocket.forward('discardUpdate');
    return jongSocket;
});

app.controller('testController', ['$scope', 'gameSocket', function($scope, gameSocket) {

//socket stuff
    $scope.$on('socket:giveID', function(event, data){
        $scope.playerID = data;
    });
    $scope.startGame = function(){
        gameSocket.emit('startGame');
    };
    $scope.$on('socket:dealTiles', function(event, data) {
        $scope.gameStarted = true;
        $scope.hand = data;
    });
    $scope.discard = function(index){
        var discardData = {
            tileIndex: index,
            playerID: $scope.playerID
        };
        gameSocket.emit('discardTile', discardData);
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
