const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:3000", // client address 
  }});
  
const port = process.env.PORT || 3000;
// helps to receive unic id
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  // room redirected to unic route
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  // send room id to connected users
  res.render('room', {roomId: req.params.room});
})

io.on('connection', (socket) => {
  // It's for video (2. On join-room happens)
  socket.on('join-room', (roomId, userId) => {
    // connect user to particular room
    socket.join(roomId)
    // send userId to client
    socket.broadcast.to(roomId).emit("user-connected", userId);
    //send particular userId of disconnected user
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    })
  })
  // it's for chat
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
  
});

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
