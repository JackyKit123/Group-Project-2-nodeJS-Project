$(() => {
    //setup client side socket.io
    const socket = io();

    //client side socket.io logic here


    /*
    //recieve messages
    socket.on('chat message', msg => $('#messages').append($('<li>').text(msg)));

    //send message
    $('form').submit(() => {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    //function to switch room
    $('button#join').click(e => {
        e.preventDefault();
        socket.emit('subscribe', prompt('which room do you want to join?'));
    })
    */
});