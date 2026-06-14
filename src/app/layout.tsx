import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SolarGrid Manager — Microgrid-as-a-Service Platform',
  description:
    'Professional solar microgrid management platform for Buea, Cameroon. Monitor energy, manage billing, track consumption, and maintain your off-grid solar system.',
  keywords: 'solar energy, microgrid, electricity, Cameroon, Buea, energy management',
  authors: [{ name: 'SolarGrid Manager' }],
  openGraph: {
    title: 'SolarGrid Manager',
    description: 'Microgrid-as-a-Service Platform for Solar Energy Management',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="avUfQlK_Pf6Iu-cmJoM-MCBu140GJLSxuLbgmeeDJAk" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
