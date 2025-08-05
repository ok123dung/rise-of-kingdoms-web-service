import { Metadata } from 'next'
import OfflinePageClient from './OfflinePageClient'

export const metadata: Metadata = {
  title: 'Offline - RoK Services',
  description: 'You are currently offline. Some features may not be available.',
  robots: {
    index: false,
    follow: false
  }
}

export default function OfflinePage() {
  return <OfflinePageClient />
}