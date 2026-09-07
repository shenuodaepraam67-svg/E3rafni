import { redirect } from 'next/navigation'
import { getAdminSession } from './login/actions'
import LeaderDashboardClient from './LeaderDashboardClient'

async function LeaderDashboardPage() {
  const isAdmin = await getAdminSession()

  if (!isAdmin) {
    redirect('/dashboard/leader/login')
  }

  return <LeaderDashboardClient />
}

export default LeaderDashboardPage
