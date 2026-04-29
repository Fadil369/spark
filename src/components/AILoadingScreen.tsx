import { useState, useEffect } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'

const HEALTHCARE_FACTS_EN = [
  'Over 125,000 deaths annually are attributed to medication non-adherence.',
  'The global digital health market is projected to reach $660 billion by 2025.',
  'Telehealth usage has grown 38x since before the COVID-19 pandemic.',
  'AI in healthcare is expected to save $150 billion annually by 2026.',
  'About 80% of healthcare data is unstructured—a key opportunity for AI.',
  'The average hospital stay costs more than $2,800 per day in the U.S.',
  'Remote patient monitoring can reduce hospital readmissions by up to 76%.',
  'Mental health disorders affect 1 in 4 people worldwide.',
  'Preventable medical errors cause 250,000+ deaths per year in the U.S.',
  'Only 12% of U.S. adults have proficient health literacy.',
]

const HEALTHCARE_FACTS_AR = [
  'يُعزى ما يزيد على 125,000 حالة وفاة سنوياً إلى عدم الالتزام بتناول الأدوية.',
  'من المتوقع أن يصل سوق الصحة الرقمية العالمي إلى 660 مليار دولار بحلول عام 2025.',
  'نما استخدام الرعاية الصحية عن بُعد 38 ضعفاً منذ ما قبل جائحة كوفيد-19.',
  'من المتوقع أن يوفر الذكاء الاصطناعي في الرعاية الصحية 150 مليار دولار سنوياً بحلول 2026.',
  'نحو 80٪ من بيانات الرعاية الصحية غير منظمة — وهو فرصة رئيسية للذكاء الاصطناعي.',
  'تكلف الإقامة الاستشفائية أكثر من 2,800 دولار يومياً في الولايات المتحدة.',
  'يمكن لمراقبة المرضى عن بُعد أن تقلل من معدلات إعادة الاستشفاء بنسبة تصل إلى 76٪.',
  'تؤثر اضطرابات الصحة النفسية على 1 من كل 4 أشخاص في العالم.',
  'تتسبب الأخطاء الطبية القابلة للوقاية في أكثر من 250,000 حالة وفاة سنوياً في الولايات المتحدة.',
  'فقط 12٪ من البالغين الأمريكيين يمتلكون مهارات محو الأمية الصحية الكاملة.',
]

interface AILoadingScreenProps {
  isVisible: boolean
  language?: 'en' | 'ar'
  message?: string
}

export function AILoadingScreen({ isVisible, language = 'en', message }: AILoadingScreenProps) {
  const { t } = useLanguage()
  const facts = language === 'ar' ? HEALTHCARE_FACTS_AR : HEALTHCARE_FACTS_EN
  const [currentFactIndex, setCurrentFactIndex] = useState(() => Math.floor(Math.random() * facts.length))
  const [fade, setFade] = useState(true)

  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentFactIndex((i) => (i + 1) % facts.length)
        setFade(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [isVisible, facts.length])

  if (!isVisible) return null

  const defaultMessage = language === 'ar' ? 'الذكاء الاصطناعي يعمل...' : 'AI is working its magic...'
  const didYouKnow = language === 'ar' ? 'هل تعلم؟' : 'Did You Know?'

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkle weight="fill" className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '1.5s' }} />
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">{message || defaultMessage}</p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-md">
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
          {didYouKnow}
        </p>
        <p
          className="text-sm text-muted-foreground italic leading-relaxed transition-opacity duration-400"
          style={{ opacity: fade ? 1 : 0 }}
        >
          "{facts[currentFactIndex]}"
        </p>
      </div>
    </div>
  )
}
