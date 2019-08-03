_Continuation Local Storage_  
---------------  
The purpose with this module is to share contexts across async (and sync) calls. Contexts are accessed by keys and can be nested. It is an alternative to the deprecated [domain](https://nodejs.org/docs/latest-v8.x/api/domain.html). It is based on [async_hooks](https://nodejs.org/docs/latest-v8.x/api/async_hooks.html) that were introduced in node 8. Beware that that the async_hooks are still experimental in nodejs.  
__Usage__
---------------  
A typical scenario is when you need to share context in a request handler.  
```js
let http = require('http');
let cls = require('node-cls');

let server = http.createServer(function (request, response) {
    let context = cls.create('request-context');
    context.id = 1;
    context.request = request;
    context.response = response;   
    context.run(doWork);
})

server.listen(8080)

function doWork() {
    let context = cls.get('request-context');
    context.response.end(`End: ${context.id}`) //End: 1

}
```
Context is retained in async calls.  
```js
let cls = require('node-cls');

let context = cls.create('myContext');
context.run(() => {
    context.name = 'George';
    setTimeout(onTimeout, 300);
});

function onTimeout() {
    let context = cls.get('myContext');
    console.log(context.name); //George
}
```
Contexts can be nested, even on the same key.  
```js
let cls = require('node-cls');

let context = cls.create('myContext');
context.run(async () => {
    context.name = 'George';
    let context2 = cls.create('myContext');
    await context2.run(onNested);
    console.log(context.name) //George
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
```
In node 12 and above you can start a context directly instead of wrapping it in the run function. The start function returns a promise. You can leave the current context by calling exit.  
```js
let cls = require('node-cls');

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
```