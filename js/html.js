function getHtmlStr4Website(model){
	var id = model.id;
	var url = model.websiteUrl;
	var title = model.websiteName;
	var str = '<li class="zcd" data-url=' + url + ' data-id=' + id + ' data-title=' + title + '><span class="item-txt ellipsis" title="' + title + '">' + title + '</span><span class="item-edit"></span><span class="item-remove"></span></li>';
	return str;
}

function getHtmlStr4Favorites(model){
	var id = model.id;
	var url = model.url;
	var title = model.title;
	var date = model.dateStr;
	var str = '<tr><td><span class="t-ellipsis" title=' + title + '><a href=' + url +' target="_blank">' + title + '</a></span></td><td>' + date + '</td><td><span data-id=' + id + ' class="btn btn-danger btn-xs m-right-del">删除</span></td></tr>';
	return str;
}
