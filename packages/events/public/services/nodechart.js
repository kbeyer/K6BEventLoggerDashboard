'use strict';

/* global $, d3, _ */

//EventChart service handles setting up and interacting with live events chart
angular.module('mean.events').factory('NodeChart', ['$rootScope', function($rootScope) {

    //var fill = d3.scale.category20();
    var force, nodes, links, node, link, cursor, d3Delegates, d3SelectedElement;

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
            d.id = d.id || d.node_id;
            
            for(var i=0; i<nodes.length; i++){
                if(nodes[i].id === d.id){
                    console.log('node ' + d.id + ' already exists, not adding');
                    return;
                }
            }

            console.log('adding node '+ d);
            var randomX = Math.floor(Math.random()*$('svg').width());
            var randomY = Math.floor(Math.random()*$('svg').height());
            nodes.push({x: randomX, y: randomY, id: d.id});
            exposed.refresh();
            return node;
        },
        addLink: function (source_id, target_id) {
            // find or create nodes
            var source = findnode(source_id)[0] || exposed.addNode(source_id);
            var target = findnode(target_id)[0] || exposed.addNode(target_id);

            // find or create source and target node
            if(findlink(source_id,target_id).length){
                console.log('link ' + source_id + ' => ' + target_id + ' already exists, not adding');
                return;
            }
            console.log('adding link ' + source_id + ' => ' + target_id);
            links.push({source: source, target: target});
            exposed.refresh();
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
            link = link.data(links);

            link.enter().insert('line', '.node')
                .attr('class', 'link');

            node = node.data(nodes);

            node.enter().insert('circle', '.cursor')
                .attr('class', 'node')
                .attr('r', 10)
                .on('mousedown', d3Delegates.click)
                .call(force.drag);

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
