import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NotificationSender } from '@/components/features/notification-sender';

export default async function AdminDashboard() {
  // Check if user is admin
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log('Session:', session);
  console.log('User role:', session?.user?.role);

  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, Admin!</h2>
        <p className="text-gray-600">
          You have access to admin-only features.
        </p>
        <div className="mt-4">
          <p><strong>User:</strong> {session.user.name || session.user.email}</p>
          <p><strong>Role:</strong> {session.user.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            View, create, and manage user accounts
          </p>
          <a 
            href="/admin/users" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Users →
          </a>
        </div>

        <NotificationSender />
      </div>
    </div>
  );
}
