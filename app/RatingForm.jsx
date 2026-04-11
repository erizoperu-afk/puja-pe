'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function RatingForm({ auctionId, toUserId, toNickname, myRole, onDone }) {
  const supabase = createClientComponentClient()
  const [value, setValue] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (value === null) return setError('Selecciona si la experiencia fue positiva o negativa.')
    if (!comment.trim()) return setError('El comentario es obligatorio.')

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('ratings').insert({
      auction_id: auctionId,
      from_user_id: user.id,
      to_user_id: toUserId,
      role: myRole,
      value,
      comment: comment.trim(),
    })

    if (insertError) {
      setError('Error al guardar la calificación. ' + insertError.message)
    } else {
      const field = myRole === 'buyer' ? 'buyer_rated' : 'seller_rated'
      await supabase
        .from('rating_windows')
        .update({ [field]: true })
        .eq('auction_id', auctionId)

      setSuccess(true)
      onDone?.()
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm">
        ✅ ¡Calificación enviada correctamente!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-800">
        Califica a <span className="text-blue-600">{toNickname}</span>
      </h3>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setValue(1)}
          className={`flex-1 py-2 rounded-lg border-2 font-bold text-lg transition-all ${
            value === 1
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-400 hover:border-green-300'
          }`}
        >
          👍 Positiva (+1)
        </button>
        <button
          type="button"
          onClick={() => setValue(-1)}
          className={`flex-1 py-2 rounded-lg border-2 font-bold text-lg transition-all ${
            value === -1
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 text-gray-400 hover:border-red-300'
          }`}
        >
          👎 Negativa (-1)
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comentario <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Describe cómo fue la experiencia..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar calificación'}
      </button>
    </form>
  )
}