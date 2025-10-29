import React from 'react';

const SkeletonBox: React.FC<{ className: string }> = ({ className }) => (
    <div className={`bg-zinc-700/80 rounded-md animate-pulse ${className}`}></div>
);

export const AnimePageSkeleton: React.FC = () => {
    return (
        <div className="space-y-12">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
                    <SkeletonBox className="w-full aspect-[2/3] rounded-xl" />
                </div>
                <div className="md:w-2/3 lg:w-3/4">
                    <SkeletonBox className="h-4 w-1/2" />
                    <SkeletonBox className="h-10 md:h-14 w-full mt-3" />
                    <SkeletonBox className="h-6 w-3/4 mt-2" />
                    
                    <div className="flex items-center space-x-2 mt-6">
                        <div className="w-16 h-16 rounded-full bg-zinc-700/80 animate-pulse"></div>
                        <div className="space-y-2">
                            <SkeletonBox className="h-5 w-32" />
                            <SkeletonBox className="h-3 w-48" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                        <SkeletonBox className="h-10 w-40" />
                        <SkeletonBox className="h-10 w-12" />
                    </div>

                    <div className="mt-8 space-y-2">
                        <SkeletonBox className="h-4 w-1/4 mb-3" />
                        <SkeletonBox className="h-3 w-full" />
                        <SkeletonBox className="h-3 w-full" />
                        <SkeletonBox className="h-3 w-5/6" />
                    </div>
                </div>
            </div>

            {/* Details Skeleton */}
            <div className="mt-8 bg-zinc-800/50 p-6 rounded-lg animate-pulse">
                <SkeletonBox className="h-6 w-1/4 mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2"><SkeletonBox className="h-3 w-1/2" /><SkeletonBox className="h-4 w-3/4" /></div>
                    <div className="space-y-2"><SkeletonBox className="h-3 w-1/2" /><SkeletonBox className="h-4 w-3/4" /></div>
                    <div className="space-y-2"><SkeletonBox className="h-3 w-1/2" /><SkeletonBox className="h-4 w-3/4" /></div>
                    <div className="space-y-2"><SkeletonBox className="h-3 w-1/2" /><SkeletonBox className="h-4 w-3/4" /></div>
                </div>
            </div>
        </div>
    );
};