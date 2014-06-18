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

    var d3TooltipSelector = '.eventChartTooltip';
    var d3ChartDelegates = {
        mouseover: function(d){
            var updateTooltip = function(d){
                d3.select(d3TooltipSelector).html(
                    '<u>' + new Date(d.start) +
                    '</u>'+
                    '<p>' + d.description + '</p>');
            };
            updateTooltip(d);

            d3.select(this)
              .attr('opacity', 1);

            var leftPos = d3.event.pageX - 130;

            d3.select(d3TooltipSelector)
                .style('left', leftPos + 'px')
                .style('top', (d3.event.pageY + 5) + 'px')
                .transition().duration(300)
                .style('opacity', 1)
                .style('display', 'block');
        },
        mouseout: function(d){
            if (!d.selected) {
                d3.select(this)
                  .attr('opacity', 0.6);
            }

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
            sort: 'start'
        }, function(events) {

            $scope.events = events;


            EventChart.init('#eventChart', d3ChartDelegates);
            EventChart.refresh(events, d3ChartDelegates);

            // bind to socket
            Socket.on('event', function (data) {
                console.log(data);
                $scope.events.push(data);

                EventChart.refresh($scope.events, d3ChartDelegates);
            });
        });
    };

}]);