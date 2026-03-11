import './App.css'
import { Link } from 'react-router-dom';
import AudioPlayer from "./components/AudioPlayer.jsx";
const API = "http://localhost:5173";
import zoo2 from "./image/zoo2.jpeg"
function App() {
  const username = localStorage.getItem("username")
  console.log("username", username)


  return (
    <div>
    <div className='parent-container'>
    <img src={zoo2} style={{width: "100%"}}/>
    <div className='bottom-left'>
      <div className='main-title'>
      <b><h1>Greenfield Local Hub</h1></b>
      <h2>Locally produced food</h2>
      </div>
    </div>
      
</div>

    <div className='second-section'>
    <h2>Trending products</h2>
    <p>product scroll goes here</p>
    </div>
    
    </div>
  )
};


export default App;
