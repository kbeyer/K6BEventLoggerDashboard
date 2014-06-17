'use strict';

/* global $ */

//EventChart service handles setting up and interacting with live events chart
angular.module('mean.events').factory('EventChart', ['$rootScope', function($rootScope) {

    // keep reference to chart created during setup
    var chart;

    return {
        addEvent: function (data, device, seriesId) {
            var endDt = new Date(data.end);
            var startDt = new Date(data.start);
            var duration = endDt - startDt;
            //
            // TODO: dynamically determine series
            //
            chart.get(seriesId || 'DEBUG').addPoint({
                id: data._id,
                x: startDt,
                y: device.y,
                z: duration || 1000
            }, true, true);
        },
        setup: function(domSelector, initialSeries, delegates) {

            chart = $(domSelector).highcharts({

                chart: {
                    type: 'scatter',
                    events: {
                        click: delegates.click// allow create new on click
                    }
                },

                title: {
                    text: ''
                },
                tooltip: {
                    crosshairs: true,
                    style: {
                        padding: 10,
                        width: 150
                    },
                    formatter: function(){ return delegates.tooltipFormatter(this); }
                },
                xAxis: {
                    type: 'datetime',
                    title: {text:'Time'}
                },
                yAxis: {
                    title: {text:'Device'}
                },
                series: initialSeries
        
            }).highcharts();
            
            // default to show loading ... until data is added
            chart.showLoading();

            return chart;
        }
    };
}]);