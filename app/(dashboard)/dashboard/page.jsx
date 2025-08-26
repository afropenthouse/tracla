import React from 'react'
import VibeasyOverview from '@/components/dashboard/Overview'
import VibeasyTable from '@/components/dashboard/Tables'

export default function page() {
  return (
    <div>
      <VibeasyOverview />
      <VibeasyTable />
    </div>
  )
}
