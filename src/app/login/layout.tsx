import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | SolarGrid Manager',
  description: 'Sign in to your SolarGrid Manager account to monitor your solar microgrid, track energy consumption, and manage billing.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
