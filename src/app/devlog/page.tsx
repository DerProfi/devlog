import Header from '@/components/Header'
import DevLogForm from '@/components/DevLogForm'
import DashboardStatsSummary from '@/components/DashboardStatsSummary'
import MoodWeek from '@/components/MoodWeek'
import WorkWeekBoard from '@/components/WorkWeekBoard'
import ContributionsChart from '@/components/ContributionsChart'
import GitHubActivityStats from '@/components/GitHubActivityStats'
import DevLogHistory from '@/components/DevLogHistory'
import { DeepWorkCard } from '@/components/deep-work'

export default function DevLogPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--dl-bg)', color: 'var(--dl-text)' }}>
      <Header />
      <main className="container mx-auto px-4 py-8 overflow-x-hidden">

        {/* Top grid: left form, right stats + mood + deep work */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 min-w-0 space-y-6">
            <DevLogForm />
          </div>
          <div className="min-w-0 space-y-8">
            <DeepWorkCard />
            <DashboardStatsSummary />
            <MoodWeek />
          </div>
        </div>

        {/* Work week board */}
        <div className="mt-10">
          <WorkWeekBoard />
        </div>

        {/* Charts row */}
        <div className="mt-10">
          <ContributionsChart />
        </div>

        <div className="mt-10">
          <GitHubActivityStats />
        </div>

        {/* Search/History */}
        <div className="mt-10">
          <DevLogHistory />
        </div>
      </main>
    </div>
  )
}
