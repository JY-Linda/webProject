var express = require("express");
var bodyParser = require("body-parser");
var http = require('http');
var util = require('util');
var fs = require("fs");
var fromGetData = require("fromGetData");
var app = express();
var filePath = "";
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:false}));
app.post("/test",function(req,res){
	fromGetData(req,res,function(params,url){
		console.log(params);
		console.log(url);
	})
});
app.listen("8888",function(req,res){
	console.log("端口号为8888的服务器已经开启了");
});
