import './App.css'

import { Routes, Route, BrowserRouter } from "react-router-dom"
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'

function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route element={<Home />} path='/' />
        <Route element={<Login />} path='/auth/signin' />
        <Route element={<SignUp />} path='/auth/signup' />
      </Routes>
    </BrowserRouter>
  )
}

export default App
