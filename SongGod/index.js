'use strict'

var mongoose = require('mongoose');
var port = process.env.PORT || 3000;
var app = require('./app');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/cloud',{ useNewUrlParser: true },(err,res) =>{
	if(err){
		throw err;
	}else{
		console.log("Successful Connection to Database");
		app.listen(port,function(){
			console.log("http://localhost: "+ port);
		});
	}
});



