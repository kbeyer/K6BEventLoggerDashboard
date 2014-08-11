'use strict';



var mongoose = require('mongoose'),
    appPath = process.cwd(),
    socketManager = require(appPath + '/server/config/socketio'),
    restify = require('express-restify-mongoose');



module.exports = function(Events, app, auth) {
    //restify.defaults({ version: 'v1', lowercase:true });
    //restify.serve(app, mongoose.model('User'));
    restify.serve(app, mongoose.model('Event'));
    restify.serve(app, mongoose.model('Session'));
    restify.serve(app, mongoose.model('Link'));
    restify.serve(app, mongoose.model('Node'), {postProcess: function (req, res, next) {
        //console.log('typeof REQ : ' + typeof(req.method) + ' , method: ' + req.method);
        //for(var p in req) { console.log(p); }
        
        switch (req.method) {
        case 'POST':
            //socketManager.emit('node-save', res.body);
            break;
        case 'PUT':
            socketManager.emit('node-save', req.body);
            break;
        }
    }});

};