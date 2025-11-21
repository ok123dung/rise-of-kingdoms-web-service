export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="relative mx-auto mb-4 h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <svg
              className="h-8 w-8 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="animate-pulse text-xl font-semibold text-slate-700 dark:text-slate-200">
          Đang tải dữ liệu...
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Vui lòng chờ trong giây lát
        </p>
      </div>
    </div>
  )
}
