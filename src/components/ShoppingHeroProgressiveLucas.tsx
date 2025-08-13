import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Sparkles, Mic, Square, ChevronRight, Users, Check, Save, Trash, ShoppingCart, Euro } from 'lucide-react'

type Person = 'Lucas' | 'Alex'

type ShoppingItem = {
  id: string
  name: string
  quantity: number
  price?: number
  assigned: Person | 'Both'
  split?: Record<Person, number> // if assigned Both, default 50/50
  pickToday?: boolean
  status: 'open' | 'bought'
}

type LongTermItem = {
  id: string
  name: string
  price: number
  split: Record<Person, number>
  targetDate?: string
  status: 'planned' | 'bought'
}

const UI = {
  page: 'min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8',
  ring: 'ring-1 ring-slate-200',
  card: 'bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60',
  chip: 'bg-slate-100',
}

const tint = {
  list: 'bg-rose-50 border-rose-100',
  long: 'bg-amber-50 border-amber-100',
}

function Section({ title, action, children }:{ title:string; action?:React.ReactNode; children:React.ReactNode }){
  return (
    <section className={`${UI.card} ${UI.ring} rounded-2xl p-4 md:p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function formatEUR(n:number){ return new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(n) }

function sampleData(){
  const list: ShoppingItem[] = [
    { id:'s1', name:'Oats', quantity:1, price:2.8, assigned:'Both', split:{ Lucas:0.5, Alex:0.5 }, pickToday:true, status:'open' },
    { id:'s2', name:'Tomatoes', quantity:6, price:3.2, assigned:'Lucas', status:'open' },
    { id:'s3', name:'Dish soap', quantity:1, price:1.9, assigned:'Alex', status:'open' },
  ]
  const long: LongTermItem[] = [
    { id:'lt1', name:'Electric kettle', price:35, split:{ Lucas:0.5, Alex:0.5 }, status:'planned' },
    { id:'lt2', name:'Shoe cabinet', price:79, split:{ Lucas:0.5, Alex:0.5 }, targetDate:new Date(Date.now()+1000*60*60*24*14).toISOString().slice(0,10), status:'planned' },
  ]
  return { list, long }
}

function ItemRow({ item, onToggleBought, onEdit, onDelete }:{ item:ShoppingItem; onToggleBought:(i:ShoppingItem)=>void; onEdit:(i:ShoppingItem)=>void; onDelete:(i:ShoppingItem)=>void }){
  const splitLabel = item.assigned==='Both' ? `${Math.round((item.split?.Lucas ?? 0.5)*100)}/${Math.round((item.split?.Alex ?? 0.5)*100)}` : item.assigned
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${UI.ring} ${tint.list}`}>
      <div className="min-w-0">
        <div className="font-medium truncate flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-rose-500"/>
          <span className={item.status==='bought' ? 'line-through text-slate-500' : ''}>{item.name}</span>
          <span className={`${UI.ring} ${UI.chip} text-xs rounded-lg px-2 py-0.5`}>x{item.quantity}</span>
        </div>
        <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
          <span className={`${UI.ring} ${UI.chip} rounded-md px-2 py-0.5 inline-flex items-center gap-1`}><Users className="h-3.5 w-3.5"/> {splitLabel}</span>
          {typeof item.price === 'number' && <span>{formatEUR(item.price)}</span>}
          {item.pickToday && <span className="text-rose-700">today</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={()=>onEdit(item)} className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 text-xs`}>Edit</button>
        <button onClick={()=>onDelete(item)} className="rounded-xl bg-rose-500/90 text-white px-2 py-1 text-xs inline-flex items-center gap-1"><Trash className="h-3 w-3"/> Delete</button>
        <button onClick={()=>onToggleBought(item)} className={`rounded-xl ${item.status==='bought' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-500/90 text-white'} px-2 py-1 text-xs inline-flex items-center gap-1`}><Check className="h-3 w-3"/> {item.status==='bought' ? 'Unmark' : 'Bought'}</button>
      </div>
    </div>
  )
}

function LongTermRow({ row, onEdit, onDelete, onMarkBought }:{ row:LongTermItem; onEdit:(r:LongTermItem)=>void; onDelete:(r:LongTermItem)=>void; onMarkBought:(r:LongTermItem)=>void }){
  const splitLabel = `${Math.round(row.split.Lucas*100)}/${Math.round(row.split.Alex*100)}`
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${UI.ring} ${tint.long}`}>
      <div>
        <div className="font-medium">{row.name}</div>
        <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
          <span className={`${UI.ring} ${UI.chip} rounded-md px-2 py-0.5 inline-flex items-center gap-1`}><Users className="h-3.5 w-3.5"/> {splitLabel}</span>
          <span className="inline-flex items-center gap-1"><Euro className="h-3.5 w-3.5"/>{formatEUR(row.price)}</span>
          {row.targetDate && <span>by {row.targetDate}</span>}
          {row.status==='bought' && <span className="text-emerald-700">bought</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={()=>onEdit(row)} className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 text-xs`}>Edit</button>
        <button onClick={()=>onDelete(row)} className="rounded-xl bg-rose-500/90 text-white px-2 py-1 text-xs inline-flex items-center gap-1"><Trash className="h-3 w-3"/> Delete</button>
        <button onClick={()=>onMarkBought(row)} className={`rounded-xl ${row.status==='bought' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-500/90 text-white'} px-2 py-1 text-xs inline-flex items-center gap-1`}><Check className="h-3 w-3"/> {row.status==='bought' ? 'Unmark' : 'Bought'}</button>
      </div>
    </div>
  )
}

function Hero({ onSubmit, onQuickAdd }:{ onSubmit:(q:string)=>void; onQuickAdd:()=>void }){
  const [q,setQ] = useState('')
  const [recording,setRecording] = useState(false)
  const bg = 'https://images.unsplash.com/photo-1542834369-f10ebf06d3cb?q=80&w=2000&auto=format&fit=crop'
  return (
    <div className="relative overflow-hidden rounded-3xl" style={{height:240}}>
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:`linear-gradient(to bottom, rgba(15,23,42,0.25), rgba(15,23,42,0.35)), url(${bg})`, backgroundSize:'cover', backgroundPosition:'center'}}/>
      <button onClick={onQuickAdd} className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm ${UI.ring}`} aria-label="Quick add item"><Plus className="h-5 w-5"/></button>
      <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
        <div className="text-slate-100/90 text-2xl md:text-4xl font-semibold drop-shadow-sm">Shopping, Lucas</div>
        <div className="mt-4">
          <div className={`mx-auto max-w-2xl ${UI.card} ${UI.ring} rounded-full px-3 py-2 md:px-4 md:py-2 flex items-center gap-2`}>
            <Sparkles className="h-5 w-5 text-slate-500"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Try: add milk x2 split 50/50" className="flex-1 bg-transparent outline-none placeholder:text-slate-200/70 text-slate-50"/>
            {!recording ? (
              <button onClick={()=>setRecording(true)} className="p-2 rounded-full bg-slate-900/30 hover:bg-slate-900/40 transition" aria-label="Start voice"><Mic className="h-5 w-5 text-slate-100"/></button>
            ) : (
              <button onClick={()=>setRecording(false)} className="p-2 rounded-full bg-rose-500/70 hover:bg-rose-500/80 transition" aria-label="Stop voice"><Square className="h-5 w-5 text-white"/></button>
            )}
            <button onClick={()=>{ if(!q) return; onSubmit(q); setQ('') }} className="ml-1 px-3 py-1.5 rounded-full bg-white text-slate-800 text-sm font-medium">Go</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemForm({ initial, onCancel, onSave }:{ initial?: Partial<ShoppingItem>; onCancel:()=>void; onSave:(i:ShoppingItem)=>void }){
  const [form,setForm] = useState<Partial<ShoppingItem>>({
    id: initial?.id || Math.random().toString(36).slice(2),
    name: initial?.name || '',
    quantity: initial?.quantity ?? 1,
    price: initial?.price ?? undefined,
    assigned: (initial?.assigned as any) || 'Both',
    split: initial?.split || { Lucas:0.5, Alex:0.5 },
    pickToday: initial?.pickToday ?? false,
    status: initial?.status || 'open',
  })
  const update = (k:keyof ShoppingItem, v:any)=> setForm(f=> ({...f, [k]: v}))
  return (
    <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
      <div className="flex items-start justify-between"><h2 className="text-xl font-semibold leading-tight pr-6">{initial?.id ? 'Edit item' : 'Add item'}</h2><button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button></div>
      <div className="mt-4 space-y-3 text-sm">
        <label className="block">Name<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.name as string} onChange={e=>update('name', e.target.value)} /></label>
        <label className="block">Quantity<input type="number" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.quantity as number} onChange={e=>update('quantity', parseInt(e.target.value||'0',10))} /></label>
        <label className="block">Price (€)<input type="number" step="0.01" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={(form.price as number|undefined) ?? ''} onChange={e=>update('price', e.target.value===''? undefined : parseFloat(e.target.value))} /></label>
        <label className="block">Assigned<select className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.assigned as any} onChange={e=>update('assigned', e.target.value as any)}><option>Lucas</option><option>Alex</option><option>Both</option></select></label>
        {form.assigned==='Both' && (
          <div className="grid grid-cols-2 gap-2">
            <label className="block">Lucas %<input type="number" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={Math.round(((form.split?.Lucas ?? 0.5)*100))} onChange={e=>{
              const luc = Math.max(0, Math.min(100, parseInt(e.target.value||'0',10)))
              update('split', { Lucas: luc/100, Alex: Math.max(0, Math.min(1, 1 - (luc/100))) })
            }} /></label>
            <div className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 flex items-center justify-between`}><span>Alex %</span><span className="font-medium">{100 - Math.round(((form.split?.Lucas ?? 0.5)*100))}</span></div>
          </div>
        )}
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.pickToday} onChange={e=>update('pickToday', e.target.checked)} /> Pick for today</label>
        <label className="block">Status<select className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.status as any} onChange={e=>update('status', e.target.value)}><option>open</option><option>bought</option></select></label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Cancel</button>
        <button onClick={()=> onSave(form as ShoppingItem)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Save className="h-4 w-4"/> Save</button>
      </div>
    </motion.aside>
  )
}

function LongTermForm({ initial, onCancel, onSave }:{ initial?: Partial<LongTermItem>; onCancel:()=>void; onSave:(r:LongTermItem)=>void }){
  const [form,setForm] = useState<Partial<LongTermItem>>({
    id: initial?.id || Math.random().toString(36).slice(2),
    name: initial?.name || '',
    price: initial?.price ?? 0,
    split: initial?.split || { Lucas:0.5, Alex:0.5 },
    targetDate: initial?.targetDate || '',
    status: initial?.status || 'planned',
  })
  const update = (k:keyof LongTermItem, v:any)=> setForm(f=> ({...f, [k]: v}))
  const lucPct = Math.round(((form.split?.Lucas ?? 0.5) * 100))
  return (
    <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
      <div className="flex items-start justify-between"><h2 className="text-xl font-semibold leading-tight pr-6">{initial?.id ? 'Edit long‑term' : 'Add long‑term'}</h2><button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button></div>
      <div className="mt-4 space-y-3 text-sm">
        <label className="block">Name<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.name as string} onChange={e=>update('name', e.target.value)} /></label>
        <label className="block">Price (€)<input type="number" step="0.01" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.price as number} onChange={e=>update('price', parseFloat(e.target.value||'0'))} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">Lucas %<input type="number" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={lucPct} onChange={e=>{
            const luc = Math.max(0, Math.min(100, parseInt(e.target.value||'0',10)))
            update('split', { Lucas: luc/100, Alex: Math.max(0, Math.min(1, 1 - (luc/100))) })
          }} /></label>
          <div className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 flex items-center justify-between`}><span>Alex %</span><span className="font-medium">{100 - lucPct}</span></div>
        </div>
        <label className="block">Target date<input type="date" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.targetDate as string} onChange={e=>update('targetDate', e.target.value)} /></label>
        <label className="block">Status<select className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.status as any} onChange={e=>update('status', e.target.value)}><option>planned</option><option>bought</option></select></label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Cancel</button>
        <button onClick={()=> onSave(form as LongTermItem)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Save className="h-4 w-4"/> Save</button>
      </div>
    </motion.aside>
  )
}

export default function Shopping(){
  const initial = useMemo(sampleData, [])
  const [list, setList] = useState<ShoppingItem[]>(initial.list)
  const [long, setLong] = useState<LongTermItem[]>(initial.long)
  const [open, setOpen] = useState({ list: false, picks: false, long: false })
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [showLongForm, setShowLongForm] = useState(false)
  const [editingLong, setEditingLong] = useState<LongTermItem | null>(null)

  const counts = { list: list.filter(i=> i.status==='open').length, picks: list.filter(i=> i.pickToday && i.status==='open').length, long: long.length }

  const onQuickAdd = () => { setEditingItem(null); setShowItemForm(true) }

  const onSubmit = (q: string) => {
    // Lightweight parser examples:
    // "add milk x2 split 50/50"
    const add = q.match(/add\s+(.+?)(?:\s+x(\d+))?(?:\s+split\s+(\d+)\/(\d+))?/i)
    if(add){
      const name = add[1]
      const qty = add[2] ? parseInt(add[2],10) : 1
      const luc = add[3] ? parseInt(add[3],10)/100 : 0.5
      const alex = add[4] ? parseInt(add[4],10)/100 : 0.5
      const id = Math.random().toString(36).slice(2)
      setList(arr => [{ id, name, quantity: qty, assigned:'Both', split:{ Lucas:luc, Alex:alex }, status:'open' }, ...arr])
      return
    }
    onQuickAdd()
  }

  return (
    <div className={UI.page}>
      <div className="max-w-6xl mx-auto space-y-4">
        <Hero onSubmit={onSubmit} onQuickAdd={onQuickAdd} />
        <Section title={`Shopping overview • ${new Date().toLocaleDateString(undefined,{month:'short', day:'numeric'})}`} action={<div className="flex gap-2"><button onClick={()=>{ setEditingItem(null); setShowItemForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add item</button><button onClick={()=>{ setEditingLong(null); setShowLongForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add long‑term</button></div>}>
          <div className="divide-y divide-slate-200/80 rounded-xl overflow-hidden">
            <div>
              <button onClick={()=> setOpen(o=> ({...o, list: !o.list}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div><div className="text-xs text-slate-500">Current list</div><div className="text-2xl font-semibold">{counts.list}</div></div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.list ? 'rotate-90':''}`}/>
              </button>
              <AnimatePresence initial={false}>{open.list && (
                <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <button onClick={()=>{ setEditingItem(null); setShowItemForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add item</button>
                  </div>
                  <div className="space-y-2">
                    {list.filter(i=> i.status==='open').map(item => (
                      <ItemRow key={item.id} item={item} onToggleBought={(it)=> setList(arr=> arr.map(x=> x.id===it.id ? { ...x, status: x.status==='bought' ? 'open' : 'bought' } : x))} onEdit={(it)=>{ setEditingItem(it); setShowItemForm(true) }} onDelete={(it)=> setList(arr=> arr.filter(x=> x.id!==it.id))} />
                    ))}
                    {list.filter(i=> i.status==='open').length===0 && <div className="text-sm text-slate-500">Your list is empty.</div>}
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </div>
            <div>
              <button onClick={()=> setOpen(o=> ({...o, picks: !o.picks}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div><div className="text-xs text-slate-500">Today's picks</div><div className="text-2xl font-semibold">{counts.picks}</div></div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.picks ? 'rotate-90':''}`}/>
              </button>
              <AnimatePresence initial={false}>{open.picks && (
                <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
                  <div className="text-sm text-slate-500 mb-2">Prioritized for today — {counts.picks} item(s)</div>
                  <div className="space-y-2">
                    {list.filter(i=> i.pickToday && i.status==='open').map(item => (
                      <ItemRow key={item.id} item={item} onToggleBought={(it)=> setList(arr=> arr.map(x=> x.id===it.id ? { ...x, status: x.status==='bought' ? 'open' : 'bought' } : x))} onEdit={(it)=>{ setEditingItem(it); setShowItemForm(true) }} onDelete={(it)=> setList(arr=> arr.filter(x=> x.id!==it.id))} />
                    ))}
                    {list.filter(i=> i.pickToday && i.status==='open').length===0 && <div className="text-sm text-slate-500">No picks for today.</div>}
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </div>
            <div>
              <button onClick={()=> setOpen(o=> ({...o, long: !o.long}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div><div className="text-xs text-slate-500">Long‑term items</div><div className="text-2xl font-semibold">{counts.long}</div></div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.long ? 'rotate-90':''}`}/>
              </button>
              <AnimatePresence initial={false}>{open.long && (
                <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <button onClick={()=>{ setEditingLong(null); setShowLongForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add long‑term</button>
                  </div>
                  <div className="space-y-2">
                    {long.map(row => (
                      <LongTermRow key={row.id} row={row} onEdit={(r)=>{ setEditingLong(r); setShowLongForm(true) }} onDelete={(r)=> setLong(arr=> arr.filter(x=> x.id!==r.id))} onMarkBought={(r)=> setLong(arr=> arr.map(x=> x.id===r.id ? { ...x, status: x.status==='bought' ? 'planned' : 'bought' } : x))} />
                    ))}
                    {long.length===0 && <div className="text-sm text-slate-500">No long‑term purchases yet.</div>}
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </div>
          </div>
        </Section>
        <AnimatePresence>
          {showItemForm && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/20">
              <ItemForm initial={editingItem ?? undefined} onCancel={()=>{ setShowItemForm(false); setEditingItem(null) }} onSave={(row)=>{
                setList(arr=> { const i=arr.findIndex(x=> x.id===row.id); if(i>=0){ const copy=[...arr]; copy[i]=row; return copy } return [row, ...arr] })
                setShowItemForm(false); setEditingItem(null)
              }} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showLongForm && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/20">
              <LongTermForm initial={editingLong ?? undefined} onCancel={()=>{ setShowLongForm(false); setEditingLong(null) }} onSave={(row)=>{
                setLong(arr=> { const i=arr.findIndex(x=> x.id===row.id); if(i>=0){ const copy=[...arr]; copy[i]=row; return copy } return [row, ...arr] })
                setShowLongForm(false); setEditingLong(null)
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


