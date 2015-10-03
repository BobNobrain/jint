/*
	** jint Basic Classes
	**
	** Here goes some basic classes, that are used in almost 
	** every application that runs with jint.
*/

// This class is used to store 2D size (width and height)
function Size(width, height)
{
	this.width=width; this.height=height;
	this.scale=function(xscale, yscale)
	{
		if(!j_isset(yscale)) yscale=xscale;
		this.width*=xscale; this.height*=yscale;
	}
}

// This class stores 2D position (almost the same to Size, but just with other names)
function Point(x, y)
{
	this.x=x; this.y=y;
}

// This class stores RGBA color
function Color()
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
		if(a<1) return 'rgba('+this.red+', '+this.green+', '+this.blue+', '+this.alpha+');';
		else return 'rgb('+this.red+', '+this.green+', '+this.blue+');';
	}
}

// This class stores a rectangle (4 numbers) and declares its sides' properties
function Rect(x, y, width, height)
{
	this.x=x; this.y=y;
	var _w=width, _h=height;
	if(_w<0) _w=0;
	if(_h<0) _h=0;
	
	Object.defineProperty(this, 'left', {
		get: function() { return this.x; },
		set: function(value)
		{
			this.x=value;
		}
	});
	
	Object.defineProperty(this, 'right', {
		get: function() { return this.x+_w; }
	});
	
	Object.defineProperty(this, 'top', {
		get: function() { return this.y; },
		set: function(value)
		{
			this.y=value;
		}
	});
	
	Object.defineProperty(this, 'bottom', {
		get: function() { return this.y+_h; }
	});
	
	Object.defineProperty(this, 'width', {
		get: function() { return _w; },
		set: function(value)
		{
			if(value<0) _w=0;
			else _w=value;
		}
	});
	Object.defineProperty(this, 'height', {
		get: function() { return _h; },
		set: function(value)
		{
			if(value<0) _h=0;
			else _h=value;
		}
	});
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
	return e1[0]==e2[0]; // types are equal <=> entries are equal
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

jint.classes.createName=function(name, package)
{ return j_isset(package)? package+'.'+name : name; }

jint.classes.register=function(classDescription)
{
	var name=jint.classes.createName(classDescription.name, classDescription.package);
	
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
				this.classDescription.methods[arguments.callee.fname].apply(this, arguments);
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

jint.classes.register({
	name: 'Size', package: 'std',
	init:
	[
		null,
		function()
		{
			this.x=0;
			this.y=0;
		},
		"number x, number y",
		function(args)
		{
			this.x=args.x;
			this.y=args.y;
		}
	],
	methods: []
});

jint.classes.register({
	name: 'Size3', package: 'std', superclass: jint.std.Size,
	init:
	[
		null,
		function()
		{
			this.z=0;
		},
		"number x, number y, number z",
		function(args)
		{
			this.initSuper(args.x, args.y);
			this.z=args.z;
		},
		"number",
		function(args)
		{
			this.initSuper(args[0], args[0]);
			this.z=args[0];
		}
	],
	methods: []
});

try { new jint.std.Size3(15, -10, 4); }
catch(e){ console.log(e); console.log(e.stack); }