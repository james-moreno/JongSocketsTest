var app = angular.module('app', ['btford.socket-io']);

app.factory('gameSocket', function (socketFactory){
    var jongSocket = socketFactory();
    jongSocket.forward('giveID');
    jongSocket.forward('game_start');
    jongSocket.forward('game_update');
    return jongSocket;
});

app.controller('testController', ['$scope', 'gameSocket', function($scope, gameSocket) {


    //socket stuff
    $scope.$on('socket:giveID', function(event, data){
        gameSocket.player_id = data;
        console.log(gameSocket.player_id);
    });
    $scope.sit = function(position){
        var player_info = {

        };
        gameSocket.emit('sit', player_info);
    };
    $scope.discard = function(index){
        gameSocket.emit('discard_tile', index);
    };
    $scope.$on('socket:game_start', function(event, data) {
        $scope.data = data;
    });
    $scope.$on('socket:game_update', function(event, data) {
        $scope.data = data;
    });
}]);
