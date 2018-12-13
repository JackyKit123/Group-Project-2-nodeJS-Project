module.exports = (io, redisClient) => {
  io.on('connection', socket => {
    let room = 'lobby';
    socket.join(room);
    socket.on('create room', () => {
      redisClient.lrange('blackjack-game-roomlist', 0, 99, (err, list) => {
        if (err) return io.emit('custom error', err)
        if (list.length === 100) return io.emit('rooms full')
        let newRoom = {
          id: 0,
          maxPlayer: 0,
          currentAmount: 1
        }
        let i = 0
        if (list.length > 0)
          while (newRoom.id == JSON.parse(list[i]).id) {
            i++
            newRoom.id++;
          }
        newRoom.id++;
        socket.emit('new room created')
        socket.on('Init Player Amount', number => {
          number = parseInt(number)
          if (number == 1) return gameStart()
          if (!(number <= 5 && number >= 1)) {
            return socket.emit('custom error', 'Invalid Player Number')
          }
          newRoom.maxPlayer = number
          redisClient.rpush('blackjack-game-roomlist', JSON.stringify(newRoom))
          room = newRoom;
          io.to('lobby').emit('new room', newRoom)
          socket.join(room.id)
        });
      });
    });

    socket.on('join room', newRoomId => {
      redisClient.lrange('blackjack-game-roomlist', 0, 99, (err, list) => {
        if (err) return socket.emit('custom error', err)
        for (let i = 0; i < list.length; i++) {
          list[i] = JSON.parse(list[i])
          if (list[i].id == newRoomId) {
            if (list[i].currentAmount >= list[i].maxPlayer) return socket.emit('custom error', 'Room is full')
            if (list[i].currentAmount == list[i].maxPlayer) gameStart();
            socket.join(newRoomId)
            list[i].currentAmount++
            redisClient.lset('blackjack-game-roomlist', i, JSON.stringify(list[i]));
            room = newRoomId
          }
        }
      })
    })
    socket.on('start', () => {
      console.log('start')
      socket.on('hit', () => {
        console.log('hit')

      })
      socket.on('stay', () => {
        console.log('stay')

      })
      socket.on('double', () => {

      })
    })
  })
}
