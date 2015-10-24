/*
	** jint STD Library
	**
	** Contains basic interface and helper classes.
	** Now is under construction.
	**
	** (ver #1 24.10.15)
*/

/*
	** Enums
*/
jint.createEnum({
	name: 'BorderStyles', package: 'std',
	values: [ 'SOLID', 'DASHED', 'DOUBLE', 'DOTTED' ]
});

jint.createEnum({
	name: 'HorizontalAlignment', package: 'std',
	values: [ 'LEFT', 'RIGHT', 'CENTER' ]
});
jint.createEnum({
	name: 'VerticalAlignment', package: 'std',
	values: [ 'TOP', 'BOTTOM', 'MIDDLE' ]
});

jint.createEnum({
	name: 'FontDecorations', package: 'std',
	values: [ 'NONE', 'UNDERLINE', 'STRIKEOUT', 'OVERLINE' ]
});
jint.createEnum({
	name: 'FontTypes', package: 'std',
	values: [ 'SERIF', 'SANS_SERIF', 'MONOSPACE' ]
});

/*
	** Non-Element Classes
	**
	** Helper classes, e.g. storing complex data
*/

// Creates and serves an event
jint.classes.register({
	name: 'Event', package: 'std',
	
	init: [
		null,			function() { this.name=null; this.listeners=[]; },
		"string name",	function(args) { this.name=args.name; }
	],
	
	methods: {
		invoke: function(args) { for(var i=0; i<this.listeners.length; i++) this.listeners[i].onEvent(this.name, args); },
		addListener: function(listener) { this.listeners.push(listener); },
		removeListener: function(listener)
		{ if(this.listeners.indexOf(listener)!=-1) this.listeners.splice(this.listeners.indexOf(listener), 1); },
		toString: function() { return '{ event "'+this.name+'" ('+this.listeners.length+' listeners) }'; }
	}
});

// Stores width and height
jint.classes.register({
	name: 'Size', package: 'std',
	init: [
		null,
		function()
		{
			this.width=0;
			this.height=0;
		},
		"number w, number h",
		function(args)
		{
			this.width=args.w;
			this.height=args.h;
		}
	],
	methods: {
		scale: function(coeff) { this.width*=coeff; this.height*=coeff; }
	}
});

// Stores rgba color
jint.classes.register({
	name: 'Color', package: 'std',
	init: [
		null,
		function()
		{
			this.value=new _jint_Color();
		},
		"number gray",
		function(args)
		{
			this.value=new _jint_Color(args.gray);
		},
		"number gray, number alpha",
		function(args)
		{
			this.value=new _jint_Color(args.gray, args.alpha);
		},
		"number r, number g, number b",
		function(args)
		{
			this.value=new _jint_Color(args.r, args.g, args.b);
		},
		"number r, number g, number b, number a",
		function(args)
		{
			this.value=new _jint_Color(args.r, args.g, args.b, args.a);
		}
	],
	methods: {
		red: function(val)		{ if(j_isset(val)) this.value.red=val;		return this.value.red; },
		green: function(val)	{ if(j_isset(val)) this.value.green=val;	return this.value.green; },
		blue: function(val)		{ if(j_isset(val)) this.value.blue=val;		return this.value.blue; },
		alpha: function(val)	{ if(j_isset(val)) this.value.alpha=val;	return this.value.alpha; },
		toString: function() { return this.value.toString(); }
	}
});

// Stores 4 values of same type for top, right, bottom and left sides
jint.classes.register({
	name: 'Sides', package: 'std',
	init: [
		null,
		function(){this.top=this.bottom=this.left=this.right=null;},
		"number all",
		function(args){this.top=this.bottom=this.left=this.right=args.all;},
		"number topBottom, number leftRight",
		function(args){this.top=this.bottom=args.topBottom; this.left=this.right=args.leftRight;},
		"number top, number left, number bottom, number right",
		function(args){this.top=args.top; this.left=args.left; this.bottom=args.bottom; this.right=args.right;},
		
		"Object all",
		function(args){this.top=this.bottom=this.left=this.right=args.all;},
		"Object topBottom, Object leftRight",
		function(args){this.top=this.bottom=args.topBottom; this.left=this.right=args.leftRight;},
		"Object top, Object left, Object bottom, Object right",
		function(args){this.top=args.top; this.left=args.left; this.bottom=args.bottom; this.right=args.right;}
	],
	methods: {
		toString: function()
		{ 
			var delim=(typeof this.left == typeof 0)? 'px ' : ' ';
			return this.top+delim+this.right+delim+this.bottom+delim+this.left+delim;
		}
	}
});

// Stores style of a border (width, color and painting style)
jint.classes.register({
	name: 'Border', package: 'std',
	init: [
		null,
		function() { this.width=0; this.color=new jint.std.Color(); this.style=jint.std.BorderStyles.SOLID },
		"number width",
		function(args) { this.width=args.width; },
		"Color c",
		function(args) { this.width=1; this.color=args.c; },
		"number width, Color c",
		function(args) { this.width=args.width; this.color=args.c; }
	],
	
	methods: {
		toString: function() { return this.width+'px ' + this.color.toString() + ' ' + this.style.value.toLowerCase(); }
	}
});

jint.classes.register({
	name: 'Font', package: 'std',
	init: [
		null,
		function()
		{
			this.face='';
			this.size=16;
			this.bold=false; this.italic=false;
			this.decoration=jint.std.FontDecorations.NONE;
			this.type=jint.std.FontTypes.SANS_SERIF;
		},
		"string face, number size",
		function(args) { this.face=args.face; },
		"string face, number size, string flags",
		function(args)
		{
			this.face=args.face; this.size=args.size;
			this.bold=		args.flags[0].toUpperCase()=='B';
			this.italic=	args.flags[1].toUpperCase()=='I';
			switch(args.flags[2].toUpperCase())
			{
			case 'O':
				this.decoration=jint.std.FontDecorations.OVERLINE;
				break;
			case 'U':
				this.decoration=jint.std.FontDecorations.UNDERLINE;
				break;
			case 'S':
				this.decoration=jint.std.FontDecorations.STRIKEOUT;
				break;
			default:
				this.decoration=jint.std.FontDecorations.NONE;
				break;
			}
		}
	],
	methods: {
		toString: function() { return this.size+'px "'+this.face+'", '+this.type.value.toLowerCase().replace(/_/g, '-'); }
	}
});

// Stores lots of style properties
jint.classes.register({
	name: 'Style', package: 'std',
	
	init: [
		null,
		function()
		{
			this.size=new jint.std.Size();
			this.bgColor=new jint.std.Color();
			this.fgColor=new jint.std.Color();
			this.border=new jint.std.Sides(new jint.std.Border());
			this.margin=new jint.std.Sides(0);
			this.padding=new jint.std.Sides(0);
			this.font=new jint.std.Font('Arial', 16);
			
			this.changed=new jint.std.Event('Changed');
		}
	],
	
	methods: {
		apply: function(elem)
		{
			elem.style.backgroundColor=this.bgColor.toString();
			elem.style.color=this.fgColor.toString();
			elem.style.width=this.size.width;
			elem.style.height=this.size.height;
			elem.style.border=this.border.toString(); // TODO: expand, test & correct
			elem.style.margin=this.margin.toString();
			elem.style.padding=this.padding.toString();
			
			elem.style.font=this.font.toString();
			elem.style.textDecoration=this.font.decoration.value.toLower().replace('strikeout', 'line-through');
			elem.style.fontWeight=this.font.bold? 'bold' : 'normal';
			elem.style.fontStyle=this.font.italic? 'italic' : 'normal';
		},
		
		set: function(property, value)
		{
			this[property]=value;
			this.changed.invoke();
		}
	}
});

/*
	** Elements Section
	**
	** All basic element classes.
*/

jint.classes.register({
	name: 'InterfaceElement', package: 'std',
	abstract: true,
	
	init: [
		null,
		function()
		{
			this.id=null;
			this.text=null;
			this.elements=[];
			
			this.style=new jint.std.Style();
			
			this.htmlElement=null;
			
			this.onClick=new jint.std.Event('Click');
			this.onMouseOver=new jint.std.Event('MouseOver');
		},
		"string text, string id",
		function(args)
		{
			this.text=args.text;
			this.id=args.id;
		}
	]
});
