import { useState, useEffect } from "react";
/*The props are the values inside the function*/
export default function Songs() {
    // Always use a unique key properties for elements inside a map
      const [loading, setLoading] = useState(false);
      const [songs, setSongs] = useState(null);

     const fetchSongs = async () => {
        setLoading(true);
        const res = await fetch("http://localhost:4000/songs", {
          method: "GET",
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        const data = await res.json();
        setSongs(data.songs);
        setLoading(false);
      };
    
      useEffect(() => {
        fetchSongs();
      }, []);
    
      // Check if notes are loaded in
      if (loading) {
        return (
          <>
            <h1>Songs are loading...</h1>
          </>
        );
      }
      if (songs == null) {
        return (
          <>
            <h1>Error: unable to fetch songs</h1>
          </>
        );
      }
    return (
        <div>
            <ul>
                {songs.map((song, index) => (<li key={song.id}>{index +1}:
            {song.title} by {song.artist_name}<br/>
            <img src={song.cover_image}/>
        </li>))}
        </ul>
        </div>
    )
}