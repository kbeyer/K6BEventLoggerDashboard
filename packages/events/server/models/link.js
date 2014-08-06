'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    appPath = process.cwd(),
    socketManager = require(appPath + '/server/config/socketio'),
    Schema = mongoose.Schema;


/**
 * Link Schema
 * Represents known connection between two nodes
 */
var LinkSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    from_node_id: String,
    to_node_id: String,
    state: String,
    meta: Object
});

/** 
 * Before save
 */
LinkSchema.pre('save', function(next) {
    this.updated = Date.now;
    console.log('LinkSchema preSave');
    socketManager.emit('link-save', this);
    next();
});

mongoose.model('Link', LinkSchema);
