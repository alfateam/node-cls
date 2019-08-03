let http = require('http');
let cls = require('../index');

let server = http.createServer(function (request, response) {
    let context = cls.create('request-context');
    context.id = 1;
    context.request = request;
    context.response = response;
    context.run(doWork);
})

server.listen(8080)

function doWork() {
    let context = cls.getContext('request-context');
    context.response.end(`End: ${context.id}`) //End: 1

}