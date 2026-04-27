import HomeClient from './HomeClient'

export default function Page({ searchParams }) {
  const q = searchParams?.q || ''
  return <HomeClient q={q} />
}
