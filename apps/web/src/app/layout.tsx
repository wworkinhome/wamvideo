import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ProfileProvider } from '@/lib/profile-context';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'WAMVIDEO',
  description: 'Plataforma OTT/SaaS de streaming: VOD, TV en vivo, eventos y EPG.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ProfileProvider>
            <Navbar />
            <main>{children}</main>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
