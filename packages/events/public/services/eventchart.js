'use strict';

/* global $ */

//EventChart service handles setting up and interacting with live events chart
angular.module('mean.events').factory('EventChart', ['$rootScope', function($rootScope) {
    return {
        setup: function(domSelector, initialSeries, delegates) {

            var chart = $(domSelector).highcharts({

                chart: {
                    type: 'bubble',
                    zoomType: 'None',// only allow zoom with zoom control,
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
                    title: {text:'Time'},
                    showFirstLabel: true
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