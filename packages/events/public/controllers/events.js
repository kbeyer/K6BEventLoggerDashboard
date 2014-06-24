'use strict';

/* global _, d3 */

angular.module('mean.events').controller('EventsController',
    ['$rootScope', '$scope', '$stateParams', '$location', 'Global', 'Events', 'EventChart', 'Socket',
    function ($rootScope, $scope, $stateParams, $location, Global, Events, EventChart, Socket) {

    $scope.global = Global;
    $scope.initialSeries = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    $scope.events = [];
    $rootScope.devices = [];

    // create base series objects
    var series = [];
    _.each($scope.initialSeries, function(t, index){
        series.push({
            data: [],
            name: t,
            id: t
        });
    });

    var intelliApply = function(fn){
        if (!$scope.$$phase){ fn(); }
        else{ fn(); }
    };

    var d3TooltipSelector = '.eventChartTooltip';
    var timeFormat = d3.time.format('%H:%M:%S.%L');
    var d3ChartDelegates = {
        mouseover: function(d){

            d3.select(this).classed({'mouseover':true});

            var leftPos = d3.event.pageX - 10;
            var endDt = new Date(d.end);
            var startDt = new Date(d.start);
            var duration = (endDt - startDt);
            d3.select(d3TooltipSelector)
                .html(
                    '<u>' + timeFormat(startDt) + ' [' + duration + 'ms]' +
                    '</u>'+
                    '<p>' + d.description + '</p>')
                .style('left', leftPos + 'px')
                .style('top', (d3.event.pageY + 5) + 'px')
                .transition().duration(300)
                .style('opacity', 0.8)
                .style('display', 'block');
        },
        mouseout: function(d){

            d3.select(this).classed({'mouseover':false});

            d3.select(d3TooltipSelector)
                .transition().duration(700).style('opacity', 0);
        },
        click: function(d){
            // update colors
            EventChart.select(d);
        }
    };

    $scope.find = function() {
        Events.query({
            limit: 25,
            sort: 'start'
        }, function(events) {

            $scope.events = events;

            EventChart.init('#eventChart', d3ChartDelegates);
            EventChart.refresh(events, d3ChartDelegates);

            $scope.devices = EventChart.devices;

            // bind to socket
            Socket.on('event', function (data) {
                console.log(data);
                intelliApply(function(){
                    $scope.events.push(data);
                    EventChart.refresh($scope.events, d3ChartDelegates);
                    $scope.devices = EventChart.devices;
                    EventChart.select(data);
                });
            });
        });
    };

}]);