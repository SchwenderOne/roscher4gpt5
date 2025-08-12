import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronRight, Euro, Receipt, Search, Filter, Sparkles, Mic, Square } from 'lucide-react'

const UI = {
  page: 'min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8',
  ring: 'ring-1 ring-slate-200',
  card: 'bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60',
  chip: 'bg-slate-100',
  subtle: 'text-slate-500',
}
const pastel = { amber: 'bg-amber-50 border-amber-100', emerald: 'bg-emerald-50 border-emerald-100' }

type Tx = { id:string; date:string; category:string; amount:number; payer:'Lucas'|'Alex'; split:Record<string,number>; note?:string; status:'paid'|'due'|'scheduled' }
type Bill = { id:string; name:string; amount:number; due:string; status:'due'|'scheduled'|'paid' }

const formatEUR = (n:number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(n)

function sampleData(){ const people=['Lucas','Alex']; const tx:Tx[]=[
  { id:'t1', date:'2025-08-08', category:'Groceries', amount:34.8, payer:'Lucas', split:{ Lucas:0.5, Alex:0.5 }, note:'Oats, tomatoes', status:'paid' },
  { id:'t2', date:'2025-08-08', category:'Utilities', amount:48.4, payer:'Alex', split:{ Lucas:0.5, Alex:0.5 }, note:'Electricity', status:'due' },
  { id:'t3', date:'2025-08-06', category:'Cleaning', amount:12, payer:'Lucas', split:{ Lucas:1, Alex:0 }, note:'Supplies', status:'paid' },
  { id:'t4', date:'2025-08-03', category:'Plants', amount:9.2, payer:'Alex', split:{ Lucas:0.5, Alex:0.5 }, note:'Fertilizer', status:'paid' },
]; const bills:Bill[]=[
  { id:'b1', name:'Internet', amount:29.99, due:'2025-08-15', status:'due' },
  { id:'b2', name:'Rent', amount:1300, due:'2025-08-25', status:'scheduled' },
]; return { people, tx, bills } }

function computeNetBalances(people:string[], txs:Tx[]){ const net:Record<string, number> = Object.fromEntries(people.map(p=>[p,0])) as Record<string, number>
  txs.forEach(t=>{ const total=t.amount; people.forEach(p=>{ const share=(t.split?.[p]??0)*total; if(p===t.payer) net[p]+= total - share; else net[p]-= share }) })
  return net
}

function Section({ title, action, children }:{title:string; action?:React.ReactNode; children:React.ReactNode}){
  return (<section className={`${UI.card} ${UI.ring} rounded-2xl p-4 md:p-5`}>
    <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{title}</h3>{action}</div>{children}
  </section>)
}

function HeroFinance({ name, onSubmit, onQuickAdd, balance }:{ name:string; onSubmit:(q:string)=>void; onQuickAdd:()=>void; balance:number }){
  const [q,setQ]=useState(''); const [recording,setRecording]=useState(false)
  const bg='https://images.unsplash.com/photo-1552083974-186346191183?q=80&w=2000&auto=format&fit=crop'
  return (<div className="relative overflow-hidden rounded-3xl" style={{height:280}}>
    <div className="absolute inset-0" style={{backgroundImage:`linear-gradient(to bottom, rgba(15,23,42,0.28), rgba(15,23,42,0.36)), url(${bg})`, backgroundSize:'cover', backgroundPosition:'center'}}/>
    <button onClick={onQuickAdd} className={`absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm ${UI.ring}`} aria-label="Quick add"><Plus className="h-5 w-5"/></button>
    <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
      <div className="text-slate-100/90 text-2xl md:text-4xl font-semibold drop-shadow-sm">Finances, {name}</div>
      <div className="mt-2"><span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/25 text-white ${UI.ring}`}><Euro className="h-4 w-4"/> Balance {formatEUR(balance||0)}</span></div>
      <div className="mt-4"><div className={`mx-auto max-w-2xl ${UI.card} ${UI.ring} rounded-full px-3 py-2 md:px-4 md:py-2 flex items-center gap-2`}>
        <Sparkles className="h-5 w-5 text-slate-500"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Try: record expense €20 groceries" className="flex-1 bg-transparent outline-none placeholder:text-slate-200/70 text-slate-50"/>
        {!recording ? (<button onClick={()=>setRecording(true)} className="p-2 rounded-full bg-slate-900/30 hover:bg-slate-900/40 transition" aria-label="Start voice"><Mic className="h-5 w-5 text-slate-100"/></button>)
                    : (<button onClick={()=>setRecording(false)} className="p-2 rounded-full bg-rose-500/70 hover:bg-rose-500/80 transition" aria-label="Stop voice"><Square className="h-5 w-5 text-white"/></button>)}
        <button onClick={()=>{ if(!q) return; onSubmit(q); setQ('') }} className="ml-1 px-3 py-1.5 rounded-full bg-white text-slate-800 text-sm font-medium">Go</button>
      </div></div>
    </div>
  </div>)
}

function BillsList({ bills, onPay }:{ bills:Bill[]; onPay:(b:Bill)=>void }){
  return (<div className="space-y-2">
    {bills.map(b=>(<div key={b.id} className={`flex items-center justify-between p-3 rounded-xl border ${UI.ring} ${pastel.amber}`}>
      <div><div className="font-medium">{b.name}</div><div className="text-xs text-slate-500">Due {b.due}</div></div>
      <div className="flex items-center gap-3"><div className="text-sm font-medium">{formatEUR(b.amount)}</div>
        {b.status!=='paid' ? (<button onClick={()=>onPay(b)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm">Mark paid</button>)
                           : (<span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-2 py-1">Paid</span>)}
      </div>
    </div>))}
  </div>)
}

function TransactionRow({ t, onOpen }:{ t:Tx; onOpen:(t:Tx)=>void }){
  return (<button onClick={()=>onOpen(t)} className={`w-full text-left grid grid-cols-[1fr,auto,auto] gap-3 items-center p-3 rounded-xl border ${UI.ring} hover:bg-white`}>
    <div className="truncate"><div className="font-medium truncate">{t.category} — {t.note || 'No note'}</div><div className="text-xs text-slate-500">{t.date} • paid by {t.payer}</div></div>
    <div className={`text-sm ${t.status==='due' ? 'text-amber-700' : 'text-slate-700'}`}>{formatEUR(t.amount)}</div>
    <ChevronRight className="h-4 w-4 text-slate-400"/>
  </button>)
}

function TransactionDetail({ tx, onClose, onDelete }:{ tx:Tx|null; onClose:()=>void; onDelete:(t:Tx)=>void }){
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
      <div className="mt-4 grid grid-cols-2 gap-2"><button className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Receipt className="h-4 w-4"/> Attach receipt</button><button onClick={()=>onDelete(tx)} className="rounded-xl bg-rose-500/90 text-white px-3 py-2 text-sm">Delete</button></div>
    </motion.aside>
  </motion.div>)}</AnimatePresence>)
}

export default function Finance(){
  const { people: initialPeople, tx: initialTx, bills: initialBills } = useMemo(sampleData, [])
  const [people] = useState(initialPeople)
  const [tx, setTx] = useState<Tx[]>(initialTx)
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [selected, setSelected] = useState<Tx|null>(null)
  const [open, setOpen] = useState({ bills:false, tx:false, settle:false })
  const [query,setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const onAdd = (t:Tx)=> setTx(arr=> [t, ...arr])
  const onPay = (b:Bill)=> setBills(arr=> arr.map(x=> x.id===b.id ? { ...x, status:'paid' } : x))
  const onDelete = (row:Tx)=> setTx(arr=> arr.filter(x=> x.id !== row.id))

  const filtered = tx.filter(t=>{
    const matchQuery = query ? (t.category + ' ' + (t.note||'')).toLowerCase().includes(query.toLowerCase()) : true
    const matchCat = categoryFilter === 'All' ? true : t.category === categoryFilter
    return matchQuery && matchCat
  })
  const categories = Array.from(new Set(['All', ...tx.map(t=> t.category)]))

  const net = computeNetBalances(people, tx)
  const lucas = net['Lucas'] || 0
  const settlementText = lucas > 0 ? `Alex → Lucas ${formatEUR(lucas)}` : lucas < 0 ? `Lucas → Alex ${formatEUR(-lucas)}` : 'All settled'

  const counts = { bills: bills.filter(b=> b.status !== 'paid').length, tx: tx.length, settle: 1 }

  return (<div className={UI.page}>
    <div className="max-w-6xl mx-auto space-y-4">
      <HeroFinance name="Lucas" balance={lucas} onSubmit={(q)=>{
        const m = q.match(/(\d+[.,]?\d*)/); if(m){ const amt=parseFloat(m[1].replace(',','.'))
          onAdd({ id:`t${Math.random().toString(36).slice(2)}`, date:new Date().toISOString().slice(0,10), category:'Other', amount:amt, payer:'Lucas', split:{ Lucas:0.5, Alex:0.5 }, note:q, status:'paid' })
        }}} onQuickAdd={()=>{
          const amt = 10; onAdd({ id:`t${Math.random().toString(36).slice(2)}`, date:new Date().toISOString().slice(0,10), category:'Other', amount:amt, payer:'Lucas', split:{ Lucas:0.5, Alex:0.5 }, note:'Quick add', status:'paid' })
        }} />
      <Section title={`Finance overview • ${new Date().toLocaleDateString(undefined,{month:'short', day:'numeric'})}`} action={<button onClick={()=>{ const amt=10; onAdd({ id:`t${Math.random().toString(36).slice(2)}`, date:new Date().toISOString().slice(0,10), category:'Other', amount:amt, payer:'Lucas', split:{ Lucas:0.5, Alex:0.5 }, note:'Quick add', status:'paid' }) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add</button>}>
        <div className="divide-y divide-slate-200/80 rounded-xl overflow-hidden">
          <div>
            <button onClick={()=> setOpen(o=> ({...o, bills: !o.bills}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
              <div><div className="text-xs text-slate-500">Upcoming bills</div><div className="text-2xl font-semibold">{counts.bills}</div></div>
              <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.bills ? 'rotate-90':''}`}/>
            </button>
            <AnimatePresence initial={false}>{open.bills && (<motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4"><BillsList bills={bills} onPay={onPay} /></motion.div>)}</AnimatePresence>
          </div>
          <div>
            <button onClick={()=> setOpen(o=> ({...o, tx: !o.tx}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
              <div><div className="text-xs text-slate-500">Recent transactions</div><div className="text-2xl font-semibold">{counts.tx}</div></div>
              <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.tx ? 'rotate-90':''}`}/>
            </button>
            <AnimatePresence initial={false}>{open.tx && (<motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
              <div className="mb-2 flex items-center gap-2">
                <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1.5 flex items-center gap-2`}>
                  <Search className="h-4 w-4"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search…" className="bg-transparent outline-none text-sm w-40"/>
                </div>
                <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1.5 flex items-center gap-2`}>
                  <Filter className="h-4 w-4"/><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="bg-transparent outline-none text-sm">
                    {categories.map(c=> <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">{filtered.map(row => (<TransactionRow key={row.id} t={row} onOpen={setSelected}/>))}
                {filtered.length===0 && <div className="text-sm text-slate-500">No transactions match your filter.</div>}
              </div>
            </motion.div>)}</AnimatePresence>
          </div>
          <div>
            <button onClick={()=> setOpen(o=> ({...o, settle: !o.settle}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
              <div><div className="text-xs text-slate-500">Settlement</div><div className="text-2xl font-semibold">1</div></div>
              <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.settle ? 'rotate-90':''}`}/>
            </button>
            <AnimatePresence initial={false}>{open.settle && (<motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
              <div className={`p-3 rounded-xl border ${UI.ring} ${pastel.emerald}`}>
                <div className="text-sm text-slate-700">Suggested settlement</div>
                <div className="font-medium">{settlementText}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm">Settle now (mock)</button>
                  <button className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Export CSV</button>
                </div>
              </div>
            </motion.div>)}</AnimatePresence>
          </div>
        </div>
      </Section>
      <TransactionDetail tx={selected} onClose={()=>setSelected(null)} onDelete={onDelete} />
    </div>
  </div>)
}
