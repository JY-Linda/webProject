/**
 * Created by JY on 2017/3/6.
 */
$(function() {
    //分页
    //调用分页函数
    pageBlock($("#pagination"),$(".pageLength"),$(".outer .inner"));
    pageBlock($("#pagination2"),$(".pageLength2"),$(".outer2 .inner2"));
    //分页函数
    function pageBlock(pageItem,hiddenDiv,showItem){
        //如果存在该元素
        if(pageItem){
            var pagecount =hiddenDiv.attr("val");//获取元素个数
            var current =hiddenDiv.attr("pagesize");//获取使用分页页面
            //根据不同页面决定一个页面显示几个数据，决定分几页
            if(current=="index"){
              //当所处页面为首页时,每页显示八个数据
              if(pagecount%8==0){
                var counts = parseInt(pagecount/8)+1;
              }else{
                var counts = parseInt(pagecount/8)+2;
              }
              var pageSize = 8;
            }else{
            //当所处页面为其他页面时,每页显示6个数据
              if(pagecount%6==0){
                var counts = parseInt(pagecount/6)+1;
              }else{
                var counts = parseInt(pagecount/6)+2;
              }
              var pageSize = 6;
            }
            if(counts>2){
                //根据上面所算出的页码数来渲染页面页码
                for(var i=0;i<counts;i++){
                    if(i==0){
                        pageItem.append("<li val="+i+" hidden><a>上一页</a></li>");
                    }else if(i==1){
                        pageItem.append("<li class='active' val="+i+"><a>"+i+"</a></li>");
                    }else{
                        pageItem.append("<li val="+i+"><a>"+i+"</a></li>");
                    }
            
                }
                //渲染下一页
                var next = parseInt(pageItem.find("li.active").attr("val"));
                pageItem.append("<li class='last' val="+(next+1)+"><a>下一页</a></li>");
                //点击页码事件
                pageItem.find("li").click(function(){
                    //先让所有数据隐藏
                    showItem.attr("hidden","hidden");
                    //获取点击页码的文本
                    var Litext = $(this).text();
                    //获取点击页码的页数
                    var page = $(this).attr("val");
                    if(Litext=="下一页"){
                        //当点击下一页的时候，获取点击之前所在页码
                        var next = parseInt(pageItem.find("li.active").attr("val"));
                        //让页面加1;
                        page = next+1;
                        //去除所有页码的active
                        pageItem.find("li").removeClass("active");
                        //让点击之前的页码的后一个处于active状态
                        pageItem.find("li").eq(next+1).addClass("active");
                    }else if(Litext=="上一页"){
                        var next = parseInt(pageItem.find("li.active").attr("val"));
                        page = next-1;
                        pageItem.find("li").removeClass("active");
                        pageItem.find("li").eq(next-1).addClass("active");
                    }else{
                        //当点击页码不是上一页也不是下一页时，
                        //去除点击页码的兄弟节点的active
                        $(this).siblings().removeClass("active");
                        //给点击页面加上class active
                        $(this).addClass("active");
                    } 
                    //判断是否显示上一页，下一页
                    if(page>(counts-2)){
                        pageItem.find("li.last").attr("hidden","hidden");
                        pageItem.find("li").eq(0).removeAttr("hidden");
                    }else if(page>1){
                        pageItem.find("li").eq(0).removeAttr("hidden");
                        pageItem.find("li.last").removeAttr("hidden");
                    }else{
                        pageItem.find("li").eq(0).attr("hidden","hidden");
                        pageItem.find("li.last").removeAttr("hidden");
                    }
                    //显示点击的页码的数据  
                    for(var i=(page-1)*pageSize;i<page*pageSize;i++){
                        showItem.eq(i).removeAttr("hidden");  
                    }       
                });
                //模拟点击第一页
               pageItem.find("li").eq(1).trigger("click");
            }  
        }
    }
    //详细信息展示页分章函数
    if($("#notesSize")){
        var size =parseInt( $("#notesSize").attr("size"));//获取数据量
        var active = parseInt($("#notesSize").attr("active"));//获取点击的是那个数据
        var dist = parseInt($("#notesSize").attr("dist"));//获取是那个页面触发事件
        //当数据量大于1时
        if(size>1){    
            if(dist){
            var zitiOne = "上一章";
            var zitiLast = "下一章";
            }else{
                var zitiOne = "上一篇";
                var zitiLast = "下一篇";
            }
            //给上一章，下一章加属性在特定页数不能点击，比如在第一页时不能点上一章。
            if(active==1){
                var firstLi = "<button disabled><a class='unable'>"+zitiOne+"</a></button>";
                var lastLi = "<button val="+(active+1)+"><a>"+zitiLast+"</a></button>";
            }else if(active==size){
                var firstLi = "<button val="+(active-1)+"><a>"+zitiOne+"</a></button>";
                var lastLi = "<button disabled><a class='unable'>"+zitiLast+"</a></button>";
            }else{
                var firstLi = "<button val="+(active-1)+"><a>"+zitiOne+"</a></button>";
                var lastLi = "<button val="+(active+1)+"><a>"+zitiLast+"</a></button>";
            }
            $(".chapterPage").append(firstLi);//追加第一章
            // 追加页数
            for(var i=1;i<=size;i++){
                if(i==active){
                    var newLi = "<button val="+i+"  class='active'><a>"+i+"</a></button>";
                    $(".chapterPage").append(newLi); 
                }else{
                    var newLi = "<button val="+i+"><a>"+i+"</a></button>";
                    $(".chapterPage").append(newLi);
                }
            }
            //追加最后一章
            $(".chapterPage").append(lastLi);
            //为页数绑定点击事件
            $(".chapterPage button").click(function(){
                //获取点击事件的文本
                var text = $(this).text();
                //获取点击事件的val
                var page = $(this).attr("val");
                //当点击的页数不是第一页时
                if(page!=1){
                    $(".chapterPage button").eq(0).removeAttr("disabled");
                    $(".chapterPage button").eq(0).find("a").removeClass("unable");
                }else{
                    $(".chapterPage button").eq(0).attr("disabled","disabled");
                    $(".chapterPage button").eq(0).find("a").addClass("unable");
                }
                //当点击的页数不是最后一页时
                if(page!=size){
                    // console.log($(".chapterPage button").eq(size+1));
                    $(".chapterPage button").eq(size+1).removeAttr("disabled");
                    $(".chapterPage button").eq(size+1).find("a").removeClass("unable");
                }else{
                    $(".chapterPage button").eq(size+1).attr("disabled","disabled");
                    $(".chapterPage button").eq(size+1).find("a").addClass("unable");
                }
                //当点击的是上一章或下一章时
                if(text==zitiOne||text==zitiLast){
                    var page = $(this).attr("val");
                    $(".chapterPage").find("button[val="+page+"]").siblings().removeClass("active");
                    $(".chapterPage").find("button[val="+page+"]").addClass("active");
                    $(this).removeClass("active");
                    // $(this).removeAttr("val");
                }else{
                    $(this).siblings().removeClass("active");
                    $(this).addClass("active");
                }
                //每次点击事件之后改变上一章下一章的val
                var activePage = $(".chapterPage button.active").attr("val");
                $(".chapterPage button").eq(0).removeAttr("val");
                $(".chapterPage button").eq(0).attr("val",parseInt(activePage)-1);
                $(".chapterPage button").eq(size+1).removeAttr("val");
                $(".chapterPage button").eq(size+1).attr("val",parseInt(activePage)+1);
                //显示相对应的数据
                var pageContent =  $(".detailsContent").find(".detail[val="+page+"]");
                pageContent.siblings(".detail").attr("hidden","hidden");
                pageContent.removeAttr("hidden");
                //改变页面高度
                 $(".detailsContent").removeClass("largedetailsContent");
                 var detailsHeight = parseInt($(".detailsContent").css("height"));
                 if(!(detailsHeight>430)){
                    $(".detailsContent").addClass("largedetailsContent");
                 }
            });
        }
        
    }
    //公告轮播
    var top =$(".move").innerHeight();
    var id =  setInterval(move,10000);
    function move(){
        $(".move").animate({
            top:-top
        },10000,function(){
            $(".move").css("top",350);
        });
    }
    //点击添加章节按钮，执行事件
    //var i = 1;
    $("#addChapter").eq(0).click(function(){
        var add = $(".addChapter").clone()[0];
        $(add).find("input").val("");//把章节内容清除
        $(add).find("textarea").val("");//把知识点内容清除
        //添加章节和内容
        $(".addChapterOuter").append(add);
    });
    //当点击不同学习方向后对应的不同知识点显示
    $("#addPublish select").eq(1).find("option").click(function(){
         //全部知识点隐藏
         $("#addPublish select").eq(2).find("option").attr("hidden","hidden");
         //全部知识点不选择
         $("#addPublish select").eq(2).find("option").removeAttr("selected");
         var val = $(this).attr("value");
         //点击元素对应的知识点显示
         $("#addPublish select").eq(2).find("option[val="+val+"]").removeAttr("hidden");
         //对应知识点第一个默认选择 
           $("#addPublish select").eq(2).find("option[val="+val+"]").eq(0).attr("selected","selected"); 
         // 304501588
    }); 
    //添加发布页面默认模拟点击前端开发方向
     $("#addPublish select").eq(1).find("option[value=1]").trigger("click");     
     //修改页面选择数据库查出来的知识点
     var dId = $(".findSelected").attr("dId");
     if(dId){
        $("#addPublish select").eq(2).find("option[value="+dId+"]").eq(0).attr("selected","selected");
     };
    //当用户登录才能搜索
    if($(".isLogin").attr("val")){
        $(".navSearch a").click(function(){
            //获取输入框的内容
            var val = $(".navSearch input[type='search']").val();
            if(val){
                //添加搜索路由
                $(this).attr("href","/search/val/"+val);
            }else{
                //当输入框中没有输入内容时，默认搜索前端开发内容
                val = "前端开发";
                $(this).attr("href","/search/val/"+val);
            }   
        }); 
    };
    //课程页面的方向点击动态改变知识点
    var liActive = $(".courseSearch ul").eq(1).find("li.active");
    if(!(liActive&&liActive.length)){
        $(".courseSearch ul").eq(1).find("li").eq(1).addClass("active");
    }
  function audit(item1,item2,url){
    item1.click(function(){
        var ids = [];
        var inputs = item2.find("input");
        for(var i = 0;i<inputs.length;i++){
            if(inputs[i].checked ==true){
                var id = $(inputs[i]).attr("val");
                ids.push(id);
            }
        } 
         $.ajax({  
             type:'get',  
             url:"/auditing/ispage/"+url,  
             data:{"ids":ids},  
             success:function(data){
                alert("操作成功");
                window.location.reload();
             },
             error:function(){
                alert("操作失败");
             }
         });
    });
  }
  //通过请求
 audit($("#unauditing button").eq(0),$("#subchecked"),"ok");
 //不通过请求
 audit($("#unauditing button").eq(1),$("#subchecked"),"no");
 //评论删除请求
 audit($("#discuss button").eq(0),$("#discussPage"),"discuss");
 var detailsHeight = parseInt($(".detailsContent").css("height"));
 if(!(detailsHeight>430)){
    console.log("height",detailsHeight);
    $(".detailsContent").addClass("largedetailsContent");
 }
});

