'use strict';

/* global $, d3, _ */

//EventChart service handles setting up and interacting with live events chart
angular.module('mean.events').factory('EventChart', ['$rootScope', function($rootScope) {

    // setup chart size and defaults
    var defaultMaxSeconds = 30;
    var rowHeight = 50;
    var rowPadding = 5;
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
    var timeFormat = d3.time.format('%X');

    // axis values from data object
    var keyFn = function(d){ return d._id; };
    var xAxisValFn = function(d){ return new Date(d.start || d.created); };
    var xMaxValFn = function(d){ return new Date(d.end || d.start || d.created); };
    //var yAxisValFn = function(d){ return findDevice(d.device_id).y; };
    var yAxisValFn = function(d){ return (findDevice(d.device_id).y * rowHeight) + rowPadding; };
    var widthValFn = function(d){
        var endDt = new Date(d.end || d.start || d.created);
        var startDt = new Date(d.start || d.created);
        var width = (xAxis(endDt) - xAxis(startDt)) || 5;// default to 5px width
        if (width <= 0) { width = 5; }
        return width;
    };
    var eventClassesFn = function (d) {
        var logLevelClass = 'loglevel' + (d.logLevel || 2);
        return 'event ' + logLevelClass;
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
                d3SelectedElement.classed({'selected': false});
            }
            var d3box = d3.select('[data-id="' + d._id + '"]');
            d3box.classed({'selected': true});
            d3SelectedElement = d3box;

            updateSelectedBand(d);
        },
        // refresh chart from data
        refresh: function(data, delegates) {
            // use existing svg canvas to render data
            var xMax = d3.max(data, xMaxValFn);
            var xMin = new Date(xMax.getTime() - (1000*defaultMaxSeconds));//30s window
            xAxis.domain([xMin, xMax]);
            yAxis.domain(d3.extent(data, yAxisValFn));

            var boxes = svgCanvas.selectAll('rect.event').data(data, keyFn);

            boxes.transition()
             .attr('x', function(d) { return xAxis(xAxisValFn(d)); })
             .attr('y', function(d) { return yAxisValFn(d); });

            boxes.enter()
             .append('svg:rect')
              .attr('class', eventClassesFn)
              .attr('data-id', keyFn)
              .attr('height', rowHeight)
              .attr('width', widthValFn)
              .attr('x', function(d) { return xAxis(xAxisValFn(d)); })
              .attr('y', function(d) { return yAxisValFn(d); })
              .on('mouseover', delegates.mouseover)
              .on('mouseout', delegates.mouseout)
              .on('click', delegates.click);

            boxes.exit()
             .remove();

            var xAxisSvg = d3.svg.axis()
                          .scale(xAxis)
                          .orient('top')
                          .ticks(12)
                          .tickFormat(function(dt){ return timeFormat(dt); });

            var axisHeight = 30;
            var chartWidth = $('#eventChart').width();
            // clear first
            $('.x.axis').remove();
            // show axis at the top                
            d3.select('#eventChart').append('svg')
                .attr('class', 'x axis')
                .attr('width', chartWidth)
                .attr('height', axisHeight)
              .append('g')
                .attr('transform', 'translate(0,30)')
                .call(xAxisSvg);
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

            // placeholder for axis at the top
            d3.select(domSelector).append('svg')
                .attr('class', 'x axis')
                .attr('width', chartWidth)
                .attr('height', axisHeight);

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