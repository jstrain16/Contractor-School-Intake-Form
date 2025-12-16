import { CheckCircle, Circle, GraduationCap, HelpCircle, User, AlertCircle, Clock, FileText } from 'lucide-react';
import { Progress } from './ui/progress';
import { useState } from 'react';
import { ApplicationForm } from './ApplicationForm';
import { BackgroundQuestionnaire } from './BackgroundQuestionnaire';

interface ApplicationCard {
  id: string;
  applicantName: string;
  businessName: string;
  licenseType: string;
  status: 'in-progress' | 'ready-for-review' | 'approved' | 'needs-revision' | 'draft';
  currentPhase: string;
  progress: number;
  lastUpdated: string;
  complexityLevel?: 'standard' | 'complex' | 'advanced';
}

interface Step {
  id: number;
  name: string;
  status: 'complete' | 'pending' | 'in-progress';
  progress: number;
}

export function Dashboard() {
  const [showApplication, setShowApplication] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Mock application data - in production this would come from an API/database
  const applications: ApplicationCard[] = [
    {
      id: 'APP-001',
      applicantName: 'Matt Armstrong',
      businessName: 'Armstrong Construction LLC',
      licenseType: 'B100 - General Building',
      status: 'in-progress',
      currentPhase: 'Phase 4: Background & Financial Screening',
      progress: 35,
      lastUpdated: '2 hours ago',
      complexityLevel: 'standard'
    },
    {
      id: 'APP-002',
      applicantName: 'John Smith',
      businessName: 'Smith Contracting Inc',
      licenseType: 'E100 - General Engineering',
      status: 'ready-for-review',
      currentPhase: 'Application Complete - Under Review',
      progress: 100,
      lastUpdated: '1 day ago',
      complexityLevel: 'complex'
    },
    {
      id: 'APP-003',
      applicantName: 'Sarah Davis',
      businessName: 'Davis Plumbing Services',
      licenseType: 'S-02 - Plumbing',
      status: 'draft',
      currentPhase: 'Phase 2: License Type Selection',
      progress: 12,
      lastUpdated: '3 days ago',
      complexityLevel: 'standard'
    }
  ];

  const activeApplication = applications.find(app => app.status === 'in-progress') || applications[0];
  
  const steps: Step[] = [
    { id: 1, name: 'User Authentication', status: 'complete', progress: 100 },
    { id: 2, name: 'License Type Selection', status: 'complete', progress: 100 },
    { id: 3, name: 'Class Booking', status: 'complete', progress: 100 },
    { id: 4, name: 'Background & Financial Screening', status: 'in-progress', progress: 35 },
    { id: 5, name: 'Supporting Materials', status: 'pending', progress: 0 },
    { id: 6, name: 'Assistance Selection', status: 'pending', progress: 0 },
    { id: 7, name: 'Business Entity Formation', status: 'pending', progress: 0 },
    { id: 8, name: 'FEIN Application', status: 'pending', progress: 0 },
    { id: 9, name: 'Business Banking', status: 'pending', progress: 0 },
    { id: 10, name: 'Owner/Officer Management', status: 'pending', progress: 0 },
    { id: 11, name: 'Workers Comp Determination', status: 'pending', progress: 0 },
    { id: 12, name: 'Pre-Licensure Education', status: 'pending', progress: 0 },
    { id: 13, name: 'General Liability Insurance', status: 'pending', progress: 0 },
    { id: 14, name: 'Experience/Qualifier', status: 'pending', progress: 0 },
    { id: 15, name: 'Contractor License Bond', status: 'pending', progress: 0 },
    { id: 16, name: 'DCPL Application', status: 'pending', progress: 0 },
    { id: 17, name: 'Final Submission', status: 'pending', progress: 0 },
  ];

  const overallProgress = activeApplication.progress;
  const nextStep = steps.find(step => step.status === 'pending' || step.status === 'in-progress');

  if (showApplication) {
    return <ApplicationForm onBack={() => setShowApplication(false)} />;
  }

  const getStatusColor = (status: ApplicationCard['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'ready-for-review':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-orange-100 text-orange-700';
      case 'needs-revision':
        return 'bg-red-100 text-red-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: ApplicationCard['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'ready-for-review':
        return <FileText className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'needs-revision':
        return <AlertCircle className="w-4 h-4" />;
      case 'draft':
        return <Circle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: ApplicationCard['status']) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'ready-for-review':
        return 'Ready for Review';
      case 'in-progress':
        return 'In Progress';
      case 'needs-revision':
        return 'Needs Revision';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Dashboard</span>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-gray-900 mb-1">Contractor School</h1>
                <p className="text-gray-600">Track your licensing intake, progress, and documents in one place.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowApplication(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Go to Application
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Progress</p>
                <p className="text-gray-900">{overallProgress}% complete</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Next up: <span className="text-gray-900">{nextStep?.name}</span></p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {step.status === 'complete' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-orange-600" />
                  )}
                  <span className="text-gray-900">{step.name}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-md text-sm ${
                    step.status === 'complete'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {step.status === 'complete' ? 'Complete' : 'Pending'}
                </span>
              </div>
              <Progress
                value={step.progress}
                className={`h-1.5 ${
                  step.status === 'complete' ? '[&>div]:bg-green-600' : '[&>div]:bg-orange-600'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowApplication(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg transition-colors shadow-sm"
          >
            Continue Application
          </button>
        </div>

        {/* My Applications */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-gray-900">My Applications</h3>
            <p className="text-sm text-gray-600 mt-1">View and manage all your contractor license applications</p>
          </div>
          <div className="divide-y divide-gray-200">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => {
                  setSelectedApplicationId(app.id);
                  setShowApplication(true);
                }}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-gray-900">{app.businessName}</h4>
                      <span className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {getStatusLabel(app.status)}
                      </span>
                      {app.complexityLevel === 'complex' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
                          Complex
                        </span>
                      )}
                      {app.complexityLevel === 'advanced' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs">
                          Advanced
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{app.licenseType}</span>
                      <span>•</span>
                      <span>{app.id}</span>
                      <span>•</span>
                      <span>Updated {app.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{app.currentPhase}</span>
                    <span className="text-gray-900">{app.progress}%</span>
                  </div>
                  <Progress 
                    value={app.progress} 
                    className={`h-2 ${
                      app.status === 'approved' 
                        ? '[&>div]:bg-green-600' 
                        : app.status === 'ready-for-review'
                        ? '[&>div]:bg-blue-600'
                        : '[&>div]:bg-orange-600'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Progress</p>
            <p className="text-3xl text-gray-900 mb-1">{overallProgress}%</p>
            <p className="text-gray-600">Weighted completion across all sections</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Next Action</p>
            <p className="text-gray-900 mb-1">{nextStep?.name}</p>
            <p className="text-gray-600">Complete the next section to move forward.</p>
          </div>
        </div>
      </main>

      {/* Floating Help Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-orange-600 hover:bg-orange-700 rounded-full shadow-lg flex items-center justify-center transition-colors">
        <HelpCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}