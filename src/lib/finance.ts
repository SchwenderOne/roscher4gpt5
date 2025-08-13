import { supabase } from './supabase'

export type TxStatus = 'paid' | 'due' | 'scheduled'
export type FinanceTx = {
  id: string
  date: string // YYYY-MM-DD
  category: string
  amount: number
  payer: string // auth user id
  split_lucas: number
  split_alex: number
  note?: string | null
  status: TxStatus
  is_settlement?: boolean
}

export async function getSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

export async function listProfiles(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('app_profile').select('id, display_name')
  if (error) throw error
  const map: Record<string, string> = {}
  ;(data || []).forEach((p: any) => { map[p.id] = p.display_name })
  return map
}

export async function listTransactions(): Promise<FinanceTx[]> {
  const { data, error } = await supabase
    .from('finance_transaction')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data || []).map((r: any) => ({
    id: r.id,
    date: r.date,
    category: r.category,
    amount: Number(r.amount),
    payer: r.payer,
    split_lucas: Number(r.split_lucas ?? 0.5),
    split_alex: Number(r.split_alex ?? 0.5),
    note: r.note,
    status: r.status,
    is_settlement: !!r.is_settlement,
  }))
}

export async function upsertTransaction(row: FinanceTx): Promise<void> {
  const exists = await supabase.from('finance_transaction').select('id').eq('id', row.id).single()
  if (exists.data) {
    const { error } = await supabase
      .from('finance_transaction')
      .update({
        date: row.date,
        category: row.category,
        amount: row.amount,
        payer: row.payer,
        split_lucas: row.split_lucas,
        split_alex: row.split_alex,
        note: row.note ?? null,
        status: row.status,
        is_settlement: !!row.is_settlement,
      })
      .eq('id', row.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('finance_transaction').insert({
      id: row.id,
      date: row.date,
      category: row.category,
      amount: row.amount,
      payer: row.payer,
      split_lucas: row.split_lucas,
      split_alex: row.split_alex,
      note: row.note ?? null,
      status: row.status,
      is_settlement: !!row.is_settlement,
    })
    if (error) throw error
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('finance_transaction').delete().eq('id', id)
  if (error) throw error
}


