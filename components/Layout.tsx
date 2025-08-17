import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useUser } from '../hooks/useUser';
export default function Layout({ children }: { children: React.ReactNode }){
  const user = useUser();
  return (
    <div>
      <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link className="text-2xl font-extrabold" href="/">TopTenly</Link>
            <nav className="hidden md:flex gap-4 text-sm">
              <Link href="/">خانه</Link>
              <Link href="/categories">دسته‌بندی‌ها</Link>
              <Link href="/favorites">علاقه‌مندی‌ها</Link>
              <Link href="/profile">پروفایل</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle/>
            {user ? (
              <a href="/api/auth/logout" className="btn">خروج</a>
            ) : (
              <div className="flex gap-2">
                <Link className="btn" href="/auth/login">ورود</Link>
                <Link className="btn btn-primary" href="/auth/signup">ثبت‌نام</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">{children}</main>
      <footer className="container mx-auto p-6 text-center text-sm opacity-70">© {new Date().getFullYear()} TopTenly</footer>
    </div>
  );
}
