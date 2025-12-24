import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { 
  Users, 
  FolderKanban, 
  Receipt, 
  Clock, 
  Wrench,
  CheckCircle2,
  ArrowRight,
  Shield,
  BarChart3,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  // If user is already logged in, redirect to dashboard
  // This is handled by middleware, but we keep this as a fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo size="md" showText={true} />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm sm:text-base">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="gradient-primary text-white text-sm sm:text-base">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent px-4">
            Complete Construction Management Solution
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4">
            Streamline your construction projects with our all-in-one platform. 
            Manage projects, track time, handle invoices, and collaborate with your team—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="gradient-primary text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto shadow-md">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Everything You Need</h2>
          <p className="text-gray-600 text-base sm:text-lg">Powerful features to manage your construction business</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <FolderKanban className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Project Management</h3>
            <p className="text-gray-600">Track projects from planning to completion with phases, budgets, and timelines.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Invoicing & Quotes</h3>
            <p className="text-gray-600">Generate professional quotes and invoices with PDF export capabilities.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Time Tracking</h3>
            <p className="text-gray-600">Track employee hours, approve timesheets, and calculate labor costs.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Equipment Management</h3>
            <p className="text-gray-600">Track equipment, schedule maintenance, and monitor usage across projects.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">Get insights with comprehensive analytics and detailed reporting.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Real-time chat, file sharing, and seamless team communication.</p>
          </div>
        </div>
      </section>

      {/* Admin Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Admin Features</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Advanced Administration</h2>
            <p className="text-gray-600 text-lg mb-8">
              Admin users have access to powerful management tools and system-wide controls
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">User Management</h3>
                  <p className="text-gray-600 text-sm">Manage team members, assign roles, and control access</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">System Settings</h3>
                  <p className="text-gray-600 text-sm">Configure company settings, preferences, and integrations</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Advanced Analytics</h3>
                  <p className="text-gray-600 text-sm">Access detailed reports and system-wide analytics</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Data Management</h3>
                  <p className="text-gray-600 text-sm">Export data, manage backups, and system maintenance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <Zap className="h-12 w-12 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of construction companies managing their projects efficiently
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Construction Manager</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/login" className="hover:text-blue-600">Sign In</Link>
              <Link href="/register" className="hover:text-blue-600">Register</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            © 2024 Construction Manager. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
