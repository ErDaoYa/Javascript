require("../../js/model/ui/js/plugins/cookie/jquery.cookie");
/**
 * 全局请求ajax变量
 * @type {Object}
 */
var njx = {
	options:{
		get:'GET',
		post:'POST',
		put:'PUT',
		delete:'DELETE',
		patch:'PATCH',
		copy:'COPY',
		head:'HEAD',
		options:'OPTIONS',
		link:'LINK',
		unlink:'UNLINK',
		purge:'PURGE',
		async:{
			//同步
			sync:true,
			//异步
			async:false
		}
	},

	accepts:{
	   'Content-Type':'application/x-www-form-urlencoded',
	   'Accept' : 'application/json',
	   'x-gomeplus-admin-login-token' : $.cookie('loginToken'),
	   'x-gomeplus-admin-user-id' : $.cookie('userId')
	},

	post:function(options){
		this.temps = {
			url : '',
			headers:this.accepts,
			type:'post',
			data : '',
			success : function(){},
			async : true,
			error : function(){},
		}
		this.newtemps = $.extend(this.temps, options);
		$.ajax(this.newtemps)	
	},

	get:function(options){
		this.temps = {
			url : '',
			type:'get',
			headers:this.accepts,
			data : '',
			success : function(){},
			async : true,
			error : function(){},
		}
		this.newtemps = $.extend(this.temps, options);
		$.ajax(this.newtemps)	
	},

	jsonp:function(options){
		this.temps = {
			async:false,
			url:'',
			type:'get',
			headers:this.accepts,
			dataType:'jsonp',
			jsonp: function(){}, //默认callback 
			data: '', //请求数据 
			timeout: 0, 
			success:function(){},  
			error:function(){},
		}
		this.newtemps = $.extend(this.temps, options);
		$.ajax(this.newtemps)	
	}
}

module.exports = njx;