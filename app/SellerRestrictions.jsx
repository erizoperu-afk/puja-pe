'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SellerRestrictions({ auctionId }) {
  const supabase = createClientComponentClient()
  const [minReputation, setMinReputation] = useState('')
  const [blockedUsers, setBlockedUsers] = useState([])
  const [searchNickname, setSearchNickname] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (auctionId) loadRestrictions()
  }, [auctionId])

  async function loadRestrictions() {
    const { data } = await supabase
      .from('seller_restrictions')
      .select('*, blocked_user:blocked_user_id(id, nickname)')
      .eq('auction_id', auctionId)

    if (data?.length) {
      const minRep = data.find(r => r.min_reputation !== null)
      if (minRep) setMinReputation(minRep.min_reputation)
      setBlockedUsers(data.filter(r => r.blocked_user_id).map(r => r.blocked_user))
    }
  }

  async function searchUsers(query) {
    if (!query.trim()) return setSearchResults([])
    const { data } = await supabase
      .from('usuarios')
      .select('id, nickname, reputation_score')
      .ilike('nickname', `%${query}%`)
      .limit(5)
    setSearchResults(data ?? [])
  }

  async function blockUser(user) {
    if (blockedUsers.find(u => u.id === user.id)) return
    setBlockedUsers(prev => [...prev, user])
    setSearchNickname('')
    setSearchResults([])
  }

  async function unblockUser(userId) {
    setBlockedUsers(prev => prev.filter(u => u.id !== userId))
  }

  async function saveRestrictions() {
    setSaving(true)
    setMessage('')

    await supabase.from('seller_restrictions').delete().eq('auction_id', auctionId)

    const { data: { user } } = await supabase.auth.getUser()
    const inserts = []

    if (minReputation !== '') {
      inserts.push({
        auction_id: auctionId,
        seller_id: user.id,
        min_reputation: parseInt(minReputation),
      })
    }

    for (const blocked of blockedUsers) {
      inserts.push({
        auction_id: auctionId,
        seller_id: user.id,
        blocked_user_id: blocked.id,
      })
    }

    if (inserts.length > 0) {
      const { error } = await supabase.from('seller_restrictions').insert(inserts)
      if (error) {
        setMessage('Error al guardar: ' + error.message)
      } else {
        setMessage('✅ Restricciones guardadas.')
      }
    } else {
      setMessage('✅ Sin restricciones (todos pueden pujar).')
    }

    setSaving(false)
  }

  return (
    <div className="border rounded-lg p-4 bg-white space-y-5">
      <h3 className="font-semibold text-gray-800">🔒 Restricciones de puja</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reputación mínima para pujar
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minReputation}
            onChange={e => setMinReputation(e.target.value)}
            placeholder="Ej: 5 (dejar vacío para sin mínimo)"
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {minReputation !== '' && (
            <button onClick={() => setMinReputation('')} className="text-gray-400 hover:text-red-500 text-xl">×</button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bloquear usuarios específicos
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchNickname}
            onChange={e => { setSearchNickname(e.target.value); searchUsers(e.target.value) }}
            placeholder="Buscar por nickname..."
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1">
              {searchResults.map(u => (
                <button
                  key={u.id}
                  onClick={() => blockUser(u)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex justify-between"
                >
                  <span>{u.nickname}</span>
                  <span className={u.reputation_score >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ({u.reputation_score >= 0 ? '+' : ''}{u.reputation_score})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {blockedUsers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {blockedUsers.map(u => (
              <span key={u.id} className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-sm rounded-full px-3 py-1">
                🚫 {u.nickname}
                <button onClick={() => unblockUser(u.id)} className="ml-1 hover:text-red-900">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {message && (
        <p className={`text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
      )}

      <button
        onClick={saveRestrictions}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar restricciones'}
      </button>
    </div>
  )
}