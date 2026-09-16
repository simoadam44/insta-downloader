export const LOCALES = ['en', 'ar', 'es', 'fr', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  es: 'Español',
  fr: 'Français',
  pt: 'Português'
};

export const RTL_LOCALES: Locale[] = ['ar'];

export function isValidLocale(l: string): l is Locale {
  return (LOCALES as readonly string[]).includes(l);
}

// ---- Tools ----
export const TOOLS = [
  'video-downloader',
  'photo-downloader',
  'reels-downloader',
  'story-saver',
  'highlights-downloader'
] as const;
export type ToolSlug = (typeof TOOLS)[number];

export const TOOL_KEYS: Record<ToolSlug, string> = {
  'video-downloader': 'video',
  'photo-downloader': 'photo',
  'reels-downloader': 'reels',
  'story-saver': 'story',
  'highlights-downloader': 'highlights'
};

type Dict = Record<string, string>;

const en: Dict = {
  'nav.video': 'Video',
  'nav.photo': 'Photo',
  'nav.reels': 'Reels',
  'nav.story': 'Story',
  'nav.highlights': 'Highlights',
  'hero.video.title': 'Instagram Video Downloader',
  'hero.photo.title': 'Instagram Photo Downloader',
  'hero.reels.title': 'Instagram Reels Downloader',
  'hero.story.title': 'Instagram Story Saver',
  'hero.highlights.title': 'Instagram Highlights Downloader',
  'hero.subtitle': 'Download photos, videos, Reels, Stories & Highlights in HD. Free, fast, no login.',
  'hero.placeholder': 'Paste link here',
  'hero.paste': 'Paste',
  'hero.download': 'DOWNLOAD',
  'hero.clear': 'Clear input',
  'how.title': 'How to download from Instagram?',
  'how.s1.t': '1. Copy URL',
  'how.s1.d': 'Open the Instagram app or website, go to the post you want to download, and copy the URL.',
  'how.s2.t': '2. Paste the link',
  'how.s2.d': 'Return to this website, paste the link into the input field at the top of the page, and press Download.',
  'how.s3.t': '3. Download file',
  'how.s3.d': 'View the results and locate the file you want. Click Download. Done! The file is saved to your device.',
  'app.title': 'Download with mobile app',
  'app.desc': 'Only for Android: Download any photos, videos, reels, IGTV in one click! Fast, high-resolution downloads without watermarks.',
  'app.cta': 'Install now',
  'why.title': 'Why SSSInstagram?',
  'why.f1.t': 'Unlimited Downloads',
  'why.f1.d': 'No restrictions! Download photos, videos, Reels, IGTV, Highlights in high quality and original resolution.',
  'why.f2.t': '100% Anonymous',
  'why.f2.d': 'Browse and download from Instagram completely anonymously! Our service does not collect your data.',
  'why.f3.t': 'Fast, Secure, and Free',
  'why.f3.d': 'Works on any web browser and device. Our service is fully automatic and free.',
  'faq.title': 'FAQ',
  'footer.rights': 'All rights reserved.',
  'footer.disclaimer': 'Disclaimer: This tool is for personal use only. Respect copyright and Instagram ToS.'
};

const ar: Dict = {
  'nav.video': 'فيديو',
  'nav.photo': 'صورة',
  'nav.reels': 'ريلز',
  'nav.story': 'ستوري',
  'nav.highlights': 'هايلايت',
  'hero.video.title': 'تحميل فيديو انستقرام',
  'hero.photo.title': 'تحميل صور انستقرام',
  'hero.reels.title': 'تحميل ريلز انستقرام',
  'hero.story.title': 'حفظ ستوري انستقرام',
  'hero.highlights.title': 'تحميل هايلايت انستقرام',
  'hero.subtitle': 'حمّل الصور والفيديو والريلز والستوري بجودة HD. مجاني وسريع وبدون تسجيل.',
  'hero.placeholder': 'الصق الرابط هنا',
  'hero.paste': 'لصق',
  'hero.download': 'تحميل',
  'hero.clear': 'مسح',
  'how.title': 'كيف تحمل من انستقرام؟',
  'how.s1.t': '١. انسخ الرابط',
  'how.s1.d': 'افتح انستقرام وانتقل إلى المنشور ثم انسخ الرابط.',
  'how.s2.t': '٢. الصق الرابط',
  'how.s2.d': 'ارجع إلى هنا والصق الرابط في الحقل بالأعلى واضغط تحميل.',
  'how.s3.t': '٣. حمّل الملف',
  'how.s3.d': 'شاهد النتائج واضغط زر التحميل. تم! تم حفظ الملف على جهازك.',
  'app.title': 'حمّل مع تطبيق الموبايل',
  'app.desc': 'للأندرويد فقط: حمّل الصور والفيديو والريلز بضغطة واحدة وبجودة عالية وبدون علامة مائية.',
  'app.cta': 'ثبّت الآن',
  'why.title': 'لماذا SSSInstagram؟',
  'why.f1.t': 'تحميل غير محدود',
  'why.f1.d': 'بدون قيود! حمّل بجودة عالية والدقة الأصلية.',
  'why.f2.t': 'مجهول 100%',
  'why.f2.d': 'تصفح وحمّل بشكل مجهول تمامًا. لا نجمع بياناتك.',
  'why.f3.t': 'سريع وآمن ومجاني',
  'why.f3.d': 'يعمل على أي متصفح وجهاز. الخدمة تلقائية ومجانية.',
  'faq.title': 'الأسئلة الشائعة',
  'footer.rights': 'جميع الحقوق محفوظة.',
  'footer.disclaimer': 'تنبيه: هذه الأداة للاستخدام الشخصي فقط. احترم حقوق النشر.'
};

const es: Dict = {
  'nav.video': 'Video',
  'nav.photo': 'Foto',
  'nav.reels': 'Reels',
  'nav.story': 'Historia',
  'nav.highlights': 'Destacados',
  'hero.video.title': 'Descargador de videos de Instagram',
  'hero.photo.title': 'Descargador de fotos de Instagram',
  'hero.reels.title': 'Descargador de Reels de Instagram',
  'hero.story.title': 'Guardar historias de Instagram',
  'hero.highlights.title': 'Descargador de destacados de Instagram',
  'hero.subtitle': 'Descarga fotos, videos, Reels, Historias y Destacados en HD. Gratis, rápido, sin login.',
  'hero.placeholder': 'Pega el enlace aquí',
  'hero.paste': 'Pegar',
  'hero.download': 'DESCARGAR',
  'hero.clear': 'Borrar',
  'how.title': '¿Cómo descargar de Instagram?',
  'how.s1.t': '1. Copia la URL',
  'how.s1.d': 'Abre Instagram, ve a la publicación y copia la URL.',
  'how.s2.t': '2. Pega el enlace',
  'how.s2.d': 'Vuelve aquí, pega el enlace arriba y pulsa Descargar.',
  'how.s3.t': '3. Descarga el archivo',
  'how.s3.d': 'Mira los resultados y haz clic en Descargar. ¡Listo!',
  'app.title': 'Descarga con la app móvil',
  'app.desc': 'Solo Android: descarga fotos, videos y reels en un clic, en alta resolución y sin marca de agua.',
  'app.cta': 'Instalar ahora',
  'why.title': '¿Por qué SSSInstagram?',
  'why.f1.t': 'Descargas ilimitadas',
  'why.f1.d': '¡Sin restricciones! Descarga en alta calidad y resolución original.',
  'why.f2.t': '100% Anónimo',
  'why.f2.d': 'Navega y descarga de forma totalmente anónima. No recogemos tus datos.',
  'why.f3.t': 'Rápido, seguro y gratis',
  'why.f3.d': 'Funciona en cualquier navegador y dispositivo. Automático y gratis.',
  'faq.title': 'Preguntas frecuentes',
  'footer.rights': 'Todos los derechos reservados.',
  'footer.disclaimer': 'Aviso: solo uso personal. Respeta los derechos de autor.'
};

const fr: Dict = {
  'nav.video': 'Vidéo',
  'nav.photo': 'Photo',
  'nav.reels': 'Reels',
  'nav.story': 'Story',
  'nav.highlights': 'À la une',
  'hero.video.title': 'Téléchargeur de vidéos Instagram',
  'hero.photo.title': 'Téléchargeur de photos Instagram',
  'hero.reels.title': 'Téléchargeur de Reels Instagram',
  'hero.story.title': 'Enregistreur de Story Instagram',
  'hero.highlights.title': 'Téléchargeur de Highlights Instagram',
  'hero.subtitle': 'Téléchargez photos, vidéos, Reels, Stories et Highlights en HD. Gratuit, rapide, sans login.',
  'hero.placeholder': 'Collez le lien ici',
  'hero.paste': 'Coller',
  'hero.download': 'TÉLÉCHARGER',
  'hero.clear': 'Effacer',
  'how.title': 'Comment télécharger depuis Instagram ?',
  'how.s1.t': '1. Copiez l’URL',
  'how.s1.d': 'Ouvrez Instagram, allez à la publication et copiez l’URL.',
  'how.s2.t': '2. Collez le lien',
  'how.s2.d': 'Revenez ici, collez le lien en haut et appuyez sur Télécharger.',
  'how.s3.t': '3. Téléchargez le fichier',
  'how.s3.d': 'Voir les résultats et cliquez sur Télécharger. Terminé !',
  'app.title': 'Télécharger avec l’app mobile',
  'app.desc': 'Android uniquement : téléchargez photos, vidéos et reels en un clic, haute résolution, sans filigrane.',
  'app.cta': 'Installer',
  'why.title': 'Pourquoi SSSInstagram ?',
  'why.f1.t': 'Téléchargements illimités',
  'why.f1.d': 'Sans restrictions ! Haute qualité et résolution d’origine.',
  'why.f2.t': '100% Anonyme',
  'why.f2.d': 'Naviguez et téléchargez anonymement. Nous ne collectons pas vos données.',
  'why.f3.t': 'Rapide, sécurisé, gratuit',
  'why.f3.d': 'Fonctionne sur tout navigateur et appareil. Automatique et gratuit.',
  'faq.title': 'FAQ',
  'footer.rights': 'Tous droits réservés.',
  'footer.disclaimer': 'Avis : usage personnel uniquement. Respectez le droit d’auteur.'
};

const pt: Dict = {
  'nav.video': 'Vídeo',
  'nav.photo': 'Foto',
  'nav.reels': 'Reels',
  'nav.story': 'Story',
  'nav.highlights': 'Destaques',
  'hero.video.title': 'Baixador de vídeos do Instagram',
  'hero.photo.title': 'Baixador de fotos do Instagram',
  'hero.reels.title': 'Baixador de Reels do Instagram',
  'hero.story.title': 'Salvar Stories do Instagram',
  'hero.highlights.title': 'Baixador de Destaques do Instagram',
  'hero.subtitle': 'Baixe fotos, vídeos, Reels, Stories e Destaques em HD. Grátis, rápido, sem login.',
  'hero.placeholder': 'Cole o link aqui',
  'hero.paste': 'Colar',
  'hero.download': 'BAIXAR',
  'hero.clear': 'Limpar',
  'how.title': 'Como baixar do Instagram?',
  'how.s1.t': '1. Copie a URL',
  'how.s1.d': 'Abra o Instagram, vá até a publicação e copie a URL.',
  'how.s2.t': '2. Cole o link',
  'how.s2.d': 'Volte aqui, cole o link no topo e pressione Baixar.',
  'how.s3.t': '3. Baixe o arquivo',
  'how.s3.d': 'Veja os resultados e clique em Baixar. Pronto!',
  'app.title': 'Baixe com o app móvel',
  'app.desc': 'Só Android: baixe fotos, vídeos e reels em um clique, alta resolução e sem marca d’água.',
  'app.cta': 'Instalar agora',
  'why.title': 'Por que SSSInstagram?',
  'why.f1.t': 'Downloads ilimitados',
  'why.f1.d': 'Sem restrições! Baixe em alta qualidade e resolução original.',
  'why.f2.t': '100% Anônimo',
  'why.f2.d': 'Navegue e baixe de forma totalmente anônima. Não coletamos dados.',
  'why.f3.t': 'Rápido, seguro e grátis',
  'why.f3.d': 'Funciona em qualquer navegador e dispositivo. Automático e grátis.',
  'faq.title': 'Perguntas frequentes',
  'footer.rights': 'Todos os direitos reservados.',
  'footer.disclaimer': 'Aviso: apenas uso pessoal. Respeite os direitos autorais.'
};

const DICTS: Record<Locale, Dict> = { en, ar, es, fr, pt };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? en;
}

export function t(locale: Locale, key: string): string {
  return getDict(locale)[key] ?? en[key] ?? key;
}
