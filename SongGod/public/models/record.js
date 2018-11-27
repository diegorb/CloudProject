'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecordSchema = Schema({
	record: Number,
},
{ collection: 'records' });

module.exports = mongoose.model('Record',RecordSchema);