let cls = require('../index');

async function main() {
    let context = cls.create('myContext');
    context.name = 'George';
    await context.start();

    let context2 = cls.create('myContext');
    context2.name = 'John Nested';
    await context2.start();
    console.log(cls.get('myContext').name); //John Nested

    cls.exit('myContext');
    console.log(cls.get('myContext').name); //George

    cls.exit('myContext');
    console.log(cls.get('myContext')); //undefined
}

main();