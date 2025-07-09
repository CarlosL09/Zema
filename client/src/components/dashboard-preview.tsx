import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Mail, 
  Clock, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import zemaLogo from "@assets/41_1751750660031.png";

const dashboardFeatures = [
  {
    title: "Email Analytics Dashboard",
    description: "Comprehensive insights into email performance and engagement patterns",
    icon: <BarChart3 className="w-6 h-6" />,
    features: ["Volume tracking", "Response time analysis", "Engagement metrics", "Visual charts"]
  },
  {
    title: "Smart Email Composer", 
    description: "AI-powered email generation with tone and purpose customization",
    icon: <Mail className="w-6 h-6" />,
    features: ["6 tone styles", "Purpose templates", "Real-time suggestions", "Content optimization"]
  },
  {
    title: "Team Collaboration",
    description: "Share automation rules and collaborate on email strategies",
    icon: <Users className="w-6 h-6" />,
    features: ["Rule sharing", "Member roles", "Activity tracking", "Performance analytics"]
  },
  {
    title: "Advanced Security Center",
    description: "AI-powered threat detection and comprehensive email protection",
    icon: <Shield className="w-6 h-6" />,
    features: ["Real-time scanning", "Threat quarantine", "Custom security rules", "Risk analysis"]
  },
  {
    title: "Automation Control Center",
    description: "Visual workflow builder with drag-and-drop automation rules",
    icon: <Zap className="w-6 h-6" />,
    features: ["Visual rule builder", "500+ templates", "Success tracking", "Error monitoring"]
  },
  {
    title: "Calendar Integration",
    description: "Seamless scheduling and meeting management",
    icon: <Calendar className="w-6 h-6" />,
    features: ["Meeting scheduling", "Calendar sync", "Availability tracking", "Conflict detection"]
  }
];

const mockStats = [
  { label: "Emails Processed", value: "12,847", change: "+15%", positive: true },
  { label: "Time Saved", value: "247 hrs", change: "+23%", positive: true },
  { label: "Automation Success", value: "94.2%", change: "+2.1%", positive: true },
  { label: "Security Threats Blocked", value: "89", change: "-12%", positive: true }
];

const mockActivities = [
  { type: "automation", title: "Smart Classifier processed 45 emails", time: "2 minutes ago", status: "success" },
  { type: "security", title: "Phishing attempt blocked", time: "15 minutes ago", status: "warning" },
  { type: "integration", title: "Salesforce sync completed", time: "1 hour ago", status: "success" },
  { type: "ai", title: "AI suggested 3 new automation rules", time: "2 hours ago", status: "info" }
];

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="py-20 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <img 
              src={zemaLogo} 
              alt="ZEMA" 
              className="h-20 md:h-24 lg:h-32 w-auto opacity-90 brightness-105 drop-shadow-lg hover:opacity-100 hover:scale-105 transition-all duration-500"
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold text-white mb-4"
          >
            See Exactly How Much Time You're Saving
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white max-w-3xl mx-auto mb-8"
          >
            Track your productivity gains with detailed analytics showing <strong>hours saved, emails processed, and stress reduced</strong>. Monitor multiple email accounts, security threats blocked, and automation success rates—all from one beautiful dashboard.
          </motion.p>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {mockStats.map((stat, index) => (
            <Card key={stat.label} className="text-center">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm">{stat.label}</CardDescription>
                <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={stat.positive ? "default" : "secondary"} className="text-xs">
                  {stat.change} this week
                </Badge>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Dashboard Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {dashboardFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-3">
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg mr-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Live Activity Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-6 h-6 mr-3 text-cyan-500" />
              Live Activity Feed
            </h3>
            <Badge variant="outline" className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
          </div>
          
          <div className="space-y-4">
            {mockActivities.map((activity, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`p-2 rounded-full mr-4 ${
                  activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                  activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {activity.type === 'automation' && <Zap className="w-4 h-4 text-green-600" />}
                  {activity.type === 'security' && <Shield className="w-4 h-4 text-yellow-600" />}
                  {activity.type === 'integration' && <Target className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'ai' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
                <Badge variant={
                  activity.status === 'success' ? 'default' :
                  activity.status === 'warning' ? 'destructive' : 'secondary'
                } className="text-xs">
                  {activity.status === 'success' ? 'Success' :
                   activity.status === 'warning' ? 'Alert' : 'Info'}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>


      </div>
    </section>
  );
}