'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Search } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchInput() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('query', term)
        } else {
            params.delete('query')
        }
        params.set('page', '1') // Reset to page 1 on new search

        startTransition(() => {
            router.replace(`/admin/bookings?${params.toString()}`)
        })
    }, 300)

    return (
        <div className="relative">
            <input
                className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                placeholder="Tìm kiếm..."
                type="text"
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {isPending && (
                <div className="absolute right-3 top-2.5">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500" />
                </div>
            )}
        </div>
    )
}
