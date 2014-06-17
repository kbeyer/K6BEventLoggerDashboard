'use strict';

//Setting up route
angular.module('mean.events').config(['$stateProvider',
    function($stateProvider) {
        // Check if the user is connected
        var checkLoggedin = function($q, $timeout, $http, $location) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user) {
                // Authenticated
                if (user !== '0') $timeout(deferred.resolve);

                // Not Authenticated
                else {
                    $timeout(deferred.reject);
                    $location.url('/login');
                }
            });

            return deferred.promise;
        };

        // states for my app
        $stateProvider
            .state('all events', {
                url: '/events',
                templateUrl: 'events/views/list.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('create app', {
                url: '/events/create',
                templateUrl: 'events/views/create.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('edit app', {
                url: '/events/:eventId/edit',
                templateUrl: 'events/views/create.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('app by id', {
                url: '/events/:eventId',
                templateUrl: 'events/views/view.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            });
    }
]);
