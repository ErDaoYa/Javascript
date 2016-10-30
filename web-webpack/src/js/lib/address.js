module.exports = {

	/**
	 * 前缀
	 * @type {String}
	 */
	prefix:'http://localhost',
	/**
	 * 存放cookies域
	 * @type {String}
	 */
	domain:'admingome.com',
	/**
	 * 登录
	 * @type {Object}
	 */
	login:{
		loginPath:'/v2/permission/loginToken'
	},
	/**
	 * 用户
	 * @type {Object}
	 */
	user:{
		userPermission:'/v2/permission/user',
		getUser:'/v2/permission/users'
	},
	/**
	 * 角色
	 * @type {Object}
	 */
	role:{
	   //角色资源
	   rolePath:'/v2/permission/role',
	   //角色列表
	   rolesPath:'/v2/permission/roles'
	},

	/**
	 * 权限
	 * @type {Object}
	 */
	privilege:{
		//权限列表
		privilegeConfs:'/v2/permission/menuPrivilegeConfs',
		//按钮级别权限
		buttonLevelPermissions:'/v2/permission/userPermissions'
	},

	/**
	 * 主页树
	 * @type {Object}
	 */
	menu:{
		menus:'/v2/permission/userMenus'
	},

	/**
	 * 代理层校验是否登录和登录token是否相同
	 * @type {Object}
	 */
	proxy:{
	   token:'/v2/permission/token'
	},

	/**
	 * 统一获取域名地址
	 * @Description {{Description}}
	 * @author yuanchangjun
	 * @date        2016-10-26
	 * @param       {[type]}        path [description]
	 * @return      {[type]}             [description]
	 */
	getPath:function(path){
		/*var proxyThat = this;
		njx.get({
		   url:proxyThat.proxy.token+'?adminUserId='+proxyThat.getCookie("userId"),
		   type:njx.options.async.sync,
		   success:function(data){
		   		if(data.data.token == proxyThat.getCookie("loginToken"))
		   			 return this.prefix + path;
		   }
		});
		alert("登录信息已过期请重新登录");
   		window.location.href="/app";*/
   		 return this.prefix + path;
	},

	/**
	 * 获取cookie仅address内部使用
	 * @Description {{Description}}
	 * @author yuanchangjun
	 * @date        2016-10-27
	 * @param       {[type]}        name [description]
	 * @return      {[type]}             [description]
	 */
	getCookie:function(name){
		var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
		if(arr=document.cookie.match(reg))
			return unescape(arr[2]);
		else
			return null;
	},

	/**
	 * @Description 对象转json传递到后台
	 * @author yuanchangjun
	 * @date        2016-10-26
	 * @param       {[type]}        params [description]
	 * @return      {[type]}               [description]
	 */
	json:function(params){
		return JSON.stringify(params);
	}
}