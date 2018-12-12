//server.js
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var redis = require('redis');
var client = redis.createClient({
    host: 'localhost',
    port: 1111
});

client.on('error',function(err){
    console.log('soz m8');
})

app.use(express.static('game'));

io.on('connection',function(socket){
    console.log('a user connected to the socket');
    //bust
    socket.on('bust',function(data){
        console.log(`Player ${data[0]} has busted with score ${data[1]}`);
        io.emit('bust',`Player ${data[0]} has busted with score ${data[1]}`);
    });
    //hit
    socket.on('hit',function(data){
        console.log(`Player ${data[0]} has hit, and received the ${data[1].Face} of ${data[1].Suit}`);
        io.emit('hit',`Player ${data[0]} has hit, and received the ${data[1].Face} of ${data[1].Suit}`);
    });
    //start
    socket.on('start',function(data){
        console.log(`Game has started with ${data} players`);
        io.emit('start',`Game has started with ${data} players`);
    })
    //stay
    socket.on('stay',function(data){
        console.log(`Player ${data[0]+1} has decided to stay, with a final score of ${data[1]}`);
    });
    //message
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

})

http.listen(3030);