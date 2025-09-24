import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import {registerSW}  from "virtual:pwa-register"
import { Provider } from 'react-redux'
import store from './store/store.js'



registerSW()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
