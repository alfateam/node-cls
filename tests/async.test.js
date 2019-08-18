let cls = require('../index');
test('async', async (done) => {
	let context = cls.create('myContext');
	context.run(() => {
		context.name = 'George';
		setTimeout(onTimeout, 300);
	});

	function onTimeout() {
		let context = cls.get('myContext');
		expect(context.name).toBe('George');
		done();
	}
});