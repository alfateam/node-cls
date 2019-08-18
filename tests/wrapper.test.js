let cls = require('../index');

test('async', async (done) => {
	cls.debug = true;
	let wrapper = require('../index')('myContext');
	wrapper.run(() => {
		let context = cls.get('myContext');
		context.name = 'George';
		setTimeout(onTimeout, 300);
	});
	
	function onTimeout() {
		let context = cls.get('myContext');
		expect(context.name).toBe('George');
		done();
	}
});