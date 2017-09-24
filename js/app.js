$(document).ready(function() {
    //容器显示
    var g_ui = {
        login: {
            isLogin: false,
            userInfo: null
        },
        left: {
            isInit: false,
            show: true
        },
        content: {
            isInit: false,
            show: true
        },
        right: {
            isInit: false,
            show: false
        }
    }

    //初始化

    // main
    mainListInit();
    //left
    leftListInit();
    //right
    rightListInit();

    //日期控件事件绑定  
    $("#startDate").on("click", function() {
        laydate({
            elem: "#startDate",
            format: 'YYYY-MM-DD',
            max: laydate.now(),
            istime: false
        });
    });

    $("#endDate").on("click", function() {
        laydate({
            elem: "#endDate",
            format: 'YYYY-MM-DD',
            max: laydate.now(),
            istime: false
        });
    });

    //收藏夹事件绑定
    $("#favorites").on("click", function() {
        var m_content_go = 0;
        var m_right = -400;
        if (!g_ui.right.show) {
            m_content_go = 400;
            m_right = 0;
        }
        $(".m-content").stop(true).animate({ right: m_content_go });
        $(".m-right").stop(true).animate({ right: m_right });
        g_ui.right.show = !g_ui.right.show;
    });


    //添加网站
    $("#addWebsite").on("click", function() {
        //添加网站记录
        editWebsiteMsg({},function(){
            var websiteName = $("#websiteName").val();
            var websiteUrl = $("#websiteUrl").val();
            if(websiteName == ""){
                swal.showInputError("请输入网站名称!");
                return false;
            }

             if(websiteUrl == ""){
                swal.showInputError("请输入网站链接!");
                return false;
            }
            
            var model = {
                id:system.uuid(),
                websiteName:websiteName,
                websiteUrl:websiteUrl
            }
            //写入本地文件
            var list = system.Api_DATA_SAVE("website.bdb",["myData","website"],model);
      
            if(list){
                $("#m-left-list-container").append(getHtmlStr4Website(model));
                swal({ 
                    title: "正在抓取链接", 
                    imageUrl:"./images/loading.gif",
                    cancelButtonText: "取消",
                    showConfirmButton:false,
                    showCancelButton: true, 
                    closeOnConfirm: false, 
                    showLoaderOnConfirm: true, 
                });
                FetchHelp.fetchOne(model,function(htmlStr){
                    swal("提示", "您的网站记录添加成功。","success");
                    $(".m-list-container").prepend(htmlStr);
                })   
            }
        })
    });

    //左边侧边栏事件绑定
    //编辑
    $("#m-left-list-container")
    .on("click", "span.item-edit", function() {
        var $model = $(this).parent();
        var id = $model.attr("data-id");
        var websiteUrl = $model.attr("data-url");
        var websiteName = $model.attr("data-title");

        var model = {
            id:id,
            websiteName:websiteName,
            websiteUrl:websiteUrl
        }
        //编辑网站
        editWebsiteMsg(model,function(){
            var websiteName = $("#websiteName").val();
            var websiteUrl = $("#websiteUrl").val();
            if(model.websiteName == ""){
                swal.showInputError("请输入网站名称!");
                return false;
            }

             if(websiteUrl == ""){
                swal.showInputError("请输入网站链接!");
                return false;
            }
            model.websiteName = websiteName;
            model.websiteUrl = websiteUrl;
            var list = system.Api_DATA_UPDATE("website.bdb",["myData","website"],model)
            if(list){
                swal("提示", "您的网站记录编辑成功。","success");
                leftListInit();               
            }
        });    
    }).on("click", "span.item-remove", function() {
        var $model = $(this);
        swal({
            title: "您正在删除网站记录！",
            text: "您确定要删除这条记录吗！",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            closeOnConfirm: false
        },
        function(isConfirm) {
            if (isConfirm) {
                //删除网站记录
                var modelId = $model.parent().attr("data-id");
                var list = system.Api_DATA_REMOVE("website.bdb",["myData","website"],modelId);
                if(list){
                    leftListInit();
                    swal("提示", "该条网站记录删除成功!。","success");
                }
            } 
        });
    });

    //右侧侧边栏事件绑定
    //收藏记录删除
    $("#favorites-container").on("click","span.m-right-del",function(){
        var id = $(this).attr("data-id");
        swal({
            title: "您正在删除收藏记录！",
            text: "您确定要删除这条收藏记录吗！",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            closeOnConfirm: false
        },
        function(isConfirm) {
            if (isConfirm) {
                var list = system.Api_DATA_REMOVE("favorites.bdb",["myData","favorites"],id)
                if(list){
                    swal("删除！", "该条收藏记录已经被删除。","success");
                    rightListInit();
                }       
            } 
        });
    });


    //查询收藏记录
    $("#searchByFavorites").on("click",function(){
        var findword = $("#search-favorites-word").val();
        var sDate = $("#startDate").val();
        var eDate = $("#endDate").val();
     
        var filter = {};
        filter["keyword"] = findword;

        if(sDate && eDate){
            var startDate = new Date(sDate).getTime();
            var endDate = new Date(eDate).getTime();
            if(startDate > endDate){
                filter["sDate"] = startDate;
                filter["eDate"] = Infinity;
            }else{
                filter["sDate"] = startDate;
                filter["eDate"] = endDate;
            }
        }else if(sDate && !eDate){
            filter["sDate"] = new Date(sDate).getTime();
            filter["eDate"] = Infinity;
        }else if(!sDate && eDate){
            var now = new Date().getTime();
            filter["sDate"] = 0;
            filter["eDate"] = new Date(eDate).getTime();
        }else{
            filter["sDate"] = 0;
            filter["eDate"] = Infinity;
        }

        var list = system.Api_DATA_FILTER("favorites.bdb",["myData","favorites"],function(model){
            var testDate = new Date(model.dateStr).getTime();
            if(model.title.indexOf(filter.keyword) < 0){
                return false;
            }
            if(testDate < filter.sDate || testDate > filter.eDate){
                return false;
            }
            return true;
        });

        var htmlStr = "";
        for (var i = list.length - 1; i >= 0; i--) {
            htmlStr += getHtmlStr4Favorites(list[i]);
        }
        $("#favorites-container").html(htmlStr);     
    });

    //内容部分事件绑定
    $(".m-list-container").on("click","em",function(){
        var $em = $(this);
        if($em.hasClass("check")){
            $em.removeClass("check");
        }else{
            $em.addClass("check");
        }
    });


    //中间部分搜索功能事件绑定
    $("#searchByWord").on("click",function(){
        var findword = $("#search-word").val();
        var list = FetchHelp.linkList;
        var render = [];
        if(findword == ""){
            var allListStr = "";
            for (var i = list.length - 1; i >= 0; i--) {
                allListStr += FetchHelp.toHtml4List(list[i]);
            }
            $(".m-list-container").html(allListStr);
            return;
        }
        var length = list.length;  
        for(var i = 0; i < length; i++){
            var linkList = list[i].linkList;
            var ll = linkList.length;
            for(var j = 0; j < ll; j++){
                var model = linkList[j];
                if(model.title.indexOf(findword) > -1){
                    render.push(model);
                }
            }
        }
        
        var model = {
            id:system.uuid(),
            websiteName:"搜索结果",
            linkList:render
        };

        var htmlStr = FetchHelp.toHtml4List(model);
        $(".m-list-container").html(htmlStr);
    });

    //批量收藏
    $("#collect").on("click",function(){
        var $model = $(".m-list-container").find("li");
        var list = [];
        $model.each(function(index,ele){
            var $li = $(this);
            var $em = $li.find("em");
            if($em.hasClass("check")){
                var title =  $li.attr("data-title");
                var url =  $li.attr("data-url"); 
                var model = {};
                model.id = system.uuid();
                model.date = new Date().getTime();
                model.dateStr = FetchHelp.dateFormat();
                model.url = url;
                model.title = title;
                list.push(model);
                $em.removeClass("check");
            }
        })
        if(list.length < 1){
            swal("提示", "请选择需要收藏的网站。","warning");
            return;
        }
        var favorites = system.Api_DATA_ADD("favorites.bdb",["myData","favorites"],list);

        if(favorites.length){
            swal("提示", "您的网站收藏成功。","success");
            rightListInit();
        }
    });


    //刷新
    $("#reload").on("click",function(){
        window.location.reload();
    });

    //返回首页
    $("#indexPage").on("click",function(){
        window.location.reload();
    });

     //修改或添加网站记录
    function editWebsiteMsg(model,callback){
        var name = model.websiteName || "";
        var url = model.websiteUrl || "";
        swal({
                title: "您正在添加网站！",
                text: "<input type='text' placeholder='请输入网站名称' value='" + name + "' class='input-ctrl' id='websiteName'/><input type='text' value='" + url + "' placeholder='请输入网站链接' class='input-ctrl' id='websiteUrl'/>",
                html: true,
                type: "info",
                showCancelButton: true,
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm:false,
                customClass:"hack"
            },
            function(s) {
                callback && callback();
                return false
                // swal("提示", "您的网站记录编辑成功。","success");
            }
        );
    }
    //中间容器初始化
    function mainListInit(){
        swal({ 
            title: "正在抓取新闻", 
            imageUrl:"./images/loading.gif",
            cancelButtonText: "取消",
            showConfirmButton:false,
            showCancelButton: true, 
            closeOnConfirm: false, 
            showLoaderOnConfirm: true, 
        });
        var list = system.Api_DATA_FIND("website.bdb",["myData","website"]);
        if(list){
            FetchHelp.start(list,function(html){
                $(".m-list-container").html(html);
                swal.close();
            })
        }    
    }
    //左边容器初始化
    function leftListInit(){
        var list = system.Api_DATA_FIND("website.bdb",["myData","website"]);
        var htmlStr = "";
        var len = list.length;
        for(var i = 0; i < len; i++){
            htmlStr += getHtmlStr4Website(list[i]);
        }
        $("#m-left-list-container").html(htmlStr);
    }
    //右边容器初始化
    function rightListInit(){
        var list = system.Api_DATA_FIND("favorites.bdb",["myData","favorites"]);
        var htmlStr = "";
        var len = list.length;
        for(var i = 0; i < len; i++){
            htmlStr += getHtmlStr4Favorites(list[i]);
        }
        $("#favorites-container").html(htmlStr);
    }
});
