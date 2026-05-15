import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        pricing: 'Pricing',
        about: 'About',
        search: 'Search insights...',
      },
      dashboard: {
        hero: 'Ignite Your Intelligence',
        heroDesc: 'Drag and drop your complex PDFs or books here to extract crystalline insights instantly with Summarizer AI.',
        createNew: 'Create New Summary',
        uploading: 'Uploading...',
        dropZone: 'Drop your files here',
        dropZoneDesc: 'PDF, DOCX, or EPUB',
      },
      sidebar: {
        newChat: 'New Analysis',
        recent: 'Recent Research',
        library: 'My Library',
        aiLab: 'AI Lab',
        settings: 'Settings',
        help: 'Help Center',
        upgrade: 'Upgrade Pro',
      },
      reader: {
        tutorMode: 'Tutor Mode',
        studyCore: 'Summarizer Study Core',
        distilling: 'AI Distilling...',
        ready: 'Ready to Analyze',
        placeholder: 'Ask anything about this document...',
      },
      landing: {
        title: 'Transform Any Document Into Instant Wisdom.',
        subtitle: 'Harness the power of Summarizer AI to distill complex PDFs and massive books into actionable knowledge instantly.',
        getStarted: 'Get Started for Free',
        viewDemo: 'View Demo',
      },
    },
  },
  fr: {
    translation: {
      nav: {
        dashboard: 'Tableau de bord',
        pricing: 'Tarification',
        about: 'À propos',
        search: 'Rechercher des idées...',
      },
      dashboard: {
        hero: 'Allumez votre intelligence',
        heroDesc: 'Glissez-déposez vos PDF ou livres complexes ici pour extraire instantanément des informations cristallines avec Summarizer AI.',
        createNew: 'Créer un nouveau résumé',
        uploading: 'Téléchargement...',
        dropZone: 'Déposez vos fichiers ici',
        dropZoneDesc: 'PDF, DOCX ou EPUB',
      },
      sidebar: {
        newChat: 'Nouvelle analyse',
        recent: 'Recherche récente',
        library: 'Ma bibliothèque',
        aiLab: 'Laboratoire IA',
        settings: 'Paramètres',
        help: 'Centre d\'aide',
        upgrade: 'Passer à Pro',
      },
      reader: {
        tutorMode: 'Mode tuteur',
        studyCore: 'Cœur d\'étude Summarizer',
        distilling: 'Distillation IA...',
        ready: 'Prêt à analyser',
        placeholder: 'Demandez n\'importe quoi sur ce document...',
      },
      landing: {
        title: 'Transformez n\'importe quel document en sagesse instantanée.',
        subtitle: 'Exploitez la puissance de Summarizer AI pour distiller des PDF complexes et des livres volumineux en connaissances exploitables instantanément.',
        getStarted: 'Commencer gratuitement',
        viewDemo: 'Voir la démo',
      },
    },
  },
  es: {
    translation: {
      nav: {
        dashboard: 'Tablero',
        pricing: 'Precios',
        about: 'Acerca de',
        search: 'Buscar ideas...',
      },
      dashboard: {
        hero: 'Enciende tu inteligencia',
        heroDesc: 'Arrastra y suelta tus PDF o libros complejos aquí para extraer información cristalina al instante con Summarizer AI.',
        createNew: 'Crear nuevo resumen',
        uploading: 'Subiendo...',
        dropZone: 'Suelte sus archivos aquí',
        dropZoneDesc: 'PDF, DOCX o EPUB',
      },
      sidebar: {
        newChat: 'Nuevo análisis',
        recent: 'Investigación reciente',
        library: 'Mi biblioteca',
        aiLab: 'Laboratorio de IA',
        settings: 'Ajustes',
        help: 'Centro de ayuda',
        upgrade: 'Mejorar a Pro',
      },
      reader: {
        tutorMode: 'Modo tutor',
        studyCore: 'Núcleo de estudio Summarizer',
        distilling: 'Destilando IA...',
        ready: 'Listo para analizar',
        placeholder: 'Pregunta cualquier cosa sobre este documento...',
      },
      landing: {
        title: 'Transforme cualquier documento en sabiduría instantánea.',
        subtitle: 'Aproveche el poder de Summarizer AI para sintetizar PDF complejos y libros masivos en conocimiento útil al instante.',
        getStarted: 'Empezar gratis',
        viewDemo: 'Ver demostración',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
