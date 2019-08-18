let cls = require('../index');

let context = cls.create('myContext');
context.run(async () => {
	context.name = 'George';
	let context2 = cls.create('myContext');
	await context2.run(onNested);
	console.log(context.name); //George
});

async function onNested() {
	await Promise.resolve();
	let context = cls.get('myContext');
	console.log(context.name); //undefined
	context.name = 'John Nested';
	setTimeout(onTimeout, 300);
}

function onTimeout() {
	let context = cls.get('myContext');
	console.log(context.name); //John Nested
}