import { registerBlock } from '../plugins/registry';
import { createBaseStyle, PLACEHOLDER_IMAGES, RCG_LOGO_DARK_BG } from '../data/seedSite';

let blocksRegistered = false;

export function initializeBuiltInBlocks(): void {
  if (blocksRegistered) return;
  blocksRegistered = true;

  // 1. Navbar
  registerBlock({
    type: 'navbar',
    category: 'navigation',
    nameFa: 'نوار ناوبری (Navbar)',
    nameEn: 'Navbar',
    descriptionFa: 'سربرگ سایت با لوگو، لینک‌های منو و دکمه اقدام اصلی',
    descriptionEn: 'Top navigation bar with brand logo, menu links, and primary CTA',
    iconName: 'PanelTop',
    createDefault: () => ({
      type: 'navbar',
      variant: 'a',
      label: 'نوار ناوبری',
      locked: false,
      hidden: false,
      content: {
        brandName: 'گروه صنعتی آرسی',
        logoUrl: RCG_LOGO_DARK_BG,
        ctaLabel: 'درخواست مشاوره',
        ctaPageId: 'page-contact',
      },
      style: createBaseStyle({ paddingY: 16, paddingX: 24, borderWidth: 1 }),
      animation: { type: 'fade', duration: 220, delay: 0 },
    }),
  });

  // 2. Hero
  registerBlock({
    type: 'hero',
    category: 'hero',
    nameFa: 'بخش معرفی (Hero)',
    nameEn: 'Hero Banner',
    descriptionFa: 'تیتر اصلی، توضیح معرفی، دو دکمه اقدام و تصویر شاخص',
    descriptionEn: 'Primary headline, subtitle, CTAs, and industrial showcase media',
    iconName: 'Sparkles',
    createDefault: () => ({
      type: 'hero',
      variant: 'a',
      label: 'بخش معرفی اصلی',
      locked: false,
      hidden: false,
      content: {
        kicker: 'متن نمونه · ماشین‌آلات صنایع چوب',
        headline: 'تیتر اصلی معرفی محصول یا خدمت (متن نمونه)',
        subheadline: 'این یک متن نمونه است که می‌توانید مستقیماً روی بوم یا در بخش محتوا ویرایش نمایید.',
        primaryCta: 'درخواست مشاوره',
        secondaryCta: 'مشاهده کاتالوگ',
        imageUrl: PLACEHOLDER_IMAGES.cncHero,
        imageAlt: 'تصویر جایگزین بخش معرفی',
      },
      style: createBaseStyle({
        backgroundType: 'gradient',
        gradientFrom: '#0B1F3D',
        gradientTo: '#12315F',
        paddingY: 72,
      }),
      animation: { type: 'slide-up', duration: 300, delay: 0 },
    }),
  });

  // 3. Features Grid
  registerBlock({
    type: 'features',
    category: 'content',
    nameFa: 'شبکه ویژگی‌ها و خدمات',
    nameEn: 'Features Grid',
    descriptionFa: 'نمایش ساختارمند قابلیت‌های فنی و خدمات کارگاهی',
    descriptionEn: 'Structured bento or numbered list of technical capabilities',
    iconName: 'LayoutGrid',
    createDefault: () => ({
      type: 'features',
      variant: 'a',
      label: 'ویژگی‌ها و خدمات',
      locked: false,
      hidden: false,
      content: {
        heading: 'مزایا و قابلیت‌های فنی (نمونه)',
        subheading: 'توضیح کوتاه معرفی قابلیت‌های مجموعه در این بخش قرار می‌گیرد.',
        items: [
          { index: '01', title: 'عنوان قابلیت اول (نمونه)', description: 'متن نمونه جهت توضیح مزیت فنی یا خدمات نصب.' },
          { index: '02', title: 'عنوان قابلیت دوم (نمونه)', description: 'متن نمونه جهت توضیح آموزش و راه‌اندازی.' },
          { index: '03', title: 'عنوان قابلیت سوم (نمونه)', description: 'متن نمونه جهت توضیح پشتیبانی و قطعات.' },
          { index: '04', title: 'عنوان قابلیت چهارم (نمونه)', description: 'متن نمونه جهت توضیح کالیبراسیون دوره‌ای.' },
        ],
      },
      style: createBaseStyle({ paddingY: 56 }),
      animation: { type: 'stagger', duration: 280, delay: 0 },
    }),
  });

  // 4. Product/Services Cards
  registerBlock({
    type: 'products',
    category: 'showcase',
    nameFa: 'کارت محصولات و ماشین‌آلات',
    nameEn: 'Products & Services',
    descriptionFa: 'نمایش دستگاه‌ها و خدمات در قالب کارت یا ردیف‌های جزئیات',
    descriptionEn: 'Machinery & service showcase in grid cards or detailed rows',
    iconName: 'Boxes',
    createDefault: () => ({
      type: 'products',
      variant: 'a',
      label: 'محصولات و ماشین‌آلات',
      locked: false,
      hidden: false,
      content: {
        heading: 'ماشین‌آلات برش و CNC (نمونه)',
        subheading: 'عنوان و توضیحات هر دستگاه را متناسب با مدل‌های واقعی تکمیل کنید.',
        items: [
          {
            category: 'سری CNC',
            title: 'دستگاه CNC روتر نمونه',
            description: 'متن نمونه معرفی کاربرد برش و حکاکی روی چوب و MDF.',
            imageUrl: PLACEHOLDER_IMAGES.cncHero,
            ctaLabel: 'مشاهده جزئیات',
          },
          {
            category: 'برش پنل',
            title: 'دستگاه دورکن نمونه',
            description: 'متن نمونه معرفی برش دقیق ورق‌های روکش‌دار.',
            imageUrl: PLACEHOLDER_IMAGES.panelSaw,
            ctaLabel: 'مشاهده جزئیات',
          },
          {
            category: 'تکمیل کار',
            title: 'دستگاه لبه چسبان نمونه',
            description: 'متن نمونه معرفی نوارکاری و پرداخت لبه‌ها.',
            imageUrl: PLACEHOLDER_IMAGES.edgeBander,
            ctaLabel: 'مشاهده جزئیات',
          },
        ],
      },
      style: createBaseStyle({ paddingY: 56 }),
      animation: { type: 'stagger', duration: 300, delay: 0 },
    }),
  });

  // 5. Image Gallery
  registerBlock({
    type: 'gallery',
    category: 'showcase',
    nameFa: 'گالری تصاویر',
    nameEn: 'Image Gallery',
    descriptionFa: 'نمایش تصاویر کارگاه، نمایشگاه یا نمونه پروژه‌ها',
    descriptionEn: 'Multi-image showroom or project gallery',
    iconName: 'Images',
    createDefault: () => ({
      type: 'gallery',
      variant: 'a',
      label: 'گالری تصاویر',
      locked: false,
      hidden: false,
      content: {
        heading: 'گالری کارگاه و خط تولید (تصاویر جایگزین)',
        items: [
          { url: PLACEHOLDER_IMAGES.workshop, caption: 'نمایشگاه صنعتی (تصویر نمونه ۱)' },
          { url: PLACEHOLDER_IMAGES.cncHero, caption: 'بخش ماشین‌کاری (تصویر نمونه ۲)' },
          { url: PLACEHOLDER_IMAGES.panelSaw, caption: 'واحد برش پنل (تصویر نمونه ۳)' },
          { url: PLACEHOLDER_IMAGES.edgeBander, caption: 'واحد لبه چسبان (تصویر نمونه ۴)' },
        ],
      },
      style: createBaseStyle({ paddingY: 56 }),
      animation: { type: 'fade', duration: 280, delay: 0 },
    }),
  });

  // 6. Testimonials
  registerBlock({
    type: 'testimonials',
    category: 'content',
    nameFa: 'نظرات مشتریان',
    nameEn: 'Testimonials',
    descriptionFa: 'نقل‌قول کارفرمایان و مدیران کارگاه‌های همکار',
    descriptionEn: 'Customer quotes and workshop feedback',
    iconName: 'MessageSquareQuote',
    createDefault: () => ({
      type: 'testimonials',
      variant: 'a',
      label: 'نظرات مشتریان',
      locked: false,
      hidden: false,
      content: {
        heading: 'دیدگاه مشتریان (متن نمونه)',
        items: [
          {
            quote: 'متن نمونه: کیفیت نصب و آموزش اپراتوری به ما کمک کرد بهره‌وری خط برش را تنظیم کنیم.',
            author: 'نام کارگاه نمونه',
            role: 'مدیر تولید (متن نمونه)',
          },
          {
            quote: 'متن نمونه: پشتیبانی تلفنی سریع در زمان نیاز، تجربه همکاری مطمئنی ایجاد کرده است.',
            author: 'نام مجموعه نمونه',
            role: 'سرپرست کارگاه MDF (متن نمونه)',
          },
        ],
      },
      style: createBaseStyle({ paddingY: 56 }),
      animation: { type: 'slide-up', duration: 260, delay: 0 },
    }),
  });

  // 7. Pricing / Service Plans
  registerBlock({
    type: 'pricing',
    category: 'conversion',
    nameFa: 'تعرفه و بسته‌های خدمات',
    nameEn: 'Service & Pricing Tiers',
    descriptionFa: 'مقایسه بسته‌های خدمات پشتیبانی، نصب یا قراردادهای سرویس',
    descriptionEn: 'Three-tier or matrix comparison for service & maintenance plans',
    iconName: 'Tags',
    createDefault: () => ({
      type: 'pricing',
      variant: 'a',
      label: 'بسته‌های خدمات',
      locked: false,
      hidden: false,
      content: {
        heading: 'بسته‌های خدمات و نگهداری (نمونه)',
        subheading: 'عناوین و مبالغ واقعی را مطابق شرایط فروش خود ویرایش کنید.',
        plans: [
          {
            name: 'پکیج پایه (نمونه)',
            price: 'استعلام (نمونه)',
            description: 'مناسب کارگاه‌های کوچک',
            features: ['نصب اولیه در محل', 'آموزش اپراتور (نمونه)', 'پشتیبانی تلفنی'],
            ctaLabel: 'درخواست بسته',
            highlighted: false,
          },
          {
            name: 'پکیج دوره‌ای (نمونه)',
            price: 'قراردادی (نمونه)',
            description: 'مناسب خطوط تولید پیوسته',
            features: ['سرویس دوره‌ای فصلی', 'کالیبراسیون محورها', 'اولویت تامین قطعه', 'پشتیبانی ویژه'],
            ctaLabel: 'انتخاب بسته',
            highlighted: true,
          },
          {
            name: 'پکیج سازمانی (نمونه)',
            price: 'توافقی (نمونه)',
            description: 'مناسب کارخانه‌های چندخطی',
            features: ['برنامه نگهداری اختصاصی', 'آموزش تیم فنی داخلی', 'تامین قطعات بحرانی'],
            ctaLabel: 'تماس با فروش',
            highlighted: false,
          },
        ],
      },
      style: createBaseStyle({ paddingY: 56 }),
      animation: { type: 'stagger', duration: 280, delay: 0 },
    }),
  });

  // 8. Stats Counters
  registerBlock({
    type: 'stats',
    category: 'content',
    nameFa: 'آمار و شاخص‌ها',
    nameEn: 'Stats Counters',
    descriptionFa: 'نوار ۴ ستونه نمایش اعداد کلیدی و سوابق',
    descriptionEn: 'Four-column tabular metric strip',
    iconName: 'BarChart3',
    createDefault: () => ({
      type: 'stats',
      variant: 'a',
      label: 'شاخص‌های کلیدی',
      locked: false,
      hidden: false,
      content: {
        heading: 'شاخص‌های مجموعه (مقادیر نمونه)',
        items: [
          { value: 'نمونه ۱', label: 'سال تجربه صنعتی (مقدار واقعی را وارد کنید)' },
          { value: 'نمونه ۲', label: 'واحدهای کارگاهی همکار' },
          { value: 'نمونه ۳', label: 'تنوع مدل‌های برش و CNC' },
          { value: 'نمونه ۴', label: 'تیم پشتیبانی فنی' },
        ],
      },
      style: createBaseStyle({ paddingY: 40, borderWidth: 1 }),
      animation: { type: 'stagger', duration: 260, delay: 0 },
    }),
  });

  // 9. FAQ Accordion
  registerBlock({
    type: 'faq',
    category: 'content',
    nameFa: 'سوالات متداول (FAQ)',
    nameEn: 'FAQ Accordion',
    descriptionFa: 'پرسش و پاسخ‌های بازشونده درباره نصب، گارانتی و خرید',
    descriptionEn: 'Interactive expandable Q&A accordion or open 2-column FAQ',
    iconName: 'HelpCircle',
    createDefault: () => ({
      type: 'faq',
      variant: 'a',
      label: 'سوالات متداول',
      locked: false,
      hidden: false,
      content: {
        heading: 'پرسش‌های پرتکرار (متن نمونه)',
        items: [
          {
            question: 'فرآیند ارسال و نصب دستگاه چگونه است؟ (نمونه)',
            answer: 'متن نمونه: زمان‌بندی ارسال و اعزام کارشناس نصب هنگام ثبت سفارش با کارگاه هماهنگ می‌شود.',
          },
          {
            question: 'آیا آموزش نرم‌افزارهای برش نیز ارائه می‌شود؟ (نمونه)',
            answer: 'متن نمونه: بله، آموزش مقدماتی کار با کنترلر و آماده‌سازی فایل خروجی در محل انجام می‌گیرد.',
          },
          {
            question: 'نحوه ارتباط با واحد خدمات پس از فروش چیست؟ (نمونه)',
            answer: 'متن نمونه: از طریق فرم تماس سایت یا شماره تلفن مستقیم واحد فنی می‌توانید درخواست ثبت کنید.',
          },
        ],
      },
      style: createBaseStyle({ paddingY: 56 }),
      animation: { type: 'fade', duration: 250, delay: 0 },
    }),
  });

  // 10. Contact Form
  registerBlock({
    type: 'contact',
    category: 'conversion',
    nameFa: 'فرم تماس با ما',
    nameEn: 'Contact Form',
    descriptionFa: 'فرم دریافت پیام و درخواست مشاوره متصل به وب‌هوک',
    descriptionEn: 'Lead capture contact form with webhook connector support',
    iconName: 'Mail',
    createDefault: () => ({
      type: 'contact',
      variant: 'a',
      label: 'فرم تماس',
      locked: false,
      hidden: false,
      content: {
        heading: 'تماس با واحد فروش و پشتیبانی',
        subheading: 'متن نمونه: فرم زیر را تکمیل نمایید تا در اسرع وقت با شما تماس گرفته شود.',
        addressLabel: 'نشانی (نمونه)',
        addressValue: 'شهرک صنعتی، بلوار صنعتگران، پلاک نمونه',
        phoneLabel: 'تلفن (نمونه)',
        phoneValue: '۰۲۱-۰۰۰۰۰۰۰۰',
        hoursLabel: 'ساعات کاری (نمونه)',
        hoursValue: 'شنبه تا چهارشنبه ۸:۳۰ تا ۱۷:۰۰',
        submitLabel: 'ارسال درخواست',
      },
      style: createBaseStyle({ paddingY: 64 }),
      animation: { type: 'slide-up', duration: 280, delay: 0 },
    }),
  });

  // 11. Map Placeholder
  registerBlock({
    type: 'map',
    category: 'conversion',
    nameFa: 'نقشه موقعیت (جایگزین)',
    nameEn: 'Map Placeholder',
    descriptionFa: 'بلوک نمایش موقعیت مکانی و مختصات کارخانه',
    descriptionEn: 'Clean schematic map placeholder with coordinates & directions',
    iconName: 'MapPin',
    createDefault: () => ({
      type: 'map',
      variant: 'a',
      label: 'موقعیت مکانی',
      locked: false,
      hidden: false,
      content: {
        heading: 'موقعیت دفتر مرکزی و کارخانه (تصویر جایگزین)',
        caption: 'متن نمونه: نشانی دقیق و کدپستی مجموعه را می‌توانید در بخش محتوا جایگزین کنید.',
        coordinates: '35.6892° N, 51.3890° E (نمونه)',
        imageUrl: PLACEHOLDER_IMAGES.mapSchematic,
      },
      style: createBaseStyle({ paddingY: 40 }),
      animation: { type: 'fade', duration: 250, delay: 0 },
    }),
  });

  // 12. CTA Banner
  registerBlock({
    type: 'cta',
    category: 'conversion',
    nameFa: 'بنر دعوت به اقدام (CTA)',
    nameEn: 'CTA Banner',
    descriptionFa: 'نوار برجسته سرمه‌ای با دکمه نارنجی برای جذب مشتری',
    descriptionEn: 'High-contrast call-to-action banner',
    iconName: 'Megaphone',
    createDefault: () => ({
      type: 'cta',
      variant: 'a',
      label: 'بنر دعوت به اقدام',
      locked: false,
      hidden: false,
      content: {
        headline: 'آماده دریافت مشاوره تخصصی برای کارگاه خود هستید؟',
        description: 'متن نمونه: با تیم مهندسی فروش گروه صنعتی آرسی در ارتباط باشید.',
        ctaLabel: 'درخواست تماس فوری',
      },
      style: createBaseStyle({
        backgroundType: 'gradient',
        gradientFrom: '#12315F',
        gradientTo: '#1E4A8A',
        paddingY: 56,
        borderRadius: 16,
      }),
      animation: { type: 'scale', duration: 280, delay: 0 },
    }),
  });

  // 13. Rich Text
  registerBlock({
    type: 'richtext',
    category: 'content',
    nameFa: 'متن تشریحی (Rich Text)',
    nameEn: 'Rich Text Editorial',
    descriptionFa: 'بخش متنی چندپارگرافی برای درباره ما، مقالات و مستندات',
    descriptionEn: 'Single or 2-column editorial prose section',
    iconName: 'FileText',
    createDefault: () => ({
      type: 'richtext',
      variant: 'a',
      label: 'متن تشریحی',
      locked: false,
      hidden: false,
      content: {
        heading: 'درباره خط مشی فنی مجموعه (متن نمونه)',
        body: 'این یک پاراگراف نمونه برای معرفی تاریخچه، استانداردهای کنترل کیفیت و رویکرد خدمات پس از فروش گروه صنعتی آرسی است.\n\nمی‌توانید متن کامل شرکت، گواهینامه‌ها و دستورالعمل‌های بهره‌برداری را در این بخش بنویسید و بین حالت تک‌ستونه یا دوستونه جابه‌جا شوید.',
      },
      style: createBaseStyle({ paddingY: 48, maxWidth: 'lg' }),
      animation: { type: 'fade', duration: 240, delay: 0 },
    }),
  });

  // 14. Footer
  registerBlock({
    type: 'footer',
    category: 'navigation',
    nameFa: 'پاورقی سایت (Footer)',
    nameEn: 'Footer',
    descriptionFa: 'بخش پایانی صفحه با لوگو، اطلاعات تماس، لینک‌ها و خبرنامه',
    descriptionEn: 'Corporate footer with logo, links, contact info, and copyright',
    iconName: 'PanelBottom',
    createDefault: () => ({
      type: 'footer',
      variant: 'a',
      label: 'پاورقی سایت',
      locked: false,
      hidden: false,
      content: {
        brandName: 'گروه صنعتی آرسی (RCG)',
        logoUrl: RCG_LOGO_DARK_BG,
        summary: 'متن نمونه: تجهیزات برش و CNC صنایع چوب و MDF.',
        copyright: '© ۱۴۰۵ گروه صنعتی آرسی (متن نمونه).',
        address: 'نشانی نمونه: شهرک صنعتی، بلوار صنعتگران',
        phone: '۰۲۱-۰۰۰۰۰۰۰۰',
        email: 'info@example-arsi.ir',
      },
      style: createBaseStyle({ paddingY: 48, borderWidth: 1 }),
      animation: { type: 'fade', duration: 220, delay: 0 },
    }),
  });
}
