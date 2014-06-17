'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
    logLevel: Number,
    tags: Array,
    description: String,
    start: Date,
    end: Date,
    device_id: String,
    data: Object
});

/** 
 * Before save
 */
EventSchema.pre('save', function(next) {
    this.updated = Date.now;
    next();
});

mongoose.model('Event', EventSchema);
