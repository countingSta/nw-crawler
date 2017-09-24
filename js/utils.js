var FetchHelp = {
	linkList:[],
	urlList:[],
	currentUrlIndex:0,
	callback:null,
	listCache:[],
	// env:window.location.href.replace("index.html?",""),
	start:function(list,callback){
		this.callback = callback;
		var len = list.length;
		for(var i = 0; i < len; i++){
			var model = list[i];
			if(model.websiteUrl != ""){
				this.urlList.push(model);
			}
		}
		this.fetchHtml();
	},
	fetchHtml:function(){
		var self = this;
		if(this.currentUrlIndex < this.urlList.length){
			var model = this.urlList[this.currentUrlIndex];
			var url = model.websiteUrl;
			$.ajax({
				url:url,
				// contentType:"text/html",
				success:function(html){
					try{
						self.resolve(model,html);
						self.currentUrlIndex++;
						self.fetchHtml();
					}catch(err){
						// console.log(err);
						self.currentUrlIndex++;
						self.fetchHtml();
					}
					
				},
				error:function(err){
					// console.log(err);
					self.currentUrlIndex++;
					self.fetchHtml();
				}
			})
		}else{
			this.finish();
		}		
	},
	fetchOne:function(model,callback){
		var self = this;
		$.ajax({
			url:model.websiteUrl,
			// contentType:"text/html",
			success:function(html){
				try{
					var _model = self._resolve(model,html);
					var listHtmlStr = self.toHtml4List(_model);
					callback && callback(listHtmlStr);
				}catch(err){
					// console.log(err);
					return;
				}	
			},
			error:function(err){
				// console.log(err);
				return;
			}
		})
	},
	_resolve:function(model,html){
		var self = this;
		var $html = $(html.replace(/<img/g, "<preventHttp"));
		var $a = $html.find("a");
		var caption = $html.filter("title").text();
		model.linkList = [];
		model.caption = caption;
		$a.each(function(index,ele){
			var $ele = $(ele);
			var $span = $ele.siblings("span").eq(0);
			var title = $ele.text().trim().replace("\n","");
			var href = $ele[0].getAttribute("href");

			if($ele.prop("target") == "_blank" && title.length > 10){
				if(href.indexOf("http") < 0){
					var rootPath = self.pathParse(model.websiteUrl);
					href = path.join(rootPath,href);
				}
				var link = {};
				link.url = href;
				link.title = title;
				link.date = $span.text();
				model.linkList.push(link);
			}	
		});
		return model;
	},
	pathParse:function(pathStr){
		var pathObj = path.parse(pathStr);
		var rootPath = pathObj.dir;
		var basePath = pathObj.base;
		var ret = "";
		if(basePath.indexOf(".") > -1 && basePath !== "index.html"){
			ret = basePath;
		}else{
			var temp = rootPath.split("/");
			for (var i = temp.length - 1; i >= 0; i--) {
				var query = temp[i];
				if(query.indexOf(".") > -1){
					ret = query;
					break;
				}
				
			}
		}
		return "http://" + ret;
	},
	resolve:function(model,$html){
		var _model = this._resolve(model,$html);
		this.linkList.push(_model);
	},
	toHtml4List:function(model){
		var list = model.linkList;
		var len = list.length;
		var caption = model.websiteName;
		var listStr = "";
		var ret = "";
		for(var i = 0; i < len; i++){
			var item = list[i];
			if(!item.date){
				item.date = this.dateFormat();
			}
			listStr += '<li class="clear" data-url=' + item.url + ' data-title=' + item.title + '><span class="m-title ellipsis"><a href=' + item.url + ' target="_blank">' + item.date + '----' + item.title + '</a></span><em></em></li>';
		}
		ret = '<div class="m-sub-list" data-id=' + model.id + '><h3>' + model.websiteName + '</h3><ul>' + listStr + '</ul></div>';
		return ret;
	},
	dateFormat:function () {
		var date = new Date();
		var str = "";
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		month = month < 10 ? "0" + month : month;
		var date = date.getDate();
		date = date < 10 ? "0" + date : date;
		return year + "-" + month + "-" + date;
	},
	finish:function(){
		var linkList = this.linkList;
		var len = linkList.length;
		var listHtml = "";
		for(var i = 0; i < len; i++){
			listHtml += this.toHtml4List(linkList[i]);
		}
		this.callback && this.callback(listHtml);
		this.reset();
	},
	reset:function(){
		this.urlList = [];
		this.currentUrlIndex = 0;
		this.callback = null;
	}
}

