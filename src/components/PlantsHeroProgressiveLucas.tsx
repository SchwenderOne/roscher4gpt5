import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Droplet, Calendar, Plus, X, Sparkles, Mic, Square, Save } from 'lucide-react'

type Plant = {
  id: string
  name: string
  species?: string
  lastWatered: string // YYYY-MM-DD
  frequencyDays: number
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
function daysBetween(a: Date, b: Date): number { const ms = parseISO(toISODate(a)).getTime() - parseISO(toISODate(b)).getTime(); return Math.round(ms / (1000*60*60*24)) }

function nextWaterDate(p: Plant): Date { return addDays(parseISO(p.lastWatered), p.frequencyDays) }
function isDueToday(p: Plant, today: Date): boolean { return toISODate(nextWaterDate(p)) === toISODate(today) || nextWaterDate(p) < parseISO(toISODate(today)) }
function isUpcoming(p: Plant, today: Date, windowDays: number): boolean {
  const nwd = nextWaterDate(p)
  const start = parseISO(toISODate(today))
  const end = addDays(start, windowDays)
  return nwd > start && nwd <= end
}

function samplePlants(): Plant[] {
  const today = new Date()
  return [
    { id: 'pl1', name: 'Monstera', species: 'Monstera deliciosa', lastWatered: toISODate(addDays(today, -6)), frequencyDays: 7, notes: 'Bright, indirect light. Fertilize next week.', imageUrl: 'https://images.unsplash.com/photo-1589227365533-cee630bd59d7?q=80&w=1200&auto=format&fit=crop' },
    { id: 'pl2', name: 'Snake Plant', species: 'Sansevieria', lastWatered: toISODate(addDays(today, -10)), frequencyDays: 14, notes: 'Low water; tolerant of shade.', imageUrl: 'https://images.unsplash.com/photo-1621447504866-5981c3dd2cd6?q=80&w=1200&auto=format&fit=crop' },
    { id: 'pl3', name: 'Basil', species: 'Ocimum basilicum', lastWatered: toISODate(addDays(today, -2)), frequencyDays: 3, notes: 'Kitchen windowsill. Pinch flowers.', imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop' },
    { id: 'pl4', name: 'Pothos', species: 'Epipremnum aureum', lastWatered: toISODate(addDays(today, -4)), frequencyDays: 7, imageUrl: 'https://images.unsplash.com/photo-1575635694007-874f5b1178e3?q=80&w=1200&auto=format&fit=crop' },
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

function Hero({ name, onSubmit, onQuickAdd }:{ name: string; onSubmit: (q: string) => void; onQuickAdd: () => void }){
  const [q, setQ] = useState('')
  const [recording, setRecording] = useState(false)
  const bg = 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=2000&auto=format&fit=crop'
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
      <button
        onClick={onQuickAdd}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm ${UI.ring}`}
        aria-label="Quick add plant"
      >
        <Plus className="h-5 w-5" />
      </button>
      <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
        <div className="text-slate-100/90 text-2xl md:text-4xl font-semibold drop-shadow-sm">Plants, Lucas</div>
        <div className="mt-4">
          <div className={`mx-auto max-w-2xl ${UI.card} ${UI.ring} rounded-full px-3 py-2 md:px-4 md:py-2 flex items-center gap-2`}>
            <Sparkles className="h-5 w-5 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try: add plant Aloe every 10 days"
              className="flex-1 bg-transparent outline-none placeholder:text-slate-200/70 text-slate-50"
            />
            {!recording ? (
              <button
                onClick={() => setRecording(true)}
                className="p-2 rounded-full bg-slate-900/30 hover:bg-slate-900/40 transition"
                aria-label="Start voice"
              >
                <Mic className="h-5 w-5 text-slate-100" />
              </button>
            ) : (
              <button
                onClick={() => setRecording(false)}
                className="p-2 rounded-full bg-rose-500/70 hover:bg-rose-500/80 transition"
                aria-label="Stop voice"
              >
                <Square className="h-5 w-5 text-white" />
              </button>
            )}
            <button
              onClick={() => { if (!q) return; onSubmit(q); setQ('') }}
              className="ml-1 px-3 py-1.5 rounded-full bg-white text-slate-800 text-sm font-medium"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlantRow({ p, onOpen }:{ p: Plant; onOpen: (p: Plant) => void }){
  const dueIn = daysBetween(nextWaterDate(p), new Date()) * -1
  const dueLabel = dueIn < 0 ? `${-dueIn}d overdue` : dueIn === 0 ? 'due today' : `in ${dueIn}d`
  return (
    <button onClick={() => onOpen(p)} className={`w-full text-left grid grid-cols-[auto,1fr,auto] gap-3 items-center p-3 rounded-xl border ${UI.ring} hover:bg-white`}>
      <Leaf className="h-4 w-4 text-emerald-600" />
      <div className="truncate">
        <div className="font-medium truncate">{p.name} {p.species && <span className="text-slate-500">— {p.species}</span>}</div>
        <div className="text-xs text-slate-500">Every {p.frequencyDays}d • Last {p.lastWatered}</div>
      </div>
      <div className="text-xs text-slate-700 inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/> {dueLabel}</div>
    </button>
  )
}

function PlantDetail({ plant, onClose, onMarkWatered }:{ plant: Plant | null; onClose: () => void; onMarkWatered: (p: Plant) => void }){
  if (!plant) return null
  const nwd = nextWaterDate(plant)
  return (
    <AnimatePresence>
      {plant && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-20 bg-black/20">
          <motion.aside
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold leading-tight pr-6">{plant.name}</h2>
              <button onClick={onClose} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {plant.species && <div className="mt-1 text-sm text-slate-600">{plant.species}</div>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Last watered <span className="float-right font-medium">{plant.lastWatered}</span></div>
              <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Next <span className="float-right font-medium">{toISODate(nwd)}</span></div>
              <div className={`${UI.ring} ${UI.chip} rounded-xl p-3 text-sm`}>Every <span className="float-right font-medium">{plant.frequencyDays} days</span></div>
            </div>
            {plant.notes && <div className="mt-4 text-sm text-slate-700">{plant.notes}</div>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => onMarkWatered(plant)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Droplet className="h-4 w-4"/> Mark watered</button>
              <button className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Edit schedule</button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Plants(){
  const initial = useMemo(samplePlants, [])
  const [plants, setPlants] = useState<Plant[]>(initial)
  const [selected, setSelected] = useState<Plant | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Plant | null>(null)

  const today = useMemo(() => new Date(), [])

  const onMarkWatered = (p: Plant) => {
    setPlants(arr => arr.map(x => x.id === p.id ? { ...x, lastWatered: toISODate(new Date()) } : x))
    setSelected(null)
  }

  const onQuickAdd = () => {
    const id = Math.random().toString(36).slice(2)
    setPlants(arr => [{ id, name: 'New plant', species: 'Aloe', lastWatered: toISODate(new Date()), frequencyDays: 10, notes: 'Quick add' }, ...arr])
  }

  const onSubmit = (q: string) => {
    // Very light parser: "add plant NAME every N days"
    const m = q.match(/add\s+plant\s+(.+?)\s+every\s+(\d+)\s+days/i)
    if (m) {
      const name = m[1]
      const freq = parseInt(m[2] || '7', 10)
      const id = Math.random().toString(36).slice(2)
      setPlants(arr => [{ id, name, lastWatered: toISODate(new Date()), frequencyDays: freq }, ...arr])
      return
    }
    // Fallback quick add
    onQuickAdd()
  }

  return (
    <div className={UI.page}>
      <div className="max-w-6xl mx-auto space-y-4">
        <Hero name="Lucas" onSubmit={onSubmit} onQuickAdd={()=>{ setEditing(null); setShowForm(true) }} />
        <Section title="Plants" action={<button onClick={()=>{ setEditing(null); setShowForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add plant</button>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plants.map(p => (
              <button key={p.id} onClick={()=> setSelected(p)} className={`p-0 text-left rounded-2xl border ${UI.ring} ${UI.card} overflow-hidden hover:shadow-sm transition`} aria-label={`Open ${p.name}`}>
                <img src={p.imageUrl || getPlantImage(p)} alt="" className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="font-semibold flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-600"/>{p.name}</div>
                  {p.species && <div className="text-sm text-slate-600 mt-0.5">{p.species}</div>}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 flex items-center gap-2`}><Droplet className="h-4 w-4"/> Every {p.frequencyDays}d</div>
                    <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 flex items-center gap-2`}><Calendar className="h-4 w-4"/> Next {toISODate(nextWaterDate(p))}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Section>
        <PlantDetail plant={selected} onClose={() => setSelected(null)} onMarkWatered={onMarkWatered} />
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/20">
              <PlantForm initial={editing ?? undefined} onCancel={()=>{ setShowForm(false); setEditing(null) }} onSave={(row)=>{
                setPlants(arr=> { const i=arr.findIndex(x=> x.id===row.id); if(i>=0){ const copy=[...arr]; copy[i]=row; return copy } return [row, ...arr] })
                setShowForm(false); setEditing(null)
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PlantForm({ initial, onCancel, onSave }:{ initial?: Partial<Plant>; onCancel:()=>void; onSave:(p:Plant)=>void }){
  const [form, setForm] = useState<Partial<Plant>>({
    id: initial?.id || Math.random().toString(36).slice(2),
    name: initial?.name || '',
    species: initial?.species || '',
    lastWatered: initial?.lastWatered || toISODate(new Date()),
    frequencyDays: initial?.frequencyDays ?? 7,
    notes: initial?.notes || '',
  })
  const update = (k:keyof Plant, v:any)=> setForm(f=> ({...f, [k]: v}))
  return (
    <motion.aside initial={{x:480}} animate={{x:0}} exit={{x:480}} transition={{type:'spring', stiffness:260, damping:26}} className={`absolute right-0 top-0 h-full w-full max-w-md ${UI.card} ${UI.ring} rounded-l-2xl p-5 overflow-y-auto`}>
      <div className="flex items-start justify-between"><h2 className="text-xl font-semibold leading-tight pr-6">{initial?.id ? 'Edit plant' : 'Add plant'}</h2><button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl p-2`} aria-label="Close"><X className="h-5 w-5"/></button></div>
      <div className="mt-4 space-y-3 text-sm">
        <label className="block">Name<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.name as string} onChange={e=>update('name', e.target.value)} /></label>
        <label className="block">Species<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.species as string} onChange={e=>update('species', e.target.value)} /></label>
        <label className="block">Last watered<input type="date" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.lastWatered as string} onChange={e=>update('lastWatered', e.target.value)} /></label>
        <label className="block">Frequency (days)<input type="number" className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.frequencyDays as number} onChange={e=>update('frequencyDays', parseInt(e.target.value||'0',10))} /></label>
        <label className="block">Notes<input className={`${UI.ring} ${UI.chip} mt-1 w-full rounded-xl px-3 py-2`} value={form.notes as string} onChange={e=>update('notes', e.target.value)} /></label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onCancel} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm`}>Cancel</button>
        <button onClick={()=> onSave(form as Plant)} className="rounded-xl bg-emerald-500/90 text-white px-3 py-2 text-sm inline-flex items-center gap-2"><Save className="h-4 w-4"/> Save</button>
      </div>
    </motion.aside>
  )
}

const plantImages: Record<string, string> = {
  Monstera: 'https://images.unsplash.com/photo-1589227365533-cee630bd59d7?q=80&w=1200&auto=format&fit=crop',
  'Snake Plant': 'https://images.unsplash.com/photo-1621447504866-5981c3dd2cd6?q=80&w=1200&auto=format&fit=crop',
  Basil: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop',
  Pothos: 'https://images.unsplash.com/photo-1575635694007-874f5b1178e3?q=80&w=1200&auto=format&fit=crop',
}
function getPlantImage(p: Plant): string {
  return plantImages[p.name] || 'https://images.unsplash.com/photo-1524594227089-14612805ab76?q=80&w=1200&auto=format&fit=crop'
}


