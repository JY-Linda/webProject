var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var session = require("express-session");
//导入功能实现处理代码
var showRouter = require("./routes/show.js");
//导入基本登录注册处理代码
var mainRouter = require("./routes/index.js");
var app = express();
app.use(express.static("public"));
//解析form表单格式参数
app.use(bodyParser.urlencoded({extended:false}));
//处理session
app.use(session({
  name:"JSESSIONID",	//cookie的名称
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1800000 }  //以毫秒为单位
}));
//1、设定模板引擎为jade
app.set("view engine","jade");
//2、设定模板所在目录为当前app.js所在目录下的views
app.set('views',path.join(__dirname,"views"));
//一级路由
app.use("/",showRouter);
app.use("/",mainRouter);
app.listen("8888",function(){
	console.log("端口号为8888的服务器已经开启");
});