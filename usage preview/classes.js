jint.import('std.paged.*'); // creates jint.* links for every specified class
jint.classes.register({
	name: 'MyButton', superclass: jint.Button,
	init:
	[
		null,
		function(instance)
		{
			instance.superclass.init(instance.className, null, new Size(80, 25));
			instance.colorScheme=jint.Color.RED;
			instance.tooltip='Click me!';
		},
		"string, string, Size, Color c",
		function(instance, params)
		{
			instance.superclass.init(params.subset(0, 1, 2)); // calls super(string, string, Size)
			instance.colorScheme=params.c; // named parameter Color c
		}
	],
	methods: {},
	callbacks:
	{
		onClick: function(instance, ev)
		{
			instance.parent.showMessage('Hello, world!');
		}
	}
});
jint.createEnum({
	name: 'Languages',
	values: ['JS', 'C#', 'Java', 'C++', 'Python', 'ASM'],
	methods:
	{
		checkSyntax: function(instance, code)
		{
			switch(instance)
			{
				case Languages.JS:
					...
				break;
				...
			}
			return false;
		}
	}
});

jint.buildInterface(jint.load('MyInterface.jint')).start();
// or the same
var mi=jint.loadAndBuild('MyInterface.jint');
mi.start();