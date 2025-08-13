'use client'
import { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
interface WebhookEvent {
  id: string
  provider: string
  eventType: string
  eventId: string
  status: string
  attempts: number
  lastAttemptAt?: string
  nextRetryAt?: string
  errorMessage?: string
  createdAt: string
  processedAt?: string
}
interface WebhookStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
}
export function WebhookMonitor() {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([])
  const [stats, setStats] = useState<WebhookStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  useEffect(() => {
    fetchWebhooks()
    const interval = setInterval(fetchWebhooks, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [filter])
  const fetchWebhooks = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      const response = await fetch(`/api/admin/webhooks?${params}`)
      const data = await response.json()
      setWebhooks(data.webhooks)
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    } finally {
      setLoading(false)
    }
  }
  const retryWebhook = async (eventId: string) => {
    setRetrying(eventId)
    try {
      const response = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      })
      if (response.ok) {
        fetchWebhooks()
      }
    } catch (error) {
      console.error('Failed to retry webhook:', error)
    } finally {
      setRetrying(null)
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'momo':
        return 'bg-pink-100 text-pink-800'
      case 'zalopay':
        return 'bg-blue-100 text-blue-800'
      case 'vnpay':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>
      )}
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Filter:</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <button
          onClick={fetchWebhooks}
          className="ml-auto text-sm text-blue-600 hover:text-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      {/* Webhook List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Event ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Attempts
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Next Retry
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <tr key={webhook.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(webhook.status)}
                    <span className="text-sm capitalize">{webhook.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getProviderColor(webhook.provider)}`}>
                    {webhook.provider.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {webhook.eventId}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm">
                  {webhook.attempts}/5
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {format(new Date(webhook.createdAt), 'dd/MM HH:mm')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {webhook.nextRetryAt 
                    ? format(new Date(webhook.nextRetryAt), 'dd/MM HH:mm')
                    : '-'
                  }
                </td>
                <td className="px-4 py-3">
                  {webhook.status === 'failed' && (
                    <button
                      onClick={() => retryWebhook(webhook.eventId)}
                      disabled={retrying === webhook.eventId}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {retrying === webhook.eventId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {webhooks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No webhooks found
          </div>
        )}
      </div>
    </div>
  )
}