'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$location', 'Global', function ($scope, $location, Global) {
    $scope.global = Global;

    $scope.init = function() {
        // go to events by default
        $location.url('/events');
    };
}]);