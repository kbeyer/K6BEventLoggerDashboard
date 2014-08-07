'use strict';

/* global d3, $ */

angular.module('mean.events').controller('NodesController',
    ['$rootScope', '$scope', '$stateParams', '$location', 'Global', 'NodeChart', 'Socket',
    function ($rootScope, $scope, $stateParams, $location, Global, NodeChart, Socket) {

    $scope.global = Global;
    $scope.nodes = [];
    $rootScope.devices = [];
    $scope.connected = false;
    $scope.status = [0, 0, 0];

    var intelliApply = function(fn){
        if (!$scope.$$phase){ fn(); }
        else{ fn(); }
    };

    var d3TooltipSelector = '.chartTooltip';
    var timeFormat = d3.time.format('%H:%M:%S.%L');

    var d3ChartDelegates = {
        mouseover: function(d){

            d3.select(this).classed({'mouseover':true});

            var leftPos = d3.event.pageX - 10;
            d3.select(d3TooltipSelector)
                .html(
                    '<u>' + timeFormat(d.data.updated) +
                    '</u>'+
                    '<p>' + d.data.displayName + ' (' + d.data.stateText + ')</p>')
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
            NodeChart.select(d);

            //
            // TODO: show card in left column with details
            //

            if ($scope.status[0] !== 0) {

                if ($scope.status[1] === 0) {
                    $scope.status[1] = d.id;

                } else if ($scope.status[2] === 0) {

                    $scope.status[2] = d.id;
                    $scope.sendEvent();
                }
            }
        }
    };

    $scope.init = function () {
        NodeChart.init('#nodesChart', d3ChartDelegates);
        NodeChart.refresh($scope.nodes, d3ChartDelegates);

        Socket.on('connect', function() {
            intelliApply(function(){ $scope.connected = true; });
        });

        Socket.on('disconnect', function() {
            intelliApply(function(){ $scope.connected = true; });
        });

        Socket.on('addnode', function (data) {
            console.log('addnode: ' + data);
            NodeChart.addNode(JSON.parse(data));
        });

        Socket.on('addlink', function(data){
            console.log('addlink: ' + data);
            NodeChart.addLink(JSON.parse(data));
        });
        Socket.on('session-save', function(data){
            console.log('session-save: ' + JSON.stringify(data));
        });
        Socket.on('node-save', function(data){
            console.log('node-save: ' + JSON.stringify(data));
            // TODO: parse all dates
            if (!data.udpated) { data.updated = new Date(); }
            else { data.updated = new Date(data.updated); }

            NodeChart.addNode(data);
        });
        Socket.on('link-save', function(data){
            console.log('link-save: ' + JSON.stringify(data));
            var link = data;
            NodeChart.addLink(link.from_node_id, link.to_node_id);
        });
    };


    $scope.restoreState = function() {
        $scope.status = [0, 0, 0];
    };

    $scope.sendEvent = function() {
        if ($scope.status[0] === 'link') {

            console.log($scope.status);
            Socket.emit('addlink', JSON.stringify({source: $scope.status[1], target:$scope.status[2]}));
            $scope.status = ['link', $scope.status[2], 0];

        } else if (status[0] === 'message') {

            Socket.emit('message',
              JSON.stringify({
                from:$scope.status[1],
                to:$scope.status[2]
            }));
            $scope.restoreState();
        } else {
            $scope.restoreState();
        }
    };

    $scope.nodeButtonClick = function (){
        $scope.restoreState();
        Socket.emit('addnode', 'yo');
    };

    $scope.linkButtonClick = function (){
        
        if ($scope.status[0] === 'link') {
            $scope.restoreState();
        } else {
            $scope.status[0] = 'link';
        }
    };

    $scope.messageButtonClick = function (){
        $scope.restoreState();
        $scope.status[0] = 'message';
    };

}]);