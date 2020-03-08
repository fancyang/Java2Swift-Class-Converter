function regex(str) {
	return new RegExp(str, 'gm');
}



function type_except(type){

	var format = "(?!.*"+type+")";
	//(?!.*排除的字符串)
	 
	return format;
	
}

function type_keyword(){

var format = "[^(public|private|function|)]";



}


function type_expresion() {
	var format = "([^ ]+) ([^ ]+) = ([^ ]+);";
	 
	return format;
}

function type_format(type) {
	var format = {"int": "Int", "double": "Double", "float": "Float", "boolean": "Bool", "long": "Long"};
	if(type in format) {
		return format[type];
	}
	return type;
}
function type_expr(type) {
	var format = {"int": "0", "double": "0.0", "float": "0.0", "boolean": "false", "long": "0", "String": "\"\""};
	return format[type];
}

function type_params(params) {
	var pattern = regex("(.*)\\s+(.*)");
	var params = params.split(',');
	params.forEach(function (item, idx) {
		item = item.trim();
		params[idx] = item.replace(pattern,  function(all, type, name){
			return "_ "+name+": "+type_format(type);
		});
	});
	return params.join(", ");
}

function convert() {
	var from = document.getElementById("from");
	var to = document.getElementById("to");
	
	var source = from.value;
	var pattern;
	
	//查找类名
	var class_name = "";
	pattern = regex("class\\s+(.+?)\\s+\\{");
	match = pattern.exec(source);
	class_name = match[1];
	
	//删除package包定义
	pattern = regex("package\\s+(.*);\\s*");
	source = source.replace(pattern, "");
	
	//删除导入
	pattern = regex("import\\s+(.*);\\s*");
	source = source.replace(pattern, "");
	
	//更改this-> self
	pattern = regex("this\\.");
	source = source.replace(pattern, "self.");
	
	//更改null-> nil
	pattern = regex("null");
	source = source.replace(pattern, "nil");
	
 

	//更改变量声明

	//带有private关键字
	//没有分配
	pattern = regex("private[\\s]+([^\\s]+)[\\s]+([^\\s]+);");
	source = source.replace(pattern,  function(all,type, name){
		//return "var "+name+": "+type_format(type)+" = "+type_expr(type)+";";
		return   "var "+name+" : "+type_format(type)+"?;";
	});

	//分配
	pattern = regex("private[\\s]+([^\\s]+)[\\s]+([^\\s]+) = ([^\\s]+);");
	source = source.replace(pattern,  function(all,type, name, expr){
		return 'var '+name+" : "+type_format(type)+" = "+expr+";";
	});




	//不带private关键字
	//没有分配		
	//		([	]+)(?!.*return.*)([^ ]+)[ ]+([^ ]+);
	var except = type_except("return");
	pattern = regex("([\\t]+)"+except+"([^\\s]+)[\\s]+([^\\s]+);");
	source = source.replace(pattern,  function(all,table,type, name){
		//return "var "+name+": "+type_format(type)+" = "+type_expr(type)+";";
		return table + "var "+name+" : "+type_format(type)+"?;";
	});

	//分配
	pattern = regex("([\\t]+)([^\\s]+)[\\s]+([^\\s]+) = ([^\\s]+);");
	source = source.replace(pattern,  function(all, table,type, name, expr){
		return table + 'var '+name+" : "+type_format(type)+" = "+expr+";";
	});
	

	//新建赋值
	//带类型
	pattern = regex("([\\t]+)([^\\s]+)[\\s]+([^\\s]+) = new[\\s]+([^\\s]+);");
	source = source.replace(pattern,  function(all, table,type, name, expr){
		return table +name +" = "+expr+";";
	});
	
	//不带类型
	pattern = regex("([\\t]+)([^\\s]+) = new[\\s]+([^\\s]+);");
	source = source.replace(pattern,  function(all, table, name, expr){
		return table + name +" = " + expr+";";
	});
		
	

	//更改for循环结构
	//		for[\s]{0,}\((.*)[\s]+(.*)=(.*);[\s]{0,}(.*)<(.*);[\s]{0,}(.*)
	pattern = regex("for[\\s]{0,}\\([\\s]{0,}([^\\s]+)[\\s]{0,}([^\\s])[\\s]{0,}=[\\s]{0,}([^\\s])[\\s]{0,};[\\s]{0,}[^\\s]+[\\s]{0,}<[\\s]{0,}([^\\s]+)[\\s]{0,};[\\s]{0,}[^\\s]+[\\s]{0,}\\)[\\s]{0,}(.*)");
	source = source.replace(pattern,  function(all,type, name, expr,range,tail){
		return "for " + name +" in "+ expr + " ..< " + range +" "+ tail ;
	});



	//更改构造函数
	pattern = regex("(public\\s+|private\\s+|protected\\s+|)"+class_name+"\\((.*?)\\)\\s*{");
	source = source.replace(pattern,  function(all, t, params){
		return "init("+type_params(params)+") {";
	});
	
	//更改函数参数
	pattern = regex("(public\\s+|private\\s+|protected\\s+)(.*?)\\s+(.*?)\\((.*?)\\)\\s*{");
	source = source.replace(pattern,  function(all, t, type, name, params){
		var rtn_type = "";
		if(type != 'void') {
			rtn_type = " -> "+type_format(type);
		}
		return "func "+name+"("+type_params(params)+")"+rtn_type+" {";
	});
	
	to.value = source.trim();
}
