import { Route, Routes } from 'react-router-dom'
import BossPugPage from './pages/BossPugPage'
import HomePage from './pages/HomePage'
import PugChatPage from './pages/PugChatPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat/:pugId" element={<PugChatPage />} />
      <Route path="/boss-pug" element={<BossPugPage />} />
    </Routes>
  )
}
