import DashboardLayout from '@/app/dashboard/layout';

export default function DashboardDevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
