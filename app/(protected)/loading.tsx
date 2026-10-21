import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-48 rounded-lg bg-slate-200" />
        <Skeleton className="h-10 w-32 rounded-lg bg-slate-200" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <Skeleton className="h-4 w-24 bg-slate-200" />
            <Skeleton className="h-10 w-32 bg-slate-200" />
            <Skeleton className="h-4 w-full bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Table/List Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 mt-8">
        <Skeleton className="h-8 w-64 bg-slate-200" />
        <div className="space-y-4 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
