'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import RatingForm from './RatingForm'

export default function RatingWindow({ auctionId }) {
  const supabase = createClientComponentClient()
  const [state, setState] = useState('loading')
  const [myRole, setMyRole] = useState(null)
  const [toUser, setToUser] = useState(null)
  const [daysLeft, setDaysLeft] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setState('no_window')

      const { data: win } = await supabase
        .from('rating_windows')
        .select('*, buyer:buyer_id(id, nickname), seller:seller_id(id, nickname)')
        .eq('auction_id', auctionId)
        .single()

      if (!win) return setState('no_window')

      const now = new Date()
      const closes = new Date(win.closes_at)
      if (now > closes) return setState('expired')

      const diff = Math.ceil((closes - now) / (1000 * 60 * 60 * 24))
      setDaysLeft(diff)

      if (win.buyer_id === user.id && !win.buyer_rated) {
        setMyRole('buyer')
        setToUser(win.seller)
      } else if (win.seller_id === user.id && !win.seller_rated) {
        setMyRole('seller')
        setToUser(win.buyer)
      } else {
        return setState('already_rated')
      }

      setState('show_form')
    }

    load()
  }, [auctionId])

  if (state === 'loading') return <p className="text-sm text-gray-400">Cargando...</p>
  if (state === 'no_window') return null
  if (state === 'expired') return (
    <div className="rounded-lg bg-gray-50 border p-4 text-sm text-gray-500">
      ⏰ El plazo para calificar esta transacción ha vencido.
    </div>
  )
  if (state === 'already_rated') return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
      ✅ Ya enviaste tu calificación para esta transacción.
    </div>
  )

  return (
    <div className="space-y-2">
      <p className="text-sm text-amber-600 font-medium">
        ⏳ Tienes <strong>{daysLeft} día{daysLeft !== 1 ? 's' : ''}</strong> para calificar.
      </p>
      <RatingForm
        auctionId={auctionId}
        toUserId={toUser?.id}
        toNickname={toUser?.nickname}
        myRole={myRole}
        onDone={() => setState('already_rated')}
      />
    </div>
  )
}