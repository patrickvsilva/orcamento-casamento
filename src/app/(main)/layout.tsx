import Link from 'next/link';
import { MobileShell } from '@/components/layout/MobileShell';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
