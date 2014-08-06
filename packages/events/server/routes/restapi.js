'use strict';



var mongoose = require('mongoose'),
    restify = require('express-restify-mongoose');



module.exports = function(Events, app, auth) {
    //restify.defaults({ version: 'v1', lowercase:true });
    //restify.serve(app, mongoose.model('User'));
    restify.serve(app, mongoose.model('Event'));
    restify.serve(app, mongoose.model('Session'));
    restify.serve(app, mongoose.model('Link'));
    restify.serve(app, mongoose.model('Node'));

};