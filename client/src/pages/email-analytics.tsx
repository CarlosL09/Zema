import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  Activity,
  Zap,
  Brain,
  MessageSquare,
  Mail
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Demo data for email analytics
const emailVolumeData = [
  { date: '2025-01-01', sent: 45, received: 67, automated: 12 },
  { date: '2025-01-02', sent: 52, received: 71, automated: 18 },
  { date: '2025-01-03', sent: 48, received: 63, automated: 15 },
  { date: '2025-01-04', sent: 61, received: 89, automated: 22 },
  { date: '2025-01-05', sent: 55, received: 76, automated: 19 },
  { date: '2025-01-06', sent: 43, received: 58, automated: 14 },
  { date: '2025-01-07', sent: 38, received: 52, automated: 11 }
];

const responseTimeData = [
  { hour: '09:00', avgResponse: 23, bestResponse: 8 },
  { hour: '10:00', avgResponse: 18, bestResponse: 5 },
  { hour: '11:00', avgResponse: 31, bestResponse: 12 },
  { hour: '12:00', avgResponse: 45, bestResponse: 18 },
  { hour: '13:00', avgResponse: 52, bestResponse: 22 },
  { hour: '14:00', avgResponse: 28, bestResponse: 9 },
  { hour: '15:00', avgResponse: 22, bestResponse: 7 },
  { hour: '16:00', avgResponse: 19, bestResponse: 6 }
];

const contactEngagementData = [
  { name: 'High Engagement', value: 28, color: '#10b981' },
  { name: 'Medium Engagement', value: 45, color: '#f59e0b' },
  { name: 'Low Engagement', value: 20, color: '#ef4444' },
  { name: 'No Response', value: 7, color: '#6b7280' }
];

const topContacts = [
  { name: 'Sarah Johnson', email: 'sarah@techcorp.com', exchanges: 47, responseRate: 92, avgResponseTime: '2.3h' },
  { name: 'Mike Chen', email: 'mike@startupxyz.com', exchanges: 39, responseRate: 88, avgResponseTime: '4.1h' },
  { name: 'Emily Davis', email: 'emily@consulting.co', exchanges: 33, responseRate: 94, avgResponseTime: '1.8h' },
  { name: 'David Wilson', email: 'david@enterprise.net', exchanges: 28, responseRate: 76, avgResponseTime: '6.2h' },
  { name: 'Lisa Brown', email: 'lisa@agency.com', exchanges: 24, responseRate: 89, avgResponseTime: '3.5h' }
];

const automationInsights = [
  {
    type: 'Smart Filters',
    processed: 156,
    accuracy: 94,
    timeSaved: '3.2h',
    description: 'Automatically categorized emails by importance and project'
  },
  {
    type: 'Auto Responses',
    processed: 89,
    accuracy: 97,
    timeSaved: '2.1h',
    description: 'Generated contextual replies for common inquiries'
  },
  {
    type: 'Meeting Scheduling',
    processed: 23,
    accuracy: 91,
    timeSaved: '1.8h',
    description: 'Automatically scheduled meetings and sent calendar invites'
  },
  {
    type: 'Follow-up Reminders',
    processed: 45,
    accuracy: 88,
    timeSaved: '1.5h',
    description: 'Tracked pending responses and sent timely follow-ups'
  }
];

export default function EmailAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Email Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Deep insights into your email communication patterns and AI automation performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% vs last week</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Automation Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">73%</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% vs last week</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">2.4h</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">-18% vs last week</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Saved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">8.6h</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+15% vs last week</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="volume" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="volume">Email Volume</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="contacts">Top Contacts</TabsTrigger>
            <TabsTrigger value="automation">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Email Volume Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={emailVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="received" stroke="#3b82f6" strokeWidth={2} name="Received" />
                    <Line type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} name="Sent" />
                    <Line type="monotone" dataKey="automated" stroke="#f59e0b" strokeWidth={2} name="Automated" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Response Time Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgResponse" fill="#3b82f6" name="Average Response (min)" />
                      <Bar dataKey="bestResponse" fill="#10b981" name="Best Response (min)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contact Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={contactEngagementData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {contactEngagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Performing Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-gray-900 dark:text-white">{contact.exchanges}</p>
                          <p className="text-gray-600 dark:text-gray-400">Exchanges</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-900 dark:text-white">{contact.responseRate}%</p>
                          <p className="text-gray-600 dark:text-gray-400">Response Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-900 dark:text-white">{contact.avgResponseTime}</p>
                          <p className="text-gray-600 dark:text-gray-400">Avg Response</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {automationInsights.map((insight, index) => (
                <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {insight.type}
                      </span>
                      <Badge variant="secondary">{insight.accuracy}% Accurate</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processed</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{insight.processed}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Saved</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{insight.timeSaved}</p>
                      </div>
                    </div>
                    <Progress value={insight.accuracy} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}