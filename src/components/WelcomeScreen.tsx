import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb, BookOpen, Palette, FileText, Code, GithubLogo } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion } from 'framer-motion'
import { SparkLogo } from '@/components/SparkLogo'

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { t } = useLanguage()
  const p = t.phases
  const w = t.welcome

  const phaseCards = [
    { icon: Lightbulb, name: p.brainstorm, desc: w.phaseBrainstorm },
    { icon: BookOpen, name: p.story, desc: w.phaseStory },
    { icon: Palette, name: p.brand, desc: w.phaseBrand },
    { icon: FileText, name: p.prd, desc: w.phasePrd },
    { icon: Code, name: p.code, desc: w.phaseCode },
    { icon: GithubLogo, name: p.github, desc: w.phaseGithub },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary-foreground/20 mb-6 shadow-xl"
          >
            <SparkLogo animated className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold font-heading mb-4"
          >
            {w.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {w.subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
        >
          {phaseCards.map((phase, index) => (
            <motion.div
              key={phase.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                    <phase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{phase.name}</h3>
                  <p className="text-sm text-muted-foreground">{phase.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>{w.aiPowered}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>{w.gamifiedProgress}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>{w.bilingualSupport}</span>
            </div>
          </div>

          <Button size="lg" onClick={onStart} className="text-lg px-8 py-6 gap-2">
            <SparkLogo className="w-5 h-5" />
            {w.startJourney}
          </Button>

          <p className="text-xs text-muted-foreground">
            {w.autoSave}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
