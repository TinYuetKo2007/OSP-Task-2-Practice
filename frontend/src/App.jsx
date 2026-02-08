import './App.css'
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
    <h1>RZA</h1>
    <nav className='form'>
      <List />
      <Link to={"/products"}>Buy Ticket</Link>
      <AudioPlayer audioSrc={song} />
    </nav>
    <p>"RZA has brought us many great memories I will always cherish!"</p>
    </div>
  )
};


export default App;
