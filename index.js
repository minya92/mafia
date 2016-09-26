var WebSocketServer = new require('ws');
var self = this;

// подключенные клиенты
var clients = {};
//комнаты
var rooms = {};

var webSocketServer = new WebSocketServer.Server({
    port: 8081
});

webSocketServer.on('connection', function(ws) {

    var id = Math.round(Math.random() * 10000000)
    clients[id] = {};
    clients[id].ws = ws;
    console.log("Новое соединение " + id);

    ws.on('message', function(message) {
        console.log('получено сообщение ' + message);
        var msg = JSON.parse(message);
        switch (msg.method){
            case  'createRoom' : self.createRoom(msg.name, id); break;
            case  'joinRoom' : self.joinRoom(msg.name, id); break;
            case  'leaveRoom' : self.leaveRoom(msg.name, id); break;
        }
        //for (var key in clients) {
        //    clients[key].ws.send(message);
        //}
});

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        if(clients[id].room){
            delete clients[id];
            self.leaveRoom(clients[id].room, id);
        }
        delete clients[id];
    });

});

self.createRoom = function(name, id){
    if(!rooms[name]) {
        rooms[name] = [];
        rooms[name].push(id);
        clients[id].room = name;
        console.log('комната создана ' + id);
        var response = {
            method: 'createRoom',
            response: 'ok',
            error: false
        }
    }
    else {
        var response = {
            method: 'createRoom',
            response:  false,
            error: 'this room is created!'
        }
    }
    clients[id].ws.send(JSON.stringify(response));
}

self.joinRoom = function(name, id){
    if(rooms[name]) {
        if(!clients[id].room){
            rooms[name].push(id);
            clients[id].room = name;
            console.log('вы вошли в комнату ' + id);
            var response = {
                method: 'joinRoom',
                response: 'ok',
                error: false
            }
        } else {
            var response = {
                method: 'joinRoom',
                response: false,
                error: 'you joined in another room!'
            }
        }
    }
    else {
        var response = {
            method: 'joinRoom',
            response: false,
            error: 'room is not created!'
        }
    }
    clients[id].ws.send(JSON.stringify(response));
}

// Вот тут пока не работаетъ
self.leaveRoom = function(name, id){
    for(var i in rooms[name]){
        if(i == id){
            delete rooms[name][id];
            rooms[name].forEach(function(client){
                clients[client].ws.send(JSON.stringify({
                    action: "leaveRoom",
                    client: client
                }));
            })
        }
    }
}