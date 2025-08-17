import { useEffect, useState } from 'react';
export default function ThemeToggle(){
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  useEffect(()=>{
    setMounted(true);
    const m = localStorage.getItem('theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enabled = m ? m === 'dark' : prefers;
    document.documentElement.classList.toggle('dark', enabled);
    setIsDark(enabled);
  }, []);
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };
  if(!mounted) return null;
  return <button className="btn" onClick={toggle}>{isDark ? 'حالت روشن' : 'حالت تیره'}</button>
}
