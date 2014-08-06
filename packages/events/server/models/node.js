'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    appPath = process.cwd(),
    socketManager = require(appPath + '/server/config/socketio'),
    Schema = mongoose.Schema;


/**
 * Node Schema
 * Represents a device known to MCSession
 */
var NodeSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    session:{
        type: Schema.ObjectId,
        ref: 'Session'
    },
    node_id: String,
    display_name: String,
    state: String,
    meta: Object
});

/** 
 * Before save
 */
NodeSchema.pre('save', function(next) {
    this.updated = Date.now;
    console.log('NodeSchema preSave');
    socketManager.emit('node-save', this);
    next();
});

mongoose.model('Node', NodeSchema);
