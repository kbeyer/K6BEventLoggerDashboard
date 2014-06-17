'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    appPath = process.cwd(),
    socketManager = require(appPath + '/server/config/socketio'),
    Schema = mongoose.Schema;


/**
 * Event Schema
 * Maps directly to MPIEvent
 */
var EventSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    source: String,
    log_level: Number,
    tags: Array,
    description: String,
    start: Date,
    end: Date,
    device_id: String,
    data: Object,
    fn_name: String
});

/** 
 * Before save
 */
EventSchema.pre('save', function(next) {
    this.updated = Date.now;
    console.log('EventSchema preSave');
    socketManager.emit('event', this);
    next();
});

mongoose.model('Event', EventSchema);
