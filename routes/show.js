var express = require("express");
//导入链接数据库方法
var dbUtil = require("dbUtil");
var upload = require("fileupload");
//导入表单获取数据函数
var fromGetData = require("fromGetData");
//导入数据转换为我们所需要格式的函数
var getDataUtil = require("getDataUtil");
//创建路由方法
var showRouter = express.Router();
var app = express();

//中间件

showRouter.use("/",function(req,res,next){
	//获取所有方向信息
	getDataUtil.getAllDepartment(req,res);
	//获取所有水平信息
	getDataUtil.getAllLevels(req,res);
	//获取所有知识点信息
	getDataUtil.getAllTopics(req,res);
	getDataUtil.getAllAnnouncement(req,res);
	res.locals.stu = req.session.stu;//保存登录学生信息
	res.locals.department = req.session.department;//保存所有方向信息
	res.locals.levels = req.session.levels;//保存所有难度信息
	res.locals.topics = req.session.topics;//保存所有知识点信息
	res.locals.announcement = req.session.announcement;//保存所有公告信息
	next();
});
//创建主页路由
showRouter.get("/toIndex",function(req,res){
	var sql = "select * from tbl_subjects";
	dbUtil.excute(sql,"",function(result){
		var i = result.length-1;
		req.session.lastSubjectId = result[i].id;//最后一个课程的id+1;
		res.render("index",{"subjects":result});
	});
});
//创建发布信息页面路由
showRouter.get("/toPublish",function(req,res){
		var sql = "select * from tbl_subjects where u_id=?";
		dbUtil.excute(sql,[req.session.stu.id],function(result1){
			var sql = "select * from tbl_notes where u_id=?";
			dbUtil.excute(sql,[req.session.stu.id],function(result2){
				res.render("publish",{"mySubjects":result1,"notes":result2,
					"userId":req.session.stu.id});
			});
		});
	//res.render("publish");
});
// showRouter.post("/addPublish",file.upload);
//创建添加发布路由
showRouter.post("/addPublish/isAdd/:isAdd/changesubId/:changesubId",function(req,res){
	req.session.lastSubjectId++;//获取当前增加元素的id
	var subjectsId = req.session.lastSubjectId;
	//获取发布内容
	upload(req,res,function(params,dataUrl,photoUrl){
		var chapters = params.chapter;
		var contents = params.content;
		delete params.chapter;//删除章节，章节是内容表当中的内容，不应该插入到课程表当中
		delete params.content;//删除内容，内容是内容表当中的内容，不应该插入到课程表当中
		params.showPhoto = photoUrl;//把封面相片存储在params中
		params.u_id = req.session.stu.id;//把用户id(外键)储存在params中
		if(dataUrl){
			params.dataUrl = dataUrl;
		}else{
			params.dataUrl = req.session.dataUrl;
		}
		//把发布内容插入tbl_subjects表中
		if(req.params.isAdd=="Yes"){
			params.id = subjectsId;
			params.dataTitle = params.title+"资料";
			console.log("params:",params.id);
			//保存发布信息
			var sql = "insert into tbl_subjects set ?";
			dbUtil.excute(sql,params,function(result){
				//把该发布的所有章节信息插入到内容表中
				for(var j=0;j<chapters.length;j++){
					var sql = "insert into tbl_content(chapter,content,sub_id) values(?,?,?)";
					dbUtil.excute(sql,[chapters[j],contents[j],subjectsId],function(result){
					});
				};
				//重定向，跳转到个人发布信息页面
				res.redirect("/toPublish");		
			});
		}else{
		// 	//保存编辑页面
			var sql = "delete from tbl_content where sub_id=?";
			dbUtil.excute(sql,[req.params.changesubId],function(result){
				if(result){
					var sql = "update tbl_subjects set ? where id= ?";
					dbUtil.excute(sql,[params,req.params.changesubId],function(result){
						//把该发布的所有章节信息插入到内容表中
						for(var j=0;j<chapters.length;j++){
							var sql = "insert into tbl_content(chapter,content,sub_id) values(?,?,?)";
							dbUtil.excute(sql,[chapters[j],contents[j],req.params.changesubId],function(result){
							});
						};
						//重定向，跳转到个人发布信息页面
						res.redirect("/toPublish");		
					});	
				}
			});
		}
	});
});
//删除发布内容路由
showRouter.get("/delsubject/d/:d/manage/:manage",function(req,res){
	var params = req.params;
	var sql ="delete from tbl_content where sub_id=?"
	dbUtil.excute(sql,[req.params.d],function(result){
		var sql1 = "delete from tbl_discuss where sub_id=?";
		dbUtil.excute(sql1,[req.params.d],function(result){
			var sql2 = "delete from tbl_subjects where id=?";
			dbUtil.excute(sql2,[req.params.d],function(result){
				if(req.params.manage == "Yes"){
					res.redirect("/tomanage");
				}else{
					res.redirect("/toPublish");	
				}	
			});
		});
	});
});
//修改发布课程路由
showRouter.get("/changePublish/changeId/:changeId/manage/:manage",function(req,res){
	var sql = "select * from tbl_subjects where id=?";
	dbUtil.excute(sql,[req.params.changeId],function(result1){
		req.session.dataUrl = result1[0].dataUrl;
		var sql = "select * from tbl_content where sub_id=?";
		dbUtil.excute(sql,[req.params.changeId],function(result2){
			if(req.params.manage=="Yes"){
				res.render("subchange",{"changeSubjects":result1,"changeContent":result2});
			}else{
				res.render("changePublish",{"changeSubjects":result1,"changeContent":result2});
			}
		});
	});
});
//添加笔记路由
showRouter.post("/addNotes",function(req,res){
	fromGetData(req,res,function(params,url){
		url = url.slice(6);
		params.notesPhoto = url;
		params.u_id = req.session.stu.id;
		var sql = "insert into tbl_notes set ?";
		dbUtil.excute(sql,params,function(result){
			res.redirect("/toPublish");	
		});
	});
});
//删除笔记
showRouter.get("/notesDetele/id/:id",function(req,res) {
	var sql = "delete from tbl_notes where id=? ";
	dbUtil.excute(sql,req.params.id,function(result){
		res.redirect("/toPublish");	
	});
});
//笔记和内容详细页面
showRouter.get("/toDetails/notes/:notes/dist/:dist/active/:active",function(req,res){
	var notes = req.params.notes;
	var dist =  req.params.dist;
	var active = parseInt(req.params.active,10);
	if(dist=="1"){
		var sql = "select * from tbl_content where sub_id=?";
		dbUtil.excute(sql,req.params.notes,function(result){
			result.notes = notes;
			result.active = active;
			res.render("details",{"notesDetail":result});
		});
	}else{
		var sql = "select * from tbl_notes where u_id=?";
		dbUtil.excute(sql,req.params.notes,function(result){
			var news = [];
			news.notes = dist;
			news.active = active;
			for(var i=0;i<result.length;i++){
				var test = {};
				test.chapter = result[i].notesTitle;
				test.content = result[i].notesDescript;
				news.push(test);
			}
			res.render("details",{"notesDetail":news});
		});
	}
	
});
//创建课程页面路由
showRouter.get("/toCourse/det/:det/topics/:topics/levels/:levels/dId/:dId",function(req,res){
	if(!(req.params.det==req.params.dId)&&req.params.dId!=0&&req.params.det!=0){
		req.params.topics=0;
	}
	if((req.params.det==0)&&(req.params.topics==0)&&(req.params.levels==0)){
		var sql = "select sub.id,sub.title,sub.descript,levels.relName from tbl_subjects sub,tbl_levels levels where sub.level_id=levels.id and reviewed='通过'";
		dbUtil.excute(sql,"",function(result){
			res.render("course",{"params":req.params,"filterCourse":result});
		});
	}else if((req.params.det!=0)&&(req.params.topics==0)&&(req.params.levels==0)){
			var sql = "select sub.id,sub.title,sub.descript,levels.relName from tbl_subjects sub,tbl_levels levels where sub.level_id=levels.id and sub.department_id=? and reviewed='通过'";
			dbUtil.excute(sql,[req.params.det],function(result){
				res.render("course",{"params":req.params,"filterCourse":result});
			});
	}else if((req.params.det==0)&&(req.params.topics!=0)&&(req.params.levels==0)){
		var sql = "select sub.id,sub.title,sub.descript,levels.relName from tbl_subjects sub,tbl_levels levels where sub.level_id=levels.id and sub.topics_id=? and reviewed='通过'";
		dbUtil.excute(sql,[req.params.topics],function(result){
			res.render("course",{"params":req.params,"filterCourse":result});
		});
	}else if((req.params.det==0)&&(req.params.topics==0)&&(req.params.levels!=0)){
		var sql = "select sub.id,sub.title,sub.descript,levels.relName from tbl_subjects sub,tbl_levels levels where sub.level_id=levels.id and sub.level_id=? and reviewed='通过'";
		dbUtil.excute(sql,[req.params.levels],function(result){
			res.render("course",{"params":req.params,"filterCourse":result});
		});
	}else if((req.params.det!=0)&&(req.params.topics!=0)&&(req.params.levels==0)){
		var sql = "select sub.id,sub.title,sub.descript,levels.relName from tbl_subjects sub,tbl_levels levels where sub.level_id=levels.id and sub.topics_id=? and sub.department_id=? and reviewed='通过'";
		dbUtil.excute(sql,[req.params.topics,req.params.det],function(result){
			res.render("course",{"params":req.params,"filterCourse":result});
		});
	}else if((req.params.det!=0)&&(req.params.topics==0)&&(req.params.levels!=0)){
		var sql = "select sub.id,sub.title,sub.descript,levels.relName from tbl_subjects sub,tbl_levels levels where sub.level_id=levels.id and sub.level_id=? and sub.department_id=? and reviewed='通过'";
		dbUtil.excute(sql,[req.params.levels,req.params.det],function(result){
			res.render("course",{"params":req.params,"filterCourse":result});
		});
	}else if((req.params.det==0)&&(req.params.topics!=0)&&(req.params.levels!=0)){
		var sql = "select sub.id,sub.title,sub.descript,levels.relName from tbl_subjects sub,tbl_levels levels where sub.level_id=levels.id and sub.topics_id=? and sub.level_id=? and reviewed='通过'";
		dbUtil.excute(sql,[req.params.topics,req.params.levels],function(result){
			res.render("course",{"params":req.params,"filterCourse":result});
		});
	}else if((req.params.det!=0)&&(req.params.topics!=0)&&(req.params.levels!=0)){
		var sql = "select sub.id,sub.title,sub.descript,levels.relName from tbl_subjects sub,tbl_levels levels where sub.level_id=levels.id and sub.topics_id=? and sub.department_id=? and sub.level_id=? and reviewed='通过'";
		dbUtil.excute(sql,[req.params.topics,req.params.det,req.params.levels],function(result){
			res.render("course",{"params":req.params,"filterCourse":result});
		});
	}	
});
//创建职业路径页面路由
showRouter.get("/toWebjob",function(req,res){
	var sql = "select * from tbl_subjects where reviewed='通过'";
	dbUtil.excute(sql,"",function(result){
		res.render("webjob",{"webjob":result});
	});
});
//创建详细知识点页面路由
showRouter.get("/toDiscuss/a/:a",function(req,res){
	var params = req.params;
	req.session.subjectsId = params.a;
	var sql1= "select con.id,con.content,con.chapter,sub.title,sub.dataTitle,sub.descript," +
		"levels.relName from tbl_content con,tbl_subjects sub,tbl_levels levels where " +
		"levels.id=sub.level_id and sub.id=con.sub_id and sub.id=?";
	dbUtil.excute(sql1,[params.a],function(result1){
		if(result1){//获取该课程的评论
		    result1.sub_id = req.params.a
			var sql2 = "select u.username,u.photo,d.discuss from tbl_user u,tbl_discuss d " +
				"where d.u_id=u.id and d.sub_id=?";
			dbUtil.excute(sql2,[params.a],function(result2){

				res.render("discuss",{"content":result1,"discuss":result2});//传递信息，并渲染出页面
			});	
		}
	});
});
showRouter.get("/download/pathId/:pathId",function(req,res){
	var pathId = req.params.pathId;
	var sql = "select dataUrl from tbl_subjects where id=?"
	dbUtil.excute(sql,[pathId],function(result){			
		res.download(result[0].dataUrl);
	});
});
//添加评价路由
showRouter.post("/addDiscuss",function(req,res){
	//获取用户评价
	var addDiscuss = req.body;
	//获取课程id和评论的学生id
	addDiscuss.sub_id = req.session.subjectsId;
	addDiscuss.u_id = req.session.stu.id;
	var sql = "insert into tbl_discuss set ?"
	dbUtil.excute(sql,addDiscuss,function(result){
		res.redirect("/toDiscuss/a/"+req.session.subjectsId);
	});
});
//2、进行用户验证
		/*
		 1)、在数据库查找该用户，判断该用户是否存在
		 2)、如果用户存在，获取数据库密码与用户输入密码匹配，如果密码正确，则登录成功，否则重新登录
		 3)、登录成功后将用户信息保存到session中
		 	session是一次会话，登录者第一次访问用户时就创建了一个session,会一直维护在服务器中，
		 	除非手动删除或过期
*/
//创建登录路由
showRouter.post("/login",function(req,res){
	res.locals.related = req.session.related;//保存个人搜索信息
	//1、接收用户请求参数
	var username = req.body.username;
	var password = req.body.password;
	var manage = parseInt(req.body.manage,10);
	if(manage){
		var sql = "select * from tbl_manage where username=?";
		dbUtil.excute(sql,[username,manage],function(result){
			if(result&&result.length>0){
				var stu = result[0]
				if(password==stu.password){
					//跳转到首页
					res.redirect("/tomanage");
				}else{
					//密码错误
					res.redirect("/toLogin?msg=密码错误，请重新登录");
				}		
			}else{
				//用户不存在
				res.redirect("/toLogin?msg=该管理员不存在,请重新登录");
			}
		});
	}else{
		var sql = "select * from tbl_user where username=?";
		dbUtil.excute(sql,[username,manage],function(result){
			if(result&&result.length>0){
				var stu = result[0]
				if(password==stu.password){
					//将登录的用户信息保存到session中
					req.session.stu = stu; 
					//跳转到首页
					res.redirect("/toIndex");
				}else{
					//密码错误
					res.redirect("/toLogin?msg=密码错误，请重新登录");
				}		
			}else{
				//用户不存在
				res.redirect("/toLogin?msg=该用户名不存在,请重新登录");
			}
		});
	}
	
});
//创建退出路由
showRouter.get("/layout",function(req,res){
	req.session.stu = null;
	res.redirect("/toLogin");
});
//创建修改个人资料路由
showRouter.post("/changeData",function(req,res){
	fromGetData(req,res,function(params,url){
		//获取用户修改信息数据
		var changeStuId = req.session.stu.id;
		var stu = getDataUtil.getRegisterData(params,url);
		stu.username=stu.username?stu.username:req.session.stu.username;
		stu.password=stu.password?stu.password:req.session.stu.password;
		stu.descript=stu.descript?stu.descript:req.session.stu.descript;
		stu.email = stu.email?stu.email:req.session.stu.email;
		stu.id = changeStuId;
		req.session.stu = stu;
		var sql = "update tbl_user set ? where id=?";
		dbUtil.excute(sql,[stu,changeStuId],function(results){
			res.redirect("/toIndex");
		});
	});	
});
//创建模糊查询路由
showRouter.get("/search/val/:val",function(req,res){
	var val = req.params.val;
	req.session.related = val;
	var term = '%'+val+'%';
	var sql = "select sub.id,sub.title,sub.descript,sub.showPhoto,det.relName,tps.name from tbl_subjects sub,tbl_department det,tbl_topics tps where (sub.title like ? or det.relName like ? or tps.name like ?) and sub.department_id=det.id and sub.topics_id=tps.id and sub.reviewed='通过'";
	dbUtil.excute(sql,[term,term,term,term],function(result){
		res.render("search",{"subjects":result,"related":val});
	});
});
// 后台管理操作
//创建后台管理页面
showRouter.get("/tomanage",function(req,res){
	var sql = "select id,username,password,email from tbl_user";
	dbUtil.excute(sql,"",function(result1){
		var sql2 ="select sub.id,sub.title,sub.dataTitle,sub.reviewed,u.username,lel.relName lelName,de.relName,topics.name from tbl_subjects sub,tbl_user u,tbl_topics topics,tbl_levels lel,tbl_department de where sub.level_id=lel.id and sub.topics_id = topics.id and sub.department_id = de.id and u.id=sub.u_id";
		dbUtil.excute(sql2,"",function(result2){
			var sql3 = "select dis.id,dis.discuss,u.username,sub.title from tbl_discuss dis,tbl_user u,tbl_subjects sub where dis.u_id = u.id and dis.sub_id=sub.id";
			dbUtil.excute(sql3,"",function(result3){
				res.render("management",{"users":result1,"subjects":result2,"discusss":result3});
			});	
		}); 
	});	
});
//创建后台删除用户路由
showRouter.get("/usermanageDelete/id/:id",function(req,res){
	var sql ="delete from tbl_content where sub_id=(select id from tbl_subjects where u_id=?)";
	dbUtil.excute(sql,[req.params.id],function(result){
		var sql1 = "delete from tbl_discuss where sub_id=(select id from tbl_subjects where u_id=?)";
		dbUtil.excute(sql1,[req.params.id],function(result){
			var sqlnotes = "delete from tbl_notes where u_id = ?";
			dbUtil.excute(sqlnotes,[req.params.id],function(){
			});
			var sql2 = "delete from tbl_subjects where u_id=?";
			dbUtil.excute(sql2,[req.params.id],function(result){
				var sql3 = "delete  from tbl_user where id=?";
				dbUtil.excute(sql3,req.params.id,function(result){
					res.redirect("/tomanage");
				});
			});
		});
	});
});
//创建管理员修改用户信息路由
showRouter.get("/usermanageChange/id/:id",function(req,res){
	var sql = "select * from tbl_user where id=?";
	dbUtil.excute(sql,[req.params.id],function(result){
			res.render("userChange",{"stu":result[0]});
	});
});
//创建修改用户信息保存信息路由
showRouter.post("/managechangeData/id/:id",function(req,res){
	var stu = req.body;
	var sql = "update tbl_user set username=?,password=?,gender=?,descript=?,email=? where id=?";
	dbUtil.excute(sql,[stu.username,stu.password,stu.gender,stu.descript,stu.email,req.params.id],function(result){
		res.redirect("/tomanage");
	});
});
//创建管理员修改课程
showRouter.post("/changesub/id/:id",function(req,res){
	var sub =req.body;
	var chapters = sub.chapter;
	var contents = sub.content;
	var sql = "delete from tbl_content where sub_id=?";
		dbUtil.excute(sql,[req.params.id],function(result){
			if(result){
				var sql = "update tbl_subjects set title=?,descript=?,dataTitle=?,topics_id=?,department_id=?,level_id=? where id= ?";
				dbUtil.excute(sql,[sub.title,sub.descript,sub.dataTitle,sub.topics_id,sub.department_id,sub.level_id,req.params.id],function(result){
					//把该发布的所有章节信息插入到内容表中
					for(var j=0;j<chapters.length;j++){
						var sql = "insert into tbl_content(chapter,content,sub_id) values(?,?,?)";
						dbUtil.excute(sql,[chapters[j],contents[j],req.params.id],function(result){
						});
					};
					//重定向，跳转到后台管理主页面
					res.redirect("/tomanage");		
				});	
			}
		});
});
//创建管理员审核路由
showRouter.get("/auditing/ispage/:ispage",function(req,res){
	var ids = req.query.ids;
	var idstring = "";
	for(var i=0;i<ids.length;i++){
		idstring+=ids[i]
		if(i<(ids.length-1)){
			idstring+=",";}}
	if(req.params.ispage=="ok"){
		var sql = "update tbl_subjects set reviewed='通过' where id in ("+idstring+")";
		dbUtil.excute(sql,"",function(result){
			console.log("操作成功");
			res.redirect("/tomanage");
		});
	}else if(req.params.ispage=="no"){
		var sql = "delete from tbl_content where sub_id in ("+idstring+")"; 
		dbUtil.excute(sql,[req.params.d],function(result){
			var sql1 = "delete from tbl_discuss where sub_id in ("+idstring+")";
			dbUtil.excute(sql1,[req.params.d],function(result){
				var sql2 = "delete from tbl_subjects where id in ("+idstring+")";
				dbUtil.excute(sql2,[req.params.d],function(result){
					console.log("删除成功");
					res.redirect("/tomanage");});});});
	}else if(req.params.ispage=="discuss"){
		var sql = "delete from tbl_discuss where id in ("+idstring+")";
		dbUtil.excute(sql,"",function(result){
			//console.log("删除评论成功");
			res.redirect("/tomanage");});}
});
module.exports = showRouter;


