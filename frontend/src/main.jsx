import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import App from "./App.jsx"
import Contact from "./Contact.jsx"
import Login from './components/LogIn.jsx'
import SignUp from './components/SignUp.jsx'
import Profile from './components/Profile.jsx'
import SongUploader from "./components/SongUploader.jsx"
import List from './List.jsx'
import AboutUs from './components/AboutUs.jsx'
import Products from './Products.jsx'

// Links
const Router = createBrowserRouter([
  {path: "/", element: <App/>},
  {path: "/contact", element: <Contact/>},
  {path: "/login", element: <Login/>},
  {path: "/signup", element: <SignUp/>},
  {path: "/profile", element: <Profile/>},
  {path: "/add-song", element: <SongUploader/>},
  {path: "/list", element: <List/>},
  {path: "/aboutus", element: <AboutUs/>},
  {path: "/products", element: <Products/>},
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={Router}/>
  </StrictMode>,
)
