import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
const AppRoutes = () => {
    return (

        <BrowserRouter>
            <Routes>
                <Route path='/Home' element={<Home />} />
                <Route path='/' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
