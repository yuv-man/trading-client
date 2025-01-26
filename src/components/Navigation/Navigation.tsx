import { useLocation } from 'react-router-dom';
import { FaChartBar, FaCode, FaCog, FaPlay } from 'react-icons/fa';
import { NavLink } from './NavLink';
import type { NavItem } from '../../types/trading';

const navItems: NavItem[] = [
  { path: '/chart', icon: FaChartBar, title: 'Chart' },
  { path: '/strategy', icon: FaCode, title: 'Strategy' },
  { path: '/optimize', icon: FaCog, title: 'Optimize' },
  { path: '/live', icon: FaPlay, title: 'Live Trading' }
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white w-12 min-h-screen shadow-md flex flex-col items-center py-2 fixed">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          {...item}
          isActive={location.pathname === item.path}
        />
      ))}
    </nav>
  );
}