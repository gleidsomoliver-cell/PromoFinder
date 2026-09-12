import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';
  const Icon = theme === 'dark' ? Moon : Sun;
  return <button type="button" className="icon-btn" onClick={toggleTheme} title={label} aria-label={label}>
    <Icon size={20} aria-hidden="true" />
  </button>;
}
