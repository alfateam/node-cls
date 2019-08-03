let cls = require('../index');

let context = cls.create('myContext');
context.run(() => {
    context.name = 'George';
    setTimeout(onTimeout, 300);
});

function onTimeout() {
    let context = cls.get('myContext');
    console.log(context.name); //George
}