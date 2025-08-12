import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Droplet, Calendar, Plus, X, Sparkles, Mic, Square, ChevronRight, Save, Trash } from 'lucide-react'

type Plant = {
  id: string
  name: string
  species?: string
  lastWatered: string // YYYY-MM-DD
  frequencyDays: number
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
    { id: 'pl1', name: 'Monstera', species: 'Monstera deliciosa', lastWatered: toISODate(addDays(today, -6)), frequencyDays: 7, notes: 'Bright, indirect light. Fertilize next week.' },
    { id: 'pl2', name: 'Snake Plant', species: 'Sansevieria', lastWatered: toISODate(addDays(today, -10)), frequencyDays: 14, notes: 'Low water; tolerant of shade.' },
    { id: 'pl3', name: 'Basil', species: 'Ocimum basilicum', lastWatered: toISODate(addDays(today, -2)), frequencyDays: 3, notes: 'Kitchen windowsill. Pinch flowers.' },
    { id: 'pl4', name: 'Pothos', species: 'Epipremnum aureum', lastWatered: toISODate(addDays(today, -4)), frequencyDays: 7 },
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
  const [open, setOpen] = useState({ today: false, schedule: false, notes: false })
  const [selected, setSelected] = useState<Plant | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Plant | null>(null)

  const today = useMemo(() => new Date(), [])

  const dueToday = plants.filter(p => isDueToday(p, today)).sort((a,b)=> nextWaterDate(a).getTime() - nextWaterDate(b).getTime())
  const upcoming = plants.filter(p => !isDueToday(p, today) && isUpcoming(p, today, 7)).sort((a,b)=> nextWaterDate(a).getTime() - nextWaterDate(b).getTime())
  const withNotes = plants.filter(p => !!p.notes)

  const counts = { today: dueToday.length, schedule: upcoming.length, notes: withNotes.length }

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
        <Section title={`Plants overview • ${new Date().toLocaleDateString(undefined,{month:'short', day:'numeric'})}`}>
          <div className="divide-y divide-slate-200/80 rounded-xl overflow-hidden">
            <div>
              <button onClick={() => setOpen(o => ({ ...o, today: !o.today }))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div>
                  <div className="text-xs text-slate-500">Today</div>
                  <div className="text-2xl font-semibold">{counts.today}</div>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.today ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open.today && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="px-3 md:px-4 pb-4">
                    <div className="text-sm text-slate-500 mb-2">Due today or overdue — {counts.today} item(s)</div>
                    <div className="space-y-2">
                      {dueToday.map(p => (
                        <PlantRow key={p.id} p={p} onOpen={setSelected} />
                      ))}
                      {dueToday.length === 0 && <div className="text-sm text-slate-500">Nothing due right now.</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <button onClick={() => setOpen(o => ({ ...o, schedule: !o.schedule }))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div>
                  <div className="text-xs text-slate-500">Schedule (next 7d)</div>
                  <div className="text-2xl font-semibold">{counts.schedule}</div>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.schedule ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open.schedule && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="px-3 md:px-4 pb-4">
                    <div className="text-sm text-slate-500 mb-2">Upcoming within a week — {counts.schedule} item(s)</div>
                    <div className="space-y-2">
                      {upcoming.map(p => (
                        <PlantRow key={p.id} p={p} onOpen={setSelected} />
                      ))}
                      {upcoming.length === 0 && <div className="text-sm text-slate-500">No upcoming watering events in the next 7 days.</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <button onClick={() => setOpen(o => ({ ...o, notes: !o.notes }))} className="w-full text-left px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50/60">
                <div>
                  <div className="text-xs text-slate-500">Notes</div>
                  <div className="text-2xl font-semibold">{counts.notes}</div>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${open.notes ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open.notes && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="px-3 md:px-4 pb-4">
                    <div className="text-sm text-slate-500 mb-2">Notes for your plants — {counts.notes} item(s)</div>
                    <div className="space-y-2">
                      {withNotes.map(p => (
                        <div key={p.id} className={`p-3 rounded-xl border ${UI.ring}`}>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-slate-600">{p.notes}</div>
                        </div>
                      ))}
                      {withNotes.length === 0 && <div className="text-sm text-slate-500">No notes yet.</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Section>
        <Section title="All plants" action={<button onClick={()=>{ setEditing(null); setShowForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2`}><Plus className="h-4 w-4"/> Add plant</button>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plants.map(p => (
              <div key={p.id} className={`p-4 rounded-2xl border ${UI.ring} ${UI.card}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-600"/>{p.name}</div>
                    {p.species && <div className="text-sm text-slate-600">{p.species}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setSelected(p)} className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 text-xs`}>Details</button>
                    <button onClick={()=>{ setEditing(p); setShowForm(true) }} className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 text-xs`}>Edit</button>
                    <button onClick={()=> setPlants(arr=> arr.filter(x=> x.id !== p.id))} className="rounded-xl bg-rose-500/90 text-white px-2 py-1 text-xs inline-flex items-center gap-1"><Trash className="h-3 w-3"/> Delete</button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 flex items-center gap-2`}><Droplet className="h-4 w-4"/> Every {p.frequencyDays}d</div>
                  <div className={`${UI.ring} ${UI.chip} rounded-xl px-2 py-1 flex items-center gap-2`}><Calendar className="h-4 w-4"/> Next {toISODate(nextWaterDate(p))}</div>
                </div>
              </div>
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


