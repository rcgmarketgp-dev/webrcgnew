import { BlockInstance, BlockType, PageTemplate } from '../types/editor';
import { createBaseStyle, PLACEHOLDER_IMAGES, RCG_LOGO_DARK_BG, RCG_LOGO_LIGHT_BG } from './seedSite';

const VALID_BLOCK_TYPES: BlockType[] = [
  'navbar',
  'hero',
  'features',
  'products',
  'gallery',
  'testimonials',
  'pricing',
  'stats',
  'faq',
  'contact',
  'map',
  'cta',
  'richtext',
  'footer',
];

export const EXTERNAL_TEMPLATES: PageTemplate[] = [
  {
    id: 'tpl-webflow-industrial',
    nameFa: 'شوکیس ماشین‌آلات CNC (مدل Webflow Industrial)',
    nameEn: 'CNC Machinery Showcase (Webflow Style)',
    sourceFa: 'الهام از Webflow Showcase',
    sourceEn: 'Webflow Showcase Style',
    category: 'landing',
    descriptionFa: 'لندینگ کامل با هدر، بخش معرفی پرقدرت، آمار فنی، محصولات، نظرات مشتریان و دعوت به اقدام.',
    descriptionEn: 'Complete industrial landing page with hero, metrics strip, machinery grid, testimonials & CTA.',
    themePatch: {
      primary: '#12315F',
      primaryHover: '#1E4A8A',
      accent: '#F26A1B',
      bg: '#0B1F3D',
      surface: '#12284A',
      text: '#F1F5F9',
      siteMode: 'dark',
    },
    blocks: [
      {
        type: 'navbar',
        variant: 'a',
        label: 'نوار ناوبری',
        locked: false,
        hidden: false,
        content: {
          brandName: 'گروه صنعتی آرسی (RCG)',
          logoUrl: RCG_LOGO_DARK_BG,
          ctaLabel: 'استعلام قیمت فوری',
          ctaPageId: 'page-contact',
        },
        style: createBaseStyle({ paddingY: 16, paddingX: 24, borderWidth: 1 }),
        animation: { type: 'fade', duration: 220, delay: 0 },
      },
      {
        type: 'hero',
        variant: 'a',
        label: 'بخش معرفی اصلی',
        locked: false,
        hidden: false,
        content: {
          kicker: 'نسل جدید ماشین‌کاری چوب و MDF',
          headline: 'خطوط تمام‌اتوماتیک CNC و برش صنعتی با دقت میکرونی',
          subheadline: 'طراحی مهندسی برای کارگاه‌های کابینت‌سازی و خطوط تولید انبوه مبلمان با خدمات نصب و پشتیبانی سراسری.',
          primaryCta: 'مشاوره فنی رایگان',
          secondaryCta: 'مشاهده دستگاه‌ها',
          imageUrl: PLACEHOLDER_IMAGES.cncHero,
          imageAlt: 'خط ماشین‌آلات CNC آرسی',
        },
        style: createBaseStyle({
          backgroundType: 'gradient',
          gradientFrom: '#0B1F3D',
          gradientTo: '#163B72',
          paddingY: 72,
        }),
        animation: { type: 'slide-up', duration: 300, delay: 0 },
      },
      {
        type: 'stats',
        variant: 'a',
        label: 'شاخص‌های صنعتی',
        locked: false,
        hidden: false,
        content: {
          heading: 'عملکرد در مقیاس صنعتی (مقادیر نمونه)',
          items: [
            { value: '۱۸+ سال', label: 'تجربه تخصصی ماشین‌آلات چوب' },
            { value: '۴۲۰+', label: 'کارگاه مجهز شده در سراسر کشور' },
            { value: '۰.۰۲ mm', label: 'دقت تکرارپذیری محورها (نمونه)' },
            { value: '۲۴ ساعته', label: 'پشتیبانی فنی و تأمین قطعه' },
          ],
        },
        style: createBaseStyle({ paddingY: 40, borderWidth: 1 }),
        animation: { type: 'stagger', duration: 260, delay: 0 },
      },
      {
        type: 'products',
        variant: 'a',
        label: 'سبد محصولات کلیدی',
        locked: false,
        hidden: false,
        content: {
          heading: 'تجهیزات پرفروش خطوط تولید',
          subheading: 'انتخاب هوشمند متناسب با ظرفیت تولید روزانه کارگاه شما',
          items: [
            {
              category: 'CNC نستینگ',
              title: 'روتر نستینگ اتوماتیک RCG',
              description: 'مناسب برش پیوسته ورق‌های MDF با میز وکیوم چندناحیه‌ای و تعویض ابزار خطی.',
              imageUrl: PLACEHOLDER_IMAGES.cncHero,
              ctaLabel: 'جزئیات فنی',
            },
            {
              category: 'دورکن دقیق',
              title: 'اره‌فلکه‌ای و دورکن ۳۸۰۰',
              description: 'ریل خطی مستحکم و خط‌کش دیجیتال برای برش بدون لب‌پریدگی.',
              imageUrl: PLACEHOLDER_IMAGES.panelSaw,
              ctaLabel: 'جزئیات فنی',
            },
            {
              category: 'لبه چسبان',
              title: 'لبه چسبان ۶ ایستگاهه صنعتی',
              description: 'پیش‌فرز الماسه، کرنر راوندر و پرداخت نهایی برای خطوط تولید پرتیراژ.',
              imageUrl: PLACEHOLDER_IMAGES.edgeBander,
              ctaLabel: 'جزئیات فنی',
            },
          ],
        },
        style: createBaseStyle({ paddingY: 56 }),
        animation: { type: 'stagger', duration: 300, delay: 0 },
      },
      {
        type: 'cta',
        variant: 'a',
        label: 'دعوت به مشاوره',
        locked: false,
        hidden: false,
        content: {
          headline: 'طراحی چیدمان خط برش اختصاصی کارگاه شما',
          description: 'مهندسان فروش آرسی بر اساس متراژ سالن و تیراژ روزانه، بهترین ترکیب دستگاه را پیشنهاد می‌دهند.',
          ctaLabel: 'درخواست بازدید و مشاوره',
        },
        style: createBaseStyle({
          backgroundType: 'gradient',
          gradientFrom: '#12315F',
          gradientTo: '#1E4A8A',
          paddingY: 56,
          borderRadius: 16,
        }),
        animation: { type: 'scale', duration: 280, delay: 0 },
      },
      {
        type: 'footer',
        variant: 'a',
        label: 'پاورقی سایت',
        locked: false,
        hidden: false,
        content: {
          brandName: 'گروه صنعتی آرسی (RCG)',
          logoUrl: RCG_LOGO_DARK_BG,
          summary: 'تأمین‌کننده تجهیزات پیشرفته برش چوب، CNC و لبه چسبان صنعتی.',
          copyright: '© ۱۴۰۵ گروه صنعتی آرسی.',
          address: 'شهرک صنعتی، بلوار صنعتگران، پلاک نمونه',
          phone: '۰۲۱-۰۰۰۰۰۰۰۰',
          email: 'sales@arsi-industrial.example',
        },
        style: createBaseStyle({ paddingY: 48, borderWidth: 1 }),
        animation: { type: 'fade', duration: 220, delay: 0 },
      },
    ],
  },
  {
    id: 'tpl-framer-bento-catalog',
    nameFa: 'کاتالوگ نمایشگاهی بنتو (مدل Framer Marketplace)',
    nameEn: 'Bento Machinery Catalog (Framer Style)',
    sourceFa: 'الهام از Framer Marketplace',
    sourceEn: 'Framer Marketplace Style',
    category: 'catalog',
    descriptionFa: 'چیدمان کاتالوگ مدرن با معرفی متمرکز، گالری نمایشگاهی، ردیف‌های مشخصات و مقایسه سرویس‌ها.',
    descriptionEn: 'Modern catalog layout featuring centered hero, visual gallery, detailed product rows & tiers.',
    themePatch: {
      primary: '#163B72',
      primaryHover: '#3366B0',
      accent: '#F26A1B',
      bg: '#081831',
      surface: '#102749',
      text: '#F8FAFC',
      siteMode: 'dark',
    },
    blocks: [
      {
        type: 'navbar',
        variant: 'b',
        label: 'هدر مینیمال کاتالوگ',
        locked: false,
        hidden: false,
        content: {
          brandName: 'کاتالوگ ماشین‌آلات آرسی',
          logoUrl: RCG_LOGO_DARK_BG,
          ctaLabel: 'دانلود کاتالوگ',
          ctaPageId: 'page-products',
        },
        style: createBaseStyle({ paddingY: 14, paddingX: 24, borderWidth: 1 }),
        animation: { type: 'fade', duration: 220, delay: 0 },
      },
      {
        type: 'hero',
        variant: 'b',
        label: 'تیتر مرکزی نمایشگاه',
        locked: false,
        hidden: false,
        content: {
          kicker: 'نمایشگاه دائمی ماشین‌آلات صنایع چوب',
          headline: 'مجموعه کامل دستگاه‌های برش، CNC و لبه‌چسبان صنعتی',
          subheadline: 'مشخصات فنی، تصاویر کارگاهی و مقایسه مدل‌ها برای تصمیم‌گیری دقیق مدیران تولید.',
          primaryCta: 'درخواست پیش‌فاکتور',
          secondaryCta: 'مقایسه مدل‌ها',
          imageUrl: PLACEHOLDER_IMAGES.workshop,
          imageAlt: 'نمایشگاه صنعتی آرسی',
        },
        style: createBaseStyle({
          backgroundType: 'gradient',
          gradientFrom: '#081831',
          gradientTo: '#12315F',
          paddingY: 64,
        }),
        animation: { type: 'slide-up', duration: 280, delay: 0 },
      },
      {
        type: 'products',
        variant: 'b',
        label: 'فهرست تفصیلی مدل‌ها',
        locked: false,
        hidden: false,
        content: {
          heading: 'مشخصات دسته‌بندی تجهیزات',
          subheading: 'نمای ردیفی برای بررسی سریع قابلیت‌های هر سری دستگاه',
          items: [
            {
              category: 'سری Heavy CNC',
              title: 'ماشین CNC پنج‌محوره صنعتی',
              description: 'مناسب منبت، مبل کلاسیک و قالب‌سازی چوبی با اسپیندل ایتالیایی.',
              imageUrl: PLACEHOLDER_IMAGES.cncHero,
              ctaLabel: 'استعلام مشخصات',
            },
            {
              category: 'سری Panel Sizing',
              title: 'برش پانل کامپیوتری (Panel Saw)',
              description: 'بهینه‌سازی اتوماتیک نقشه برش برای کاهش پرت ورق در کارخانه‌ها.',
              imageUrl: PLACEHOLDER_IMAGES.panelSaw,
              ctaLabel: 'استعلام مشخصات',
            },
          ],
        },
        style: createBaseStyle({ paddingY: 56 }),
        animation: { type: 'stagger', duration: 280, delay: 0 },
      },
      {
        type: 'gallery',
        variant: 'a',
        label: 'گالری کارگاه‌های مجهز',
        locked: false,
        hidden: false,
        content: {
          heading: 'گزارش تصویری نصب و راه‌اندازی',
          items: [
            { url: PLACEHOLDER_IMAGES.workshop, caption: 'خط کامل برش و لبه چسبان (نمونه)' },
            { url: PLACEHOLDER_IMAGES.cncHero, caption: 'واحد CNC نستینگ (نمونه)' },
            { url: PLACEHOLDER_IMAGES.panelSaw, caption: 'واحد برش دورکن (نمونه)' },
            { url: PLACEHOLDER_IMAGES.edgeBander, caption: 'واحد پرداخت لبه (نمونه)' },
          ],
        },
        style: createBaseStyle({ paddingY: 48 }),
        animation: { type: 'fade', duration: 260, delay: 0 },
      },
      {
        type: 'footer',
        variant: 'b',
        label: 'پاورقی کاتالوگ',
        locked: false,
        hidden: false,
        content: {
          brandName: 'گروه صنعتی آرسی (RCG)',
          logoUrl: RCG_LOGO_DARK_BG,
          summary: 'مرجع تخصصی ماشین‌آلات مدرن صنایع چوب و MDF.',
          copyright: '© ۱۴۰۵ گروه صنعتی آرسی.',
          address: 'شهرک صنعتی، بلوار صنعتگران',
          phone: '۰۲۱-۰۰۰۰۰۰۰۰',
          email: 'catalog@arsi-industrial.example',
        },
        style: createBaseStyle({ paddingY: 44, borderWidth: 1 }),
        animation: { type: 'fade', duration: 220, delay: 0 },
      },
    ],
  },
  {
    id: 'tpl-relume-b2b-conversion',
    nameFa: 'لندینگ تبدیل سرنخ B2B (مدل Relume Kit)',
    nameEn: 'B2B Lead Conversion (Relume Kit)',
    sourceFa: 'الهام از Relume Library',
    sourceEn: 'Relume Kit Style',
    category: 'landing',
    descriptionFa: 'معماری هدفمند برای دریافت سرنخ فروش شامل مزیت‌های رقابتی، تعرفه خدمات، سوالات متداول و فرم تماس.',
    descriptionEn: 'High-converting B2B funnel with feature grid, service tiers, FAQ accordion, and lead capture form.',
    blocks: [
      {
        type: 'hero',
        variant: 'a',
        label: 'بنر کمپین فروش اقساطی/سازمانی',
        locked: false,
        hidden: false,
        content: {
          kicker: 'پیشنهاد ویژه تجهیز کارگاه‌ها',
          headline: 'تجهیز کامل خط تولید MDF با شرایط ویژه تحویل و نصب',
          subheadline: 'پکیج ترکیبی دورکن + لبه چسبان + CNC همراه با ۶ ماه سرویس دوره‌ای رایگان.',
          primaryCta: 'دریافت پیش‌فاکتور پکیج',
          secondaryCta: 'تماس با مشاور فروش',
          imageUrl: PLACEHOLDER_IMAGES.edgeBander,
          imageAlt: 'پکیج خط تولید آرسی',
        },
        style: createBaseStyle({
          backgroundType: 'gradient',
          gradientFrom: '#0B1F3D',
          gradientTo: '#1E4A8A',
          paddingY: 64,
        }),
        animation: { type: 'slide-up', duration: 280, delay: 0 },
      },
      {
        type: 'features',
        variant: 'b',
        label: 'چرا آرسی؟',
        locked: false,
        hidden: false,
        content: {
          heading: 'مزایای همکاری مستقیم با گروه صنعتی آرسی',
          subheading: 'از انتخاب فنی تا تأمین قطعات یدکی در کنار خط تولید شما هستیم.',
          items: [
            { index: '01', title: 'تحویل و نصب سریع', description: 'اعزام مهندس نصب و تراز لیزری دستگاه در محل کارگاه.' },
            { index: '02', title: 'آموزش تخصصی اپراتور', description: 'دوره عملی نرم‌افزار G-Code و نگهداری روزانه.' },
            { index: '03', title: 'انبار قطعات اصلی', description: 'دسترسی فوری به اسپیندل، ریل، موتور و مصرفی‌ها.' },
            { index: '04', title: 'ضمانت‌نامه کتبی', description: 'پشتیبانی واقعی و سرویس دوره‌ای برنامه‌ریزی‌شده.' },
          ],
        },
        style: createBaseStyle({ paddingY: 52 }),
        animation: { type: 'stagger', duration: 260, delay: 0 },
      },
      {
        type: 'pricing',
        variant: 'a',
        label: 'پکیج‌های تجهیز خط تولید',
        locked: false,
        hidden: false,
        content: {
          heading: 'بسته‌های پیشنهادی سرمایه‌گذاری',
          subheading: 'مناسب کارگاه‌های نوپا تا کارخانه‌های تمام‌اتوماتیک',
          plans: [
            {
              name: 'پکیج کارگاهی',
              price: 'استعلام روز',
              description: 'شروع سریع کارگاه دکوراسیون داخلی',
              features: ['دورکن ۳۲۰۰ استاندارد', 'لبه چسبان نیمه‌اتومات', 'نصب و آموزش کامل'],
              ctaLabel: 'استعلام پکیج',
              highlighted: false,
            },
            {
              name: 'پکیج صنعتی پلاس',
              price: 'پیشنهاد ویژه',
              description: 'بهترین تعادل سرعت و دقت',
              features: ['CNC روتر وکیوم‌دار', 'لبه چسبان ۶ ایستگاهه', 'نرم‌افزار بهینه‌سازی برش', 'سرویس فصلی رایگان'],
              ctaLabel: 'انتخاب پکیج ویژه',
              highlighted: true,
            },
            {
              name: 'پکیج کارخانه هوشمند',
              price: 'قراردادی',
              description: 'تولید انبوه و اتوماسیون',
              features: ['CNC نستینگ بارگذاری اتومات', 'پنل‌سا کامپیوتری', 'آموزش تیم فنی اختصاصی'],
              ctaLabel: 'جلسه مهندسی فروش',
              highlighted: false,
            },
          ],
        },
        style: createBaseStyle({ paddingY: 56 }),
        animation: { type: 'stagger', duration: 280, delay: 0 },
      },
      {
        type: 'faq',
        variant: 'a',
        label: 'سوالات خرید و ضمانت',
        locked: false,
        hidden: false,
        content: {
          heading: 'پاسخ به پرسش‌های رایج خریداران',
          items: [
            {
              question: 'شرایط پرداخت و زمان تحویل دستگاه‌ها چگونه است؟',
              answer: 'بسته به موجودی انبار و مدل انتخابی، تحویل فوری یا برنامه‌ریزی‌شده با پیش‌پرداخت توافقی انجام می‌شود.',
            },
            {
              question: 'آیا پیش از خرید امکان تست عملی دستگاه وجود دارد؟',
              answer: 'بله، در نمایشگاه مرکزی می‌توانید با ورق نمونه خود کیفیت برش و لبه‌چسبانی را از نزدیک بررسی کنید.',
            },
          ],
        },
        style: createBaseStyle({ paddingY: 48 }),
        animation: { type: 'fade', duration: 240, delay: 0 },
      },
      {
        type: 'contact',
        variant: 'a',
        label: 'فرم دریافت مشاوره',
        locked: false,
        hidden: false,
        content: {
          heading: 'ثبت درخواست پیش‌فاکتور و مشاوره',
          subheading: 'مشخصات تماس خود را ثبت کنید تا کارشناس مربوطه با شما تماس بگیرد.',
          addressLabel: 'نشانی نمایشگاه',
          addressValue: 'تهران، شهرک صنعتی، بلوار صنعتگران',
          phoneLabel: 'تلفن فروش',
          phoneValue: '۰۲۱-۰۰۰۰۰۰۰۰',
          hoursLabel: 'پاسخگویی',
          hoursValue: 'شنبه تا پنج‌شنبه ۹ تا ۱۸',
          submitLabel: 'ثبت درخواست مشاوره',
        },
        style: createBaseStyle({ paddingY: 56 }),
        animation: { type: 'slide-up', duration: 260, delay: 0 },
      },
    ],
  },
  {
    id: 'tpl-tailwind-corporate-about',
    nameFa: 'صفحه معرفی کارخانه و برند (مدل Tailwind Corporate)',
    nameEn: 'Corporate Plant & Brand (Tailwind Style)',
    sourceFa: 'الهام از Tailwind UI',
    sourceEn: 'Tailwind UI Style',
    category: 'corporate',
    descriptionFa: 'مناسب صفحه درباره ما و معرفی زیرساخت‌های مهندسی، گالری خط تولید و دیدگاه شرکای تجاری.',
    descriptionEn: 'Editorial corporate profile with rich narrative, stats, workshop gallery, and customer quotes.',
    blocks: [
      {
        type: 'hero',
        variant: 'b',
        label: 'معرفی گروه صنعتی آرسی',
        locked: false,
        hidden: false,
        content: {
          kicker: 'درباره گروه صنعتی آرسی',
          headline: 'مهندسی دقیق در خدمت صنعت چوب و مبلمان مدرن',
          subheadline: 'بیش از یک دهه همراهی با تولیدکنندگان حرفه‌ای در تامین، کالیبراسیون و نوسازی خطوط برش.',
          primaryCta: 'بازدید از نمایشگاه',
          secondaryCta: 'ارتباط با مدیریت',
          imageUrl: PLACEHOLDER_IMAGES.workshop,
          imageAlt: 'خط تولید گروه صنعتی آرسی',
        },
        style: createBaseStyle({
          backgroundType: 'gradient',
          gradientFrom: '#0B1F3D',
          gradientTo: '#12315F',
          paddingY: 64,
        }),
        animation: { type: 'fade', duration: 260, delay: 0 },
      },
      {
        type: 'richtext',
        variant: 'b',
        label: 'داستان و ماموریت شرکت',
        locked: false,
        hidden: false,
        content: {
          heading: 'استانداردهای کنترل کیفیت و تعهد فنی آرسی',
          body: 'گروه صنعتی آرسی با هدف ارتقای بهره‌وری کارگاه‌ها و کارخانه‌های صنایع چوب، مجموعه‌ای از دقیق‌ترین ماشین‌آلات برش، CNC و لبه چسبان را عرضه می‌کند.\n\nتمامی دستگاه‌ها پیش از تحویل تحت آزمون‌های دقیق هندسی، آزمون اسپیندل و کالیبراسیون کنترلر قرار می‌گیرند تا خط تولید مشتری بدون توقف آغاز به کار کند.',
        },
        style: createBaseStyle({ paddingY: 52, maxWidth: 'lg' }),
        animation: { type: 'fade', duration: 240, delay: 0 },
      },
      {
        type: 'testimonials',
        variant: 'b',
        label: 'دیدگاه مدیران تولید',
        locked: false,
        hidden: false,
        content: {
          heading: 'اعتماد برندهای پیشرو صنعت مبلمان',
          items: [
            {
              quote: 'دقت برش و کیفیت سرویس دوره‌ای آرسی باعث شد ضایعات ورق ما به شکل محسوسی کاهش یابد.',
              author: 'مجتمع تولیدی نمونه',
              role: 'مدیر خط تولید کابینت',
            },
            {
              quote: 'تامین سریع قطعات و پاسخگویی صادقانه تیم فنی، مهم‌ترین دلیل تداوم همکاری ما بوده است.',
              author: 'صنایع چوب پارس (نمونه)',
              role: 'مدیرعامل',
            },
          ],
        },
        style: createBaseStyle({ paddingY: 52 }),
        animation: { type: 'slide-up', duration: 260, delay: 0 },
      },
      {
        type: 'map',
        variant: 'a',
        label: 'نقشه دفتر مرکزی و کارخانه',
        locked: false,
        hidden: false,
        content: {
          heading: 'موقعیت مکانی نمایشگاه و واحد فنی',
          caption: 'دسترسی مستقیم از اتوبان اصلی شهرک صنعتی جهت بازدید حضوری و تست دستگاه.',
          coordinates: '35.6892° N, 51.3890° E',
          imageUrl: PLACEHOLDER_IMAGES.mapSchematic,
        },
        style: createBaseStyle({ paddingY: 44 }),
        animation: { type: 'fade', duration: 240, delay: 0 },
      },
    ],
  },
  {
    id: 'tpl-flowbite-service-desk',
    nameFa: 'پورتال خدمات فنی و گارانتی (مدل Flowbite)',
    nameEn: 'Technical Service & Support (Flowbite Style)',
    sourceFa: 'الهام از Flowbite Blocks',
    sourceEn: 'Flowbite Style',
    category: 'service',
    descriptionFa: 'ساختار آماده برای صفحه خدمات پس از فروش، درخواست تعمیرکار، پرسش‌های فنی و قرارداد نگهداری.',
    descriptionEn: 'Dedicated after-sales support portal with service grid, maintenance tiers, FAQ & dispatch form.',
    blocks: [
      {
        type: 'features',
        variant: 'a',
        label: 'خدمات واحد فنی RCG',
        locked: false,
        hidden: false,
        content: {
          heading: 'واحد خدمات مهندسی و پشتیبانی آرسی',
          subheading: 'اعزام کارشناس، عیب‌یابی کنترلر، بالانس اسپیندل و تأمین قطعات اصلی.',
          items: [
            { index: '01', title: 'نصب و تراز لیزری', description: 'راه‌اندازی استاندارد خطوط برش و CNC در سراسر کشور.' },
            { index: '02', title: 'کالیبراسیون و سرویس دوره‌ای', description: 'تنظیم گونیا، ریل‌های خطی و سیستم وکیوم.' },
            { index: '03', title: 'عیب‌یابی آنلاین و تلفنی', description: 'پاسخگویی سریع مهندسان برق و مکانیک.' },
            { index: '04', title: 'تأمین قطعات اورجینال', description: 'ارسال فوری تیغه‌اره، الماسه، رله و قطعات مکانیکی.' },
          ],
        },
        style: createBaseStyle({ paddingY: 56 }),
        animation: { type: 'stagger', duration: 260, delay: 0 },
      },
      {
        type: 'faq',
        variant: 'b',
        label: 'راهنمای نگهداری و پرسش‌های فنی',
        locked: false,
        hidden: false,
        content: {
          heading: 'سوالات متداول بخش تعمیرات و نگهداری',
          items: [
            {
              question: 'دوره پیشنهادی گریس‌کاری ریل‌ها و بال‌اسکرو چیست؟',
              answer: 'در شیفت کاری تک‌نوبته، بازبینی هفتگی و روان‌کاری مطابق جدول دفترچه دستگاه توصیه می‌شود.',
            },
            {
              question: 'چگونه درخواست اعزام کارشناس ثبت کنیم؟',
              answer: 'از طریق فرم پایین صفحه، شماره سریال دستگاه و شرح خطا را ارسال نمایید.',
            },
          ],
        },
        style: createBaseStyle({ paddingY: 48 }),
        animation: { type: 'fade', duration: 240, delay: 0 },
      },
      {
        type: 'contact',
        variant: 'b',
        label: 'فرم اعزام کارشناس فنی',
        locked: false,
        hidden: false,
        content: {
          heading: 'ثبت تیکت خدمات پس از فروش',
          subheading: 'پاسخگویی اولویت‌دار برای دستگاه‌های دارای قرارداد نگهداری فعال.',
          addressLabel: 'واحد خدمات مرکزی',
          addressValue: 'شهرک صنعتی، سوله خدمات مهندسی آرسی',
          phoneLabel: 'خط ویژه فنی',
          phoneValue: '۰۲۱-۰۰۰۰۰۰۰۰',
          hoursLabel: 'شیفت پشتیبانی',
          hoursValue: 'شنبه تا پنج‌شنبه ۸ تا ۱۸',
          submitLabel: 'ارسال درخواست فنی',
        },
        style: createBaseStyle({ paddingY: 56 }),
        animation: { type: 'slide-up', duration: 260, delay: 0 },
      },
    ],
  },
  {
    id: 'tpl-awwwards-clean-light',
    nameFa: 'قالب روشن و مینیمال مهندسی (مدل Clean Light)',
    nameEn: 'Clean Light Engineering (Awwwards Style)',
    sourceFa: 'الهام از Awwwards Minimal',
    sourceEn: 'Awwwards Clean Style',
    category: 'corporate',
    descriptionFa: 'قالب روشن با کنتراست استاندارد سرمه‌ای روی پس‌زمینه سفید و جزئیات نارنجی برای ارائه کاتالوگ مدرن.',
    descriptionEn: 'Crisp light-mode corporate aesthetic pairing high-contrast navy typography on clean white surfaces.',
    themePatch: {
      primary: '#12315F',
      primaryHover: '#1E4A8A',
      accent: '#F26A1B',
      bg: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#0B1F3D',
      muted: '#475569',
      border: 'rgba(15, 23, 42, 0.14)',
      siteMode: 'light',
    },
    blocks: [
      {
        type: 'navbar',
        variant: 'a',
        label: 'نوار ناوبری روشن',
        locked: false,
        hidden: false,
        content: {
          brandName: 'گروه صنعتی آرسی',
          logoUrl: RCG_LOGO_LIGHT_BG,
          ctaLabel: 'مشاوره خرید',
          ctaPageId: 'page-contact',
        },
        style: createBaseStyle({
          backgroundColor: '#FFFFFF',
          textColor: '#0B1F3D',
          paddingY: 16,
          paddingX: 24,
          borderWidth: 1,
          borderColor: 'rgba(15,23,42,0.12)',
        }),
        animation: { type: 'fade', duration: 220, delay: 0 },
      },
      {
        type: 'hero',
        variant: 'a',
        label: 'بخش معرفی روشن',
        locked: false,
        hidden: false,
        content: {
          kicker: 'مهندسی مدرن صنایع چوب',
          headline: 'دقت صنعتی در طراحی مدرن خطوط برش و CNC',
          subheadline: 'انتخابی مطمئن برای برندهای معماری داخلی و تولیدکنندگان مبلمان صادراتی.',
          primaryCta: 'دریافت کاتالوگ ۱۴۰۵',
          secondaryCta: 'مشاهده محصولات',
          imageUrl: PLACEHOLDER_IMAGES.cncHero,
          imageAlt: 'دستگاه CNC مینیمال',
        },
        style: createBaseStyle({
          backgroundType: 'solid',
          backgroundColor: '#F1F5F9',
          textColor: '#0B1F3D',
          paddingY: 64,
        }),
        animation: { type: 'slide-up', duration: 280, delay: 0 },
      },
      {
        type: 'products',
        variant: 'a',
        label: 'ویترین محصولات روشن',
        locked: false,
        hidden: false,
        content: {
          heading: 'محصولات برگزیده',
          subheading: 'کیفیت ساخت بالا و طراحی ارگونومیک کاربری',
          items: [
            {
              category: 'CNC',
              title: 'سی‌ان‌سی سری دقیق RCG',
              description: 'عملکرد بی‌صدا و راندمان بالا در شیفت‌های طولانی.',
              imageUrl: PLACEHOLDER_IMAGES.cncHero,
              ctaLabel: 'اطلاعات بیشتر',
            },
            {
              category: 'برش',
              title: 'دورکن اتوماتیک سری پرو',
              description: 'تنظیم دیجیتال زاویه و ارتفاع اره با دقت دهم میلی‌متر.',
              imageUrl: PLACEHOLDER_IMAGES.panelSaw,
              ctaLabel: 'اطلاعات بیشتر',
            },
            {
              category: 'لبه‌چسبان',
              title: 'لبه چسبان پیش‌فرزدار',
              description: 'خط چسب فوق‌العاده ظریف برای ورق‌های هایگلاس و مات.',
              imageUrl: PLACEHOLDER_IMAGES.edgeBander,
              ctaLabel: 'اطلاعات بیشتر',
            },
          ],
        },
        style: createBaseStyle({
          backgroundColor: '#FFFFFF',
          textColor: '#0B1F3D',
          paddingY: 56,
        }),
        animation: { type: 'stagger', duration: 280, delay: 0 },
      },
      {
        type: 'footer',
        variant: 'a',
        label: 'پاورقی روشن',
        locked: false,
        hidden: false,
        content: {
          brandName: 'گروه صنعتی آرسی',
          logoUrl: RCG_LOGO_LIGHT_BG,
          summary: 'ماشین‌آلات برش و CNC صنایع چوب و MDF.',
          copyright: '© ۱۴۰۵ گروه صنعتی آرسی.',
          address: 'شهرک صنعتی، بلوار صنعتگران',
          phone: '۰۲۱-۰۰۰۰۰۰۰۰',
          email: 'info@arsi-industrial.example',
        },
        style: createBaseStyle({
          backgroundColor: '#F1F5F9',
          textColor: '#0B1F3D',
          paddingY: 44,
          borderWidth: 1,
          borderColor: 'rgba(15,23,42,0.1)',
        }),
        animation: { type: 'fade', duration: 220, delay: 0 },
      },
    ],
  },
];

export function parseExternalTemplatePayload(
  raw: unknown,
  sourceUrl?: string
): PageTemplate | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  let rawBlocks: unknown[] | null = null;
  let name = '';
  let desc = '';
  let themePatch: PageTemplate['themePatch'];

  // Format 1: Arsi Studio PageTemplate JSON
  if (Array.isArray(obj.blocks)) {
    rawBlocks = obj.blocks;
    name = String(obj.nameFa || obj.name || obj.title || obj.nameEn || 'تمپلیت بیرونی');
    desc = String(obj.descriptionFa || obj.description || obj.descriptionEn || 'بارگذاری شده از منبع بیرونی');
    if (obj.themePatch && typeof obj.themePatch === 'object') {
      themePatch = obj.themePatch as PageTemplate['themePatch'];
    } else if (obj.theme && typeof obj.theme === 'object') {
      themePatch = obj.theme as PageTemplate['themePatch'];
    }
  }
  // Format 2: Full Arsi Studio ProjectData JSON export (uses first page)
  else if (Array.isArray(obj.pages) && obj.pages.length > 0) {
    const firstPage = obj.pages[0] as Record<string, unknown>;
    if (Array.isArray(firstPage?.blocks)) {
      rawBlocks = firstPage.blocks;
      name = String(obj.projectName || firstPage.title || 'تمپلیت پروژه وارداتی');
      desc = String((firstPage.seo as Record<string, unknown> | undefined)?.description || 'استخراج‌شده از فایل پروژه JSON');
      if (obj.theme && typeof obj.theme === 'object') {
        themePatch = obj.theme as PageTemplate['themePatch'];
      }
    }
  }

  if (!rawBlocks || rawBlocks.length === 0) return null;

  const normalizedBlocks: Omit<BlockInstance, 'id'>[] = rawBlocks
    .filter((b): b is Record<string, unknown> => Boolean(b && typeof b === 'object'))
    .map((b, idx) => {
      const candidateType = String(b.type || 'richtext') as BlockType;
      const safeType: BlockType = VALID_BLOCK_TYPES.includes(candidateType) ? candidateType : 'richtext';
      const content =
        b.content && typeof b.content === 'object'
          ? (b.content as Record<string, unknown>)
          : {
              heading: String(b.title || `بخش ${idx + 1}`),
              body: String(b.description || b.text || ''),
            };

      const styleObj = b.style && typeof b.style === 'object' ? (b.style as Record<string, unknown>) : {};
      const animObj =
        b.animation && typeof b.animation === 'object'
          ? (b.animation as Record<string, unknown>)
          : {};

      return {
        type: safeType,
        variant: b.variant === 'b' ? 'b' : 'a',
        label: String(b.label || `بخش ${idx + 1}`),
        locked: Boolean(b.locked),
        hidden: Boolean(b.hidden),
        content,
        style: createBaseStyle(styleObj),
        animation: {
          type:
            animObj.type === 'fade' ||
            animObj.type === 'slide-up' ||
            animObj.type === 'slide-start' ||
            animObj.type === 'scale' ||
            animObj.type === 'stagger'
              ? animObj.type
              : 'fade',
          duration: typeof animObj.duration === 'number' ? animObj.duration : 260,
          delay: typeof animObj.delay === 'number' ? animObj.delay : 0,
        },
      };
    });

  if (normalizedBlocks.length === 0) return null;

  const hostLabel = sourceUrl
    ? (() => {
        try {
          return new URL(sourceUrl).hostname;
        } catch {
          return 'External URL';
        }
      })()
    : 'JSON File';

  return {
    id: `ext-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    nameFa: name.slice(0, 90),
    nameEn: name.slice(0, 90),
    sourceFa: `منبع بیرونی (${hostLabel})`,
    sourceEn: `External (${hostLabel})`,
    category: 'external',
    descriptionFa: desc.slice(0, 180),
    descriptionEn: desc.slice(0, 180),
    themePatch,
    blocks: normalizedBlocks,
    isExternalImported: true,
    sourceUrl,
  };
}
