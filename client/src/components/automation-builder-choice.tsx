import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Settings, Sparkles, Zap, ArrowRight, Users, Wrench } from "lucide-react";

interface AutomationBuilderChoiceProps {
  open: boolean;
  onClose: () => void;
  onSelectAIGuided: () => void;
  onSelectAdvanced: () => void;
}

export default function AutomationBuilderChoice({ 
  open, 
  onClose, 
  onSelectAIGuided, 
  onSelectAdvanced 
}: AutomationBuilderChoiceProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl mb-2">
            Choose Your Automation Builder
          </DialogTitle>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Select the interface that best matches your experience level
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* AI-Guided Builder */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-cyan-500 cursor-pointer group"
                onClick={onSelectAIGuided}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">AI-Guided Builder</CardTitle>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Perfect for Beginners</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Let our AI assistant guide you step-by-step through creating powerful automations
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span>Conversational interface with smart questions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span>Automatic integration app selection</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span>No technical knowledge required</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span>Built-in best practice suggestions</span>
                </div>
              </div>

              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Experience
                </div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                  AI asks questions, understands your needs, and creates automations for you
                </p>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white group-hover:shadow-lg transition-all duration-300"
                onClick={onSelectAIGuided}
              >
                Start AI-Guided Setup
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Template Builder */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 cursor-pointer group"
                onClick={onSelectAdvanced}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Template Gallery</CardTitle>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <Wrench className="h-4 w-4" />
                <span>For All Experience Levels</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Choose from pre-built automation templates and customize them to your needs
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>25+ ready-to-use automation templates</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Browse by category and complexity</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Quick preview and one-click setup</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Professional automation patterns</span>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Template-Based Experience
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Browse proven automation templates and customize settings
                </p>
              </div>

              <Button 
                variant="outline"
                className="w-full border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white group-hover:shadow-lg transition-all duration-300"
                onClick={onSelectAdvanced}
              >
                Browse Templates
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          You can always switch between builders later in your automation settings
        </div>
      </DialogContent>
    </Dialog>
  );
}