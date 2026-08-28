import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
          <div className="h-8 w-64 bg-slate-700 rounded"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-36 bg-slate-800 rounded-lg"></div>
          <div className="h-10 w-44 bg-indigo-900/50 rounded-lg"></div>
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Action Box */}
          <div className="h-56 bg-slate-800/80 rounded-2xl border border-slate-700/50 p-6 space-y-4">
            <div className="h-5 w-28 bg-indigo-800/60 rounded"></div>
            <div className="h-7 w-3/4 bg-slate-700 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-700/60 rounded"></div>
            <div className="h-10 w-40 bg-indigo-600/40 rounded-lg mt-4"></div>
          </div>

          {/* Current Milestone Box */}
          <div className="h-64 bg-slate-800/60 rounded-2xl border border-slate-700/40 p-6 space-y-4">
            <div className="h-5 w-36 bg-slate-700 rounded"></div>
            <div className="h-6 w-1/2 bg-slate-700 rounded"></div>
            <div className="h-3 w-full bg-slate-700/50 rounded-full"></div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="h-10 bg-slate-700/30 rounded"></div>
              <div className="h-10 bg-slate-700/30 rounded"></div>
            </div>
          </div>

          {/* Roadmap Preview */}
          <div className="h-48 bg-slate-800/50 rounded-2xl border border-slate-700/40 p-6 space-y-4">
            <div className="h-5 w-32 bg-slate-700 rounded"></div>
            <div className="flex gap-4">
              <div className="h-20 flex-1 bg-slate-700/30 rounded-xl"></div>
              <div className="h-20 flex-1 bg-slate-700/30 rounded-xl"></div>
              <div className="h-20 flex-1 bg-slate-700/30 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Right 1 Col */}
        <div className="space-y-6">
          {/* Career Alignment Card */}
          <div className="h-72 bg-slate-800/80 rounded-2xl border border-slate-700/50 p-6 flex flex-col items-center justify-center space-y-4">
            <div className="h-28 w-28 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center">
              <div className="h-8 w-12 bg-slate-700 rounded"></div>
            </div>
            <div className="h-4 w-40 bg-slate-700 rounded"></div>
            <div className="h-3 w-48 bg-slate-700/50 rounded"></div>
          </div>

          {/* Weekly Progress */}
          <div className="h-44 bg-slate-800/50 rounded-2xl border border-slate-700/40 p-6 space-y-3">
            <div className="h-5 w-28 bg-slate-700 rounded"></div>
            <div className="h-8 w-32 bg-slate-700 rounded"></div>
            <div className="h-2 w-full bg-slate-700 rounded"></div>
          </div>

          {/* Recent Activity */}
          <div className="h-56 bg-slate-800/50 rounded-2xl border border-slate-700/40 p-6 space-y-3">
            <div className="h-5 w-32 bg-slate-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-8 bg-slate-700/30 rounded"></div>
              <div className="h-8 bg-slate-700/30 rounded"></div>
              <div className="h-8 bg-slate-700/30 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
