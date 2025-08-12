import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Sparkles, ChevronRight, X, Check } from 'lucide-react'

const UI = {
  page: 'min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8',
  ring: 'ring-1 ring-slate-200',
  card: 'bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60',
  chip: 'bg-slate-100',
}
const tint = {
  shopping: { dot: 'bg-rose-400', block: 'bg-rose-50 border-rose-100' },
  finances: { dot: 'bg-amber-400', block: 'bg-amber-50 border-amber-100' },
  cleaning: { dot: 'bg-sky-400', block: 'bg-sky-50 border-sky-100' },
  plants: { dot: 'bg-emerald-400', block: 'bg-emerald-50 border-emerald-100' },
}
const nowLabel = () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

type TaskT = { id:string; type:'shopping'|'finances'|'cleaning'|'plants'; title:string; at?:string; detail?:string; horizon:'daily'|'short'|'long' }

function sampleModel(){
  const base: TaskT[] = [
    { id: '1', type:'shopping', title:'Groceries: oats, tomatoes', at:'09:30', detail:'Assign & split', horizon:'daily' },
    { id: '2', type:'finances', title:'Pay electricity bill', at:'18:00', detail:'€48.40 outstanding', horizon:'daily' },
    { id: '3', type:'cleaning', title:'Bathroom rotation', detail:'You are next', horizon:'short' },
    { id: '4', type:'plants', title:'Water Monstera', at:'20:00', detail:'Fertilizer next week', horizon:'daily' },
    { id: '5', type:'shopping', title:'Kettle (long‑term)', detail:'50/50 split', horizon:'long' },
    { id: '6', type:'finances', title:'Track rent split', detail:'Reminder 25th', horizon:'short' },
  ]
  return { dateLabel: nowLabel(), tasks: base, userName: 'Lucas' }
}

function Dot({ type }:{type:keyof typeof tint}) { return <span className={`inline-block h-2.5 w-2.5 rounded-full ${tint[type].dot}`}></span> }

function TaskRow({ t, onOpen }:{t:TaskT; onOpen:(t:TaskT)=>void}) {
  return (
    <button onClick={()=>onOpen(t)} className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border ${tint[t.type].block} ${UI.ring} md:p-4 hover:shadow-sm transition`}>
      <Dot type={t.type} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium truncate">{t.title}</div>
          {t.at && <div className="text-xs text-slate-500">{t.at}</div>}
        </div>
        <div className="text-sm text-slate-500 truncate">{t.detail}</div>
      </div>
      <span className="ml-auto text-slate-400">⟶</span>
      <div className="sr-only">Open details</div>
    </button>
  )
}

function Section({ title, children }:{title:string; children:React.ReactNode}){
  return (
    <section className={`${UI.card} ${UI.ring} rounded-2xl p-4 md:p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function Hero({ name, onSubmit }:{name:string; onSubmit:(q:string)=>void}){
  const [q,setQ] = useState('')
  const [recording, setRecording] = useState(false)
  const bg = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2000&auto=format&fit=crop'
  return (
    <div className="relative overflow-hidden rounded-3xl" style={{height:240}}>
      <div className="absolute inset-0" style={{backgroundImage:`linear-gradient(to bottom, rgba(15,23,42,0.25), rgba(15,23,42,0.35)), url(${bg})`, backgroundSize:'cover', backgroundPosition:'center'}}/>
      <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
        <div className="text-slate-100/90 text-2xl md:text-4xl font-semibold drop-shadow-sm">Early morning, {name}</div>
        <div className="mt-4">
          <div className={`mx-auto max-w-2xl ${UI.card} ${UI.ring} rounded-full px-3 py-2 md:px-4 md:py-2 flex items-center gap-2`}>
            <Sparkles className="h-5 w-5 text-slate-500"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search, draft, or just ask…" className="flex-1 bg-transparent outline-none placeholder:text-slate-200/70 text-slate-50"/>
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

function DetailPanel({ task, onClose, onMarkDone }:{task:TaskT|null; onClose:()=>void; onMarkDone:(t:TaskT)=>void}){
  if(!task) return null
  const meta = [task.type, task.at].filter(Boolean)
  const helpers:Record<TaskT['type'], string[]> = {
    shopping: ['Assign split', 'Add item', 'Open list'],
    finances: ['Record payment', 'Attach receipt', 'View history'],
    cleaning: ['Reassign', 'Set reminder', 'View rotation'],
    plants: ['Mark fertilized', 'Change schedule', 'Add note'],
  }
  return (
    <AnimatePresence>
      {task && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-20 bg-black/20">
          <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold leading-tight pr-6">{task.title}</h2>
              <button onClick={onClose} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button>
            </div>
            <div className="mt-2 flex gap-2 text-sm text-slate-600">
              {meta.map((m,i)=> (<span key={i} className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${UI.ring} ${UI.chip}`}>{m}</span>))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Edit</button>
              <button onClick={()=>onMarkDone(task)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Check className="h-4 w-4"/> Mark done</button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Dashboard(){
  const model = useMemo(sampleModel, [])
  const [open, setOpen] = useState({ daily:false, short:false, long:false })
  const [selected, setSelected] = useState<TaskT|null>(null)

  const byHorizon = (h:TaskT['horizon']) => model.tasks.filter(t=>t.horizon===h)
  const counts = { daily: byHorizon('daily').length, short: byHorizon('short').length, long: byHorizon('long').length }

  return (
    <div className={UI.page}>
      <div className="max-w-6xl mx-auto space-y-4">
        <Hero name={model.userName} onSubmit={(q)=>{ /* wire to LLM later */ }} />
        <section className={`${UI.card} ${UI.ring} rounded-2xl p-4 md:p-5`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Daily report • {model.dateLabel}</h3>
          </div>
          <div className="divide-y divide-slate-200/80 rounded-xl overflow-hidden">
            {([
              { key:'daily', label:'Daily tasks', count: counts.daily },
              { key:'short', label:'Short‑term', count: counts.short },
              { key:'long', label:'Long‑term', count: counts.long },
            ] as const).map(c => (
              <div key={c.key}>
                <button onClick={()=> setOpen(o=> ({...o, [c.key]: !o[c.key as keyof typeof o]}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                  <div>
                    <div className="text-xs text-slate-500">{c.label}</div>
                    <div className="text-2xl font-semibold">{c.count}</div>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open[c.key as keyof typeof open] ? 'rotate-90' : ''}`}/>
                </button>
                <AnimatePresence initial={false}>
                  {open[c.key as keyof typeof open] && (
                    <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
                      <div className="text-sm text-slate-500 mb-2">{c.label} — {c.count} item(s)</div>
                      <div className="space-y-2">
                        {byHorizon(c.key as TaskT['horizon']).map(t=> (
                          <TaskRow key={t.id} t={t} onOpen={setSelected} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
        <DetailPanel task={selected} onClose={()=>setSelected(null)} onMarkDone={(t)=> setSelected(null)} />
      </div>
    </div>
  )
}
