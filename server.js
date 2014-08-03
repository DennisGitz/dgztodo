var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
//var mongoDB = require('mongodb').MongoClient;

if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   var mongo = env['mongodb-2.2'][0].credentials;
} else {
   var mongo = {
      "username" : "user1",
      "password" : "secret",
      "url" : "mongodb://localhost:27017/mytodo"
};
}
// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 8090);
// Start server



mongoose.connect(mongo.url);

app.use(express.static(__dirname+'/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());

app.listen(port,host);

console.log("App listening on port 8090");	


//models

var Todo = mongoose.model('todo',{text : String});


//routes

app.get('/api/todos',function (req, res){

	Todo.find(function  (err, todos) {
		if ( err) res.send(err);

		res.json(todos);
	});
});

app.post('/api/todos', function (req, res){
	Todo.create ({
		text:req.body.text,
		done:false
	}, function (err, todo){
		if (err) res.send(err);

		Todo.find(function  (err, todos) {
		if ( err) res.send(err);

		res.json(todos);
	    });
	});
});

app.delete('/api/todos/:todo_id',function (req, res){
	Todo.remove({
		_id : req.params.todo_id
	}, function (err, todo){
		if (err) res.send(err);

		Todo.find(function  (err, todos) {
		if ( err) res.send(err);

		res.json(todos);
	    });
	});
});


app.get('*',function(req, res){
	res.sendfile('./public/index.html');
});


