export default function SkeletonReport() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 animate-pulse">
      {/* Header row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Price block */}
      <div className="mb-6">
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Table rows */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between py-3 border-t border-slate-100 dark:border-slate-700">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}

      {/* Sentiment block */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-600 rounded mb-3" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-600 rounded mb-2" />
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-600 rounded" />
      </div>
    </div>
  );
}
