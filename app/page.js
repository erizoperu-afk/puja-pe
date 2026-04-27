import HomeClient from './HomeClient'

export default async function Page({ searchParams }) {
  const { q = '' } = await searchParams
  return <HomeClient q={q} />
}
