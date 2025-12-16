import { 
  ArrowLeft, 
  Building2, 
  CheckCircle, 
  Clock, 
  FileText, 
  GraduationCap, 
  Shield, 
  User, 
  Users,
  Briefcase,
  FileCheck,
  Award,
  Search,
  Grid,
  List,
  Plus,
  Bell,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import { ApplicationForm } from './ApplicationForm';

interface Step {
  id: number;
  name: string;
  status: 'complete' | 'pending' | 'in-progress';
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  assignee: string;
  date: string;
  color: string;
}

interface DashboardDarkProps {
  onBack?: () => void;
}

export function DashboardDark({ onBack }: DashboardDarkProps) {
  const [showApplication, setShowApplication] = useState(false);

  if (showApplication) {
    return <ApplicationForm onBack={() => setShowApplication(false)} />;
  }

  const completedSteps = 4;
  const totalSteps = 8;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const steps: Step[] = [
    { 
      id: 1, 
      name: 'Account Setup', 
      status: 'complete', 
      icon: <User className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-600'
    },
    { 
      id: 2, 
      name: 'Business Entity', 
      status: 'complete', 
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-600'
    },
    { 
      id: 3, 
      name: 'Workers Comp', 
      status: 'in-progress', 
      icon: <Shield className="w-6 h-6" />,
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      id: 4, 
      name: 'Business & Law', 
      status: 'complete', 
      icon: <FileText className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-600'
    },
    { 
      id: 5, 
      name: 'Pre-Licensure', 
      status: 'in-progress', 
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      id: 6, 
      name: 'General Liability', 
      status: 'pending', 
      icon: <Shield className="w-6 h-6" />,
      color: 'from-pink-400 to-rose-600'
    },
    { 
      id: 7, 
      name: 'Experience', 
      status: 'complete', 
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-600'
    },
    { 
      id: 8, 
      name: 'DOPL Application', 
      status: 'pending', 
      icon: <FileCheck className="w-6 h-6" />,
      color: 'from-pink-400 to-rose-600'
    },
  ];

  const activities: Activity[] = [
    {
      id: 1,
      type: 'reminder',
      title: 'Complete Workers Comp',
      assignee: 'John Smith',
      date: '12 Feb at 2pm',
      color: 'from-pink-400 to-pink-500'
    },
    {
      id: 2,
      type: 'call',
      title: 'Review Pre-Licensure Docs',
      assignee: 'Sarah Johnson',
      date: '13 Feb at 12pm',
      color: 'from-yellow-300 to-yellow-400'
    },
    {
      id: 3,
      type: 'meeting',
      title: 'DOPL Application Review',
      assignee: 'Mike Davis',
      date: '15 Feb at 10am',
      color: 'from-purple-400 to-purple-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Top Navigation */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white">License Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Issue Credit
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Edit
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
              Delete
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Hero Stats */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-white/80" />
                  </div>
                  <div>
                    <div className="text-6xl text-white mb-2">
                      {progressPercentage}<span className="text-4xl text-white/60">%</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>General Contractor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>{completedSteps} of {totalSteps} Complete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>In Progress</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowApplication(true)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                >
                  Continue Application
                </button>
              </div>

              {/* Status Bars */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-400/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-4 border border-green-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/60 uppercase tracking-wider">Completed</span>
                  </div>
                  <div className="text-3xl text-white">{completedSteps}<span className="text-lg text-white/60"> Steps</span></div>
                </div>
                <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-white/60 uppercase tracking-wider">In Progress</span>
                  </div>
                  <div className="text-3xl text-white">2<span className="text-lg text-white/60"> Steps</span></div>
                </div>
                <div className="bg-gradient-to-br from-pink-400/20 to-rose-600/20 backdrop-blur-sm rounded-2xl p-4 border border-pink-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-white/60 uppercase tracking-wider">Pending</span>
                  </div>
                  <div className="text-3xl text-white">2<span className="text-lg text-white/60"> Steps</span></div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">Overall Progress</span>
                  <span className="text-sm text-white">{progressPercentage}% Complete</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-pink-400"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl text-white mb-1">License Requirements</h2>
                  <p className="text-white/60">{completedSteps} of {totalSteps} steps completed</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                    <Search className="w-5 h-5 text-white/60" />
                  </button>
                  <button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Grid className="w-5 h-5 text-white" />
                  </button>
                  <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                    <List className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Steps Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => step.status === 'in-progress' && setShowApplication(true)}
                    className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white`}>
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm mb-1 truncate">{step.name}</div>
                        <div className={`text-xs px-2 py-1 rounded-md inline-block ${
                          step.status === 'complete' 
                            ? 'bg-green-400/20 text-green-400' 
                            : step.status === 'in-progress'
                            ? 'bg-yellow-400/20 text-yellow-400'
                            : 'bg-pink-400/20 text-pink-400'
                        }`}>
                          {step.status === 'complete' ? 'Complete' : step.status === 'in-progress' ? 'In Progress' : 'Pending'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40 mb-2">Step {step.id} of {totalSteps}</div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${step.color} transition-all`}
                        style={{ width: step.status === 'complete' ? '100%' : step.status === 'in-progress' ? '50%' : '0%' }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white">Activity</h3>
                <div className="text-3xl text-white">{activities.length} <span className="text-sm text-white/60">Activities</span></div>
              </div>

              <div className="space-y-3 mb-6">
                <button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl py-2.5 transition-colors text-white">
                  <Calendar className="w-4 h-4" />
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl py-2.5 transition-colors text-white">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl py-2.5 transition-colors text-white">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl py-2.5 transition-colors text-white">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl py-2.5 transition-colors text-white">
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-white/60 mb-3">Upcoming</div>
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`bg-gradient-to-br ${activity.color} rounded-2xl p-4 group hover:scale-[1.02] transition-transform cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white text-sm">{activity.title}</div>
                          <div className="text-white/70 text-xs">{activity.date}</div>
                        </div>
                      </div>
                      <button className="text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/30 rounded-full"></div>
                      <div>
                        <div className="text-white text-xs">{activity.assignee}</div>
                        <div className="text-white/60 text-xs">Reviewing needs...</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}