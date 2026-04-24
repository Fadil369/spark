import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Check, Rocket, Shield, Users, Lightning, Code, Heart } from '@phosphor-icons/react'

export function BrainsaitEnterpriseOffer() {
  return (
    <Card className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 border-0 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
      
      <div className="relative">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/40 backdrop-blur-sm">
                  <Sparkle className="w-3 h-3 mr-1" weight="fill" />
                  EXCLUSIVE OFFER
                </Badge>
                <Badge variant="secondary" className="bg-yellow-400/90 text-yellow-900 border-0 font-bold animate-pulse">
                  LIMITED TIME
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Brainsait Enterprise Partnership
              </CardTitle>
              <CardDescription className="text-white/90 text-base">
                Deploy to a professional enterprise account with advanced features, free hosting, and startup support
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Rocket className="w-10 h-10 text-white" weight="fill" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-white" weight="bold" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enterprise GitHub Organization</h3>
                  <p className="text-sm text-white/80">
                    Deploy to @brainsait-enterprise with unlimited private repos, advanced CI/CD, and team collaboration
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" weight="fill" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">HIPAA-Compliant Hosting</h3>
                  <p className="text-sm text-white/80">
                    Free hosting on AWS/Azure with HIPAA compliance, SSL certificates, and enterprise security
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" weight="fill" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Startup Mentorship Program</h3>
                  <p className="text-sm text-white/80">
                    Monthly 1:1 sessions with healthcare tech advisors, investor intros, and growth strategies
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Lightning className="w-5 h-5 text-white" weight="fill" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Priority AI Credits</h3>
                  <p className="text-sm text-white/80">
                    $500/month in AI credits for GPT-4, Claude, and code generation tools to iterate faster
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-lg p-5 border border-white/30">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5" weight="fill" />
              What's Included (Worth $2,500/month)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Enterprise GitHub Organization access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Free HIPAA-compliant cloud hosting</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Custom domain & SSL certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Automated backups & monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Priority technical support (24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Healthcare startup community access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Investor pitch deck templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Legal & compliance consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Advanced CI/CD pipelines</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300 flex-shrink-0" weight="bold" />
                <span>Access to pre-vetted developer talent</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-5 text-gray-900">
            <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider mb-1">Founder's Special</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-1">
                  100% FREE for First 6 Months
                </h3>
                <p className="text-sm opacity-90">
                  Then just $99/month. Cancel anytime. No credit card required to start.
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-sm font-semibold mb-1">You Save:</div>
                <div className="text-4xl font-bold">$15,000</div>
                <div className="text-xs opacity-75">in the first 6 months</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-sm text-white/70">
            <p className="mb-2">
              <strong className="text-white">Why Brainsait Enterprise?</strong> We're dedicated to empowering healthcare founders with the tools, infrastructure, and support needed to succeed. Our enterprise account is purpose-built for healthcare startups navigating compliance, scaling challenges, and investor expectations.
            </p>
            <p className="text-xs">
              By choosing Brainsait Enterprise, you join a curated community of healthcare innovators, get direct access to mentors who've built and exited healthcare companies, and receive infrastructure that would typically cost thousands per month.
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
