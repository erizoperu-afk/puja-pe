import Link from 'next/link'

export default function UserBadge({ userId, nickname, reputationScore, showLink = true }) {
  const score = reputationScore ?? 0
  const formatted = score > 0 ? `+${score}` : `${score}`

  const scoreColor =
    score > 0 ? 'text-green-600' :
    score < 0 ? 'text-red-600' :
    'text-gray-400'

  const content = (
    <span className="inline-flex items-center gap-1 font-medium">
      <span className="text-gray-800">{nickname}</span>
      <span className={`text-sm ${scoreColor}`}>({formatted})</span>
    </span>
  )

  if (showLink && userId) {
    return (
      <Link href={`/perfil/${userId}`} className="hover:underline">
        {content}
      </Link>
    )
  }

  return content
}