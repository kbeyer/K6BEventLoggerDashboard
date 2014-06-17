'use strict';

/* global _ */

angular.module('mean.events').controller('EventsController',
    ['$scope', '$stateParams', '$location', 'Global', 'Events', 'EventChart',
    function ($scope, $stateParams, $location, Global, Events, EventChart) {

    $scope.global = Global;

    $scope.initialSources = ['SessionController', 'ViewController'];

    // create base series objects
    var series = [];
    _.each($scope.initialSources, function(t){
        series.push({
            data: [],
            name: t,
            id: t.toLowerCase()
        });
    });

    $scope.find = function() {
        Events.query({
        }, function(events) {

            // add placeholder for counts
            _.each(events, function(e){
                console.log(e);
            });

            $scope.events = events;

            var chart = EventChart.setup('#eventChart', series, {});
            chart.hideLoading();

            //var shift = series.data.length > 20; // shift if the series is 
                                                 // longer than 20

            // add the point
            chart.series[0].addPoint([30, 100], true, false);

            //
            // TODO: add socket bindings
            //

            
        });
    };

}]);