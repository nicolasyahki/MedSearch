import { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MainContent from '../components/MainContent'

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-app">
      <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <MainContent />
      </div>
    </div>
  )
}

export default Dashboard
