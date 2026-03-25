import Link from "next/link";
import { Mail, Tag, Sparkles, Zap, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, BarChart3, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <header className="px-4 lg:px-6 h-20 flex items-center border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center" href="/">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-black tracking-tighter text-gray-900 uppercase">Elevate Business</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-8">
          <Link className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors" href="/login">
            Login
          </Link>
          <Link
            className="text-sm font-black bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
            href="/register"
          >
            Scale Now
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest animate-pulse">
                <Sparkles className="h-3 w-3" />
                Built for High-Volume Business Owners
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-gray-900 leading-tight">
                  Stop Drowning in <span className="text-indigo-600">Customer Emails.</span> Start Scaling.
                </h1>
                <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl font-medium leading-relaxed">
                  Handling Ecommerce, Amazon, or Shopify stores? Don't let 500+ daily emails kill your growth. Elevate Business AI automates your inbox so you can focus on ROI, not replies.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-indigo-600 px-10 text-base font-black text-white shadow-2xl shadow-indigo-300 transition-all hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
                >
                  Automate My Inbox
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-gray-100 bg-white px-10 text-base font-bold text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-200 active:scale-95"
                >
                  Watch Demo
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-50 grayscale hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">Shopify</div>
                <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">Amazon</div>
                <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">E-commerce</div>
                <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">Dropshipping</div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Prop Section */}
        <section className="w-full py-24 bg-gray-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-black tracking-tighter sm:text-5xl leading-tight">
                  The "Frustration-Free" Email Workflow for Founders
                </h2>
                <p className="text-gray-400 text-lg font-medium leading-relaxed">
                  As an online business owner, your time is worth $500/hr. Why are you spending it manually typing "Where is my order?" or "Is this in stock?"
                </p>
                <div className="space-y-4">
                  {[
                    "Auto-classify Support, Returns, and Pre-sale inquiries.",
                    "Generate hyper-professional replies in your brand voice.",
                    "Link multiple Gmail accounts for all your stores.",
                    "Reduce response time from 24 hours to 24 seconds."
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 bg-indigo-500/20 p-1 rounded-md">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                      </div>
                      <span className="font-bold text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm hover:border-indigo-500/50 transition-colors">
                    <TrendingUp className="h-8 w-8 text-indigo-400 mb-4" />
                    <h3 className="text-xl font-black mb-2">90% Less Time</h3>
                    <p className="text-gray-400 text-sm font-medium">On customer support emails daily.</p>
                  </div>
                  <div className="bg-gray-800/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm hover:border-indigo-500/50 transition-colors">
                    <BarChart3 className="h-8 w-8 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-black mb-2">Higher ROI</h3>
                    <p className="text-gray-400 text-sm font-medium">Faster replies mean higher conversion rates.</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-gray-800/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm hover:border-indigo-500/50 transition-colors">
                    <Users className="h-8 w-8 text-indigo-400 mb-4" />
                    <h3 className="text-xl font-black mb-2">Pro Quality</h3>
                    <p className="text-gray-400 text-sm font-medium">AI that sounds more human than a template.</p>
                  </div>
                  <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 group cursor-pointer overflow-hidden relative">
                    <Sparkles className="absolute top-0 right-0 h-24 w-24 text-white/10 -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black mb-2">Pure AI</h3>
                    <p className="text-indigo-100 text-sm font-medium italic">"The secret weapon for Shopify millionaires."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Authority Section */}
        <section className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <h2 className="text-3xl font-black tracking-tighter sm:text-5xl text-gray-900 leading-tight">
                Enterprise-Grade Security
              </h2>
              <p className="max-w-[700px] text-gray-500 font-medium text-lg">
                We know your data is your business. We never sell, store, or train on your customer data.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center space-y-4">
                <ShieldCheck className="h-12 w-12 text-indigo-600" />
                <h3 className="text-xl font-black">Official Google OAuth</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Click "Trust Authors" during setup to grant secure, encrypted access to your inbox. You remain in full control.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center space-y-4">
                <Zap className="h-12 w-12 text-indigo-600" />
                <h3 className="text-xl font-black">Real-time Sync</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Our engine scans your inbox instantly, classifying every message so you never miss an urgent order update.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center space-y-4">
                <Sparkles className="h-12 w-12 text-indigo-600" />
                <h3 className="text-xl font-black">Multi-Store Support</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Manage accounts for 10+ Shopify stores in one unified dashboard. Switch between accounts seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 bg-indigo-600 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
            <div className="space-y-8 max-w-3xl mx-auto">
              <h2 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl text-white leading-tight">
                Don't Let Another Day Go by in Email Debt.
              </h2>
              <p className="mx-auto max-w-[600px] text-indigo-50 font-bold text-xl leading-relaxed">
                Elevate your business today. Join the elite founders who chose intelligence over manual labor.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex h-16 items-center justify-center rounded-2xl bg-white px-12 text-lg font-black text-indigo-600 shadow-2xl transition-all hover:bg-gray-50 hover:-translate-y-1 active:scale-95"
                >
                  Start Scaling Now
                </Link>
                <div className="text-white/80 text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  No Credit Card Required
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Link className="flex items-center" href="/">
                <div className="bg-indigo-600 p-1 rounded-md">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-lg font-black tracking-tighter uppercase text-gray-900">Elevate Business</span>
              </Link>
              <p className="text-xs font-bold text-gray-400">© 2026 Elevate Business AI. All rights reserved.</p>
            </div>
            <nav className="flex gap-8">
              <Link className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors" href="#">
                Terms
              </Link>
              <Link className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors" href="#">
                Privacy
              </Link>
              <Link className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors" href="#">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
