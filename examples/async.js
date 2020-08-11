let cls = require('../index');
let key = Symbol();
let context = cls.create(key);
context.run(() => {
	context.name = 'George';
	setTimeout(onTimeout, 300);
});

function onTimeout() {
	let context = cls.get(key);
	console.log(context.name); //George
}