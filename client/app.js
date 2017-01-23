var app = angular.module('app', ['btford.socket-io']);

app.factory('gameSocket', function (socketFactory){
    var jongSocket = socketFactory();
    jongSocket.forward('game_start');
    jongSocket.forward('game_update');
    return jongSocket;
});

app.controller('testController', ['$scope', 'gameSocket', function($scope, gameSocket) {
    $scope.sit = function(position){
        console.log(gameSocket);
        gameSocket.emit('sit', position);
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
