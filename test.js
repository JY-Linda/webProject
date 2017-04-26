var express = require("express");
var bodyParser = require("body-parser");
var multiparty = require('multiparty');
var http = require('http');
var util = require('util');
var fs = require("fs");
var app = express();
var filePath = "";
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:false}));
app.post("/test",function(req,res){
	//解析文件上传
	var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      //console.log(files);
      filePath = files.file[0].path ;
      console.log(filePath);
      res.end(util.inspect({fields: fields, files: files}));
    }); 
	fs.readFile(filePath,{
		flag:'r',
	},function(err,data){
		if(!err){
			if(data){
			console.log("读取完毕");
			console.log(data.toString());
			}
			
		}else{
			console.log("读取出错："+err);
		}
	});
});
app.listen("8888",function(req,res){
	console.log("端口号为8888的服务器已经开启了");
});