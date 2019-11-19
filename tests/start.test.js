let cls = require('../index');
let versionArray = process.version.replace('v', '').split('.');
let major = parseInt(versionArray[0]);
test('node12 start', async (done) => {
	if (major >= 12)
		await core(done);
	else {
		try {
			await core(done);
		} catch (e) {
			expect(e.message).toBe('start() is not supported in nodejs < v12.0.0');
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
