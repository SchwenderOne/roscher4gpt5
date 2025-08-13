import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronRight, Euro, Receipt, Search, Filter, Sparkles, Mic, Square, Save, Trash } from 'lucide-react'

const UI = {
  page: 'min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8',
  ring: 'ring-1 ring-slate-200',
  card: 'bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60',
  chip: 'bg-slate-100',
  subtle: 'text-slate-500',
}
const pastel = { amber: 'bg-amber-50 border-amber-100', emerald: 'bg-emerald-50 border-emerald-100' }

type Tx = { id:string; date:string; category:string; amount:number; payer:'Lucas'|'Alex'; split:Record<string,number>; note?:string; status:'paid'|'due'|'scheduled' }

const formatEUR = (n:number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(n)

function sampleData(){ const people=['Lucas','Alex']; const tx:Tx[]=[
  { id:'t1', date:'2025-08-08', category:'Groceries', amount:34.8, payer:'Lucas', split:{ Lucas:0.5, Alex:0.5 }, note:'Oats, tomatoes', status:'paid' },
  { id:'t2', date:'2025-08-08', category:'Utilities', amount:48.4, payer:'Alex', split:{ Lucas:0.5, Alex:0.5 }, note:'Electricity', status:'due' },
  { id:'t3', date:'2025-08-06', category:'Cleaning', amount:12, payer:'Lucas', split:{ Lucas:1, Alex:0 }, note:'Supplies', status:'paid' },
  { id:'t4', date:'2025-08-03', category:'Plants', amount:9.2, payer:'Alex', split:{ Lucas:0.5, Alex:0.5 }, note:'Fertilizer', status:'paid' },
]; return { people, tx } }

function computeNetBalances(people:string[], txs:Tx[]){ const net:Record<string, number> = Object.fromEntries(people.map(p=>[p,0])) as Record<string, number>
  txs.forEach(t=>{ const total=t.amount; people.forEach(p=>{ const share=(t.split?.[p]??0)*total; if(p===t.payer) net[p]+= total - share; else net[p]-= share }) })
  return net
}

function Section({ title, action, children }:{title:string; action?:React.ReactNode; children:React.ReactNode}){
  return (<section className={`${UI.card} ${UI.ring} rounded-2xl p-4 md:p-5`}>
    <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{title}</h3>{action}</div>{children}
  </section>)
}

function HeroFinance({ name, onSubmit, onQuickAdd, balance, onOpenBalance }:{ name:string; onSubmit:(q:string)=>void; onQuickAdd:()=>void; balance:number; onOpenBalance:()=>void }){
  const [q,setQ]=useState(''); const [recording,setRecording]=useState(false)
  const bg='https://images.unsplash.com/photo-1552083974-186346191183?q=80&w=2000&auto=format&fit=crop'
  return (<div className="relative overflow-hidden rounded-3xl" style={{height:280}}>
    <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:`linear-gradient(to bottom, rgba(15,23,42,0.28), rgba(15,23,42,0.36)), url(${bg})`, backgroundSize:'cover', backgroundPosition:'center'}}/>
    <button onClick={onQuickAdd} className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm ${UI.ring}`} aria-label="Quick add"><Plus className="h-5 w-5"/></button>
    <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
      <div className="text-slate-100/90 text-2xl md:text-4xl font-semibold drop-shadow-sm">Finances, {name}</div>
      <div className="mt-2"><button onClick={onOpenBalance} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/25 text-white ${UI.ring}`} aria-label="Open balance details"><Euro className="h-4 w-4"/> Balance {formatEUR(balance||0)}</button></div>
      <div className="mt-4"><div className={`mx-auto max-w-2xl ${UI.card} ${UI.ring} rounded-full px-3 py-2 md:px-4 md:py-2 flex items-center gap-2`}>
        <Sparkles className="h-5 w-5 text-slate-500"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Try: record expense €20 groceries" className="flex-1 bg-transparent outline-none placeholder:text-slate-200/70 text-slate-50"/>
        {!recording ? (<button onClick={()=>setRecording(true)} className="p-2 rounded-full bg-slate-900/30 hover:bg-slate-900/40 transition" aria-label="Start voice"><Mic className="h-5 w-5 text-slate-100"/></button>)
                    : (<button onClick={()=>setRecording(false)} className="p-2 rounded-full bg-rose-500/70 hover:bg-rose-500/80 transition" aria-label="Stop voice"><Square className="h-5 w-5 text-white"/></button>)}
        <button onClick={()=>{ if(!q) return; onSubmit(q); setQ('') }} className="ml-1 px-3 py-1.5 rounded-full bg-white text-slate-800 text-sm font-medium">Go</button>
      </div></div>
    </div>
  </div>)
}

function BalanceDetail({ people, net, tx, onClose, onSettle }:{ people:string[]; net:Record<string,number>; tx:Tx[]; onClose:()=>void; onSettle:()=>void }){
  const sharedTx = tx.filter(t=> (t.split?.Lucas ?? 0) > 0 && (t.split?.Alex ?? 0) > 0)
  return (
    <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
      <div className="flex items-start justify-between"><h2 className="text-xl font-semibold leading-tight pr-6">Balances</h2><button onClick={onClose} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button></div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className={`${UI.ring} ${UI.chip} rounded-xl p-4`}><div className="text-xs text-slate-500">Lucas</div><div className="text-xl font-semibold">{formatEUR(net['Lucas']||0)}</div></div>
        <div className={`${UI.ring} ${UI.chip} rounded-xl p-4`}><div className="text-xs text-slate-500">Alex</div><div className="text-xl font-semibold">{formatEUR(net['Alex']||0)}</div></div>
      </div>
      <div className="mt-6">
        <div className="text-sm text-slate-600 mb-2">Shared transactions affecting balance</div>
        <div className="space-y-2">
          {sharedTx.map(row => (
            <div key={row.id} className={`p-3 rounded-xl border ${UI.ring} flex items-center justify-between`}>
              <div className="min-w-0">
                <div className="font-medium truncate">{row.category} — {row.note || 'No note'}</div>
                <div className="text-xs text-slate-500">{row.date} • payer {row.payer}</div>
              </div>
              <div className="text-sm font-medium">{formatEUR(row.amount)}</div>
            </div>
          ))}
          {sharedTx.length===0 && <div className="text-sm text-slate-500">No shared transactions yet.</div>}
        </div>
      </div>
      <div className="mt-6">
        <button onClick={onSettle} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm">Settle now</button>
      </div>
    </motion.aside>
  )
}


const statusStyles: Record<Tx['status'], string> = {
  paid: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  due: 'text-amber-700 bg-amber-50 border-amber-100',
  scheduled: 'text-slate-700 bg-slate-100 border-slate-200',
}
const categoryTint: Record<string, string> = {
  Groceries: 'bg-amber-200',
  Utilities: 'bg-sky-200',
  Cleaning: 'bg-sky-200',
  Plants: 'bg-emerald-200',
  Other: 'bg-slate-300',
}
function Dot({ c }:{ c:string }){ return <span className={`inline-block h-2.5 w-2.5 rounded-full ${categoryTint[c] || 'bg-slate-300'}`}/>} 
function TransactionRow({ t, onOpen }:{ t:Tx; onOpen:(t:Tx)=>void }){
  return (
    <button onClick={()=>onOpen(t)} className={`w-full text-left p-3 rounded-xl border ${UI.ring} hover:bg-white flex items-start gap-3`}>
      <Dot c={t.category || 'Other'} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium truncate">{t.category} — {t.note || 'No note'}</div>
        </div>
        <div className="text-xs text-slate-500 truncate">{t.payer} • Split {Math.round(((t.split?.Lucas ?? 0.5)*100))}%/{Math.round(((t.split?.Alex ?? 0.5)*100))}%</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className={`text-sm font-medium ${t.status==='due' ? 'text-amber-700' : 'text-slate-700'}`}>{formatEUR(t.amount)}</div>
        <span className={`text-[11px] px-2 py-0.5 rounded-lg border ${statusStyles[t.status]}`}>{t.status}</span>
      </div>
    </button>
  )
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function renderGroupedByDate(rows: Tx[], onOpen: (t: Tx)=>void){
  const groups = rows.reduce<Record<string, Tx[]>>((acc, t)=>{
    (acc[t.date] ||= []).push(t)
    return acc
  }, {})
  const sortedDates = Object.keys(groups).sort((a,b)=> b.localeCompare(a))
  return (
    <div className="space-y-4">
      {sortedDates.map(date => (
        <div key={date}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-500">{formatDateLabel(date)}</div>
            <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 text-xs`}>{groups[date].length} item(s)</div>
          </div>
          <div className="space-y-2">
            {groups[date].map(t => (
              <TransactionRow key={t.id} t={t} onOpen={onOpen} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TransactionDetail({ tx, onClose, onDelete, onEdit }:{ tx:Tx|null; onClose:()=>void; onDelete:(t:Tx)=>void; onEdit:(t:Tx)=>void }){
  if(!tx) return null
  return (<AnimatePresence>{tx && (<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-20 bg-black/20">
    <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
      <div className="flex items-start justify-between"><h2 className="text-xl font-semibold leading-tight pr-6">{tx.category}</h2><button onClick={onClose} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button></div>
      <div className="mt-2 text-sm text-slate-600">{tx.note || 'No note'}</div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Amount: <span className="float-right font-medium">{formatEUR(tx.amount)}</span></div>
        <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Payer: <span className="float-right font-medium">{tx.payer}</span></div>
        <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Date: <span className="float-right font-medium">{tx.date}</span></div>
        <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Status: <span className="float-right font-medium">{tx.status}</span></div>
      </div>
      <div className="mt-4"><div className="text-sm text-slate-600 mb-1">Split</div><div className="space-y-2">
        {Object.entries(tx.split || {}).map(([name, share])=> (<div key={name} className={`p-3 rounded-xl border ${UI.ring}`}><div className="flex items-center justify-between text-sm"><span>{name}</span><span className="font-medium">{Math.round(share*100)}%</span></div></div>))}
      </div></div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Receipt className="h-4 w-4"/> Attach receipt</button>
        <button onClick={()=>onEdit(tx)} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Edit</button>
        <button onClick={()=>onDelete(tx)} className="rounded-xl bg-rose-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Trash className="h-4 w-4"/> Delete</button>
      </div>
    </motion.aside>
  </motion.div>)}</AnimatePresence>)
}

function TransactionForm({ initial, people, onCancel, onSave }:{ initial?: Partial<Tx>; people: string[]; onCancel:()=>void; onSave:(t:Tx)=>void }){
  const [form, setForm] = useState<Partial<Tx>>({
    id: initial?.id || `t${Math.random().toString(36).slice(2)}`,
    date: initial?.date || new Date().toISOString().slice(0,10),
    category: initial?.category || 'Other',
    amount: initial?.amount ?? 0,
    payer: (initial?.payer as any) || 'Lucas',
    split: initial?.split || { Lucas:0.5, Alex:0.5 },
    note: initial?.note || '',
    status: initial?.status || 'paid',
  })
  const update = (k:keyof Tx, v:any)=> setForm(f=> ({...f, [k]: v}))
  return (
    <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
      <div className="flex items-start justify-between"><h2 className="text-xl font-semibold leading-tight pr-6">{initial?.id ? 'Edit transaction' : 'Add transaction'}</h2><button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button></div>
      <div className="mt-4 space-y-3 text-sm">
        <label className="block">Category<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.category as string} onChange={e=>update('category', e.target.value)} /></label>
        <label className="block">Amount<input type="number" step="0.01" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.amount as number} onChange={e=>update('amount', parseFloat(e.target.value||'0'))} /></label>
        <label className="block">Date<input type="date" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.date as string} onChange={e=>update('date', e.target.value)} /></label>
        <label className="block">Payer<select className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.payer as any} onChange={e=>update('payer', e.target.value)}>{people.map(p=> <option key={p}>{p}</option>)}</select></label>
        <label className="block">Note<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.note as string} onChange={e=>update('note', e.target.value)} /></label>
        <label className="block">Status<select className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.status as any} onChange={e=>update('status', e.target.value)}><option>paid</option><option>due</option><option>scheduled</option></select></label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Cancel</button>
        <button onClick={()=> onSave(form as Tx)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Save className="h-4 w-4"/> Save</button>
      </div>
    </motion.aside>
  )
}


export default function Finance(){
  const { people: initialPeople, tx: initialTx } = useMemo(sampleData, [])
  const [people] = useState(initialPeople)
  const [tx, setTx] = useState<Tx[]>(initialTx)
  const [selected, setSelected] = useState<Tx|null>(null)
  const [open, setOpen] = useState({ tx: false })
  const [query,setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showTxForm, setShowTxForm] = useState(false)
  const [editingTx, setEditingTx] = useState<Tx | null>(null)
  const [showBalance, setShowBalance] = useState(false)

  const onAdd = (t:Tx)=> setTx(arr=> [t, ...arr])
  const onDelete = (row:Tx)=> setTx(arr=> arr.filter(x=> x.id !== row.id))
  const onSaveTx = (row:Tx)=> setTx(arr=> {
    const i = arr.findIndex(x=> x.id===row.id); if(i>=0){ const copy=[...arr]; copy[i]=row; return copy } else { return [row, ...arr] }
  })

  const filtered = tx.filter(t=>{
    const matchQuery = query ? (t.category + ' ' + (t.note||'')).toLowerCase().includes(query.toLowerCase()) : true
    const matchCat = categoryFilter === 'All' ? true : t.category === categoryFilter
    return matchQuery && matchCat
  })
  const categories = Array.from(new Set(['All', ...tx.map(t=> t.category)]))

  const net = computeNetBalances(people, tx)
  const lucas = net['Lucas'] || 0
  const alex = net['Alex'] || 0
  const counts = { tx: tx.length }

  return (<div className={UI.page}>
    <div className="max-w-6xl mx-auto space-y-4">
      <HeroFinance name="Lucas" balance={lucas} onOpenBalance={()=> setShowBalance(true)} onSubmit={(q)=>{
        const m = q.match(/(\d+[.,]?\d*)/); if(m){ const amt=parseFloat(m[1].replace(',','.'))
          onAdd({ id:`t${Math.random().toString(36).slice(2)}`, date:new Date().toISOString().slice(0,10), category:'Other', amount:amt, payer:'Lucas', split:{ Lucas:0.5, Alex:0.5 }, note:q, status:'paid' })
        }}} onQuickAdd={()=>{ setEditingTx(null); setShowTxForm(true) }} />
      <Section title={`Transaction history • ${new Date().toLocaleDateString(undefined,{month:'short', day:'numeric'})}`} action={<div className="flex gap-2"><button onClick={()=>{ setEditingTx(null); setShowTxForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add tx</button></div>}>
        <div className="divide-y divide-slate-200/80 rounded-xl overflow-hidden">
          <div>
            <button onClick={()=> setOpen(o=> ({...o, tx: !o.tx}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
              <div><div className="text-xs text-slate-500">Transactions</div><div className="text-2xl font-semibold">{counts.tx}</div></div>
              <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.tx ? 'rotate-90':''}`}/>
            </button>
            <AnimatePresence initial={false}>{open.tx && (<motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1.5 flex items-center gap-2`}>
                  <Search className="h-4 w-4"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search…" className="bg-transparent outline-none text-sm w-44"/>
                </div>
                <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1.5 flex items-center gap-2`}>
                  <Filter className="h-4 w-4"/>
                  <select aria-label="Category filter" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="bg-transparent outline-none text-sm">
                    {categories.map(c=> <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {renderGroupedByDate(filtered, setSelected)}
              {filtered.length===0 && <div className="text-sm text-slate-500">No transactions match your filter.</div>}
            </motion.div>)}</AnimatePresence>
          </div>
        </div>
      </Section>
      <TransactionDetail tx={selected} onClose={()=>setSelected(null)} onDelete={onDelete} onEdit={(row)=>{ setEditingTx(row); setShowTxForm(true) }} />
      <AnimatePresence>
        {showBalance && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/20">
            <BalanceDetail people={people} net={{ Lucas: lucas, Alex: alex }} tx={tx} onClose={()=> setShowBalance(false)} onSettle={()=>{
              const amount = Math.abs(lucas)
              if(amount === 0){ setShowBalance(false); return }
              const debtor = lucas > 0 ? 'Alex' : 'Lucas'
              // Settlement: debtor pays the other; split assigns 100% to creditor so nets zero out
              const row: Tx = {
                id:`t${Math.random().toString(36).slice(2)}`,
                date: new Date().toISOString().slice(0,10),
                category:'Settlement',
                amount,
                payer: debtor as any,
                split: debtor === 'Lucas' ? { Lucas: 0, Alex: 1 } : { Lucas: 1, Alex: 0 },
                note: 'Settlement',
                status:'paid'
              }
              setTx(arr=> [row, ...arr])
              setShowBalance(false)
            }} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTxForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/20">
            <TransactionForm initial={editingTx ?? undefined} people={people} onCancel={()=>{ setShowTxForm(false); setEditingTx(null) }} onSave={(row)=>{ onSaveTx(row); setShowTxForm(false); setEditingTx(null) }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>)
}
