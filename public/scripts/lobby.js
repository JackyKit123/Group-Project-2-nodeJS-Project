$(() => {
    const socket = io();
    socket.on('custom error', error => {
        alert(error);
        window.location.href = '/'
    })

    $('#create').on('click', () => socket.emit('create room'))

    socket.on('new room created', () => {
        socket.emit('Init Player Amount', prompt('How many players do you want in your game (1-5)'))
        window.location.href = '/room'
    })
    $('ul').on('click', evt => {
        socket.emit('join room', evt.target.id)
        window.location.href = '/room'
    })

    socket.on('new room', room => {
        $('ul').append(`<li id=${room.id}>Join Room ${room.id}</li>`)
    })
})