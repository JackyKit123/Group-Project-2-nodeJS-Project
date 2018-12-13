$(()=>{
    const socket = io();
    $('#btnStart').click(() => socket.emit('start'))
    $('#btnhitMe').click(() => socket.emit('hit'))
    $('#btnstay').click(() => socket.emit('stay'))
})