import { 
  ArrowLeft, 
  Search, 
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ChevronRight,
  MoreVertical,
  Download,
  Mail,
  Phone,
  Bell,
  Settings,
  LogOut,
  User,
  DollarSign,
  AlertCircle,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Building2,
  GraduationCap,
  Briefcase,
  Shield,
  Award,
  ClipboardCheck,
  Send,
  Edit,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { AdminSettings } from './AdminSettings';

interface Application {
  id: string;
  applicantName: string;
  email: string;
  businessName: string;
  status: 'in-progress' | 'ready-for-review' | 'approved' | 'needs-revision';
  lastUpdated: string;
  assignedAdmin: string;
  progress: number;
  requiresPayment: boolean;
  paymentStatus?: 'paid' | 'unpaid' | 'pending';
  paymentAmount?: number;
  complexityLevel?: 'standard' | 'complex' | 'advanced';
}

interface AdminDashboardProps {
  onBack?: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'my-queue'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'APP-001',
      applicantName: 'John Smith',
      email: 'john.smith@email.com',
      businessName: 'Smith Construction LLC',
      status: 'ready-for-review',
      lastUpdated: '2 hours ago',
      assignedAdmin: 'Sarah Johnson',
      progress: 100,
      requiresPayment: true,
      paymentStatus: 'pending',
      paymentAmount: 500,
      complexityLevel: 'standard'
    },
    {
      id: 'APP-002',
      applicantName: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      businessName: 'Garcia Builders Inc',
      status: 'in-progress',
      lastUpdated: '5 hours ago',
      assignedAdmin: 'Mike Davis',
      progress: 62,
      requiresPayment: false
    },
    {
      id: 'APP-003',
      applicantName: 'Robert Johnson',
      email: 'robert.j@email.com',
      businessName: 'RJ Contracting',
      status: 'approved',
      lastUpdated: '1 day ago',
      assignedAdmin: 'Sarah Johnson',
      progress: 100,
      requiresPayment: true,
      paymentStatus: 'paid',
      paymentAmount: 750,
      complexityLevel: 'complex'
    },
    {
      id: 'APP-004',
      applicantName: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      businessName: 'Chen Home Services',
      status: 'needs-revision',
      lastUpdated: '3 hours ago',
      assignedAdmin: 'Sarah Johnson',
      progress: 75,
      requiresPayment: true,
      paymentStatus: 'unpaid',
      paymentAmount: 300,
      complexityLevel: 'advanced'
    },
    {
      id: 'APP-005',
      applicantName: 'David Martinez',
      email: 'david.m@email.com',
      businessName: 'Martinez General Contracting',
      status: 'in-progress',
      lastUpdated: '6 hours ago',
      assignedAdmin: 'Mike Davis',
      progress: 45,
      requiresPayment: false
    },
    {
      id: 'APP-006',
      applicantName: 'Jennifer Brown',
      email: 'jennifer.brown@email.com',
      businessName: 'Brown Renovations LLC',
      status: 'ready-for-review',
      lastUpdated: '4 hours ago',
      assignedAdmin: 'Sarah Johnson',
      progress: 100,
      requiresPayment: true,
      paymentStatus: 'pending',
      paymentAmount: 400,
      complexityLevel: 'standard'
    },
  ]);

  // Mock KPI data
  const kpiData = {
    inProgress: 24,
    readyForReview: 8,
    approved: 156,
    needsRevision: 5
  };

  const togglePaymentRequirement = (appId: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        if (app.requiresPayment) {
          // Remove payment requirement
          return {
            ...app,
            requiresPayment: false,
            paymentStatus: undefined,
            paymentAmount: undefined,
            complexityLevel: undefined
          };
        } else {
          // Add payment requirement
          return {
            ...app,
            requiresPayment: true,
            paymentStatus: 'unpaid',
            paymentAmount: 500,
            complexityLevel: 'standard'
          };
        }
      }
      return app;
    }));

    // Update selected application if it's the one being modified
    if (selectedApplication && selectedApplication.id === appId) {
      const updatedApp = applications.find(app => app.id === appId);
      if (updatedApp) {
        const newApp = {
          ...updatedApp,
          requiresPayment: !updatedApp.requiresPayment,
          paymentStatus: updatedApp.requiresPayment ? undefined : ('unpaid' as const),
          paymentAmount: updatedApp.requiresPayment ? undefined : 500,
          complexityLevel: updatedApp.requiresPayment ? undefined : ('standard' as const)
        };
        setSelectedApplication(newApp);
      }
    }
  };

  const updatePaymentStatus = (appId: string, status: 'paid' | 'unpaid' | 'pending') => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, paymentStatus: status } : app
    ));
    
    if (selectedApplication && selectedApplication.id === appId) {
      setSelectedApplication({ ...selectedApplication, paymentStatus: status });
    }
  };

  // Filter for "My Queue" - assigned to Sarah Johnson
  const myQueueApplications = applications.filter(
    app => app.assignedAdmin === 'Sarah Johnson' && 
    (app.status === 'ready-for-review' || app.status === 'needs-revision')
  );

  const displayedApplications = activeTab === 'my-queue' ? myQueueApplications : applications;

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'ready-for-review':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-orange-100 text-orange-700';
      case 'needs-revision':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Application['status']) => {
    switch (status) {
      case 'ready-for-review':
        return 'Ready for Review';
      case 'in-progress':
        return 'In Progress';
      case 'needs-revision':
        return 'Needs Revision';
      case 'approved':
        return 'Approved';
      default:
        return status;
    }
  };

  if (showSettings) {
    return <AdminSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">Admin Portal</h1>
                  <p className="text-sm text-gray-600">Contractors School</p>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-700" />
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray-900">Sarah Johnson</div>
                  <div className="text-xs text-gray-600">Admin</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* In Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500">Last 30 days</span>
            </div>
            <div className="text-3xl text-gray-900 mb-1">{kpiData.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="mt-4 flex items-center gap-2 text-sm text-orange-600">
              <span>+3 this week</span>
            </div>
          </div>

          {/* Ready for Review */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Needs attention</span>
            </div>
            <div className="text-3xl text-gray-900 mb-1">{kpiData.readyForReview}</div>
            <div className="text-sm text-gray-600">Ready for Review</div>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
              <span>Review now →</span>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">All time</span>
            </div>
            <div className="text-3xl text-gray-900 mb-1">{kpiData.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <span>+12 this month</span>
            </div>
          </div>

          {/* Needs Revision */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs text-gray-500">Awaiting action</span>
            </div>
            <div className="text-3xl text-gray-900 mb-1">{kpiData.needsRevision}</div>
            <div className="text-sm text-gray-600">Needs Revision</div>
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
              <span>Pending applicant</span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl text-gray-900">Applications</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === 'recent'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Recent Applications
                    <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                      {applications.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('my-queue')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === 'my-queue'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    My Queue
                    <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                      {myQueueApplications.length}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
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
                    Applicant
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                    Assigned Admin
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedApplications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedApplication(app)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{app.applicantName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {app.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.businessName}</div>
                      <div className="text-xs text-gray-500">{app.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                        {app.requiresPayment && (
                          <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                            app.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : app.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <DollarSign className="w-3 h-3" />
                            {app.paymentStatus === 'paid' ? 'Paid' : app.paymentStatus === 'pending' ? 'Payment Pending' : 'Payment Required'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                            style={{ width: `${app.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{app.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-gray-900">{app.assignedAdmin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{app.lastUpdated}</span>
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

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {displayedApplications.length} of {applications.length} applications
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Previous
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Application Detail Modal - Redesigned */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedApplication(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl text-white">{selectedApplication.applicantName}</h3>
                    <p className="text-sm text-orange-100">{selectedApplication.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="w-10 h-10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Progress & Metadata Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="text-sm text-orange-100 mb-1">Progress</div>
                  <div className="text-2xl text-white">{selectedApplication.progress}%</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="text-sm text-orange-100 mb-1">Primary Trade</div>
                  <div className="text-white">General Contractor</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="text-sm text-orange-100 mb-1">License Type</div>
                  <div className="text-white">B-General</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              {/* License Setup & Basic Info */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => 
                    prev.includes('setup') ? prev.filter(s => s !== 'setup') : [...prev, 'setup']
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-900">License Setup & Basic Info</div>
                      <div className="text-xs text-gray-500">Complete your profile and license details</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {expandedSections.includes('setup') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedSections.includes('setup') && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                    {/* Editable Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Full Name</label>
                        <input 
                          type="text"
                          defaultValue={selectedApplication.applicantName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Email</label>
                        <input 
                          type="email"
                          defaultValue={selectedApplication.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">License Type</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                          <option>B-General Contractor</option>
                          <option>C-Concrete Contractor</option>
                          <option>E-Electrical Contractor</option>
                          <option>P-Plumbing Contractor</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Classification</label>
                        <input 
                          type="text"
                          defaultValue="Commercial & Residential"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs text-gray-600 uppercase tracking-wide">Documents</label>
                        <button className="px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded transition-colors flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Add Document
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {/* Document 1 */}
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-900">Driver's License (Front)</div>
                              <div className="text-xs text-gray-500">Uploaded 2 days ago • 1.2 MB</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors group">
                              <Download className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
                            </button>
                            <button className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors group">
                              <Edit className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
                            </button>
                          </div>
                        </div>

                        {/* Document 2 */}
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-900">Driver's License (Back)</div>
                              <div className="text-xs text-gray-500">Uploaded 2 days ago • 1.1 MB</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors group">
                              <Download className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
                            </button>
                            <button className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors group">
                              <Edit className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-sm flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-Licensure / Education */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => 
                    prev.includes('education') ? prev.filter(s => s !== 'education') : [...prev, 'education']
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-900">Pre-Licensure / Education</div>
                      <div className="text-xs text-gray-500">Upload course completion or exemptions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {expandedSections.includes('education') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedSections.includes('education') && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">Course Completion Certificate</div>
                          <div className="text-xs text-gray-500">Uploaded 2 days ago</div>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <button className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      Edit Documents
                    </button>
                  </div>
                )}
              </div>

              {/* Business Entity, FEIN & Banking */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => 
                    prev.includes('business') ? prev.filter(s => s !== 'business') : [...prev, 'business']
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-900">Business Entity, FEIN & Banking</div>
                      <div className="text-xs text-gray-500">Business structure and tax information</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {expandedSections.includes('business') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedSections.includes('business') && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Business Name</label>
                        <div className="text-sm text-gray-900">{selectedApplication.businessName}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Entity Type</label>
                        <div className="text-sm text-gray-900">LLC</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">FEIN</label>
                        <div className="text-sm text-gray-900">XX-XXXXXXX</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Formation Date</label>
                        <div className="text-sm text-gray-900">Jan 2024</div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      Edit Business Info
                    </button>
                  </div>
                )}
              </div>

              {/* Insurance */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => 
                    prev.includes('insurance') ? prev.filter(s => s !== 'insurance') : [...prev, 'insurance']
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-900">Insurance</div>
                      <div className="text-xs text-gray-500">General liability and workers comp coverage</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    {expandedSections.includes('insurance') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedSections.includes('insurance') && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                      <AlertCircle className="w-5 h-5" />
                      Pending: Upload insurance documents
                    </div>
                  </div>
                )}
              </div>

              {/* Experience & Qualifier */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => 
                    prev.includes('experience') ? prev.filter(s => s !== 'experience') : [...prev, 'experience']
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-900">Experience & Qualifier</div>
                      <div className="text-xs text-gray-500">Document qualifier experience if required</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {expandedSections.includes('experience') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              </div>

              {/* Exams (Business & Law) */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => 
                    prev.includes('exams') ? prev.filter(s => s !== 'exams') : [...prev, 'exams']
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-900">Exams (Business & Law)</div>
                      <div className="text-xs text-gray-500">Pass the Business & Law exam or provide specialty proof</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {expandedSections.includes('exams') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              </div>

              {/* DOPL Application */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => 
                    prev.includes('dopl') ? prev.filter(s => s !== 'dopl') : [...prev, 'dopl']
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-900">DOPL Application</div>
                      <div className="text-xs text-gray-500">Complete and mark DOPLs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {expandedSections.includes('dopl') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              </div>

              {/* Review / Attestation */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => 
                    prev.includes('review') ? prev.filter(s => s !== 'review') : [...prev, 'review']
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-900">Review / Attestation</div>
                      <div className="text-xs text-gray-500">Final review and sign attestation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    {expandedSections.includes('review') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              </div>

              {/* Reminder Email Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-blue-700 mb-4">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Reminder Email</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-900 mb-2">Missing steps:</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        Insurance: Add workers comp or waiver if no employees
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        Review / Attestation: Complete final review and sign
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-700 mb-2 block">Email draft</label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                      rows={3}
                      placeholder="Generate a draft or write your own reminder..."
                      defaultValue="Hi John, you're almost done with your contractor license application! Just two more steps to complete..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate AI Draft
                    </button>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Email
                    </button>
                    <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-sm flex items-center gap-2">
                      Send via AI Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Approve Application
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact
                </button>
                <button className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Request Revision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}