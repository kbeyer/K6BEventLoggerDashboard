'use strict';

/**
 * Module dependencies.
 */
var socketio = require('socket.io');

// Constructor
var SocketManager = function() {
    // keep reference to socket created on connection
    this.socket = null;
};

// helper method to initializer server and bindings
SocketManager.prototype.init = function (server) {
    var me = this;
    //initialize socket.io server
    var io = socketio(server);
    // automatically emit news on connection
    io.on('connection', function (s) {
        s.emit('news', { listening: 'true' });
        // save reference for later binding
        me.socket = s;

        s.on('addnode', function (s) {
            console.log('addnode');
            me.socket.emit('addnode', JSON.stringify({id: Math.round(Math.random()*1000)}));
        });

        s.on('addlink', function (d) {
            console.log('addlink: ' + d);
        });

    });

    // handle messages from clients

};

SocketManager.prototype.on = function (eventName, callback) {
    var me = this;
    me.socket.on(eventName, function () {
        var args = arguments;
        callback(me.socket, args);
    });
};

SocketManager.prototype.emit = function (eventName, data, callback) {
    var me = this;
    me.socket.emit(eventName, data, function () {
        var args = arguments;
        callback(me.socket, args);
    });
};

// lazy init single instance of socket manager
if (!global.socketManager) {
    global.socketManager = new SocketManager();
}

// node.js module export
module.exports = global.socketManager;
