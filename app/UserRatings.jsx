'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function UserRatings({ userId }) {
  const supabase = createClientComponentClient()
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('ratings')
        .select('*, from_user:from_user_id(nickname), auction:auction_id(titulo)')
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false })

      setRatings(data ?? [])
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) return <p className="text-sm text-gray-400">Cargando calificaciones...</p>
  if (!ratings.length) return <p className="text-sm text-gray-500">Este usuario aún no tiene calificaciones.</p>

  return (
    <div className="space-y-3">
      {ratings.map(r => (
        <div key={r.id} className={`rounded-lg border p-3 ${r.value === 1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">
              {r.value === 1 ? '👍' : '👎'} {r.from_user?.nickname}
              <span className="text-gray-400 font-normal ml-1">
                ({r.role === 'buyer' ? 'comprador' : 'vendedor'})
              </span>
            </span>
            <span className="text-xs text-gray-400">
              {new Date(r.created_at).toLocaleDateString('es-PE')}
            </span>
          </div>
          <p className="text-sm text-gray-700">{r.comment}</p>
          {r.auction?.titulo && (
            <p className="text-xs text-gray-400 mt-1">Remate: {r.auction.titulo}</p>
          )}
          {r.overridden_by_admin && (
            <p className="text-xs text-orange-600 mt-1">⚖️ Modificada por el administrador: {r.admin_note}</p>
          )}
        </div>
      ))}
    </div>
  )
}