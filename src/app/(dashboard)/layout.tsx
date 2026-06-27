import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
