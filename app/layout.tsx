import type { Metadata, Viewport } from 'next';
import { GoogleTagManager } from '@next/third-parties/google';
import { Geist_Mono, Noto_Sans, Playfair_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
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
        url: appUrl
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
            className={cn(
                'h-full antialiased',
                notoSans.variable,
                playfairDisplayHeading.variable,
                geistMono.variable,
                'font-sans'
            )}
        >
            {process.env.NEXT_PUBLIC_GTM_ID ? (
                <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
            ) : null}
            <body className="min-h-full flex flex-col">
                {children}
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
