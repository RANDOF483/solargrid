import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | SolarGrid Manager',
  description: 'Create a new SolarGrid Manager account. Join our Microgrid-as-a-Service platform for reliable solar energy in Buea, Cameroon.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
