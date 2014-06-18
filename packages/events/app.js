'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Events = new Module('Events');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Events.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Events.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    Events.menus.add({
        'roles': ['authenticated'],
        'title': 'Events',
        'link': 'all Events'
    });

    Events.aggregateAsset('css', 'package.css');
    Events.aggregateAsset('js', 'd3.js');

    return Events;
});
