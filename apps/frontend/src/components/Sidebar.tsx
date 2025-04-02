import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  position: 'left' | 'right';
  title: string;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ position, title, children }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div 
      className={`sidebar transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-80'
      } ${position === 'left' ? 'border-r' : 'border-l'}`}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {position === 'left' 
            ? (collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)
            : (collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />)
          }
        </button>
      </div>
      
      {!collapsed && <div className="flex-1 overflow-y-auto">{children}</div>}
    </div>
  );
};

export default Sidebar