import './App.css'
import Header from './components/Header.jsx'
import { Link } from 'react-router-dom';
import List from "./List.jsx"
import AudioPlayer from "./components/AudioPlayer.jsx";
const API = "http://localhost:5173";
import song from "./audio/SweaterWeather.mp3"
function App() {
  const username = localStorage.getItem("username")
  console.log("username", username)

  return (
    <div>
    <Header/>
    <h1>Harmoniq</h1>
    <nav>
      <List />
      <Link to={"/aboutus"}>About Us</Link>
      <Link to={"/buyticket"}>Buy Ticket</Link>
      <AudioPlayer audioSrc={song} />
    </nav>
    </div>
  )
};


export default App;
