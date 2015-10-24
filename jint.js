/*
	** jint Basic Classes
	**
	** Here goes some basic classes, that are used in almost 
	** every application that runs with jint.
*/

// This class stores RGBA color
function _jint_Color()
{
	var r=0, g=0, b=0, a=1;
	switch(arguments.length)
	{
	case 0: break;
	case 1:
		r=g=b=arguments[0];
	break;
	case 2:
		r=g=b=arguments[0]; a=arguments[1];
	break;
	case 3:
		r=arguments[0]; g=arguments[1]; b=arguments[2];
	break;
	default:
		r=arguments[0]; g=arguments[1]; b=arguments[2]; a=arguments[3];
	break;
	}
	
	r=Math.max(0, Math.min(r, 255)); g=Math.max(0, Math.min(g, 255)); b=Math.max(0, Math.min(b, 255));
	a=Math.max(0, Math.min(a, 1));
	
	//this.red=r; this.green=g; this.blue=b; this.alpha=a;
	Object.defineProperty(this, 'red', {
		get: function() { return r; },
		set: function(value)
		{
			r=Math.max(0, Math.min(value, 255));
		}
	});
	Object.defineProperty(this, 'green', {
		get: function() { return g; },
		set: function(value)
		{
			g=Math.max(0, Math.min(value, 255));
		}
	});
	Object.defineProperty(this, 'blue', {
		get: function() { return b; },
		set: function(value)
		{
			b=Math.max(0, Math.min(value, 255));
		}
	});
	Object.defineProperty(this, 'alpha', {
		get: function() { return a; },
		set: function(value)
		{
			a=Math.max(0, Math.min(value, 1));
		}
	});
	
	this.toHex=function()
	{
		return '#'+this.red.toString(16)+', '+this.green.toString(16)+', '+this.blue.toString(16)+');';
	}
	this.toString=function()
	{
		if(a<1) return 'rgba('+this.red+', '+this.green+', '+this.blue+', '+this.alpha+')';
		else return 'rgb('+this.red+', '+this.green+', '+this.blue+')';
	}
}

/*
	** jint Help Functions
	**
	** All functions in this part start with 'j_' and are never
	** used anywhere besides main jint code.
*/

// Checks if the data parameter contains undefined or not
function j_isset(data) { return typeof data != typeof undefined; }

// Creates string description of signature that matches given arguments
function j_create_sig(args)
{
	//console.log('j_create_sig(args), args:');
	//console.log(args);
	if(args.length==0) return null;
	var result=[];
	for(var i=0; i<args.length; i++)
	{
		var type=typeof args[i];
		if(type==typeof {} && j_isset(args[i].classDescription))
			type=args[i].classDescription.name;
		result.push(type);
	}
	return result.join(', ');
}

// Checks if given signature description matches given arguments list
// TODO: check the most appropriate sig
function j_match_sig(sig, args) { return j_compare_sigs(sig, j_create_sig(args)); }

// Checks whether given signature descriptions describe the same signature
function j_compare_sigs(sig1, sig2)
{
	//console.log('j_compare_sigs(sig1, sig2), ');
	//console.log(sig1+', '+sig2);
	if(sig1==sig2) return true; // they're completely equal
	if(sig1==null || sig2==null) return false; // one of them is null, when the other is not
	
	var sig1a=sig1.split(','), sig2a=sig2.split(',');
	if(sig1a.length!=sig2a.length) return false; // they contain different amounts of parameters
	for(var i=0; i<sig1a.length; i++)
	{
		var entry1=j_prepare_entry(sig1a[i]);
		var entry2=j_prepare_entry(sig2a[i]);
		// now we're expecting entries to be of a kind '{TYPE} {NAME}'
		if(!j_compare_sig_entries(entry1, entry2)) return false; // entries differ => signatures differ
	}
	return true;
}

// Checks an equallity of two text descriptions of signature entry
function j_compare_sig_entries(entry1, entry2)
{
	var e1=entry1.split(' '), e2=entry2.split(' ');
	if(e1[0]==e2[0]) return true; // types are equal <=> entries are equal
	if(jint.classes.getParentDepth(e1[0], e2[0])!=-1) return true; // (entry1) is parent of (entry2)
	if(jint.classes.getParentDepth(e2[0], e1[0])!=-1) return true; // (entry2) is parent of (entry1)
	return false;
}

// Clears trailing, leading and doubling whitespaces
function j_prepare_entry(entry) { return entry.replace(/(^\ *)|(\ *$)/g, '').replace(/(\ {2,})/g, ' '); }

// Returns specially formatted object, containing signature description and named arguments (if the names are specified)
function j_parse_sig(sig, args)
{
	//console.log('j_parse_sig(sig, args), sig:"'+sig+'" args:');
	//console.log(args);
	
	if(sig==null) return null;
	
	var result={};
	var signature=sig.split(',');
	for(var i=0; i<signature.length; i++)
	{
		var entry=j_prepare_entry(signature[i]);
		var paramname=entry.split(' ')[1];
		if(!j_isset(args[i]))
		{
			args[i]=jint.getDefaultValueFor(entry.split(' ')[0]);
		}
		if(j_isset(paramname) && paramname!=null)
		{
			result[paramname]=args[i];
		}
		result[''+i]=args[i];
	}
	return result;
}

/*
	** Main Functions and Classes Definitions
	**
	** Here go jint object definition, most basic standart classes and mechanisms.
*/

jint={};

jint.getDefaultValueFor=function(type)
{
	switch(type)
	{
		case typeof 0: return 0;
		case typeof '': return '';
		default: return null;
	}
}

jint.Object=function()
{
	this.classDescription={
		name: 'Object', package: 'std', superclass: null,
		init:
		[
			null,
			function() { }
		],
		methods: []
	};
	
	this.superclass=null;
	
	this.getInitSignatures=function()
	{
		result=[];
		for(var x in this.classDescription.init)
		{
			if(typeof this.classDescription.init[x] == typeof '')
				result.push(this.classDescription.init[x]);
			else if(this.classDescription.init[x]==null)
				result.push(this.classDescription.init[x]);
		}
		return result;
	}
	
	this.init=function(signature, args)
	{
		var cld=this.classDescription;
		
		//console.log('init in '+jint.classes.createName(cld.name, cld.package));
		
		for(var i=0; i<cld.init.length; i+=2)
		{
			if(j_compare_sigs(signature, cld.init[i]))
			{
				// signature suits this init, call it
				// (in context of this and with specially formatted args parameter)
				cld.init[i+1].apply(this, [j_parse_sig(cld.init[i], args)]);
				return;
				// if superclass init should be called, it's made inside this.init with this.initSuper(...)
			}
		}
		throw new Error('No init function with such signature! (sig:"'+signature+'", class '+this.classDescription.name+')');
	}
	
	this.initSuper=function() {}

}

jint.classes={};

jint.std={};
jint.std.Object=jint.Object;

jint.classes.createName=function(name, package)
{ return j_isset(package)? package+'.'+name : name; }

jint.classes.all=[ 'std.Object' ];
jint.classes.getByFullName=function(name)
{
	var names=name.split('.');
	var parent=jint;
	for(var i=0; i<names.length-1; i++)
	{
		if(!j_isset(parent[names[i]])) throw new Error('Namespace "'+names[i]+'" in path "'+name+'" does not exist.');
		parent=parent[names[i]];
	}
	// setting name to classname
	name=names[names.length-1];
	return parent[name];
}
jint.classes.getByClassName=function(name)
{
	var result=[];
	for(var x in jint.classes.all)
	{
		var arr=jint.classes.all[x].split('.');
		if(arr[arr.length-1]==name)
			result.push(jint.classes.getByFullName(jint.classes.all[x]));
	}
	return result;
}
// returns a number of links between found parent class and child class (e.g. 1 for direct parent, 0 for oneself, -1 if no links found)
jint.classes.getParentDepth=function(parentName, childName)
{
	var parent=null, child=null;
	// given names may both be full (supposed every name containing '.' to be full name) and class names;
	// here we check this and choose between functions to use to find the class
	// using an array in both cases to simplify next code
	if(parentName.indexOf('.')!=-1) parent=[ jint.classes.getByFullName(parentName) ];
	else parent=jint.classes.getByClassName(parentName);
	if(childName.indexOf('.')!=-1) child=[ jint.classes.getByFullName(childName) ];
	else child=jint.classes.getByClassName(childName);
	
	// now we need to assert that there'is the only child; otherwise we have names conflict
	if(child.length>1)
		throw new Error('There are at least two classes bearing name "'+childName+'". Use full names to avoid name conflicts.');
	
	child=child[0];
	var iteration=0;
	while(child!=null)
	{
		for(var i=0; i<parent.length; i++)
		{
			if(child==parent[i]) return iteration;
		}
		++iteration;
		child=child.superclass;
	}
	return -1;
}

// TODO: add abstract classes
jint.classes.register=function(classDescription)
{
	var name=jint.classes.createName(classDescription.name, classDescription.package);
	
	if(jint.classes.all.indexOf(name)==-1) jint.classes.all.push(name);
	else throw new Error('The class "'+name+'" already exists and cannot be registered again!');
	
	if(!j_isset(classDescription.superclass)) classDescription.superclass=jint.Object;
	if(!j_isset(classDescription.methods)) classDescription.methods=[];
	
	// creating all nesessary objects
	var names=name.split('.');
	var parent=jint;
	for(var i=0; i<names.length-1; i++)
	{
		if(!j_isset(parent[names[i]])) parent[names[i]]={};
		parent=parent[names[i]];
	}
	// setting name to classname
	name=names[names.length-1];
	
	// and creating the class
	parent[name]=function()
	{
		var cld=arguments.callee.classDescription;
		this.classDescription=cld;
		this.superclass=cld.superclass;
		this.__proto__=new cld.superclass();
		
		this.init=function(signature, args)
		{
			var cld=this.classDescription;
			for(var i=0; i<cld.init.length; i+=2)
			{
				if(j_compare_sigs(signature, cld.init[i]))
				{
					// signature suits this init, call it
					// (in context of this and with specially formatted args parameter)
					cld.init[i+1].apply(this, [j_parse_sig(cld.init[i], args)]);
					return;
					// if superclass init should be called, it's made inside this.init with this.initSuper(...)
				}
			}
			throw new Error('No init function with such signature! (sig:"'+signature+'", class '+this.classDescription.name+')');
		}
		this.initSuper=function()
		{
			var sig=j_create_sig(arguments);
			this.__proto__.init(sig, arguments);
		}
		this.getInitSignatures=function()
		{
			this.__proto__.getInitSignatures.apply(this, arguments);
		}
		
		for(var x in cld.methods)
		{
			this[x]=function()
			{
				var result=this.classDescription.methods[arguments.callee.fname].apply(this, arguments);
				return j_isset(result)? result : this;
			}
			this[x].fname=x;
		}
		
		// firstly, call superclass default init
		this.initSuper();
		// secindly, call own defaut init
		this.init(null, null);
		
		// then let's try to find and call appropriate init
		var sig=j_create_sig(arguments);
		//console.log('this.init() in '+cld.name);
		this.init(sig, arguments);
	}
	
	parent[name].classDescription=classDescription;
	parent[name].superclass=classDescription.superclass;
}

jint.createEnum=function(enumDescription)
{
	var name=enumDescription.name;
	var package=enumDescription.package;
	var values=enumDescription.values;
	var methods=enumDescription.methods || {};
	
	var fullname=jint.classes.createName(name, package);
	
	// creating all nesessary objects
	var names=fullname.split('.');
	var parent=jint;
	for(var i=0; i<names.length-1; i++)
	{
		if(!j_isset(parent[names[i]])) parent[names[i]]={};
		parent=parent[names[i]];
	}
	
	parent[name]={};
	for(var i in values)
	{
		var tmp={};
		// adding methods
		for(var j in methods)
		{
			tmp[j]=methods[j];
		}
		tmp.value=values[i];
		parent[name][values[i]]=tmp;
		// std['MyEnum']['MY_CONSTANT']={ ... }
	}
	parent[name].getValues=function()
	{
		return values;
	}
}

jint.unpack=function(name)
{
	if(name.indexOf('classes')==0 || name.indexOf('*')==0 || name.indexOf('debug')==0) return;
	
	jint.debug.log('Unpacking "'+name+'"...');
	
	var package=name.split('.');
	name=package.splice(-1, 1)[0];
	
	var parent=jint;
	for(var i=0; i<package.length; i++)
	{
		if(!j_isset(parent[package[i]])) throw new Error('Specified package does not exist!');
		parent=parent[package[i]];
	}
	
	if(name=='*')
	{
		for(var x in parent)
		{
			window[x]=parent[x];
		}
	}
	else
	{
		window[name]=parent[name];
	}
}

jint.load=function(path)
{
	jint.debug.log('Loading "'+path+'"...');
	var script=document.createElement('script');
	script.setAttribute('src', path);
	document.getElementsByTagName('head')[0].appendChild(script);
}

jint.debug={};
jint.debug.enabled=true;
jint.debug.journal=[];
jint.debug.log=function(obj)
{
	jint.debug.journal.push( { at: new Date(), message: obj } );
	if(jint.debug.enabled) console.log(obj);
}


/*
	** Initializing section
	**
	** Here are being loaded main packages and libs,
	** e.g. std.*
*/
auto=jint.auto={ toString: function() { return '<auto>' } };

jint.load('./lib/std.js')


/*
	** Test Section
	**
	** Here lay some test definitions and calls.
	** (will be removed later)
*/
