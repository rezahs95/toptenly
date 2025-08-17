import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Router from 'next/router';
export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function onLogin(e:any){
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else Router.push('/');
  }
  return (
    <div className="container mx-auto p-6 card">
      <h1 className="text-2xl font-bold mb-4">ورود</h1>
      <form onSubmit={onLogin} className="space-y-3 max-w-md">
        <input className="w-full p-2" placeholder="ایمیل" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-2" placeholder="رمز عبور" value={password} onChange={e=>setPassword(e.target.value)} type="password" />
        <button className="btn btn-primary">{loading? '...' : 'ورود'}</button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
