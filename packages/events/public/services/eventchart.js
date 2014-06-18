'use strict';

/* global $, d3, _ */

//EventChart service handles setting up and interacting with live events chart
angular.module('mean.events').factory('EventChart', ['$rootScope', function($rootScope) {

    // setup chart size and defaults
    var logLevelColors = ['rgba(92,184,92,0.8)',
                        'rgba(240,173,78,0.8)',
                        'rgba(217,83,70,0.8)',
                        'rgba(91,192,222,0.8)'];
    var rowPadding = 2;
    var padding = 10;
    var xAxis, yAxis, svgCanvas, d3SelectedElement;
    var devices = [];
    // find or add device by id
    var findDevice = function(id) {
        var name = id || 'Unknown';
        var device = _.find(devices, function(d){ return d.name === name; });
        if (!device) {
            device = {name: name, y: (devices.length+1)};
            devices.push(device);
        }
        return device;
    };
    // axis values from data object
    var keyFn = function(d){ return d._id; };
    var xAxisValFn = function(d){ return new Date(d.start || d.created); };
    var yAxisValFn = function(d){ return findDevice(d.device_id).y; };
    var fillFn = function(d){ return logLevelColors[d.log_level]; };
    var heightValFn = function(d){
        return yAxis(findDevice(d.device_id).y) - rowPadding;
    };
    var widthValFn = function(d){
        var endDt = new Date(d.end || d.start || d.created);
        var startDt = new Date(d.start || d.created);
        var width = (xAxis(endDt) - xAxis(startDt)) || 10;// default to 10px width
        return width;
    };

    var updateSelectedBand = function(d) {
        if (!xAxis) { return false; }
        // update plot line
        d3.select('#selected-line')
          .attr('x', xAxis(xAxisValFn(d)))
          .attr('width', widthValFn(d));
    };

    return {
        // find or add device by id
        devices: devices,
        select: function(d) {
            if (!xAxis) { return false; }
            if (d3SelectedElement) {
                d3SelectedElement
                .attr('stroke', '#ccc')
                .attr('stroke-width', 1)
                .attr('opacity', 0.6);
            }
            var d3box = d3.select('[data-id="' + d._id + '"]');
            d3box.attr('stroke', 'yellow')
                .attr('stroke-width', 2)
                .attr('opacity', 1);
            d3SelectedElement = d3box;

            updateSelectedBand(d);
        },
        // refresh chart from data
        refresh: function(data, delegates) {
            // use existing svg canvas to render data
            xAxis.domain(d3.extent(data, xAxisValFn));
            yAxis.domain(d3.extent(data, yAxisValFn));

            var boxes = svgCanvas.selectAll('rect.event').data(data, keyFn);

            boxes.transition()
             .attr('x', function(d) { return xAxis(xAxisValFn(d)); })
             .attr('y', function(d) { return (findDevice(d.device_id).y * 50) + 5; });//yAxis(yAxisValFn(d)); });

            boxes.enter()
             .append('svg:rect')
              .attr('class', 'event')
              .attr('data-id', keyFn)
              .attr('height', 50)
              .attr('width', widthValFn)
              .attr('x', function(d) { return xAxis(xAxisValFn(d)); })
              .attr('y', function(d) { return (findDevice(d.device_id).y * 50) + 5; })// yAxis(yAxisValFn(d)); })
              .attr('fill', fillFn)
              .attr('stroke', '#ccc')
              .attr('opacity', 0.6)// draw with initial opacity same as mouseout
              .on('mouseover', delegates.mouseover)
              .on('mouseout', delegates.mouseout)
              .on('click', delegates.click);

            boxes.exit()
             .remove();
        },
        init: function (domSelector, delegates) {
            var axisHeight = 30;
            var chartWidth = $(domSelector).width();
            var chartHeight = $(document).height() - axisHeight;

            // setup a big svg canvas...
            xAxis = d3.time.scale()
                .range([padding, chartWidth - padding]);
            yAxis = d3.scale.linear()
                .range([chartHeight - padding, padding]);

            // show axis at the top                
            d3.select(domSelector).append('svg')
                .attr('class', 'x axis')
                .attr('width', chartWidth)
                .attr('height', axisHeight)
              .append('g')
                .attr('transform', 'translate(' + padding + ',0)')
                .call(xAxis);

            // boxes canvas next
            svgCanvas = d3.select(domSelector).append('svg:svg')
                .attr('width', chartWidth)
                .attr('height', chartHeight);

            // currently selected plot band
            svgCanvas.append('svg:rect')
                .attr('id', 'selected-line')
                .attr('x', -1)
                .attr('width', 0)
                .attr('y', 0)
                .attr('height', chartHeight - padding)
                .attr('fill', 'yellow')
                .attr('opacity', 0.1);
        }
    };
}]);