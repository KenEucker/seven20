var connect = require('connect');
var server = connect.createServer();
server = connect.createServer(connect.static(__dirname));
server.listen(80,function(){
    console.log('%s listening at %s', server.name, server.url);
});