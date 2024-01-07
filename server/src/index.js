const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

app.use(cors());

const server = http.createServer(app);

// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const CHAT_BOT = 'Admin';
let chatRoom = '';
let allUsers = [];
let allMessages = new Map();

function leaveRoom(userID, chatRoomUsers) {
  return chatRoomUsers.filter((user) => user.id != userID);
}

function updateChatRoomUsersList(room, socket) {
  const chatRoomUsers = allUsers.filter((user) => user.room === room);
  socket.to(room).emit('chatroom_users', chatRoomUsers);
  socket.emit('chatroom_users', chatRoomUsers);
}

function sayHiToChatRoom(socket, room, username) {
  let __createdtime__ = Date.now(); // Current timestamp

  // Send message to all users currently in the room, apart from the user that just joined
  socket.to(room).emit('receive_message', {
    message: `${username} has joined the chat room`,
    username: CHAT_BOT,
    __createdtime__,
  });

  // Send a welcome message to new joined user
  socket.emit('receive_message', {
    message: `Welcome ${username}`,
    username: CHAT_BOT,
    __createdtime__,
  });
}

function uploadLast100Messages(room, socket) {
  let last100Messages = [];
  const roomMessages = allMessages.get(room);
  if (roomMessages) {
    last100Messages = roomMessages.slice(-100);
  }

  socket.emit('last_100_messages', JSON.stringify(last100Messages));
}

// Listen for when the client connects via socket.io-client
io.on('connection', (socket) => {
  console.log(`User connected id:${socket.id}`);

  socket.on('join_room', (data) => {
    const { username, room } = data; // Data sent from client when join_room event emitted
    socket.join(room); // Join the user to a socket room

    chatRoom = room;
    const currentUser = allUsers.find( user => user.username === username);
    if(currentUser){
      console.log(`User Reconnected username: ${currentUser?.username}` );
      currentUser.id = socket.id;
    }else{
      allUsers.push({ id: socket.id, username, room });
      console.log(`User connected username: ${username}` );
    
    }

    updateChatRoomUsersList(room, socket);
    sayHiToChatRoom(socket, room, username);
    uploadLast100Messages(room, socket);
  });

  socket.on('send_message', (data) => {

    const { message, username, room, __createdtime__ } = data;
    io.in(room).emit('receive_message', data); // Send to all users in room, including sender
    //save message in memory
    const roomMessages = allMessages.get(room);
    if(roomMessages){
      roomMessages.push({message, username, __createdtime__});
      allMessages.set(room,roomMessages);
    }else{
      allMessages.set(room,[{message, username, __createdtime__}]);
    }
  });

  socket.on('leave_room', (data) => {
    const { username, room } = data;
    socket.leave(room);
    const __createdtime__ = Date.now();
    // Remove user from memory
    allUsers = leaveRoom(socket.id, allUsers);
    socket.to(room).emit('chatroom_users', allUsers);
    socket.to(room).emit('receive_message', {
      username: CHAT_BOT,
      message: `${username} has left the chat`,
      __createdtime__,
    });
    console.log(`${username} has left the chat`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from the chat');
    const user = allUsers.find((user) => user.id == socket.id);
    if (user?.username) {
      console.log(`User disconnected username: ${user?.username}` );
      allUsers = leaveRoom(socket.id, allUsers);
      socket.to(chatRoom).emit('chatroom_users', allUsers);
      socket.to(chatRoom).emit('receive_message', {
        message: `${user.username} has disconnected from the chat.`,
      });
    }
  });
});

server.listen(4000, () => 'Server is running on port 4000');






