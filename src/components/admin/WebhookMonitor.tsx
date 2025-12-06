'use client'
import { useState, useEffect } from 'react'

import { format } from 'date-fns'
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Loader2
} from 'lucide-react'

interface WebhookEvent {
  id: string
  provider: string
  event_type: string
  event_id: string
  status: string
  attempts: number
  last_attempt_at?: string
  next_retry_at?: string
  error_message?: string
  created_at: string
  processed_at?: string
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
    void fetchWebhooks()
    const interval = setInterval(() => void fetchWebhooks(), 30000) // Refresh every 30s
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])
  const fetchWebhooks = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      const response = await fetch(`/api/admin/webhooks?${params.toString()}`)
      const data = (await response.json()) as { webhooks: WebhookEvent[]; stats: WebhookStats }
      setWebhooks(data.webhooks)
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    } finally {
      setLoading(false)
    }
  }
  const retryWebhook = async (event_id: string) => {
    setRetrying(event_id)
    try {
      const response = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id })
      })
      if (response.ok) {
        void fetchWebhooks()
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
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>
      )}
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Filter:</span>
        <select
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <button
          className="ml-auto text-sm text-blue-600 hover:text-blue-700"
          onClick={() => void fetchWebhooks()}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      {/* Webhook List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Event ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Attempts
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Next Retry
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {webhooks.map(webhook => (
              <tr key={webhook.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(webhook.status)}
                    <span className="text-sm capitalize">{webhook.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs ${getProviderColor(webhook.provider)}`}
                  >
                    {webhook.provider.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs">{webhook.event_id}</code>
                </td>
                <td className="px-4 py-3 text-sm">{webhook.attempts}/5</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {format(new Date(webhook.created_at), 'dd/MM HH:mm')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {webhook.next_retry_at ? format(new Date(webhook.next_retry_at), 'dd/MM HH:mm') : '-'}
                </td>
                <td className="px-4 py-3">
                  {webhook.status === 'failed' && (
                    <button
                      className="text-blue-600 hover:text-blue-700"
                      disabled={retrying === webhook.event_id}
                      onClick={() => void retryWebhook(webhook.event_id)}
                    >
                      {retrying === webhook.event_id ? (
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
          <div className="py-8 text-center text-gray-500">No webhooks found</div>
        )}
      </div>
    </div>
  )
}
