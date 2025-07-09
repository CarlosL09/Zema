import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Settings, Plus, Users, Share, Palette, Code, Workflow } from 'lucide-react';
import logoSrc from '@assets/24_1751668817532.png';

export default function CustomContentSection() {
  return (
    <section id="custom-content" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <div className="flex justify-center mb-6">
            <img 
              src={logoSrc} 
              alt="ZEMA Logo" 
              className="h-16 transition-all duration-500 hover:scale-110 hover:brightness-110 filter drop-shadow-md"
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Build Your Own Automation
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create custom templates and rules tailored to your unique workflow. Share them with the community or keep them private.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Template Builder Feature */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-600">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Custom Template Builder</CardTitle>
                  <Badge variant="secondary" className="mt-1">Visual Designer</Badge>
                </div>
              </div>
              <CardDescription className="text-lg">
                Drag and drop triggers, actions, and conditions to create powerful automation templates. No coding required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Triggers
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Email received/sent</li>
                    <li>• Keyword matching</li>
                    <li>• Time scheduling</li>
                    <li>• Sender patterns</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Actions
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Auto reply</li>
                    <li>• Forward emails</li>
                    <li>• Create tasks</li>
                    <li>• Add labels</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Share className="w-4 h-4" />
                  <span>Share with community</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Track usage stats</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules Builder Feature */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 dark:hover:border-purple-600">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Advanced Rules Engine</CardTitle>
                  <Badge variant="secondary" className="mt-1">Logic Builder</Badge>
                </div>
              </div>
              <CardDescription className="text-lg">
                Write intelligent conditional logic with priority management and complex automation rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Example Rule Logic
                  </h4>
                  <code className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    sender.email.contains("@vip.com") AND<br />
                    subject.includes("urgent") → priority = 5
                  </code>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">Priority</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">1-5 Levels</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-semibold text-green-600 dark:text-green-400">Triggers</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">All/Any Logic</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-semibold text-purple-600 dark:text-purple-400">Actions</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Multi-step</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Palette className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Visual Builder</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Intuitive drag-and-drop interface</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Share className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Community Sharing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Share templates publicly</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Code className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Advanced Logic</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complex conditional rules</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Usage Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track template performance</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            onClick={() => window.location.href = '/automation-templates'}
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Building Custom Templates
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Join thousands of users creating custom automation workflows
          </p>
        </div>
      </div>
    </section>
  );
}