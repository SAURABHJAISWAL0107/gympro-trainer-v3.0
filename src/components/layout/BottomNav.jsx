// GymPro Trainer — Bottom Navigation
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Dumbbell, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import './BottomNav.css';

const tabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/programs', icon: Calendar, label: 'Program' },
  { path: '/workout', icon: Dumbbell, label: 'Workout' },
  { path: '/progress', icon: BarChart3, label: 'Progress' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav during active workout or onboarding
  if (location.pathname.startsWith('/active-workout') || location.pathname.startsWith('/onboarding')) {
    return null;
  }

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path || 
          (tab.path === '/home' && location.pathname === '/');
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.path}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            id={`nav-${tab.label.toLowerCase()}`}
          >
            <div className="nav-tab-inner">
              {isActive && (
                <motion.div
                  className="nav-tab-bg"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="nav-label">{tab.label}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
