'use strict';

/* global _ */

angular.module('mean.events').controller('EventsController',
    ['$scope', '$stateParams', '$location', 'Global', 'Events', 'EventChart', 'Socket',
    function ($scope, $stateParams, $location, Global, Events, EventChart, Socket) {

    $scope.global = Global;
    $scope.initialSeries = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    $scope.events = [];

    // create base series objects
    var series = [];
    var dtNow = new Date();
    _.each($scope.initialSeries, function(t, index){
        series.push({
            data: [{
                id: 'now',
                x: dtNow,
                y: Math.random()*10
            }],
            name: t,
            id: t
        });
    });

    var chartDelegates = {
        tooltipFormatter: function(pt) {
            var header = '';
            
            var evt = _.find($scope.events, function(e){ return e._id === pt.point.id; });

            var contentLabel = '<p style="font-style:italic;">WARNING: Event not found.</p><br/>';
            var footer = '';
            var timeLabel = '';

            // require an element to print content
            if (evt) {
                var content = evt.description.substr(0,140);
                if (evt.description.length > 140) { content += '..'; }
                contentLabel = '<span style="font-style:italic;"><span>' + content.replace('\n', '<br/>') + '</span></span><br/>';
                footer = '<div style="font-size: 10px">' + evt.source + '</div>';
                footer += '<div style="font-size: 10px">[#' + evt.tags.join(', #') + ']</div>';
                
            }

            return header + timeLabel + contentLabel + footer;
        }
    };

    $scope.find = function() {
        Events.query({
        }, function(events) {

            $scope.events = events;

            //var shift = series.data.length > 20; // shift if the series is 
                                                 // longer than 20

            // add placeholder for counts
            _.each(events, function(e){
                console.log(e);
                var seriesIndex = e.log_level || 0;
                series[seriesIndex].data.push({
                    id: e._id,
                    x: new Date(e.start),
                    y: Math.random()*10
                });

            });


            var chart = EventChart.setup('#eventChart', series, chartDelegates);
            chart.hideLoading();

            // bind to socket
            Socket.on('event', function (data) {
                console.log(data);
                $scope.events.push(data);

                EventChart.addEvent(data, $scope.initialSeries[data.log_level]);
              // test connection to server
              //socket.emit('client event', { my: 'data' });
            });
        });
    };

}]);