import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Sparkles, Mic, Square, ChevronRight, Calendar, Check } from 'lucide-react'

type Person = 'Lucas' | 'Alex'

type Room = {
  id: string
  name: string
  area?: string
  lastCleaned: string // YYYY-MM-DD
  frequencyDays: number
  assignedNext: Person
  notes?: string
}

const UI = {
  page: 'min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8',
  ring: 'ring-1 ring-slate-200',
  card: 'bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60',
  chip: 'bg-slate-100',
}

function toISODate(d: Date): string { return d.toISOString().slice(0, 10) }
function addDays(d: Date, days: number): Date { const nd = new Date(d); nd.setDate(nd.getDate() + days); return nd }
function parseISO(s: string): Date { return new Date(s + 'T00:00:00') }
function clampToMidnight(d: Date): Date { return parseISO(toISODate(d)) }
function daysBetween(a: Date, b: Date): number { const ms = clampToMidnight(a).getTime() - clampToMidnight(b).getTime(); return Math.round(ms / (1000*60*60*24)) }

function nextCleanDate(r: Room): Date { return addDays(parseISO(r.lastCleaned), r.frequencyDays) }
function isDueToday(r: Room, today: Date): boolean {
  const ncd = nextCleanDate(r)
  const t = clampToMidnight(today)
  return toISODate(ncd) === toISODate(t) || ncd < t
}
function isUpcoming(r: Room, today: Date, windowDays: number): boolean {
  const ncd = nextCleanDate(r)
  const start = clampToMidnight(today)
  const end = addDays(start, windowDays)
  return ncd > start && ncd <= end
}

function rotate(person: Person): Person { return person === 'Lucas' ? 'Alex' : 'Lucas' }

function sampleRooms(): Room[] {
  const today = new Date()
  return [
    { id: 'r1', name: 'Bathroom', area: 'Main', lastCleaned: toISODate(addDays(today, -7)), frequencyDays: 7, assignedNext: 'Lucas', notes: 'Deep clean tiles monthly.' },
    { id: 'r2', name: 'Kitchen', area: 'Main', lastCleaned: toISODate(addDays(today, -3)), frequencyDays: 3, assignedNext: 'Alex' },
    { id: 'r3', name: 'Living Room', area: 'Common', lastCleaned: toISODate(addDays(today, -5)), frequencyDays: 7, assignedNext: 'Lucas' },
    { id: 'r4', name: 'Hallway', area: 'Common', lastCleaned: toISODate(addDays(today, -10)), frequencyDays: 14, assignedNext: 'Alex' },
  ]
}

function Section({ title, action, children }:{ title: string; action?: React.ReactNode; children: React.ReactNode }){
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

function Hero({ onSubmit, onQuickAdd }:{ onSubmit: (q: string) => void; onQuickAdd: () => void }){
  const [q, setQ] = useState('')
  const [recording, setRecording] = useState(false)
  const bg = 'https://images.unsplash.com/photo-1507652955-f3dcef5a3be5?q=80&w=2000&auto=format&fit=crop'
  return (
    <div className="relative overflow-hidden rounded-3xl" style={{ height: 240 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.25), rgba(15,23,42,0.35)), url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <button onClick={onQuickAdd} className={`absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm ${UI.ring}`} aria-label="Quick add room">
        <Plus className="h-5 w-5" />
      </button>
      <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
        <div className="text-slate-100/90 text-2xl md:text-4xl font-semibold drop-shadow-sm">Cleaning, Lucas</div>
        <div className="mt-4">
          <div className={`mx-auto max-w-2xl ${UI.card} ${UI.ring} rounded-full px-3 py-2 md:px-4 md:py-2 flex items-center gap-2`}>
            <Sparkles className="h-5 w-5 text-slate-500" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Try: clean Bathroom every 7 days" className="flex-1 bg-transparent outline-none placeholder:text-slate-200/70 text-slate-50" />
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

function Dot(){ return <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400" /> }

function RoomRow({ r, onOpen }:{ r: Room; onOpen: (r: Room) => void }){
  const diff = daysBetween(nextCleanDate(r), new Date()) * -1
  const label = diff < 0 ? `${-diff}d overdue` : diff === 0 ? 'due today' : `in ${diff}d`
  return (
    <button onClick={()=>onOpen(r)} className={`w-full text-left grid grid-cols-[auto,1fr,auto] gap-3 items-center p-3 rounded-xl border ${UI.ring} hover:bg-white`}>
      <Dot />
      <div className="truncate">
        <div className="font-medium truncate">{r.name} {r.area && <span className="text-slate-500">— {r.area}</span>}</div>
        <div className="text-xs text-slate-500">Every {r.frequencyDays}d • Last {r.lastCleaned} • Next {toISODate(nextCleanDate(r))}</div>
      </div>
      <div className="text-xs text-slate-700 inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/> {label}</div>
    </button>
  )
}

function RoomDetail({ room, onClose, onMarkCleaned }:{ room: Room | null; onClose:()=>void; onMarkCleaned: (r: Room) => void }){
  if(!room) return null
  return (
    <AnimatePresence>
      {room && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-20 bg-black/20">
          <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold leading-tight pr-6">{room.name}</h2>
              <button onClick={onClose} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button>
            </div>
            {room.area && <div className="mt-1 text-sm text-slate-600">{room.area}</div>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Last cleaned <span className="float-right font-medium">{room.lastCleaned}</span></div>
              <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Next <span className="float-right font-medium">{toISODate(nextCleanDate(room))}</span></div>
              <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Every <span className="float-right font-medium">{room.frequencyDays} days</span></div>
              <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Assigned <span className="float-right font-medium">{room.assignedNext}</span></div>
            </div>
            {room.notes && <div className="mt-4 text-sm text-slate-700">{room.notes}</div>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={()=>onMarkCleaned(room)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Check className="h-4 w-4"/> Mark cleaned</button>
              <button className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Edit schedule</button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Cleaning(){
  const initial = useMemo(sampleRooms, [])
  const [rooms, setRooms] = useState<Room[]>(initial)
  const [open, setOpen] = useState({ today:false, rotation:false, backlog:false })
  const [selected, setSelected] = useState<Room|null>(null)

  const today = useMemo(()=> new Date(), [])

  const dueToday = rooms.filter(r=> isDueToday(r, today))
  const upcoming = rooms.filter(r=> isUpcoming(r, today, 7))
  const backlog = rooms.filter(r=> nextCleanDate(r) < addDays(today, -1))

  const counts = { today: dueToday.length, rotation: rooms.length, backlog: backlog.length }

  const onMarkCleaned = (r: Room) => {
    setRooms(arr => arr.map(x => x.id === r.id ? { ...x, lastCleaned: toISODate(new Date()), assignedNext: rotate(x.assignedNext) } : x))
    setSelected(null)
  }

  const onQuickAdd = () => {
    const id = Math.random().toString(36).slice(2)
    setRooms(arr => [{ id, name: 'New Room', area: 'Common', lastCleaned: toISODate(new Date()), frequencyDays: 7, assignedNext: 'Lucas', notes: 'Quick add' }, ...arr])
  }

  const onSubmit = (q: string) => {
    // Parse: "clean ROOM every N days" -> add room
    const m = q.match(/clean\s+(.+?)\s+every\s+(\d+)\s+days/i)
    if (m) {
      const name = m[1]
      const freq = parseInt(m[2] || '7', 10)
      const id = Math.random().toString(36).slice(2)
      setRooms(arr => [{ id, name, lastCleaned: toISODate(new Date()), frequencyDays: freq, assignedNext: 'Lucas' }, ...arr])
      return
    }
    onQuickAdd()
  }

  return (
    <div className={UI.page}>
      <div className="max-w-6xl mx-auto space-y-4">
        <Hero onSubmit={onSubmit} onQuickAdd={onQuickAdd} />
        <Section title={`Cleaning overview • ${new Date().toLocaleDateString(undefined,{month:'short', day:'numeric'})}`}>
          <div className="divide-y divide-slate-200/80 rounded-xl overflow-hidden">
            <div>
              <button onClick={()=> setOpen(o=> ({...o, today: !o.today}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div><div className="text-xs text-slate-500">Today</div><div className="text-2xl font-semibold">{counts.today}</div></div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.today ? 'rotate-90' : ''}`}/>
              </button>
              <AnimatePresence initial={false}>{open.today && (
                <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
                  <div className="text-sm text-slate-500 mb-2">Due today or overdue — {counts.today} item(s)</div>
                  <div className="space-y-2">{dueToday.map(r => (<RoomRow key={r.id} r={r} onOpen={setSelected}/>))}
                    {dueToday.length===0 && <div className="text-sm text-slate-500">Nothing due right now.</div>}
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </div>
            <div>
              <button onClick={()=> setOpen(o=> ({...o, rotation: !o.rotation}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div><div className="text-xs text-slate-500">Rotation</div><div className="text-2xl font-semibold">{counts.rotation}</div></div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.rotation ? 'rotate-90' : ''}`}/>
              </button>
              <AnimatePresence initial={false}>{open.rotation && (
                <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
                  <div className="text-sm text-slate-500 mb-2">Next assigned per room</div>
                  <div className="space-y-2">{rooms.map(r => (
                    <div key={r.id} className={`p-3 rounded-xl border ${UI.ring}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm text-slate-700">{r.assignedNext}</div>
                      </div>
                      <div className="text-xs text-slate-500">Every {r.frequencyDays}d • Last {r.lastCleaned}</div>
                    </div>
                  ))}</div>
                </motion.div>
              )}</AnimatePresence>
            </div>
            <div>
              <button onClick={()=> setOpen(o=> ({...o, backlog: !o.backlog}))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div><div className="text-xs text-slate-500">Backlog</div><div className="text-2xl font-semibold">{counts.backlog}</div></div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.backlog ? 'rotate-90' : ''}`}/>
              </button>
              <AnimatePresence initial={false}>{open.backlog && (
                <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="px-3 md:px-4 pb-4">
                  <div className="text-sm text-slate-500 mb-2">Overdue by more than a day</div>
                  <div className="space-y-2">{backlog.map(r => (<RoomRow key={r.id} r={r} onOpen={setSelected}/>))}
                    {backlog.length===0 && <div className="text-sm text-slate-500">No backlog 🎉</div>}
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </div>
          </div>
        </Section>
        <Section title="All rooms">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rooms.map(r => (
              <div key={r.id} className={`p-4 rounded-2xl border ${UI.ring} ${UI.card}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    {r.area && <div className="text-sm text-slate-600">{r.area}</div>}
                  </div>
                  <button onClick={()=>setSelected(r)} className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 text-xs`}>Details</button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1`}>Every {r.frequencyDays}d</div>
                  <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1`}>Next {toISODate(nextCleanDate(r))}</div>
                </div>
                <div className="mt-2 text-xs text-slate-600">Assigned: {r.assignedNext}</div>
              </div>
            ))}
          </div>
        </Section>
        <RoomDetail room={selected} onClose={()=>setSelected(null)} onMarkCleaned={onMarkCleaned} />
      </div>
    </div>
  )
}


