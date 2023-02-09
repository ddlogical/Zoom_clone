const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
// peerjs connection (server generates unic id)
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video');

// if you don't want to hear yourself
myVideo.muted = true;

const peers = {};
// Use navigator.mediaDevices.getUserMedia which generates Promise contains strem
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)
    // answer call 
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        // receive other user stream
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    //  3. user-connected (we connect)
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
})
// 1. Start socket.io from here (myPeer object. This object will allow you to send and receive data)
myPeer.on('open', id => { 
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    // providing mediaStream
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    // event stream set newUser video
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        // remove video
        video.remove()
    })
    // add call to peers object
    peers[userId] = call
}
// for chat (client side)
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

// for chat (client side)
  socket.on('chat message', function(msg) {
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

//get video element and stream, play video and append it to grid
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

