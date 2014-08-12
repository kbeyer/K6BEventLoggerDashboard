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
  //
  // TODO: custom primary key name
  // OR store generated ID in app via response 
  //

    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    session:{
        type: Schema.ObjectId,
        ref: 'Session'
    },
    mongoID: String,
    playerID: String,
    isSessionCreator: Boolean,
    displayName: String,
    stateText: String,
    lastHeartbeatSentFromPeerAt: Date,
    lastHeartbeatReceivedFromPeerAt: Date,
    lastHeartbeatSentToPeerAt: Date,
    timeLatencySamples: Array,
    meta: Object
});


/** 
 * Before save
 */
NodeSchema.pre('save', function(next) {
    this.updated = Date.now;
    //console.log('NodeSchema preSave');
    next();
});
/**
 * After save
 */
NodeSchema.post('save', function(next) {
    this.mongoID = this._id;
    //console.log('mongoID after save: ' + this.mongoID);
    socketManager.emit('node-save', this);
});

mongoose.model('Node', NodeSchema);
