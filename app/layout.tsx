import type { Metadata, Viewport } from 'next';
import { GoogleTagManager } from '@next/third-parties/google';
import { Geist_Mono, Noto_Sans, Playfair_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { getGtmId } from '@/lib/analytics';
import { LOGO_PATH } from '@/lib/brand';
import { getPublicAppUrl } from '@/lib/env';
import { cn } from '@/lib/utils';
import './globals.css';

const playfairDisplayHeading = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-heading'
});

const notoSans = Noto_Sans({
    subsets: ['latin'],
    variable: '--font-sans'
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
});

const appUrl = getPublicAppUrl();
const gtmId = getGtmId();

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#e07a3a'
};

export const metadata: Metadata = {
    metadataBase: new URL(appUrl),
    title: {
        default: 'Buxmate',
        template: '%s · Buxmate'
    },
    description:
        'Private event planning for organisers — manage guests, RSVPs, activities and payments.',
    applicationName: 'Buxmate',
    appleWebApp: {
        title: 'Buxmate',
    },
    robots: {
        index: false,
        follow: false
    },
    openGraph: {
        type: 'website',
        siteName: 'Buxmate',
        title: 'Buxmate',
        description:
            'Plan the chaos. Split the cost. Keep it private — bucks, hens and group weekends.',
        locale: 'en_AU',
        url: appUrl,
        images: [{ url: LOGO_PATH, alt: 'Buxmate' }],
    },
    twitter: {
        card: 'summary',
        title: 'Buxmate',
        description:
            'Private event planning for organisers — guests, RSVPs, activities and payments.'
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            data-scroll-behavior="smooth"
            suppressHydrationWarning
            className={cn(
                'h-full antialiased',
                notoSans.variable,
                playfairDisplayHeading.variable,
                geistMono.variable,
                'font-sans'
            )}
        >
            <body className="min-h-full flex flex-col" suppressHydrationWarning>
                {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
                {children}
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
