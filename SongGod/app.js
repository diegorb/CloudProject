'use strict'

const express = require('express');
const bodyparser = require('body-parser');
const Record = require('./public/models/record.js');

const app = express();

// needed to parse JSON data in the body of POST requests
app.use(bodyparser.json());
app.use(express.static('public'));

// serve the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + './public/index.html');
});

// respond to GET requests with the record in the DB
app.get('/record', (req, res) => {
    Record.findOne({}, (err, result) => {
      if (err) return console.log(err); // print error
      if(!result) return res.send({record: 0}); // if no data in the DB return record = 0
      res.send(result); 
    });
});

// update the max value into the DB
app.put('/record', (req, res) => {
    Record.updateOne({}, req.body, {upsert: true}, (err, result) => {
        if (err) {
            return console.log(err);
        }
    });
    res.sendStatus(200);
});

module.exports = app;