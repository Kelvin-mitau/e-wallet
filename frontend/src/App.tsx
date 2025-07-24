import './App.css'

import { Routes, Route, BrowserRouter } from "react-router-dom"
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Account from './pages/Account'
import Notifications from './pages/Notifications'

function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route element={<Home />} path='/dashboard' />
        <Route element={<Login />} path='/' />
        <Route element={<SignUp />} path='/signup' />
        <Route element={<Account />} path='/profile' />
        <Route element={<Notifications />} path='/notifications' />
      </Routes>
    </BrowserRouter>
  )
}

export default App
