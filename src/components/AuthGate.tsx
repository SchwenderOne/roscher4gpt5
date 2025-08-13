import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']

export default function AuthGate({ children }:{ children: React.ReactNode }){
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    let mounted = true
    supabase.auth.getSession().then(({ data })=>{ if(mounted){ setSession(data.session); setLoading(false) }})
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s)=>{ setSession(s) })
    return ()=> { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  if(loading) return <div className="min-h-screen grid place-items-center text-slate-600">Loading…</div>
  if(!session) return <SignIn onError={setError} />
  return <>{children}</>
}

function SignIn({ onError }:{ onError: (e:string|null)=>void }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [pending, setPending] = useState(false)

  const submit = async () => {
    onError(null); setPending(true)
    try{
      if(mode==='signup'){
        const { data, error } = await supabase.auth.signUp({ email, password })
        if(error) throw error
        await ensureProfile()
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if(error) throw error
        await ensureProfile()
      }
    } catch(e:any){ onError(e.message || 'Auth error') }
    finally{ setPending(false) }
  }

  const ensureProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return
    const display_name = name || email.split('@')[0]
    await supabase.from('app_profile').upsert({ id: user.id, display_name }, { onConflict: 'id' })
  }

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center p-4">
      <div className="w-full max-w-sm bg-white/70 backdrop-blur ring-1 ring-slate-200 rounded-2xl p-5">
        <h1 className="text-lg font-semibold text-slate-800">Sign {mode==='signup' ? 'up' : 'in'}</h1>
        <div className="mt-3 space-y-3 text-sm">
          <label className="block">Email<input className="mt-1 w-full rounded-xl ring-1 ring-slate-200 bg-slate-100 px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} /></label>
          <label className="block">Password<input type="password" className="mt-1 w-full rounded-xl ring-1 ring-slate-200 bg-slate-100 px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} /></label>
          {mode==='signup' && (<label className="block">Display name<input className="mt-1 w-full rounded-xl ring-1 ring-slate-200 bg-slate-100 px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Lucas or Alex"/></label>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={()=> setMode(mode==='signup' ? 'signin' : 'signup')} className="rounded-xl ring-1 ring-slate-200 bg-slate-100 px-3 py-2 text-sm">Switch to {mode==='signup' ? 'sign in' : 'sign up'}</button>
          <button onClick={submit} disabled={pending} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm">{pending ? 'Please wait…' : (mode==='signup' ? 'Create account' : 'Sign in')}</button>
        </div>
      </div>
    </div>
  )
}


