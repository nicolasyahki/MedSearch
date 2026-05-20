import { IconSearch, IconHistory } from '@tabler/icons-react'

function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { icon: IconSearch, label: 'Recherche', active: true },
    { icon: IconHistory, label: 'Historique', active: false },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-bg-sidebar border-r border-border
        min-h-[calc(100vh-64px)] p-4 flex flex-col
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex-1">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className={`w-full min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    item.active
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-body">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
