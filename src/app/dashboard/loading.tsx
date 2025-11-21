export default function DashboardLoading() {
    return (
        <div className="space-y-6 p-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                        <div className="mt-4 h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
