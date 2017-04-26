var express = require("express");
//导入链接数据库方法
var dbUtil = require("dbUtil");
//导入表单数据获取数据函数
var fromGetData = require("fromGetData");
var getDataUtil = require("getDataUtil");
//创建路由方法
var mianRouter = express.Router();
//中间件
mianRouter.use("/",function(req,res,next){
	next();
});
//创建登录跳转页面路由
mianRouter.get("/toLogin",function(req,res){
	res.locals.msg = req.query.msg;
	res.render("login");
});
//创建注册跳转页面路由
mianRouter.get("/toRegister",function(req,res){
	res.locals.msg = req.query.msg;
	res.render("register");
});
//创建注册路由
mianRouter.post("/register",function(req,res){
	//获取用户注册信息
	//调用文件上传数据获取函数
	fromGetData(req,res,function(params,url){
		//获取用户注册数据
		var stu = getDataUtil.getRegisterData(params,url)
		//查询该用户名是否已经被注册过
		var sql = "select * from tbl_user where username=?";
		dbUtil.excute(sql,[stu.username],function(result){
			if(result&&result.length>0){
				res.redirect("/toRegister?msg=该用户名被占用，请重新选择");
			}else{
				if(stu.descript==""){
					stu.descript="这家伙很懒，什么都没留下。。"
				}
				//当没有注册过就把注册信息保存到数据库
				var sql = "insert into tbl_user set ?";
				dbUtil.excute(sql,stu,function(results){
				res.redirect("/toLogin");
				});
			}
		});	
	});
	
});
module.exports=mianRouter;