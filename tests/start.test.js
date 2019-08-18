let cls = require('../index');
let versionArray = process.version.replace('v', '').split('.');
let major = parseInt(versionArray[0]);
test('node12 start', async (done) => {
	if (major < 12)
		await core(done);
	else {
		try {
			core(done);
		}
		catch (e) {
			expect(e.error).stringContaing('Async_hooks are not supported');
			done();
		}
	}
});

async function core(done) {
	let context = cls.create('myContext');
	context.name = 'George';
	await context.start();

	let context2 = cls.create('myContext');
	context2.name = 'John Nested';
	await context2.start();
	expect(cls.get('myContext').name).toBe('John Nested');

	cls.exit('myContext');
	expect(cls.get('myContext').name).toBe('George');

	cls.exit('myContext');
	expect(cls.get('myContext')).toBe(undefined);
	done();
}
