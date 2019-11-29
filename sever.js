var http = require("http");
var fs = require("fs");
var path = require ("path");
var mime = require("mime");
var cache = {};
var chatServer=require('./lib/chat_server.js')



//发送错误
function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'});
    response.write('error 404 : resource not found');
    response.end();
}

//发送公共文件
function sendFlie(response , filePath,fileContents)
{
    response.writeHead(
        200,
        {'Content-Type':mime.getType(path.basename(filePath))}
    );
    response.end(fileContents);
}

// 静态文件服务
function serverStatic(response,cache,absPath)
{
    if(cache[absPath])
    {
        sendFlie(response,absPath,cache[absPath]);
    }else{
        fs.exists(absPath,function(exists){
            if(exists)
            {
                fs.readFile(absPath,function(error,data){
                    if(error)
                    send404(response);
                    else
                    cache[absPath]=data;
                    sendFlie(response,absPath,data);
                })
            }else
            {
                send404(response);
            }
        })
      
    }
}

//创建服务器

var server = http.createServer(function(request,response)
{
    var filePath=false;
    if(request.url=='/')
    {
        filePath='public/index.html';
    }else
    {
        filePath='public'+ request.url;
    }

    var absPath='./'+filePath;

    serverStatic(response,cache,absPath);
})

chatServer.listen(server)
//启动http服务器
server.listen(3000,function(error){
    if(error) throw error;

    console.log('http://127.0.0.1:3000')
})