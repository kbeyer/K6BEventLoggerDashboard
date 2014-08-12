'use strict';

/* global $, d3, _ */

//EventChart service handles setting up and interacting with live events chart
angular.module('mean.events').factory('NodeChart', ['$rootScope', function($rootScope) {

    //var fill = d3.scale.category20();
    var force, nodes, links, node, link, cursor, d3Delegates, d3SelectedElement;

    var keyFn = function(d){ return d.id; };
    var nodeClassFn = function(d) {
        return 'node' + ' state-' + (d.data.state || 0) + (d.isSessionCreator ? ' creator' : '');
    };

    function findnode(id){
        return nodes.filter(function(node){
            return node.id===id;
        });
    }

    function findlink(source_id, target_id){
        return links.filter(function(link){
            return (link.source.id===source_id && link.target.id===target_id) ||
                    (link.source.id===target_id && link.target.id===source_id);
        });
    }

    function tick() {
        link.attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node.attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
    }

    var exposed = {
        addNode: function(d) {
            d.id = d.id || d.playerID;


            for(var i=0; i<nodes.length; i++){
                if(nodes[i].id === d.id){
                    console.log('node ' + d.id + ' already exists, updating');
                    var doPulse = false;
                    if (d.lastHeartbeatSentToPeerAt > nodes[i].data.lastHeartbeatSentToPeerAt) {
                        doPulse = true;
                    }
                    nodes[i].data = d;
                    exposed.refresh();
                    
                    if (doPulse) { exposed.pulseNode(d.id); }

                    return nodes[i];
                }
            }

            console.log('adding node '+ d.id);
            var randomX = Math.floor(Math.random()*$('svg').width());
            var randomY = Math.floor(Math.random()*$('svg').height());
            nodes.push({x: randomX, y: randomY, id: d.id, data: d});
            exposed.refresh();
            return nodes[nodes.length-1];
        },
        addLink: function (source_id, target_id) {
            // find or create nodes
            var source = findnode(source_id)[0] || exposed.addNode({playerID: source_id, state: 0});
            var target = findnode(target_id)[0] || exposed.addNode({playerID: target_id, state: 0});

            // find or create source and target node
            if(findlink(source_id,target_id).length){
                console.log('link ' + source_id + ' => ' + target_id + ' already exists, not adding');
                return;
            }
            console.log('adding link ' + source_id + ' => ' + target_id);
            links.push({id: source_id + target_id, source: source, target: target});
            exposed.refresh();
        },
        pulseNode: function(id) {
            var d3box = d3.select('[data-id="' + id + '"]');
            d3box.transition(300)
                .style('fill', 'rgba(91,192,222,0.8)')
                .transition().duration(1000)
                .style('fill', '#eee');
        },
        select: function(d) {
            if (d3SelectedElement) {
                d3SelectedElement.classed({'selected': false});
            }
            var d3box = d3.select('[data-id="' + d._id + '"]');
            d3box.classed({'selected': true});
            d3SelectedElement = d3box;
        },
        // refresh chart from data
        refresh: function(data) {
            link = link.data(links, keyFn);

            link.enter().insert('line', '.node')
                .attr('class', 'link');

            node = node.data(nodes, keyFn);

            node.transition()
                .attr('class', nodeClassFn)
                .transition().duration(300)
                .style('opacity', 0.8);

            node.enter().insert('circle', '.cursor')
                .attr('class', nodeClassFn)
                .attr('r', 10)
                .attr('data-id', keyFn)
                .on('mousedown', d3Delegates.click)
                .on('mouseover', d3Delegates.mouseover)
                .on('mouseout', d3Delegates.mouseout)
                .call(force.drag);

            node.exit()
                .remove();

            force.start();

        },
        init: function (domSelector, delegates) {
            d3Delegates = delegates;
            var axisHeight = 30;
            var width = $(domSelector).width();
            var height = $(document).height() - axisHeight;

            force = d3.layout.force()
                .size([width, height])
                .nodes([]) // initialize with no nodes
                .linkDistance(30)
                .charge(-60)
                .on('tick', tick);

            var svg = d3.select(domSelector).append('svg')
                .attr('width', width)
                .attr('height', height)
                .on('mousemove', function () {
                    cursor.attr('transform', 'translate(' + d3.mouse(this) + ')');
                });

            svg.append('rect')
                .attr('width', width)
                .attr('height', height);

            nodes = force.nodes();
            links = force.links();
            node = svg.selectAll('.node');
            link = svg.selectAll('.link');

            cursor = svg.append('circle')
                .attr('r', 30)
                .attr('transform', 'translate(-100,-100)')
                .attr('class', 'cursor');

            exposed.refresh();
        }
    };

    return exposed;

}]);
