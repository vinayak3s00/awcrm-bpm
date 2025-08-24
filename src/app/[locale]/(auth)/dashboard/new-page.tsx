// AWCRM Dashboard - Professional CRM Overview
// Information-dense dashboard with comprehensive metrics

'use client';

import React from 'react';
import { useOrganization } from '@clerk/nextjs';
import { CRMHeader } from '@/components/layout/CRMHeader';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  Phone,
  Mail,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Mock data for dashboard metrics
const dashboardMetrics = [
  { title: 'Total Revenue', value: '$2.85M', change: 12.5, trend: 'up', icon: DollarSign, color: 'bg-green-500' },
  { title: 'Total Contacts', value: '1,247', change: 8.3, trend: 'up', icon: Users, color: 'bg-blue-500' },
  { title: 'Active Deals', value: '23', change: -2.1, trend: 'down', icon: TrendingUp, color: 'bg-purple-500' },
  { title: 'Conversion Rate', value: '24.8%', change: 3.2, trend: 'up', icon: Target, color: 'bg-orange-500' },
];

const recentActivities = [
  { id: 1, type: 'call', contact: 'John Smith', company: 'Acme Corp', time: '2 hours ago', status: 'completed' },
  { id: 2, type: 'email', contact: 'Sarah Johnson', company: 'TechStart', time: '4 hours ago', status: 'sent' },
  { id: 3, type: 'meeting', contact: 'Mike Brown', company: 'Enterprise', time: '1 day ago', status: 'scheduled' },
  { id: 4, type: 'task', contact: 'Lisa Davis', company: 'Innovation Inc', time: '2 days ago', status: 'pending' },
];

const upcomingTasks = [
  { id: 1, title: 'Follow up with Acme Corp', dueDate: 'Today, 2:00 PM', priority: 'high' },
  { id: 2, title: 'Prepare proposal for TechStart', dueDate: 'Tomorrow, 10:00 AM', priority: 'medium' },
  { id: 3, title: 'Call Enterprise Solutions', dueDate: 'Jan 25, 3:00 PM', priority: 'low' },
  { id: 4, title: 'Send contract to Innovation Inc', dueDate: 'Jan 26, 9:00 AM', priority: 'high' },
];

const pipelineData = [
  { stage: 'Prospecting', count: 45, value: 125000, color: 'bg-blue-500' },
  { stage: 'Qualification', count: 23, value: 89000, color: 'bg-indigo-500' },
  { stage: 'Proposal', count: 12, value: 156000, color: 'bg-purple-500' },
  { stage: 'Negotiation', count: 8, value: 234000, color: 'bg-pink-500' },
  { stage: 'Closed Won', count: 15, value: 345000, color: 'bg-green-500' },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'call': return Phone;
    case 'email': return Mail;
    case 'meeting': return Calendar;
    case 'task': return FileText;
    default: return Activity;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'crm-badge-success';
    case 'sent': return 'crm-badge-info';
    case 'scheduled': return 'crm-badge-warning';
    case 'pending': return 'crm-badge-error';
    default: return 'crm-badge-info';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export default function DashboardPage() {
  const { organization } = useOrganization();

  // Show loading state if organization is not loaded
  if (!organization) {
    return (
      <div className="crm-flex crm-items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="crm-text-sm text-gray-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-main">
      <CRMHeader 
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business."
        showSearch={true}
        showFilters={false}
        showQuickActions={true}
      />
      
      <div className="crm-content">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 crm-gap-6 mb-6">
          {dashboardMetrics.map((metric, index) => (
            <div key={index} className="crm-card">
              <div className="crm-card-content">
                <div className="crm-flex crm-items-center crm-justify-between">
                  <div>
                    <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">
                      {metric.title}
                    </p>
                    <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 ${metric.color} rounded-lg crm-flex crm-items-center justify-center`}>
                    <metric.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="crm-flex crm-items-center mt-3">
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-600 mr-1" />
                  )}
                  <span className={`crm-text-xs crm-font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 crm-gap-6">
          {/* Sales Pipeline */}
          <div className="lg:col-span-2">
            <div className="crm-card">
              <div className="crm-card-header">
                <div className="crm-flex crm-items-center crm-justify-between">
                  <h3 className="crm-text-lg crm-font-semibold text-gray-900">Sales Pipeline</h3>
                  <button className="crm-button crm-button-secondary crm-text-sm">
                    View All
                  </button>
                </div>
              </div>
              <div className="crm-card-content">
                <div className="grid grid-cols-1 md:grid-cols-5 crm-gap-4">
                  {pipelineData.map((stage, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-12 h-12 ${stage.color} rounded-lg crm-flex crm-items-center justify-center mx-auto mb-2`}>
                        <span className="crm-text-lg crm-font-bold text-white">{stage.count}</span>
                      </div>
                      <h4 className="crm-text-sm crm-font-medium text-gray-900 mb-1">{stage.stage}</h4>
                      <p className="crm-text-xs text-gray-500">
                        ${(stage.value / 1000).toFixed(0)}K
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div>
            <div className="crm-card">
              <div className="crm-card-header">
                <div className="crm-flex crm-items-center crm-justify-between">
                  <h3 className="crm-text-lg crm-font-semibold text-gray-900">Upcoming Tasks</h3>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="crm-card-content">
                <div className="crm-space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="crm-flex crm-items-start crm-gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(task.priority).replace('text-', 'bg-')}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="crm-text-sm crm-font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        <p className="crm-text-xs text-gray-500">{task.dueDate}</p>
                      </div>
                      <span className={`crm-text-xs crm-font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-6">
          <div className="crm-card">
            <div className="crm-card-header">
              <div className="crm-flex crm-items-center crm-justify-between">
                <h3 className="crm-text-lg crm-font-semibold text-gray-900">Recent Activities</h3>
                <button className="crm-button crm-button-secondary crm-text-sm">
                  View All
                </button>
              </div>
            </div>
            <div className="crm-card-content">
              <div className="crm-space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="crm-flex crm-items-center crm-gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full crm-flex crm-items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="crm-text-sm text-gray-900">
                          <span className="crm-font-medium">{activity.contact}</span> from{' '}
                          <span className="crm-font-medium">{activity.company}</span>
                        </p>
                        <p className="crm-text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <span className={`crm-badge ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
