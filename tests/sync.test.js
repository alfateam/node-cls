let cls = require('../index');

test('basic async test', async (done) => {
	let context = cls.create('request-context');
	context.id = 1;
	await context.run(doWork);

	function doWork() {
		let context = cls.getContext('request-context');
		expect(context.id).toBe(1);
		done();

	}
});