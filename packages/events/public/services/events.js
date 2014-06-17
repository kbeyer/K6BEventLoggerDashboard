'use strict';

//Stories service used for stories REST endpoint
angular.module('mean.events').factory('Events', ['$resource', function($resource) {
    return $resource('api/v1/events/:eventId', {
        eventId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);