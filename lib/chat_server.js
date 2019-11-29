var socketio = require('socket.io')

var io;

var guestNumber = 1
var nickNumber = {}
var namesUsed = []
var currentRoom = {}

//启动websocket服务
module.exports.listen = function (server) {
    io = socketio.listen(server)
    io.set('log level', 1)
    io.sockets.on('connection', function (socket) {
        guestNumber = assignGusetName(socket, guestNumber, nickNumber, namesUsed);
        joinRoom(socket, 'Lobby')
        handleMessageBroadcasting(socket, nickNumber)
        handleNameChangeAttempts(socket, nickNumber, namesUsed)
        handleRoomJoining(socket)
        socket.on('rooms', function () {
            socket.emit('rooms', io.sockets.manager.rooms)
        })
        handleClientDisconnetion(socket, nickNumber, namesUsed)
    })
}

//分配昵称
function assignGusetName(socket, guestNumber, nickNumber, namesUsed) {
    var name = 'Guest' + guestNumber;
    nickNumber[socket.id] = name;
    socket.emit('nameResult', {
        success: true,
        name: name,
    })
    namesUsed.push(name)
    return guestNumber
}
//加入房间
function joinRoom(socket, room) {

    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {
        room: room
    });
    socket.broadcast.to(room).emit('message', {
        text:nickNumber[socket.id] + ' has joined ' + room + '.'
    });
    var usersInRoom = io.sockets.clients(room);
    if (usersInRoom.length > 1) {
      
        var usersInRoomSummary = 'Users currently in ' + room + ': ';
        for (var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if (userSocketId != socket.id) {
                if (index > 0) {
                    usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }
        usersInRoomSummary += '.';
        socket.emit('message', {
            text: usersInRoomSummary
        });
    }

}
//发送聊天信息
function handleMessageBroadcasting(socket, nickNumber)
{
   socket.on('message',function(message)
   {
       socket.broadcast.to(message.room).emit('message',
       {
           text: nickNumber[socket.id] + ':'+ message.text
       })
   })
}
//变更房间名称
function handleNameChangeAttempts(socket, nickNumbers, namesUsed)
{
socket.on('nameAttempt',function(name){
       if(name.indexof('Guest')==0)
       {
           socket.emit('nameResult',{
               success:false,
               message:'names cannot begin with "Guest".'
           })
       }else{
           if(namesUsed.indexOf(name)=-1)
           {
               var previousName=nickNames[socket.id];
               var previousNameIndex= namesUsed.indexOf(previousName);
               namesUsed.push(name);
               nickNumber[socket.id]=name;
               delete namesUsed[previousNameIndex];
               socket.emit('nameResult',{
                   success:true,
                   name:name
               });
               socket.broadcast.to(curentRoom[socket.id]).emit('message',{
                   text:previousName+'is now know as '+name+'.'
               });

           }else{
               socket.emit('nameResult',{
                   success:false,
                   message:'that name is already in use'
               })
           }
       }
   })
}
//创建房间
function handleRoomJoining(socket)
{
  socket.on('join',function(socket){
      socket.on('join',function(room){
          socket.leave(curentRoom[socket.id]);
          joinRoom(socket,room.newRoom)
      })
  })
}
//断开连接
function handleClientDisconnetion(socket, nickNumber, namesUsed)
{
   socket.on('disconnent',function(){
       var nameIndex = namesUsed.indexOf(nickNumber[socket.id]);
       delete namesUsed[nameIndex]
       delete nickNames[socket.id]
   })
}