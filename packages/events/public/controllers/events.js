'use strict';

/* global _ */

angular.module('mean.events').controller('EventsController',
    ['$scope', '$stateParams', '$location', 'Global', 'Events', 'EventChart', 'Socket',
    function ($scope, $stateParams, $location, Global, Events, EventChart, Socket) {

    $scope.global = Global;
    $scope.initialSeries = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    $scope.events = [];
    $scope.devices = [];

    // create base series objects
    var series = [];
    _.each($scope.initialSeries, function(t, index){
        series.push({
            data: [],
            name: t,
            id: t
        });
    });


    // find or add device by id
    var findDevice = function(id) {
        var name = id || 'Unknown';
        var device = _.find($scope.devices, function(d){ return d.name === name; });
        if (!device) {
            device = {name: name, y: ($scope.devices.length+1) * 25};
            $scope.devices.push(device);
        }
        return device;
    };

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
            sort: 'start'
        }, function(events) {

            $scope.events = events;

            //var shift = series.data.length > 20; // shift if the series is 
                                                 // longer than 20

            // add placeholder for counts
            _.each(events, function(e){
                console.log(e);
                var seriesIndex = e.log_level || 1;
                var device = findDevice(e.device_id);
                series[seriesIndex-1].data.push({
                    id: e._id,
                    x: new Date(e.start || e.created),
                    y: device.y
                });

            });


            var chart = EventChart.setup('#eventChart', series, chartDelegates);
            chart.hideLoading();

            // bind to socket
            Socket.on('event', function (data) {
                console.log(data);
                $scope.events.push(data);

                var seriesIndex = data.log_level || 1;
                EventChart.addEvent(data, findDevice(data.device_id), $scope.initialSeries[seriesIndex-1]);
              // test connection to server
              //socket.emit('client event', { my: 'data' });
            });
        });
    };

}]);