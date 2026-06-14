import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | SolarGrid Manager',
  description: 'Reset your SolarGrid Manager account password to regain access to your energy dashboard.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
