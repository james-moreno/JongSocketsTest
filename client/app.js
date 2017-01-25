var app = angular.module('app', ['btford.socket-io']);

app.factory('gameSocket', function (socketFactory){
    var jongSocket = socketFactory();
    jongSocket.forward('giveID');
    jongSocket.forward('game_start');
    jongSocket.forward('gameStarting');
    jongSocket.forward('dealTiles');
    return jongSocket;
});

app.controller('testController', ['$scope', 'gameSocket', function($scope, gameSocket) {

//socket stuff
    $scope.startGame = function(){
        gameSocket.emit('startGame');
    };
    $scope.$on('socket:giveID', function(event, data){
        $scope.playerID = data;
    });
    $scope.discard = function(index){
        var discardData = {
            tileIndex: index,
            playerID: $scope.playerID
        };
        gameSocket.emit('discardTile', discardData);
    };
    $scope.$on('socket:dealTiles', function(event, data) {
        $scope.gameStarted = true;
        $scope.hand = data;
    });
}]);
