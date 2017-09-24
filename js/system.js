var system = {
	MODEL_CID:0,
	uuid:function(){
		var now = new Date();
		return ~~(now.getTime() / 1000) + this._getIndex();
	},
	_getIndex:function(){
		var index = this.MODEL_CID;
		index++;
		if (index >= 1000) {
			index = 1;
		}
		var nn = "" + index;
		while (nn.length < 3) {
			nn = "0" + nn;
		}
		return nn;
	},
	_mkdirs:function (rootPath, alias) {
		var index = 0;
		var pst = rootPath;
		while (index < alias.length) {
			pst = path.resolve(pst,alias[index++]);
			if (!fs.existsSync(pst)) {
				fs.mkdirSync(pst);
			}
		}
	},
	_mkPath:function(rootPath,alias){
		var index = 0;
		var ret = rootPath;
		while(alias.length > index){
			ret = path.resolve(ret,alias[index++]);
		}
		return ret;
	},
	Api_DATA_SAVE:function(fileName,alias,model){
		var list = null;		
		try{
			var dirPath = this._mkPath(root_dir,alias);
			var filePath = path.resolve(dirPath,fileName);
			if(fs.existsSync(filePath)){
				var source = fs.readFileSync(filePath,{
					encoding:"utf8"
				});
				var data = JSON.parse(source);
				list = Array.isArray(data) ? data : [];
			}else{
				this._mkdirs(root_dir,alias);
				list = [];
				model.id = this.uuid();
			}
			list.unshift(model);
			fs.writeFileSync(filePath,JSON.stringify(list),{
				encoding:"utf8"
			});
		}catch(err){
			// console.log(err);
			swal("提示", "系统错误","error");
			return;
		}
		return list;
	},
	Api_DATA_ADD:function(fileName,alias,list){
		var ret = [];		
		try{
			var dirPath = this._mkPath(root_dir,alias);
			var filePath = path.resolve(dirPath,fileName);
			var coll = [];
			if(fs.existsSync(filePath)){
				var source = fs.readFileSync(filePath,{
					encoding:"utf8"
				});
				var data = JSON.parse(source);
				coll = Array.isArray(data) ? data : [];
			}else{
				this._mkdirs(root_dir,alias);
				coll = [];
			}
			var modelMap = {};
			coll = coll.concat(list);
			for (var i = coll.length - 1; i >= 0; i--) {
				var model = coll[i];
				if(!modelMap[model.url]){
					ret.push(model);
					modelMap[model.url] = 1;
				}
			}
			fs.writeFileSync(filePath,JSON.stringify(ret),{
				encoding:"utf8"
			});
		}catch(err){
			// console.log(err);
			swal("提示", "系统错误","error");
			return;
		}
		return ret;
	},
	Api_DATA_REMOVE:function(fileName,alias,modelId){
		var list = [];
		try{
			var dirPath = this._mkPath(root_dir,alias);
			var filePath = path.resolve(dirPath,fileName);
			if(!fs.existsSync(filePath)){
				return;
			}
			var source = fs.readFileSync(filePath,{
				encoding:"utf8"
			});
			var data = JSON.parse(source);
			list = Array.isArray(data) ? data : [];
			var len = list.length;
			for(var i = 0; i < len; i++){
				if(list[i].id == modelId){
					list.splice(i,1);
					break;
				}
			}
			fs.writeFileSync(filePath,JSON.stringify(list),{
				encoding:"utf8"
			});
		}catch(err){
			// console.log(err);
			swal("提示", "系统错误","error");
			return;
		}
		return list;
	},
	Api_DATA_FIND:function(fileName,alias){
		var list = [];
		try{
			var dirPath = this._mkPath(root_dir,alias);
			var filePath = path.resolve(dirPath,fileName);
			if(!fs.existsSync(filePath)){
				this._mkdirs(root_dir,alias);
				fs.writeFileSync(filePath,JSON.stringify(list),{
					encoding:"utf8"
				});
				return list;
			}
			var source = fs.readFileSync(filePath,{
				encoding:"utf8"
			});
			var data = JSON.parse(source);
			list = Array.isArray(data) ? data : [];
		}catch(err){
			// console.log(err);
			swal("提示", "系统错误","error");
			return;
		}
		return list;
	},
	Api_DATA_FILTER:function(fileName,alias,filter){
		var list = this.Api_DATA_FIND(fileName,alias);
		var len = list.length;
		var ret = [];
		for(var i = 0; i < len; i++){
			var model = list[i];
			if(filter(model)){
				ret.push(model)
			}
		}
		return ret;
	},
	Api_DATA_UPDATE:function(fileName,alias,model){
		var list = [];
		try{
			var dirPath = this._mkPath(root_dir,alias);
			var filePath = path.resolve(dirPath,fileName);

			if(!fs.existsSync(filePath)){
				list.push(model);
				this._mkdirs(root_dir,alias);
				fs.writeFileSync(filePath,JSON.stringify(list),{
					encoding:"utf8"
				});
				return list;
			}
			var source = fs.readFileSync(filePath,{
				encoding:"utf8"
			});
			var data = JSON.parse(source);
			list = Array.isArray(data) ? data : [];
			var len = list.length;
			for(var i = 0; i < len; i++){
				if(list[i].id == model.id){
					list[i] = model;
					break;
				}
			}

			fs.writeFileSync(filePath,JSON.stringify(list),{
				encoding:"utf8"
			});
		}catch(err){
			console.log(err);
			swal("提示", "系统错误","error");
			return;
		}
		return list;
	}
}
