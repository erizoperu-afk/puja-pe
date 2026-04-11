'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function AdminCalificacionesPage() {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [newValue, setNewValue] = useState(null)

  useEffect(() => {
    loadRatings()
  }, [])

  async function loadRatings() {
    setLoading(true)
    const { data } = await supabase
      .from('ratings')
      .select(`
        *,
        from_user:from_user_id(nickname),
        to_user:to_user_id(nickname),
        auction:auction_id(titulo)
      `)
      .order('created_at', { ascending: false })

    setRatings(data ?? [])
    setLoading(false)
  }

  async function handleOverride(ratingId) {
    if (!adminNote.trim()) return alert('Debes ingresar una nota de mediación.')
    if (newValue === null) return alert('Selecciona el nuevo valor.')

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('ratings')
      .update({
        value: newValue,
        overridden_by_admin: true,
        admin_note: adminNote.trim(),
        admin_id: user.id,
        overridden_at: new Date().toISOString(),
      })
      .eq('id', ratingId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setEditing(null)
      setAdminNote('')
      setNewValue(null)
      loadRatings()
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Cargando...</p>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚖️ Mediación de Calificaciones</h1>

      {ratings.length === 0 && (
        <p className="text-gray-500">No hay calificaciones aún.</p>
      )}

      <div className="space-y-4">
        {ratings.map(r => (
          <div key={r.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-800">
                  {r.value === 1 ? '👍 Positiva' : '👎 Negativa'} — {r.from_user?.nickname} → {r.to_user?.nickname}
                </p>
                <p className="text-sm text-gray-500">Remate: {r.auction?.titulo}</p>
                <p className="text-sm text-gray-700 mt-1">"{r.comment}"</p>
                {r.overridden_by_admin && (
                  <p className="text-xs text-orange-600 mt-1">⚖️ Ya modificada: {r.admin_note}</p>
                )}
              </div>
              <button
                onClick={() => { setEditing(r.id); setNewValue(r.value); setAdminNote('') }}
                className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-lg"
              >
                Mediar
              </button>
            </div>

            {editing === r.id && (
              <div className="mt-4 border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Cambiar calificación:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewValue(1)}
                    className={`px-4 py-2 rounded-lg border-2 font-bold ${newValue === 1 ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}
                  >
                    👍 Positiva (+1)
                  </button>
                  <button
                    onClick={() => setNewValue(-1)}
                    className={`px-4 py-2 rounded-lg border-2 font-bold ${newValue === -1 ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400'}`}
                  >
                    👎 Negativa (-1)
                  </button>
                </div>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Nota de mediación (obligatoria)..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOverride(r.id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Confirmar mediación
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}