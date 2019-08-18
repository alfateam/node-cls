let cls = require('../index');

test('nested', async (done) => {
    let context = cls.create('myContext');
    context.run(async () => {
        context.name = 'George';
        let context2 = cls.create('myContext');
        await context2.run(onNested);
        expect(context.name).toBe('George');
    });

    async function onNested() {
        await Promise.resolve();
        let context = cls.get('myContext');
        expect(context.name).toBe(undefined);
        context.name = 'John Nested';
        setTimeout(onTimeout, 300);
    }

    function onTimeout() {
        let context = cls.get('myContext');
        expect(context.name).toBe('John Nested');
        done();
    }
});