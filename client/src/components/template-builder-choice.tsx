import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Settings, Sparkles, Zap, ArrowRight, Users, Wrench, FileText, Code } from "lucide-react";

interface TemplateBuilderChoiceProps {
  open: boolean;
  onClose: () => void;
  onSelectAIGuided: () => void;
  onSelectAdvanced: () => void;
}

export default function TemplateBuilderChoice({ 
  open, 
  onClose, 
  onSelectAIGuided, 
  onSelectAdvanced 
}: TemplateBuilderChoiceProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl mb-2">
            Choose Your Template Builder
          </DialogTitle>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Select how you'd like to create your email template
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* AI-Guided Template Builder */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 cursor-pointer group"
                onClick={onSelectAIGuided}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">AI-Guided Builder</CardTitle>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Perfect for Everyone</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Let AI guide you through creating professional email templates step-by-step
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Conversational template creation</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Smart platform integration selection</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Professional email structure suggestions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Industry best practices included</span>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Creation
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  AI helps you create templates for customer service, sales, meetings, and more
                </p>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white group-hover:shadow-lg transition-all duration-300"
                onClick={onSelectAIGuided}
              >
                Start AI-Guided Creation
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Template Builder */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-500 cursor-pointer group"
                onClick={onSelectAdvanced}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Code className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Advanced Builder</CardTitle>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <Wrench className="h-4 w-4" />
                <span>For Power Users</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Build custom templates with full control over structure, variables, and integrations
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Custom template structure builder</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Dynamic variable and placeholder system</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Multi-platform integration setup</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Advanced conditional logic</span>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Form-Based Builder
                </div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  Complete control over template structure with detailed configuration options
                </p>
              </div>

              <Button 
                variant="outline"
                className="w-full border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white group-hover:shadow-lg transition-all duration-300"
                onClick={onSelectAdvanced}
              >
                Open Advanced Builder
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Both builders create reusable templates that can be shared with your team
        </div>
      </DialogContent>
    </Dialog>
  );
}