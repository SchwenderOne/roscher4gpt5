import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Sparkles, Mic, Square, Calendar, Check, Save } from 'lucide-react'

type Person = 'Lucas' | 'Alex'

type Room = {
  id: string
  name: string
  area?: string
  lastCleaned: string // YYYY-MM-DD
  frequencyDays: number
  assignedNext: Person
  notes?: string
  imageUrl?: string
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
    { id: 'r1', name: 'Bathroom', area: 'Main', lastCleaned: toISODate(addDays(today, -7)), frequencyDays: 7, assignedNext: 'Lucas', notes: 'Deep clean tiles monthly.', imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1600&auto=format&fit=crop' },
    { id: 'r2', name: 'Kitchen', area: 'Main', lastCleaned: toISODate(addDays(today, -3)), frequencyDays: 3, assignedNext: 'Alex', imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&auto=format&fit=crop' },
    { id: 'r3', name: 'Living Room', area: 'Common', lastCleaned: toISODate(addDays(today, -5)), frequencyDays: 7, assignedNext: 'Lucas', imageUrl: 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d52?q=80&w=1600&auto=format&fit=crop' },
    { id: 'r4', name: 'Hallway', area: 'Common', lastCleaned: toISODate(addDays(today, -10)), frequencyDays: 14, assignedNext: 'Alex', imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop' },
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
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.25), rgba(15,23,42,0.35)), url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <button onClick={onQuickAdd} className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm ${UI.ring}`} aria-label="Quick add room">
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
  const [selected, setSelected] = useState<Room|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Room | null>(null)

  const today = useMemo(()=> new Date(), [])

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
        <Hero onSubmit={onSubmit} onQuickAdd={()=>{ setEditing(null); setShowForm(true) }} />
        <Section title="Rooms" action={<button onClick={()=>{ setEditing(null); setShowForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add room</button>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms.map(r => (
              <button key={r.id} onClick={()=> setSelected(r)} className={`p-0 text-left rounded-2xl border ${UI.ring} ${UI.card} overflow-hidden hover:shadow-sm transition`} aria-label={`Open ${r.name}`}>
                <img src={r.imageUrl || getRoomImage(r)} alt="" className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="font-semibold">{r.name}</div>
                  {r.area && <div className="text-sm text-slate-600 mt-0.5">{r.area}</div>}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1`}>Every {r.frequencyDays}d</div>
                    <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1`}><Calendar className="h-4 w-4 inline mr-1"/> Next {toISODate(nextCleanDate(r))}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">Assigned: {r.assignedNext}</div>
                </div>
              </button>
            ))}
          </div>
        </Section>
        <RoomDetail room={selected} onClose={()=>setSelected(null)} onMarkCleaned={onMarkCleaned} />
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/20">
              <RoomForm initial={editing ?? undefined} onCancel={()=>{ setShowForm(false); setEditing(null) }} onSave={(row)=>{
                setRooms(arr=> { const i=arr.findIndex(x=> x.id===row.id); if(i>=0){ const copy=[...arr]; copy[i]=row; return copy } return [row, ...arr] })
                setShowForm(false); setEditing(null)
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function RoomForm({ initial, onCancel, onSave }:{ initial?: Partial<Room>; onCancel:()=>void; onSave:(r:Room)=>void }){
  const [form, setForm] = useState<Partial<Room>>({
    id: initial?.id || Math.random().toString(36).slice(2),
    name: initial?.name || '',
    area: initial?.area || '',
    lastCleaned: initial?.lastCleaned || toISODate(new Date()),
    frequencyDays: initial?.frequencyDays ?? 7,
    assignedNext: (initial?.assignedNext as any) || 'Lucas',
    notes: initial?.notes || '',
  })
  const update = (k:keyof Room, v:any)=> setForm(f=> ({...f, [k]: v}))
  return (
    <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
      <div className="flex items-start justify-between"><h2 className="text-xl font-semibold leading-tight pr-6">{initial?.id ? 'Edit room' : 'Add room'}</h2><button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button></div>
      <div className="mt-4 space-y-3 text-sm">
        <label className="block">Name<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.name as string} onChange={e=>update('name', e.target.value)} /></label>
        <label className="block">Area<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.area as string} onChange={e=>update('area', e.target.value)} /></label>
        <label className="block">Last cleaned<input type="date" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.lastCleaned as string} onChange={e=>update('lastCleaned', e.target.value)} /></label>
        <label className="block">Frequency (days)<input type="number" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.frequencyDays as number} onChange={e=>update('frequencyDays', parseInt(e.target.value||'0',10))} /></label>
        <label className="block">Assigned<select className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.assignedNext as any} onChange={e=>update('assignedNext', e.target.value)}><option>Lucas</option><option>Alex</option></select></label>
        <label className="block">Notes<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.notes as string} onChange={e=>update('notes', e.target.value)} /></label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Cancel</button>
        <button onClick={()=> onSave(form as Room)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Save className="h-4 w-4"/> Save</button>
      </div>
    </motion.aside>
  )
}

const roomImages: Record<string, string> = {
  Bathroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1600&auto=format&fit=crop',
  Kitchen: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&auto=format&fit=crop',
  'Living Room': 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d52?q=80&w=1600&auto=format&fit=crop',
  Hallway: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop',
}
function getRoomImage(r: Room): string {
  return roomImages[r.name] || 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop'
}


