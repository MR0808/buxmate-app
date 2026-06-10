import { cn } from '@/lib/utils';

type EventCoverImageProps = {
    signedUrl: string | null;
    alt?: string;
    className?: string;
    height?: 'sm' | 'md' | 'lg' | 'hero';
    overlay?: boolean;
    priority?: boolean;
};

const heightClasses = {
    sm: 'h-32',
    md: 'h-40 sm:h-48',
    lg: 'h-48 sm:h-56',
    hero: 'h-52 sm:h-64'
};

export function EventCoverImage({
    signedUrl,
    alt = '',
    className,
    height = 'md',
    overlay = true,
    priority = false
}: EventCoverImageProps) {
    if (!signedUrl) {
        return (
            <div
                className={cn(
                    'bg-linear-to-br from-primary/15 via-primary/5 to-transparent',
                    heightClasses[height],
                    className
                )}
                aria-hidden
            />
        );
    }

    return (
        <div
            className={cn(
                'relative overflow-hidden',
                heightClasses[height],
                className
            )}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={signedUrl}
                alt={alt}
                className="size-full object-cover"
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
            />
            {overlay ? (
                <div className="absolute inset-0 bg-linear-to-t from-card via-card/10 to-transparent" />
            ) : null}
        </div>
    );
}
