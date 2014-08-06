'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    appPath = process.cwd(),
    socketManager = require(appPath + '/server/config/socketio'),
    Schema = mongoose.Schema;


/**
 * Session Schema
 * Maps directly to MCSession
 */
var SessionSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    session_id: String,
    display_name: String
});

/** 
 * Before save
 */
SessionSchema.pre('save', function(next) {
    this.updated = Date.now;
    console.log('SessionSchema preSave');
    socketManager.emit('session-save', this);
    next();
});

mongoose.model('Session', SessionSchema);
