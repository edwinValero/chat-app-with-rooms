import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client'; 
import Home from './pages/home';
import Chat from './pages/chat';
import useLocalStorage from './utils/useLocalStorage';

const socket = io.connect('http://localhost:4000');

function App() {
  const [username, setUsername] = useLocalStorage('username','');
  const [room, setRoom] = useLocalStorage('room', '');
  
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route 
            path='/' 
            element={
              <Home 
                username={username}
                setUsername={setUsername} 
                room={room}
                setRoom={setRoom} 
                socket={socket} 
              />
            } 
          />
           <Route
            path='/chat'
            element={
              <Chat 
                username={username} 
                setUsername={setUsername} 
                room={room} 
                setRoom={setRoom} 
                socket={socket} 
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
