import { SunIcon, MoonIcon } from '@phosphor-icons/react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
      className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-all hover:border-amber-400 hover:text-amber-600 active:scale-95 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-amber-400 dark:hover:text-amber-400"
    >
      {theme === 'dark' ? <SunIcon size={20} weight="bold" /> : <MoonIcon size={20} weight="bold" />}
    </button>
  );
};
