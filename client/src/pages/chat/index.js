import styles from './styles.module.css';
import MessagesReceived from './messages';
import SendMessage from './send-message';
import RoomAndUsersColumn from './room-and-users';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const Chat = ({ username, room, socket, setUsername, setRoom }) => {

  const navigate = useNavigate();
  
  const prevUsernameRoomRef = useRef({ username: null, room: null });
  useEffect(() => {
    const { username: prevUsername, room: prevRoom } = prevUsernameRoomRef.current;
    if ((username && username !== prevUsername) || (room && room !== prevRoom)) {
      socket.emit('join_room', { username, room });
    }
    prevUsernameRoomRef.current = { username, room };
  }, [username, room, socket]);

  useEffect(() => { 
    if(!username  || !room){
      console.log('no username or room go home.')
      navigate('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.chatContainer}>
      <RoomAndUsersColumn socket={socket} username={username} setUsername={setUsername} setRoom={setRoom} room={room} />
      <div>
        <MessagesReceived socket={socket} />
        <SendMessage socket={socket} username={username} room={room} />
      </div>
    </div>
  );
};

export default Chat;