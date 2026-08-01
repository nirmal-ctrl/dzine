import React from 'react';
import { cn } from "@/lib/utils";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
    duration?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({
    className,
    duration = '2s',
    ...props
}) => {
    return (
        <div
            className={cn(
                "relative overflow-hidden bg-muted/50 w-full h-full",
                className
            )}
            {...props}
        >
            <div
                className="absolute inset-0 -translate-x-full"
                style={{
                    backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                    animation: `shimmer ${duration} infinite`
                }}
            />
        </div>
    );
};
