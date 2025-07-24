import logo from '../assets/logo.svg';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils.ts';

import styles from './Header.module.css';

const navItems = [
  { path: '/', label: 'Planner' },
  { path: '/calendar', label: 'Calendar' },
];

export const Header = () => {
  const location = useLocation();

  return (
    <header className="mb-4 flex flex-row items-center gap-6">
      <img width="63px" height="63px" src={logo} alt="logo" />
      <nav className="flex gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(styles.navLink, location.pathname === item.path && styles.active)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};
