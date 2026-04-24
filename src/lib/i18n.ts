export type Language = 'en' | 'ar'

export const translations = {
  en: {
    // App Header
    appTitle: 'HealFounder',
    appSubtitle: 'Build your healthcare startup',
    backToDashboard: 'Back to Dashboard',

    // Dashboard
    yourStartupJourney: 'Your Startup Journey',
    dashboardSubtitle: 'Complete each phase to build your healthcare startup from idea to GitHub',
    startCurrentPhase: 'Start Current Phase',
    continueJourney: 'Continue Journey',

    // Game Stats
    founderLevel: 'Founder Level',
    level: 'Level',
    xpProgress: 'XP Progress',
    xpToNextLevel: 'XP to next level',
    badgesEarned: 'Badges Earned',
    streakDays: 'Day Streak',

    // Badge Showcase
    achievementBadges: 'Achievement Badges',
    achievementBadgesSubtitle: 'Unlock badges as you complete your startup journey',
    earned: 'Earned',
    locked: 'Locked',

    // Phase Navigation
    phases: {
      brainstorm: 'Brainstorm',
      story: 'Story',
      brand: 'Brand',
      prd: 'PRD',
      code: 'Code',
      github: 'GitHub',
    },

    // Brainstorm Phase
    brainstorm: {
      title: 'The Idea Forge',
      subtitle: 'Extract healthcare problems into crisp startup concepts',
      placeholder: 'e.g., My grandmother struggles to remember when to take her medications, leading to hospital readmissions...',
      tryThemes: 'Or try one of these healthcare themes:',
      generateConcepts: 'Generate Related Concepts',
      generating: 'Generating ideas...',
      aiGeneratedConcepts: 'AI-Generated Healthcare Concepts',
      relatedIdeas: 'Review these related ideas and themes',
      originalInput: 'Original input:',
      startOver: 'Start Over',
      refineConcept: 'Refine into Startup Concept',
      refining: 'Refining concept...',
      yourConcept: 'Your Startup Concept',
      reviewFinalize: 'Review and finalize your concept card',
      problem: 'Problem',
      targetUsers: 'Target Users',
      solutionVision: 'Solution Vision',
      completeBrainstorm: 'Complete Brainstorm',
      whatProblem: 'What healthcare problems are you passionate about?',
      describeFrustrations: 'Describe frustrations, unmet needs, or challenges you\'ve observed in healthcare',
    },

    // Story Phase
    story: {
      title: 'The Story Builder',
      subtitle: 'Transform your concept into a compelling founder narrative',
      yourConcept: 'Your Concept',
      chooseStoryTone: 'Choose Your Story Tone',
      selectNarrativeStyle: 'Select the narrative style that fits your vision',
      empathetic: 'Empathetic',
      empatheticDesc: 'Warm, human-centered storytelling that emphasizes patient experiences and emotional impact',
      scientific: 'Scientific',
      scientificDesc: 'Data-driven narrative focusing on evidence, clinical outcomes, and systemic solutions',
      continueToElements: 'Continue to Story Elements',
      fillStoryElements: 'Fill in Your Story Elements',
      fillElementsSubtitle: 'Answer these prompts to build your founder narrative',
      targetPatient: 'Who is the patient or person affected?',
      coreProblem: 'What is the core healthcare problem?',
      realWorldImpact: 'What is the real-world impact?',
      solutionVision: 'What is your solution vision?',
      adjustTone: 'Adjust Narrative Tone',
      generateStory: 'Generate Founder Story',
      generating: 'Generating your story...',
      yourFounderStory: 'Your Founder Story',
      reviewEdit: 'Review and edit your generated narrative',
      aiStoryScore: 'AI Story Quality Score',
      clarity: 'Clarity',
      emotion: 'Emotion',
      healthcare: 'Healthcare',
      excellent: 'Excellent',
      good: 'Good',
      needsWork: 'Needs Work',
      editInputs: 'Edit Inputs',
      regenerate: 'Regenerate',
      completeStory: 'Complete Story Phase',
    },

    // Common
    back: 'Back',
    next: 'Next',
    complete: 'Complete',
    save: 'Save',
    edit: 'Edit',
    cancel: 'Cancel',
    retry: 'Retry',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Celebration
    phaseComplete: 'Phase Complete!',
    congratulations: 'Congratulations! 🎉',
    xpEarned: 'XP Earned',
    badgeUnlocked: 'Badge Unlocked',
    continueToNext: 'Continue to Next Phase',
    viewDashboard: 'View Dashboard',
  },

  ar: {
    // App Header
    appTitle: 'هيل فاوندر',
    appSubtitle: 'ابنِ شركتك الناشئة في الرعاية الصحية',
    backToDashboard: 'العودة للوحة التحكم',

    // Dashboard
    yourStartupJourney: 'رحلة شركتك الناشئة',
    dashboardSubtitle: 'أكمل كل مرحلة لبناء شركتك الناشئة في الرعاية الصحية من الفكرة إلى GitHub',
    startCurrentPhase: 'بدء المرحلة الحالية',
    continueJourney: 'متابعة الرحلة',

    // Game Stats
    founderLevel: 'مستوى المؤسس',
    level: 'مستوى',
    xpProgress: 'تقدم نقاط الخبرة',
    xpToNextLevel: 'نقاط للمستوى التالي',
    badgesEarned: 'الشارات المكتسبة',
    streakDays: 'يوم متتالي',

    // Badge Showcase
    achievementBadges: 'شارات الإنجاز',
    achievementBadgesSubtitle: 'افتح الشارات مع إكمال رحلتك',
    earned: 'مكتسبة',
    locked: 'مقفلة',

    // Phase Navigation
    phases: {
      brainstorm: 'العصف الذهني',
      story: 'القصة',
      brand: 'العلامة التجارية',
      prd: 'وثيقة المتطلبات',
      code: 'الكود',
      github: 'جيت هاب',
    },

    // Brainstorm Phase
    brainstorm: {
      title: 'مصنع الأفكار',
      subtitle: 'استخرج مشكلات الرعاية الصحية إلى مفاهيم شركات ناشئة واضحة',
      placeholder: 'مثال: تعاني جدتي من صعوبة تذكر مواعيد أدويتها مما يؤدي إلى إعادة الاستشفاء...',
      tryThemes: 'أو جرب أحد مواضيع الرعاية الصحية:',
      generateConcepts: 'توليد المفاهيم ذات الصلة',
      generating: 'جارٍ توليد الأفكار...',
      aiGeneratedConcepts: 'المفاهيم الصحية المولّدة بالذكاء الاصطناعي',
      relatedIdeas: 'راجع هذه الأفكار والمواضيع ذات الصلة',
      originalInput: 'المدخل الأصلي:',
      startOver: 'البدء من جديد',
      refineConcept: 'تحسين المفهوم لشركة ناشئة',
      refining: 'جارٍ تحسين المفهوم...',
      yourConcept: 'مفهوم شركتك الناشئة',
      reviewFinalize: 'راجع وأكمل بطاقة مفهومك',
      problem: 'المشكلة',
      targetUsers: 'المستخدمون المستهدفون',
      solutionVision: 'رؤية الحل',
      completeBrainstorm: 'إكمال العصف الذهني',
      whatProblem: 'ما مشكلات الرعاية الصحية التي تهتم بها؟',
      describeFrustrations: 'صف الإحباطات والاحتياجات غير الملباة أو التحديات التي لاحظتها في الرعاية الصحية',
    },

    // Story Phase
    story: {
      title: 'بناء القصة',
      subtitle: 'حوّل مفهومك إلى رواية مؤسس مقنعة',
      yourConcept: 'مفهومك',
      chooseStoryTone: 'اختر نبرة قصتك',
      selectNarrativeStyle: 'اختر أسلوب السرد الذي يناسب رؤيتك',
      empathetic: 'متعاطف',
      empatheticDesc: 'سرد دافئ ومتمحور حول الإنسان يؤكد على تجارب المرضى والتأثير العاطفي',
      scientific: 'علمي',
      scientificDesc: 'رواية مستندة إلى البيانات تركز على الأدلة والنتائج السريرية والحلول المنهجية',
      continueToElements: 'المتابعة لعناصر القصة',
      fillStoryElements: 'املأ عناصر قصتك',
      fillElementsSubtitle: 'أجب على هذه الأسئلة لبناء رواية المؤسس',
      targetPatient: 'من هو المريض أو الشخص المتأثر؟',
      coreProblem: 'ما هي مشكلة الرعاية الصحية الجوهرية؟',
      realWorldImpact: 'ما هو التأثير الفعلي؟',
      solutionVision: 'ما هي رؤيتك للحل؟',
      adjustTone: 'ضبط نبرة السرد',
      generateStory: 'توليد قصة المؤسس',
      generating: 'جارٍ توليد قصتك...',
      yourFounderStory: 'قصة مؤسسك',
      reviewEdit: 'راجع وعدّل روايتك المولّدة',
      aiStoryScore: 'نقاط جودة القصة بالذكاء الاصطناعي',
      clarity: 'الوضوح',
      emotion: 'العاطفة',
      healthcare: 'الرعاية الصحية',
      excellent: 'ممتاز',
      good: 'جيد',
      needsWork: 'يحتاج تحسين',
      editInputs: 'تعديل المدخلات',
      regenerate: 'إعادة التوليد',
      completeStory: 'إكمال مرحلة القصة',
    },

    // Common
    back: 'رجوع',
    next: 'التالي',
    complete: 'اكتمال',
    save: 'حفظ',
    edit: 'تعديل',
    cancel: 'إلغاء',
    retry: 'إعادة المحاولة',
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
    success: 'نجاح',

    // Celebration
    phaseComplete: 'المرحلة مكتملة!',
    congratulations: 'تهانينا! 🎉',
    xpEarned: 'نقاط خبرة مكتسبة',
    badgeUnlocked: 'شارة مفتوحة',
    continueToNext: 'المتابعة للمرحلة التالية',
    viewDashboard: 'عرض لوحة التحكم',
  }
} as const

export type TranslationKey = keyof typeof translations.en
