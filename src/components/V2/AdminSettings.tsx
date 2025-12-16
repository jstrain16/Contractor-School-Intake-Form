import { 
  ArrowLeft, 
  Search,
  User,
  Users,
  Shield,
  ShieldCheck,
  FileText,
  Bell,
  Settings,
  Mail,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  Globe,
  DollarSign,
  Calendar,
  Cloud,
  RefreshCw,
  Link,
  ExternalLink,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Bot,
  Zap,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'applicant';
  status: 'active' | 'inactive';
  lastActive: string;
  createdDate: string;
}

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'system' | 'notifications'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [salesforceConnected, setSalesforceConnected] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecurityToken, setShowSecurityToken] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 hours ago');
  const [openAIConnected, setOpenAIConnected] = useState(true);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: 'USR-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@contractorsschool.com',
      role: 'super-admin',
      status: 'active',
      lastActive: '2 minutes ago',
      createdDate: 'Jan 15, 2025'
    },
    {
      id: 'USR-002',
      name: 'Mike Davis',
      email: 'mike.davis@contractorsschool.com',
      role: 'admin',
      status: 'active',
      lastActive: '1 hour ago',
      createdDate: 'Jan 20, 2025'
    },
    {
      id: 'USR-003',
      name: 'Emily Rodriguez',
      email: 'emily.r@contractorsschool.com',
      role: 'admin',
      status: 'active',
      lastActive: '3 hours ago',
      createdDate: 'Feb 1, 2025'
    },
    {
      id: 'USR-004',
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'applicant',
      status: 'active',
      lastActive: '5 hours ago',
      createdDate: 'Dec 10, 2025'
    },
    {
      id: 'USR-005',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      role: 'applicant',
      status: 'active',
      lastActive: '2 days ago',
      createdDate: 'Dec 5, 2025'
    },
    {
      id: 'USR-006',
      name: 'David Chen',
      email: 'david.chen@contractorsschool.com',
      role: 'admin',
      status: 'inactive',
      lastActive: '30 days ago',
      createdDate: 'Nov 1, 2025'
    },
  ]);

  const getRoleColor = (role: UserAccount['role']) => {
    switch (role) {
      case 'super-admin':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'applicant':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: UserAccount['role']) => {
    switch (role) {
      case 'super-admin':
        return <ShieldCheck className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'applicant':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: UserAccount['role']) => {
    switch (role) {
      case 'super-admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'applicant':
        return 'Applicant';
      default:
        return role;
    }
  };

  const updateUserRole = (userId: string, newRole: UserAccount['role']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
    ));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, status: selectedUser.status === 'active' ? 'inactive' : 'active' });
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    setSelectedUser(null);
  };

  const roleStats = {
    superAdmins: users.filter(u => u.role === 'super-admin').length,
    admins: users.filter(u => u.role === 'admin').length,
    applicants: users.filter(u => u.role === 'applicant').length,
    activeUsers: users.filter(u => u.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">Settings</h1>
                  <p className="text-sm text-gray-600">System Configuration</p>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Save Changes
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-sm">
                Publish
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="flex items-center gap-2 p-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'roles'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'system'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              System Settings
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'notifications'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
          </div>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl text-gray-900">{roleStats.superAdmins}</div>
                </div>
                <div className="text-sm text-gray-600">Super Admins</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl text-gray-900">{roleStats.admins}</div>
                </div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-2xl text-gray-900">{roleStats.applicants}</div>
                </div>
                <div className="text-sm text-gray-600">Applicants</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl text-gray-900">{roleStats.activeUsers}</div>
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <h2 className="text-xl text-gray-900">All Users</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 lg:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <button 
                      onClick={() => setShowAddUserModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr 
                        key={user.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{user.lastActive}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{user.createdDate}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Super Admin */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">Super Admin</h3>
                  <p className="text-sm text-gray-600">{roleStats.superAdmins} users</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Full system access
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Manage all users
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Configure settings
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Approve/reject applications
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Assign admins
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  View all data
                </div>
              </div>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Edit Permissions
              </button>
            </div>

            {/* Admin */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">Admin</h3>
                  <p className="text-sm text-gray-600">{roleStats.admins} users</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Review applications
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Approve/reject applications
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Contact applicants
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  View assigned applications
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Cannot manage users
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Cannot configure settings
                </div>
              </div>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Edit Permissions
              </button>
            </div>

            {/* Applicant */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">Applicant</h3>
                  <p className="text-sm text-gray-600">{roleStats.applicants} users</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Submit application
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Track progress
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Upload documents
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  View own application
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Cannot view other applications
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <XCircle className="w-4 h-4 text-red-600" />
                  No admin access
                </div>
              </div>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Edit Permissions
              </button>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">School Name</label>
                  <input
                    type="text"
                    defaultValue="Contractors School"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@contractorsschool.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Support Phone</label>
                  <input
                    type="tel"
                    defaultValue="(555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Application Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Application Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-900">Auto-assign applications</div>
                    <div className="text-xs text-gray-600">Automatically assign new applications to available admins</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-900">Email notifications for new applications</div>
                    <div className="text-xs text-gray-600">Send email when a new application is submitted</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-900">Require payment before final review</div>
                    <div className="text-xs text-gray-600">Block final approval for unpaid premium applications</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Settings
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Standard Support</label>
                    <input
                      type="number"
                      defaultValue="500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Complex Support</label>
                    <input
                      type="number"
                      defaultValue="750"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Advanced Support</label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Salesforce Integration */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-900 flex items-center gap-2">
                      Salesforce Integration
                    </h3>
                    <p className="text-sm text-gray-600">Connect and sync data with Salesforce CRM</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {salesforceConnected && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </span>
                  )}
                  <button 
                    onClick={() => setSalesforceConnected(!salesforceConnected)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      salesforceConnected ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      salesforceConnected ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {salesforceConnected && (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Connection Active</span>
                      </div>
                      <button 
                        onClick={() => setLastSyncTime('Just now')}
                        className="px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Sync Now
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last synced: {lastSyncTime}
                    </div>
                  </div>

                  {/* API Credentials */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      API Credentials
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Instance URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            defaultValue="https://yourcompany.salesforce.com"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <ExternalLink className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Username</label>
                        <input
                          type="text"
                          defaultValue="admin@contractorsschool.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">API Key</label>
                        <div className="flex gap-2">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            defaultValue="sk_live_51ABC123XYZ789..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                          />
                          <button 
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Security Token</label>
                        <div className="flex gap-2">
                          <input
                            type={showSecurityToken ? 'text' : 'password'}
                            defaultValue="ABC123XYZ789DEF456..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                          />
                          <button 
                            onClick={() => setShowSecurityToken(!showSecurityToken)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {showSecurityToken ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Types */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Connection Types
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Lead Sync</div>
                            <div className="text-xs text-gray-600">Sync contractor applications as leads</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Contact Sync</div>
                            <div className="text-xs text-gray-600">Sync applicant information to contacts</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Opportunity Sync</div>
                            <div className="text-xs text-gray-600">Create opportunities for premium applications</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Case Sync</div>
                            <div className="text-xs text-gray-600">Create cases for revision requests</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Payment Sync</div>
                            <div className="text-xs text-gray-600">Track premium payments in Salesforce</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sync Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm text-gray-900 mb-4">Sync Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-900">Auto-sync</div>
                          <div className="text-xs text-gray-600">Automatically sync data on changes</div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-900">Bi-directional sync</div>
                          <div className="text-xs text-gray-600">Allow updates from Salesforce to portal</div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-900">Sync interval</div>
                          <div className="text-xs text-gray-600">How often to sync data</div>
                        </div>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm">
                          <option>Real-time</option>
                          <option>Every 5 minutes</option>
                          <option>Every 15 minutes</option>
                          <option>Every hour</option>
                          <option>Daily</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Test Connection */}
                  <div className="border-t border-gray-200 pt-6">
                    <button className="w-full px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Test Connection
                    </button>
                  </div>
                </div>
              )}

              {!salesforceConnected && (
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cloud className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-900 mb-2">Salesforce Not Connected</h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Connect your Salesforce account to sync contractor applications, track leads, and manage customer relationships.
                  </p>
                  <button 
                    onClick={() => setSalesforceConnected(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 mx-auto"
                  >
                    <Link className="w-4 h-4" />
                    Connect Salesforce
                  </button>
                </div>
              )}
            </div>

            {/* OpenAI Integration */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-900 flex items-center gap-2">
                      OpenAI Integration
                    </h3>
                    <p className="text-sm text-gray-600">AI-powered features and automation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {openAIConnected && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                  <button 
                    onClick={() => setOpenAIConnected(!openAIConnected)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      openAIConnected ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      openAIConnected ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {openAIConnected && (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-medium">AI Features Active</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Online
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Model: GPT-4 Turbo • Usage: 12,450 / 50,000 tokens this month
                    </div>
                  </div>

                  {/* API Configuration */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      API Configuration
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">API Key</label>
                        <div className="flex gap-2">
                          <input
                            type={showOpenAIKey ? 'text' : 'password'}
                            defaultValue="sk-proj-abcdef123456789..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                          />
                          <button 
                            onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {showOpenAIKey ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Organization ID</label>
                        <input
                          type="text"
                          defaultValue="org-123456789"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Model Selection</label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                          <option>GPT-4 Turbo (Recommended)</option>
                          <option>GPT-4</option>
                          <option>GPT-3.5 Turbo</option>
                          <option>GPT-3.5</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* AI Features */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI-Powered Features
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Document Analysis</div>
                            <div className="text-xs text-gray-600">Automatically review and validate uploaded documents</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-purple-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Application Validation</div>
                            <div className="text-xs text-gray-600">Detect errors and missing information in applications</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-purple-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Smart Responses</div>
                            <div className="text-xs text-gray-600">AI-generated responses to applicant questions</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-purple-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Auto-categorization</div>
                            <div className="text-xs text-gray-600">Automatically categorize application complexity levels</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Email Drafting</div>
                            <div className="text-xs text-gray-600">Generate professional email templates for applicants</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-purple-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">Risk Assessment</div>
                            <div className="text-xs text-gray-600">Identify potential issues or red flags in applications</div>
                          </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-purple-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Behavior Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm text-gray-900 mb-4">AI Behavior Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Response Creativity</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            defaultValue="70"
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-600 w-12 text-right">70%</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Conservative</span>
                          <span>Creative</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Confidence Threshold</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            defaultValue="85"
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-600 w-12 text-right">85%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Minimum confidence level for automatic actions
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-900">Human review for critical decisions</div>
                          <div className="text-xs text-gray-600">Require admin approval for high-impact AI decisions</div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-purple-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Usage & Limits */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm text-gray-900 mb-4">Usage & Limits</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700">Monthly Token Usage</span>
                          <span className="text-gray-900">12,450 / 50,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-900">Daily rate limit</div>
                          <div className="text-xs text-gray-600">Maximum AI requests per day</div>
                        </div>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm">
                          <option>1,000 requests</option>
                          <option>5,000 requests</option>
                          <option>10,000 requests</option>
                          <option>Unlimited</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Test AI */}
                  <div className="border-t border-gray-200 pt-6">
                    <button className="w-full px-6 py-3 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Test AI Connection
                    </button>
                  </div>
                </div>
              )}

              {!openAIConnected && (
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-gray-900 mb-2">OpenAI Not Connected</h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Connect OpenAI to unlock powerful AI features like document analysis, smart responses, and automated validation.
                  </p>
                  <button 
                    onClick={() => setOpenAIConnected(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    Connect OpenAI
                  </button>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-900">Two-factor authentication</div>
                    <div className="text-xs text-gray-600">Require 2FA for all admin accounts</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-900">Session timeout</div>
                    <div className="text-xs text-gray-600">Auto-logout after inactivity</div>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>4 hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h4 className="text-sm text-gray-900 mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">New application submitted</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Application approved</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Application needs revision</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Payment received</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* In-App Notifications */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm text-gray-900 mb-3">In-App Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">New assignment</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Comment on application</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-orange-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">System updates</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Email</label>
                  <div className="text-gray-900">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Created Date</label>
                  <div className="text-gray-900">{selectedUser.createdDate}</div>
                </div>
              </div>

              {/* Role Management */}
              <div className="border-t border-gray-200 pt-6">
                <label className="text-sm text-gray-600 mb-3 block">User Role</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => updateUserRole(selectedUser.id, 'super-admin')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedUser.role === 'super-admin'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ShieldCheck className={`w-6 h-6 mx-auto mb-2 ${
                      selectedUser.role === 'super-admin' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <div className="text-sm text-gray-900">Super Admin</div>
                  </button>
                  <button
                    onClick={() => updateUserRole(selectedUser.id, 'admin')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedUser.role === 'admin'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Shield className={`w-6 h-6 mx-auto mb-2 ${
                      selectedUser.role === 'admin' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="text-sm text-gray-900">Admin</div>
                  </button>
                  <button
                    onClick={() => updateUserRole(selectedUser.id, 'applicant')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedUser.role === 'applicant'
                        ? 'border-gray-500 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className={`w-6 h-6 mx-auto mb-2 ${
                      selectedUser.role === 'applicant' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <div className="text-sm text-gray-900">Applicant</div>
                  </button>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-900 block mb-1">Account Status</label>
                    <div className="text-xs text-gray-600">
                      {selectedUser.status === 'active' ? 'User has full access' : 'User access is disabled'}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleUserStatus(selectedUser.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedUser.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedUser.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedUser.name}?`)) {
                      deleteUser(selectedUser.id);
                    }
                  }}
                  className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl text-gray-900">Add New User</h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="john.doe@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Role</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="applicant">Applicant</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}