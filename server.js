'use strict';

/**
 * Module dependencies.
 */
var http = require('http'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    logger = require('mean-logger');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Initializing system variables
var config = require('./server/config/config');
var db = mongoose.connect(config.db);

// Bootstrap Models, Dependencies, Routes and the app as an express app
var app = require('./server/config/system/bootstrap')(passport, db);


// create server with express app
var server = http.createServer(app);

// Configure Socket.io, initialize single instance of SocketManager
require('./server/config/socketio').init(server);

// Start the app by listening on <port>, optional hostname
server.listen(config.port, config.hostname);
console.log('App started on port ' + config.port + ' (' + process.env.NODE_ENV + ')');

// Initializing logger
logger.init(app, passport, mongoose);

// Expose app
exports = module.exports = app;
