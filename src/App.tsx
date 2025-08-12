import React, { useState } from 'react'
import Dashboard from './components/DashboardHeroDailyLucas'
import Finance from './components/FinanceHeroProgressiveLucas'
import Plants from './components/PlantsHeroProgressiveLucas'
import Cleaning from './components/CleaningHeroProgressiveLucas'

const TabButton: React.FC<{active:boolean; onClick:()=>void; children:React.ReactNode}> = ({active,onClick,children}) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-xl border ${active ? 'bg-white shadow-sm' : 'bg-slate-100'} ring-1 ring-slate-200 text-sm`}
  >{children}</button>
)

export default function App() {
  const [tab, setTab] = useState<'dashboard'|'finance'|'plants'|'cleaning'>('dashboard')
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-slate-700 font-semibold">Roommate App UI</h1>
        <div className="flex gap-2">
          <TabButton active={tab==='dashboard'} onClick={()=>setTab('dashboard')}>Dashboard</TabButton>
          <TabButton active={tab==='finance'} onClick={()=>setTab('finance')}>Finance</TabButton>
          <TabButton active={tab==='plants'} onClick={()=>setTab('plants')}>Plants</TabButton>
          <TabButton active={tab==='cleaning'} onClick={()=>setTab('cleaning')}>Cleaning</TabButton>
        </div>
      </div>
      {tab==='dashboard' ? <Dashboard/> : tab==='finance' ? <Finance/> : tab==='plants' ? <Plants/> : <Cleaning/>}
    </div>
  )
}
