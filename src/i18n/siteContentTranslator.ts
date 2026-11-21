import {
  ActionButtonItem,
  BlockInstance,
  Language,
  LinkTarget,
  NavMenuItem,
  PageData,
  ProjectData,
} from '../types/editor';

/**
 * Specialized Persian <-> English industrial & CMS site content dictionary
 * covering seed data, built-in block definitions, showcase templates,
 * CNC/woodworking terminology, and UI content snippets.
 */
const FA_TO_EN_PAIRS: Array<[string, string]> = [
  // Project, Brand & Navigation
  ['گروه صنعتی آرسی (RCG)', 'Arsi Industrial Group (RCG)'],
  ['گروه صنعتی آرسی', 'Arsi Industrial Group'],
  ['صفحه اصلی', 'Home'],
  ['محصولات و خدمات', 'Products & Services'],
  ['محصولات', 'Products'],
  ['تماس با ما', 'Contact Us'],
  ['تماس', 'Contact'],
  ['درخواست مشاوره', 'Request Consultation'],
  ['صفحه جدید', 'New Page'],
  ['نوار ناوبری اصلی', 'Main Navigation Bar'],
  ['نوار ناوبری', 'Navigation Bar'],
  ['نوار ناوبری روشن', 'Light Navigation Bar'],
  ['هدر مینیمال کاتالوگ', 'Minimal Catalog Header'],
  ['کاتالوگ ماشین‌آلات آرسی', 'Arsi Machinery Catalog'],
  ['دانلود کاتالوگ', 'Download Catalog'],
  ['استعلام قیمت فوری', 'Instant Price Quote'],
  ['مشاوره خرید', 'Purchase Consultation'],

  // SEO Titles & Descriptions
  [
    'گروه صنعتی آرسی | ماشین‌آلات CNC و برش چوب و MDF',
    'Arsi Industrial Group | Wood & MDF CNC Cutting Machinery',
  ],
  [
    'متن نمونه سئو: طراحی، تامین و پشتیبانی فنی ماشین‌آلات برش و CNC صنایع چوب و MDF.',
    'Sample SEO description: Design, supply, and technical support for Wood & MDF CNC and panel cutting machinery.',
  ],
  [
    'محصولات و خدمات | گروه صنعتی آرسی',
    'Products & Services | Arsi Industrial Group',
  ],
  [
    'متن نمونه: فهرست دسته‌بندی دستگاه‌های برش، CNC و خدمات پشتیبانی فنی.',
    'Sample description: Catalog of CNC routers, panel saws, edge banders, and technical support services.',
  ],
  [
    'تماس با ما | گروه صنعتی آرسی',
    'Contact Us | Arsi Industrial Group',
  ],
  [
    'متن نمونه: فرم ارتباط مستقیم با واحد فروش و پشتیبانی فنی گروه صنعتی آرسی.',
    'Sample description: Direct inquiry form for Arsi Industrial Group sales and technical engineering.',
  ],

  // Assets & Tags
  ['لوگوی RCG (پس‌زمینه تیره)', 'RCG Logo (Dark Background)'],
  ['لوگوی RCG (پس‌زمینه روشن)', 'RCG Logo (Light Background)'],
  ['تصویر جایگزین دستگاه CNC چوب', 'Wood CNC Router Placeholder Image'],
  ['تصویر جایگزین دورکن و برش MDF', 'Panel Saw & MDF Cutting Placeholder Image'],
  ['تصویر جایگزین لبه چسبان', 'Edge Bander Placeholder Image'],
  ['تصویر جایگزین نمایشگاه صنعتی', 'Industrial Showroom Placeholder Image'],
  ['لوگو', 'Logo'],
  ['برند', 'Brand'],
  ['دستگاه', 'Machine'],
  ['نمونه', 'Sample'],
  ['برش', 'Cutting'],
  ['لبه چسبان', 'Edge Bander'],
  ['لبه‌چسبان', 'Edge Bander'],
  ['کارگاه', 'Workshop'],
  ['نمایشگاه', 'Showroom'],
  ['آپلود', 'Upload'],

  // Hero (Seed & Definitions & Templates)
  ['بخش معرفی اصلی (Hero)', 'Main Hero Banner'],
  ['بخش معرفی اصلی', 'Main Hero Section'],
  ['معرفی صفحه محصولات', 'Products Page Hero'],
  ['تیتر مرکزی نمایشگاه', 'Centered Showroom Hero'],
  ['بنر کمپین فروش اقساطی/سازمانی', 'Installment & Corporate Sales Campaign Banner'],
  ['معرفی گروه صنعتی آرسی', 'About Arsi Industrial Group'],
  ['بخش معرفی روشن', 'Light Hero Section'],
  ['متن نمونه · راهکارهای ماشین‌کاری چوب و MDF', 'Sample · Wood & MDF Machining Solutions'],
  ['تجهیز خطوط برش و CNC صنایع چوب با پشتیبانی تخصصی', 'Industrial Wood & MDF CNC Lines with Specialized Support'],
  [
    'این یک متن نمونه برای معرفی گروه صنعتی آرسی است. این بخش را می‌توانید متناسب با پیام رسمی مجموعه، خدمات نصب و راه‌اندازی و راهکارهای کارگاهی ویرایش کنید.',
    'Sample copy introducing Arsi Industrial Group. Customize this text with your official company overview, installation services, and workshop automation solutions.',
  ],
  ['مشاهده محصولات', 'Explore Machinery'],
  ['تماس با واحد فنی', 'Contact Engineering'],
  ['تصویر جایگزین دستگاه CNC گروه صنعتی آرسی', 'Arsi Industrial Group CNC Router Placeholder'],
  ['متن نمونه · سبد ماشین‌آلات و پشتیبانی', 'Sample · Machinery Portfolio & Support'],
  ['ماشین‌آلات برش، CNC و بسته‌های خدمات پس از فروش', 'CNC Routers, Panel Saws & After-Sales Service Plans'],
  [
    'این صفحه با ساختار آماده برای معرفی خطوط دستگاه و پکیج‌های نگهداری (بدون قیمت یا مشخصات ساختگی) چیده شده است.',
    'Structured layout ready to present your industrial machinery lines and maintenance packages cleanly without fabricated figures.',
  ],
  ['درخواست کاتالوگ', 'Request Catalog'],
  ['سوالات متداول', 'FAQ'],
  ['نمایشگاه نمونه ماشین‌آلات', 'Machinery Showroom Placeholder'],
  ['متن نمونه · ماشین‌آلات صنایع چوب', 'Sample · Woodworking Machinery'],
  ['تیتر اصلی معرفی محصول یا خدمت (متن نمونه)', 'Primary Product or Service Headline (Sample)'],
  [
    'این یک متن نمونه است که می‌توانید مستقیماً روی بوم یا در بخش محتوا ویرایش نمایید.',
    'Sample copy that you can edit directly on the canvas or in the Content Inspector.',
  ],
  ['مشاهده کاتالوگ', 'View Catalog'],
  ['تصویر جایگزین بخش معرفی', 'Hero Showcase Placeholder'],

  // Stats
  ['شاخص‌های نمونه مجموعه', 'Sample Company Metrics'],
  ['شاخص‌های کلیدی', 'Key Performance Metrics'],
  ['شاخص‌های صنعتی', 'Industrial Metrics'],
  ['شاخص‌های کلیدی (متن نمونه قابل ویرایش)', 'Key Metrics (Editable Sample Copy)'],
  ['شاخص‌های مجموعه (مقادیر نمونه)', 'Company Metrics (Sample Values)'],
  ['عملکرد در مقیاس صنعتی (مقادیر نمونه)', 'Performance at Industrial Scale (Sample Metrics)'],
  ['نمونه 1', 'Sample 1'],
  ['نمونه 2', 'Sample 2'],
  ['نمونه 3', 'Sample 3'],
  ['نمونه 4', 'Sample 4'],
  ['سال سابقه فعالیت (مقدار واقعی را وارد کنید)', 'Years of Operation (Enter Actual Value)'],
  ['شهرهای تحت پوشش خدمات پس از فروش', 'Cities Covered by After-Sales Service'],
  ['سری دستگاه‌های CNC و برش پنل', 'CNC Router & Panel Saw Series'],
  ['پاسخگویی فنی و تامین قطعات', 'Technical Response & Spare Parts Supply'],
  ['سال تجربه صنعتی (مقدار واقعی را وارد کنید)', 'Years of Industrial Experience (Enter Actual Figure)'],
  ['واحدهای کارگاهی همکار', 'Partner Workshops & Plants'],
  ['تنوع مدل‌های برش و CNC', 'CNC & Panel Cutting Models'],
  ['تیم پشتیبانی فنی', 'Dedicated Engineering Support Team'],
  ['18+ سال', '18+ Years'],
  ['تجربه تخصصی ماشین‌آلات چوب', 'Specialized Woodworking Machinery Expertise'],
  ['420+', '420+'],
  ['کارگاه مجهز شده در سراسر کشور', 'Workshops Equipped Nationwide'],
  ['0.02 mm', '0.02 mm'],
  ['دقت تکرارپذیری محورها (نمونه)', 'Axis Repeatability Precision (Sample)'],
  ['24 ساعته', '24/7'],
  ['پشتیبانی فنی و تأمین قطعه', 'Technical Support & Spare Parts'],

  // Features
  ['قابلیت‌ها و خدمات فنی', 'Engineering Capabilities & Services'],
  ['ویژگی‌ها و خدمات', 'Features & Services'],
  ['خدمات مهندسی و پشتیبانی کارگاهی (نمونه متن)', 'Engineering Services & Workshop Support (Sample)'],
  [
    'توضیحات این بخش به صورت نمونه قرار گرفته است و در ویرایشگر قابل تغییر است.',
    'This section contains sample descriptions ready to be tailored in the visual editor.',
  ],
  ['مشاوره انتخاب ماشین‌آلات متناسب با تیراژ', 'Capacity-Matched Machinery Selection'],
  [
    'متن نمونه: بررسی فضای کارگاه، نوع ورق MDF یا چوب طبیعی و پیشنهاد چیدمان مناسب خط تولید.',
    'Sample: Assessing workshop floor space, MDF or solid wood stock, and recommending an optimal production line layout.',
  ],
  ['نصب، تراز دقیق و آموزش اپراتوری', 'Installation, Precision Leveling & Operator Training'],
  [
    'متن نمونه: راه‌اندازی دستگاه در محل مشتری به همراه آموزش کار با نرم‌افزار کنترلر و نکات نگهداری.',
    'Sample: On-site machine commissioning along with CNC controller software training and preventive maintenance checklists.',
  ],
  ['تامین قطعات مصرفی و سرویس دوره‌ای', 'Consumables Supply & Scheduled Maintenance'],
  [
    'متن نمونه: دسترسی به قطعات یدکی استاندارد و برنامه‌ریزی بازدیدهای دوره‌ای برای کاهش توقف خط.',
    'Sample: Rapid access to OEM spare parts and scheduled calibration visits to minimize production downtime.',
  ],
  ['پشتیبانی تلفنی و عیب‌یابی سریع', 'Rapid Phone Support & Diagnostics'],
  [
    'متن نمونه: راهنمایی گام‌به‌گام توسط تیم فنی و اعزام کارشناس در صورت نیاز.',
    'Sample: Step-by-step remote troubleshooting by senior technicians and prompt on-site dispatch when required.',
  ],
  ['مزایا و قابلیت‌های فنی (نمونه)', 'Technical Advantages & Capabilities (Sample)'],
  [
    'توضیح کوتاه معرفی قابلیت‌های مجموعه در این بخش قرار می‌گیرد.',
    'Place a concise overview of your engineering capabilities here.',
  ],
  ['عنوان قابلیت اول (نمونه)', 'First Capability Title (Sample)'],
  ['عنوان قابلیت دوم (نمونه)', 'Second Capability Title (Sample)'],
  ['عنوان قابلیت سوم (نمونه)', 'Third Capability Title (Sample)'],
  ['عنوان قابلیت چهارم (نمونه)', 'Fourth Capability Title (Sample)'],
  ['متن نمونه جهت توضیح مزیت فنی یا خدمات نصب.', 'Sample description covering technical advantage or installation service.'],
  ['متن نمونه جهت توضیح آموزش و راه‌اندازی.', 'Sample description covering commissioning and operator training.'],
  ['متن نمونه جهت توضیح پشتیبانی و قطعات.', 'Sample description covering after-sales support and spare parts.'],
  ['متن نمونه جهت توضیح کالیبراسیون دوره‌ای.', 'Sample description covering scheduled axis calibration.'],

  // Products
  ['ویترین ماشین‌آلات نمونه', 'Sample Machinery Showcase'],
  ['فهرست ماشین‌آلات (ردیفی)', 'Machinery Catalog (Rows)'],
  ['محصولات و ماشین‌آلات', 'Products & Machinery'],
  ['سبد محصولات کلیدی', 'Core Product Lineup'],
  ['فهرست تفصیلی مدل‌ها', 'Detailed Model Lineup'],
  ['ویترین محصولات روشن', 'Light Product Showcase'],
  ['دسته‌بندی ماشین‌آلات (اطلاعات نمونه)', 'Machinery Categories (Sample Catalog)'],
  [
    'مشخصات فنی دقیق هر مدل را پس از ثبت نهایی جایگزین متن نمونه نمایید.',
    'Replace sample copy with verified specifications for each machine model before publishing.',
  ],
  ['سری CNC روتر', 'CNC Router Series'],
  ['دستگاه CNC روتر کارگاهی (نمونه)', 'Workshop CNC Router (Sample)'],
  [
    'متن نمونه: مناسب حکاکی، منبت، برش صفحات MDF و درب‌های کابینت با میز کار صنعتی.',
    'Sample: Built for 3D carving, MDF sheet nesting, and cabinet door profiling with an industrial vacuum bed.',
  ],
  ['مشاهده جزئیات', 'View Details'],
  ['سری برش پنل', 'Panel Sizing Series'],
  ['دستگاه دورکن و برش پنل (نمونه)', 'Sliding Table Panel Saw (Sample)'],
  [
    'متن نمونه: برش دقیق ورق‌های روکش‌دار با ریل خطی و خط‌کش تنظیم‌شونده.',
    'Sample: Chip-free precision sizing of laminated panels with hardened linear guides and digital fence.',
  ],
  ['سری تکمیل کار', 'Edge Finishing Series'],
  ['دستگاه لبه چسبان تمام‌اتومات (نمونه)', 'Full-Automatic Edge Bander (Sample)'],
  [
    'متن نمونه: پرداخت لبه نوار PVC روی صفحات برش‌خورده با ایستگاه‌های چسب و پولیش.',
    'Sample: Precision PVC edge banding on cut panels with pre-milling, gluing, trimming, and buffing stations.',
  ],
  ['معرفی تجهیزات کارگاهی (نمونه متن)', 'Workshop Equipment Lineup (Sample Copy)'],
  [
    'عنوان، تصویر و توضیحات هر ردیف را می‌توانید مستقیم ویرایش کنید.',
    'Click any title, photo, or specification row to edit directly on the canvas.',
  ],
  ['دستگاه CNC', 'CNC Machinery'],
  ['مدل نمونه CNC-A (جایگزین نام اصلی)', 'Sample Model CNC-A (Replace Model Name)'],
  [
    'متن نمونه: طراحی شده برای برش‌کاری پیوسته صفحات MDF، روکش‌کاری و کارگاه‌های مبلمان.',
    'Sample: Engineered for continuous MDF nesting, veneer profiling, and modern furniture manufacturing.',
  ],
  ['استعلام وضعیت', 'Check Availability'],
  ['برش پنل', 'Panel Sizing'],
  ['مدل نمونه دورکن صنعتی (جایگزین نام اصلی)', 'Sample Industrial Panel Saw (Replace Model Name)'],
  [
    'متن نمونه: مجهز به تیغه خط‌زن و گونیای دقیق جهت برش تمیز لبه‌های روکش‌دار.',
    'Sample: Equipped with a scoring blade and precision miter fence for clean cuts on melamine boards.',
  ],
  ['مدل نمونه لبه چسبان (جایگزین نام اصلی)', 'Sample Industrial Edge Bander (Replace Model Name)'],
  [
    'متن نمونه: چسب‌زنی یکنواخت و پرداخت سریع برای افزایش سرعت مونتاژ قطعات.',
    'Sample: Uniform hot-melt adhesive application and high-speed trimming to accelerate cabinet assembly.',
  ],
  ['ماشین‌آلات برش و CNC (نمونه)', 'CNC & Cutting Machinery (Sample)'],
  [
    'عنوان و توضیحات هر دستگاه را متناسب با مدل‌های واقعی تکمیل کنید.',
    'Update each machine title and summary to match your production models.',
  ],
  ['سری CNC', 'CNC Series'],
  ['دستگاه CNC روتر نمونه', 'Sample CNC Router'],
  ['متن نمونه معرفی کاربرد برش و حکاکی روی چوب و MDF.', 'Sample summary of wood & MDF cutting and engraving capabilities.'],
  ['دستگاه دورکن نمونه', 'Sample Panel Saw'],
  ['متن نمونه معرفی برش دقیق ورق‌های روکش‌دار.', 'Sample summary of precision laminated sheet cutting.'],
  ['تکمیل کار', 'Edge Finishing'],
  ['دستگاه لبه چسبان نمونه', 'Sample Edge Bander'],
  ['متن نمونه معرفی نوارکاری و پرداخت لبه‌ها.', 'Sample summary of edge banding and end-trimming performance.'],

  // Gallery
  ['گالری تصاویر', 'Image Gallery'],
  ['گالری کارگاه‌های مجهز', 'Equipped Workshops Gallery'],
  ['گالری کارگاه و خط تولید (تصاویر جایگزین)', 'Workshop & Production Line Gallery (Placeholder Media)'],
  ['نمایشگاه صنعتی (تصویر نمونه 1)', 'Industrial Showroom (Sample Image 1)'],
  ['بخش ماشین‌کاری (تصویر نمونه 2)', 'CNC Machining Bay (Sample Image 2)'],
  ['واحد برش پنل (تصویر نمونه 3)', 'Panel Sizing Unit (Sample Image 3)'],
  ['واحد لبه چسبان (تصویر نمونه 4)', 'Edge Banding Unit (Sample Image 4)'],
  ['گزارش تصویری نصب و راه‌اندازی', 'Installation & Commissioning Gallery'],
  ['خط کامل برش و لبه چسبان (نمونه)', 'Complete Cutting & Edge Banding Line (Sample)'],
  ['واحد CNC نستینگ (نمونه)', 'Nesting CNC Cell (Sample)'],
  ['واحد برش دورکن (نمونه)', 'Sliding Panel Saw Station (Sample)'],
  ['واحد پرداخت لبه (نمونه)', 'Edge Finishing Station (Sample)'],

  // Testimonials
  ['دیدگاه مشتریان (نمونه)', 'Client Testimonials (Sample)'],
  ['نظرات مشتریان', 'Client Testimonials'],
  ['دیدگاه مدیران تولید', 'Production Directors Feedback'],
  ['تجربه همکاری کارگاه‌ها (متن نمونه)', 'Workshop Collaboration Feedback (Sample)'],
  [
    'متن نمونه: هماهنگی تیم نصب و آموزش اولیه باعث شد خط برش ما در کوتاه‌ترین زمان وارد مدار تولید شود.',
    'Sample: Seamless coordination from installation through operator training brought our cutting line into production in record time.',
  ],
  ['نام کارگاه نمونه الف', 'Sample Workshop Alpha'],
  ['مدیر تولید صنایع کابینت (متن نمونه)', 'Cabinetry Production Manager (Sample)'],
  [
    'متن نمونه: دسترسی به مشاوره فنی هنگام تنظیم دستگاه، اطمینان خاطر خوبی برای اپراتورهای مجموعه ایجاد کرده است.',
    'Sample: Direct access to engineering support during setup gives our machine operators complete confidence on every shift.',
  ],
  ['نام کارگاه نمونه ب', 'Sample Workshop Beta'],
  ['کارگاه دکوراسیون چوبی (متن نمونه)', 'Architectural Woodwork Studio (Sample)'],
  ['دیدگاه مشتریان (متن نمونه)', 'Customer Reviews (Sample)'],
  [
    'متن نمونه: کیفیت نصب و آموزش اپراتوری به ما کمک کرد بهره‌وری خط برش را تنظیم کنیم.',
    'Sample: High installation standards and clear operator training helped optimize our daily panel cutting output.',
  ],
  ['نام کارگاه نمونه', 'Sample Workshop Name'],
  ['مدیر تولید (متن نمونه)', 'Production Manager (Sample)'],
  [
    'متن نمونه: پشتیبانی تلفنی سریع در زمان نیاز، تجربه همکاری مطمئنی ایجاد کرده است.',
    'Sample: Responsive phone troubleshooting has made our ongoing partnership highly reliable.',
  ],
  ['نام مجموعه نمونه', 'Sample Company Name'],
  ['سرپرست کارگاه MDF (متن نمونه)', 'MDF Workshop Supervisor (Sample)'],

  // Pricing / Service Tiers
  ['بسته‌های خدمات و نگهداری', 'Service & Maintenance Plans'],
  ['بسته‌های خدمات', 'Service Plans'],
  ['پکیج‌های تجهیز خط تولید', 'Production Line Packages'],
  ['طرح‌های پشتیبانی و سرویس دوره‌ای (نمونه)', 'Support & Scheduled Maintenance Tiers (Sample)'],
  [
    'تعرفه یا شرایط دقیق را از بخش تنظیمات جایگزین عبارت نمونه کنید.',
    'Update contract pricing and service terms inside the block inspector.',
  ],
  ['بسته راه‌اندازی پایه (نمونه)', 'Essential Commissioning Plan (Sample)'],
  ['طبق قرارداد (نمونه)', 'Per Contract (Sample)'],
  ['مناسب کارگاه‌های تازه‌تاسیس', 'Ideal for newly launched woodworking shops'],
  ['نصب و تراز اولیه در محل', 'On-site installation & leveling'],
  ['آموزش کاربری اپراتور (متن نمونه)', 'Hands-on operator training (Sample)'],
  ['پشتیبانی تلفنی در ساعات اداری', 'Business-hours phone engineering support'],
  ['درخواست اطلاعات', 'Request Info'],
  ['بسته نگهداری دوره‌ای (نمونه)', 'Scheduled Maintenance Plan (Sample)'],
  ['توافقی / سالانه (نمونه)', 'Custom / Annual (Sample)'],
  ['مناسب خطوط تولید فعال و پیوسته', 'Designed for active, high-output production lines'],
  ['بازدید دوره‌ای کالیبراسیون', 'Periodic geometric calibration audits'],
  ['اولویت تامین قطعات مصرفی', 'Priority consumables & tooling dispatch'],
  ['بررسی وضعیت اسپیندل و ریل‌ها', 'Spindle runout & linear guideway inspection'],
  ['پشتیبانی فنی اختصاصی', 'Dedicated senior technician support'],
  ['ثبت درخواست بسته', 'Select Maintenance Plan'],
  ['بسته خطوط صنعتی (نمونه)', 'Enterprise Multi-Line Plan (Sample)'],
  ['استعلام اختصاصی (نمونه)', 'Custom Quote (Sample)'],
  ['مناسب کارخانه‌ها با چند دستگاه هم‌زمان', 'Built for industrial plants running multiple machines'],
  ['برنامه سرویس اختصاصی محل', 'Tailored on-site preventive maintenance schedule'],
  ['آموزش پیشرفته تیم نگهداری', 'Advanced in-house maintenance team training'],
  ['تامین موجودی قطعات یدکی بحرانی', 'Guaranteed critical spare parts stocking'],
  ['تماس با واحد سازمانی', 'Contact Enterprise Desk'],
  ['بسته‌های خدمات و نگهداری (نمونه)', 'Maintenance & Service Tiers (Sample)'],
  ['عناوین و مبالغ واقعی را مطابق شرایط فروش خود ویرایش کنید.', 'Customize plan titles and pricing terms to match your commercial agreement.'],
  ['پکیج پایه (نمونه)', 'Starter Package (Sample)'],
  ['استعلام (نمونه)', 'Quote (Sample)'],
  ['مناسب کارگاه‌های کوچک', 'Built for boutique workshops'],
  ['نصب اولیه در محل', 'Initial on-site installation'],
  ['آموزش اپراتور (نمونه)', 'Operator training (Sample)'],
  ['پشتیبانی تلفنی', 'Phone technical support'],
  ['درخواست بسته', 'Request Package'],
  ['پکیج دوره‌ای (نمونه)', 'Periodic Package (Sample)'],
  ['قراردادی (نمونه)', 'Contract-Based (Sample)'],
  ['پیشنهاد ویژه', 'Featured Plan'],
  ['سرویس دوره‌ای فصلی', 'Quarterly preventive service'],
  ['کالیبراسیون محورها', 'Multi-axis alignment & calibration'],
  ['اولویت تامین قطعه', 'Priority spare parts fulfillment'],
  ['پشتیبانی ویژه', 'Priority hotline support'],
  ['انتخاب بسته', 'Choose Package'],
  ['پکیج سازمانی (نمونه)', 'Enterprise Package (Sample)'],
  ['توافقی (نمونه)', 'Negotiable (Sample)'],
  ['مناسب کارخانه‌های چندخطی', 'Ideal for multi-line factories'],
  ['برنامه نگهداری اختصاصی', 'Dedicated preventive maintenance program'],
  ['آموزش تیم فنی داخلی', 'Internal engineering team training'],
  ['تامین قطعات بحرانی', 'Critical spare parts allocation'],
  ['تماس با فروش', 'Contact Sales'],

  // FAQ
  ['پرسش‌های متداول', 'Frequently Asked Questions'],
  ['سوالات متداول درباره خرید و خدمات (نمونه)', 'Purchasing & Service FAQ (Sample)'],
  [
    'نصب و آموزش کار با دستگاه چگونه انجام می‌شود؟ (نمونه)',
    'How are machine installation and operator training handled? (Sample)',
  ],
  [
    'متن نمونه: پس از تحویل دستگاه در محل کارگاه، کارشناس فنی برای تراز، تست اولیه و آموزش اپراتور حضور پیدا می‌کند.',
    'Sample: Upon delivery to your facility, our field engineer completes laser leveling, trial cuts, and operator training.',
  ],
  [
    'شرایط تامین قطعات مصرفی به چه صورت است؟ (نمونه)',
    'How are spare parts and consumables supplied? (Sample)',
  ],
  [
    'متن نمونه: قطعات مصرفی استاندارد از طریق واحد خدمات پس از فروش قابل سفارش و ارسال به سراسر کشور است.',
    'Sample: OEM consumables and spare parts are stocked centrally and dispatched nationwide via our after-sales desk.',
  ],
  [
    'آیا امکان بازدید حضوری پیش از انتخاب دستگاه وجود دارد؟ (نمونه)',
    'Can we schedule an in-person showroom demo before ordering? (Sample)',
  ],
  [
    'متن نمونه: بله، با هماهنگی قبلی از طریق صفحه تماس می‌توانید جهت بازدید و بررسی عملکرد دستگاه وقت ملاقات بگیرید.',
    'Sample: Yes. You can book a live cutting demonstration at our showroom via the Contact page.',
  ],
  ['پرسش‌های پرتکرار (متن نمونه)', 'Frequently Asked Questions (Sample)'],
  ['فرآیند ارسال و نصب دستگاه چگونه است؟ (نمونه)', 'How does delivery and commissioning work? (Sample)'],
  [
    'متن نمونه: زمان‌بندی ارسال و اعزام کارشناس نصب هنگام ثبت سفارش با کارگاه هماهنگ می‌شود.',
    'Sample: Shipping schedules and technician dispatch dates are coordinated with your plant upon order confirmation.',
  ],
  [
    'آیا آموزش نرم‌افزارهای برش نیز ارائه می‌شود؟ (نمونه)',
    'Is CAM/nesting software training included? (Sample)',
  ],
  [
    'متن نمونه: بله، آموزش مقدماتی کار با کنترلر و آماده‌سازی فایل خروجی در محل انجام می‌گیرد.',
    'Sample: Yes, core controller operation and G-Code post-processing workflows are covered during commissioning.',
  ],
  [
    'نحوه ارتباط با واحد خدمات پس از فروش چیست؟ (نمونه)',
    'How do we reach the after-sales engineering desk? (Sample)',
  ],
  [
    'متن نمونه: از طریق فرم تماس سایت یا شماره تلفن مستقیم واحد فنی می‌توانید درخواست ثبت کنید.',
    'Sample: Submit a service ticket using the contact form or call our technical support hotline directly.',
  ],

  // CTA Banners
  ['دعوت به اقدام (مشاوره خرید)', 'Call to Action (Sales Consultation)'],
  ['بنر دعوت به اقدام', 'Call to Action Banner'],
  ['دعوت به مشاوره', 'Consultation CTA'],
  [
    'نیاز به مشاوره برای تجهیز یا ارتقای کارگاه دارید؟',
    'Need Technical Advice to Equip or Upgrade Your Plant?',
  ],
  [
    'متن نمونه: کارشناسان فروش و فنی گروه صنعتی آرسی آماده پاسخگویی و ارائه کاتالوگ رسمی هستند.',
    'Sample: Arsi Industrial Group sales engineers are ready to advise on machine sizing and provide official catalogs.',
  ],
  ['ثبت درخواست مشاوره', 'Book Consultation'],
  ['آماده دریافت مشاوره تخصصی برای کارگاه خود هستید؟', 'Ready for Specialized Machinery Guidance?'],
  ['متن نمونه: با تیم مهندسی فروش گروه صنعتی آرسی در ارتباط باشید.', 'Sample: Connect with Arsi Industrial Group sales engineering team.'],
  ['درخواست تماس فوری', 'Request Immediate Callback'],

  // Contact & Map
  ['فرم تماس و درخواست مشاوره', 'Contact & Consultation Form'],
  ['فرم تماس', 'Contact Form'],
  ['فرم دریافت مشاوره', 'Lead Consultation Form'],
  ['فرم اعزام کارشناس فنی', 'Technician Dispatch Form'],
  ['ارتباط با واحد فروش و خدمات فنی', 'Connect with Sales & Technical Support'],
  ['تماس با واحد فروش و پشتیبانی', 'Contact Sales & Engineering Support'],
  [
    'متن نمونه: اطلاعات تماس خود را ثبت کنید تا همکاران ما با شما تماس بگیرند.',
    'Sample: Leave your contact details and our engineering team will get in touch promptly.',
  ],
  [
    'متن نمونه: فرم زیر را تکمیل نمایید تا در اسرع وقت با شما تماس گرفته شود.',
    'Sample: Complete the form below and an advisor will contact you shortly.',
  ],
  ['نشانی کارخانه و نمایشگاه (نمونه)', 'Plant & Showroom Address (Sample)'],
  ['شهرک صنعتی، خیابان صنعت، پلاک نمونه 10', 'Industrial Park, Sanat Blvd, Sample Unit 10'],
  ['شهرک صنعتی، بلوار صنعتگران، پلاک نمونه', 'Industrial Zone, Sanatgaran Blvd, Sample Unit'],
  ['شماره تماس (نمونه)', 'Phone Number (Sample)'],
  ['021-00000000', '021-00000000'],
  ['ساعات پاسخگویی (نمونه)', 'Business Hours (Sample)'],
  ['شنبه تا چهارشنبه 8:30 تا 17:00', 'Sat – Wed, 8:30 AM – 5:00 PM'],
  ['شنبه تا پنج‌شنبه 9 تا 18', 'Sat – Thu, 9:00 AM – 6:00 PM'],
  ['شنبه تا پنج‌شنبه 8 تا 18', 'Sat – Thu, 8:00 AM – 6:00 PM'],
  ['ارسال پیام', 'Send Message'],
  ['ارسال درخواست', 'Submit Inquiry'],
  ['نشانی (نمونه)', 'Address (Sample)'],
  ['تلفن (نمونه)', 'Phone (Sample)'],
  ['ساعات کاری (نمونه)', 'Working Hours (Sample)'],
  ['موقعیت مکانی روی نقشه', 'Facility Map Location'],
  ['موقعیت مکانی', 'Location Map'],
  ['موقعیت نمایشگاه مرکزی (تصویر جایگزین)', 'Central Showroom Location (Placeholder Map)'],
  ['موقعیت دفتر مرکزی و کارخانه (تصویر جایگزین)', 'Headquarters & Factory Map (Placeholder)'],
  [
    'این بخش جایگزین نقشه است. می‌توانید نشانی و مختصات دقیق را در تنظیمات جایگزین کنید.',
    'Schematic map placeholder. Replace with your verified facility address and coordinates in the Inspector.',
  ],
  [
    'متن نمونه: نشانی دقیق و کدپستی مجموعه را می‌توانید در بخش محتوا جایگزین کنید.',
    'Sample: Replace this note with your exact plant street address and postal code.',
  ],
  ['35.6892° N, 51.3890° E (نمونه)', '35.6892° N, 51.3890° E (Sample)'],

  // Rich Text
  ['متن تشریحی', 'Rich Text Section'],
  ['درباره خط مشی فنی مجموعه (متن نمونه)', 'Technical Quality Policy (Sample)'],
  [
    'این یک پاراگراف نمونه برای معرفی تاریخچه، استانداردهای کنترل کیفیت و رویکرد خدمات پس از فروش گروه صنعتی آرسی است.\n\nمی‌توانید متن کامل شرکت، گواهینامه‌ها و دستورالعمل‌های بهره‌برداری را در این بخش بنویسید و بین حالت تک‌ستونه یا دوستونه جابه‌جا شوید.',
    'This sample editorial section introduces Arsi Industrial Group history, quality control benchmarks, and after-sales philosophy.\n\nReplace it with your official company profile, ISO certifications, and operating guidelines, or switch between 1-column and 2-column layouts.',
  ],

  // Footer
  ['پاورقی سایت (Footer)', 'Site Footer'],
  ['پاورقی سایت', 'Site Footer'],
  ['پاورقی صفحه', 'Page Footer'],
  ['پاورقی کاتالوگ', 'Catalog Footer'],
  ['پاورقی روشن', 'Light Footer'],
  [
    'متن نمونه: تامین‌کننده ماشین‌آلات CNC و برش چوب و MDF همراه با خدمات نصب و پشتیبانی فنی.',
    'Sample: Industrial supplier of Wood & MDF CNC machinery backed by certified installation and technical service.',
  ],
  [
    '© 1405 گروه صنعتی آرسی — تمامی حقوق محفوظ است (متن نمونه).',
    '© 2026 Arsi Industrial Group — All Rights Reserved (Sample).',
  ],
  ['نشانی نمونه: شهرک صنعتی، بلوار صنعتگران', 'Sample Address: Industrial Zone, Sanatgaran Blvd'],
  ['تلفن تماس نمونه: 021-00000000', 'Sample Phone: +98 21 0000 0000'],
  ['ماشین‌آلات CNC و برش صنایع چوب و MDF', 'Wood & MDF CNC and Panel Cutting Machinery'],
  ['© 1405 گروه صنعتی آرسی (متن نمونه).', '© 2026 Arsi Industrial Group (Sample).'],
  ['© 1405 گروه صنعتی آرسی.', '© 2026 Arsi Industrial Group.'],
  ['شهرک صنعتی، بلوار صنعتگران (نمونه)', 'Industrial Zone, Sanatgaran Blvd (Sample)'],
  ['شهرک صنعتی، بلوار صنعتگران', 'Industrial Zone, Sanatgaran Blvd'],
  ['متن نمونه: تجهیزات برش و CNC صنایع چوب و MDF.', 'Sample: Wood & MDF CNC cutting equipment.'],
  ['ماشین‌آلات برش و CNC صنایع چوب و MDF.', 'Wood & MDF CNC & Panel Cutting Machinery.'],

  // External Templates Copy
  ['نسل جدید ماشین‌کاری چوب و MDF', 'Next-Generation Wood & MDF Machining'],
  [
    'خطوط تمام‌اتوماتیک CNC و برش صنعتی با دقت میکرونی',
    'Full-Automatic CNC & Industrial Cutting Lines with Micron Precision',
  ],
  [
    'طراحی مهندسی برای کارگاه‌های کابینت‌سازی و خطوط تولید انبوه مبلمان با خدمات نصب و پشتیبانی سراسری.',
    'Precision-engineered for custom cabinetry workshops and high-volume furniture plants with nationwide commissioning.',
  ],
  ['مشاوره فنی رایگان', 'Free Technical Consultation'],
  ['مشاهده دستگاه‌ها', 'Browse Machines'],
  ['خط ماشین‌آلات CNC آرسی', 'Arsi CNC Machinery Line'],
  ['تجهیزات پرفروش خطوط تولید', 'Best-Selling Production Line Equipment'],
  [
    'انتخاب هوشمند متناسب با ظرفیت تولید روزانه کارگاه شما',
    'Engineered configurations matched to your workshop daily sheet capacity',
  ],
  ['CNC نستینگ', 'Nesting CNC'],
  ['روتر نستینگ اتوماتیک RCG', 'RCG Automatic Nesting Router'],
  [
    'مناسب برش پیوسته ورق‌های MDF با میز وکیوم چندناحیه‌ای و تعویض ابزار خطی.',
    'Built for continuous MDF sheet nesting featuring multi-zone vacuum bed and linear ATC tool changer.',
  ],
  ['جزئیات فنی', 'Technical Specs'],
  ['دورکن دقیق', 'Precision Panel Saw'],
  ['اره‌فلکه‌ای و دورکن 3800', 'Precision Sliding Panel Saw 3800'],
  [
    'ریل خطی مستحکم و خط‌کش دیجیتال برای برش بدون لب‌پریدگی.',
    'Heavy-duty prismatic guideways with digital rip fence for chip-free panel sizing.',
  ],
  ['لبه چسبان 6 ایستگاهه صنعتی', 'Industrial 6-Station Edge Bander'],
  [
    'پیش‌فرز الماسه، کرنر راوندر و پرداخت نهایی برای خطوط تولید پرتیراژ.',
    'Diamond pre-milling, corner rounding, scraping, and buffing built for continuous high-output shifts.',
  ],
  ['طراحی چیدمان خط برش اختصاصی کارگاه شما', 'Custom Workshop Cutting Line Layout Design'],
  [
    'مهندسان فروش آرسی بر اساس متراژ سالن و تیراژ روزانه، بهترین ترکیب دستگاه را پیشنهاد می‌دهند.',
    'Arsi sales engineers recommend the optimal machinery mix based on your floor area and daily sheet throughput.',
  ],
  ['درخواست بازدید و مشاوره', 'Schedule Visit & Consultation'],
  [
    'تأمین‌کننده تجهیزات پیشرفته برش چوب، CNC و لبه چسبان صنعتی.',
    'Trusted supplier of industrial CNC machining centers, panel saws, and edge banders.',
  ],
  ['نمایشگاه دائمی ماشین‌آلات صنایع چوب', 'Permanent Woodworking Machinery Exhibition'],
  [
    'مجموعه کامل دستگاه‌های برش، CNC و لبه‌چسبان صنعتی',
    'Complete Range of Industrial CNC Routers, Saws & Edge Banders',
  ],
  [
    'مشخصات فنی، تصاویر کارگاهی و مقایسه مدل‌ها برای تصمیم‌گیری دقیق مدیران تولید.',
    'Technical datasheets, plant photography, and side-by-side model comparisons for production directors.',
  ],
  ['درخواست پیش‌فاکتور', 'Request Proforma Invoice'],
  ['مقایسه مدل‌ها', 'Compare Models'],
  ['نمایشگاه صنعتی آرسی', 'Arsi Industrial Showroom'],
  ['فهرست تفصیلی مدل‌ها', 'Detailed Model Catalog'],
  ['مشخصات دسته‌بندی تجهیزات', 'Equipment Category Specifications'],
  [
    'نمای ردیفی برای بررسی سریع قابلیت‌های هر سری دستگاه',
    'Row-by-row breakdown for rapid technical comparison across machine series',
  ],
  ['سری Heavy CNC', 'Heavy CNC Series'],
  ['ماشین CNC پنج‌محوره صنعتی', 'Industrial 5-Axis CNC Machining Center'],
  [
    'مناسب منبت، مبل کلاسیک و قالب‌سازی چوبی با اسپیندل ایتالیایی.',
    'Designed for 5-axis sculpting, classic furniture frames, and mold making with high-torque Italian spindles.',
  ],
  ['استعلام مشخصات', 'Request Datasheet'],
  ['سری Panel Sizing', 'Panel Sizing Series'],
  ['برش پانل کامپیوتری (Panel Saw)', 'Computerized Beam Panel Saw'],
  [
    'بهینه‌سازی اتوماتیک نقشه برش برای کاهش پرت ورق در کارخانه‌ها.',
    'Automated cut-pattern optimization software minimizing board waste in high-volume factories.',
  ],
  ['مرجع تخصصی ماشین‌آلات مدرن صنایع چوب و MDF.', 'Dedicated specialist in modern Wood & MDF industrial machinery.'],
  ['پیشنهاد ویژه تجهیز کارگاه‌ها', 'Turnkey Workshop Automation Offer'],
  [
    'تجهیز کامل خط تولید MDF با شرایط ویژه تحویل و نصب',
    'Complete MDF Production Line with Turnkey Delivery & Commissioning',
  ],
  [
    'پکیج ترکیبی دورکن + لبه چسبان + CNC همراه با 6 ماه سرویس دوره‌ای رایگان.',
    'Bundled Panel Saw + Edge Bander + CNC Router package with 6 months of complimentary preventive maintenance.',
  ],
  ['دریافت پیش‌فاکتور پکیج', 'Get Package Quote'],
  ['تماس با مشاور فروش', 'Speak with Sales Advisor'],
  ['پکیج خط تولید آرسی', 'Arsi Production Line Bundle'],
  ['چرا آرسی؟', 'Why Arsi?'],
  [
    'مزایای همکاری مستقیم با گروه صنعتی آرسی',
    'Advantages of Partnering Direct with Arsi Industrial Group',
  ],
  [
    'از انتخاب فنی تا تأمین قطعات یدکی در کنار خط تولید شما هستیم.',
    'Supporting your plant at every stage—from engineering selection through OEM spare-parts fulfillment.',
  ],
  ['تحویل و نصب سریع', 'Rapid Delivery & Commissioning'],
  ['اعزام مهندس نصب و تراز لیزری دستگاه در محل کارگاه.', 'Field engineer dispatch and laser leveling inside your plant.'],
  ['آموزش تخصصی اپراتور', 'Certified Operator Training'],
  ['دوره عملی نرم‌افزار G-Code و نگهداری روزانه.', 'Hands-on CAM/G-Code programming and daily lubrication training.'],
  ['انبار قطعات اصلی', 'OEM Spare Parts Warehouse'],
  ['دسترسی فوری به اسپیندل، ریل، موتور و مصرفی‌ها.', 'Immediate stock of spindles, linear rails, servo drives, and cutters.'],
  ['ضمانت‌نامه کتبی', 'Written Industrial Warranty'],
  ['پشتیبانی واقعی و سرویس دوره‌ای برنامه‌ریزی‌شده.', 'Verified coverage backed by scheduled preventive maintenance visits.'],
  ['بسته‌های پیشنهادی سرمایه‌گذاری', 'Recommended Turnkey Investment Tiers'],
  ['مناسب کارگاه‌های نوپا تا کارخانه‌های تمام‌اتوماتیک', 'Scaled from startup cabinet shops to automated factories'],
  ['پکیج کارگاهی', 'Workshop Starter Tier'],
  ['استعلام روز', 'Daily Quote'],
  ['شروع سریع کارگاه دکوراسیون داخلی', 'Fast launch for interior millwork workshops'],
  ['دورکن 3200 استاندارد', '3200mm Precision Panel Saw'],
  ['لبه چسبان نیمه‌اتومات', 'Semi-Automatic Edge Bander'],
  ['نصب و آموزش کامل', 'Full commissioning & operator training'],
  ['استعلام پکیج', 'Request Package Quote'],
  ['پکیج صنعتی پلاس', 'Industrial Plus Tier'],
  ['بهترین تعادل سرعت و دقت', 'Optimal balance of cycle speed and accuracy'],
  ['CNC روتر وکیوم‌دار', 'Vacuum-Bed CNC Router'],
  ['نرم‌افزار بهینه‌سازی برش', 'Nesting & Cut-Optimization Suite'],
  ['سرویس فصلی رایگان', 'Complimentary quarterly maintenance'],
  ['انتخاب پکیج ویژه', 'Select Featured Tier'],
  ['پکیج کارخانه هوشمند', 'Smart Factory Tier'],
  ['قراردادی', 'Enterprise Contract'],
  ['تولید انبوه و اتوماسیون', 'Mass production & automated material handling'],
  ['CNC نستینگ بارگذاری اتومات', 'Auto-Load/Unload Nesting CNC'],
  ['پنل‌سا کامپیوتری', 'Computerized Beam Saw'],
  ['آموزش تیم فنی اختصاصی', 'Dedicated plant engineering training'],
  ['جلسه مهندسی فروش', 'Book Engineering Review'],
  ['سوالات خرید و ضمانت', 'Purchasing & Warranty FAQ'],
  ['پاسخ به پرسش‌های رایج خریداران', 'Answers to Common Buyer Questions'],
  ['شرایط پرداخت و زمان تحویل دستگاه‌ها چگونه است؟', 'What are payment terms and lead times?'],
  [
    'بسته به موجودی انبار و مدل انتخابی، تحویل فوری یا برنامه‌ریزی‌شده با پیش‌پرداخت توافقی انجام می‌شود.',
    'Depending on warehouse stock and machine configuration, immediate dispatch or scheduled delivery is available under flexible terms.',
  ],
  ['آیا پیش از خرید امکان تست عملی دستگاه وجود دارد؟', 'Can we test-cut sample panels prior to purchase?'],
  [
    'بله، در نمایشگاه مرکزی می‌توانید با ورق نمونه خود کیفیت برش و لبه‌چسبانی را از نزدیک بررسی کنید.',
    'Yes—bring your own MDF boards to our central showroom to inspect routing and edge-banding finish firsthand.',
  ],
  ['ثبت درخواست پیش‌فاکتور و مشاوره', 'Request Proforma & Engineering Advice'],
  [
    'مشخصات تماس خود را ثبت کنید تا کارشناس مربوطه با شما تماس بگیرد.',
    'Submit your contact information and a specialist sales engineer will follow up.',
  ],
  ['نشانی نمایشگاه', 'Showroom Address'],
  ['تهران، شهرک صنعتی، بلوار صنعتگران', 'Tehran, Industrial Park, Sanatgaran Blvd'],
  ['تلفن فروش', 'Sales Desk'],
  ['پاسخگویی', 'Support Hours'],
  ['درباره گروه صنعتی آرسی', 'About Arsi Industrial Group'],
  ['مهندسی دقیق در خدمت صنعت چوب و مبلمان مدرن', 'Precision Engineering for Modern Woodworking & Furniture'],
  [
    'بیش از یک دهه همراهی با تولیدکنندگان حرفه‌ای در تامین، کالیبراسیون و نوسازی خطوط برش.',
    'Over a decade empowering manufacturers through CNC equipment supply, calibration, and cutting-line modernization.',
  ],
  ['بازدید از نمایشگاه', 'Visit Showroom'],
  ['ارتباط با مدیریت', 'Contact Executive Desk'],
  ['خط تولید گروه صنعتی آرسی', 'Arsi Industrial Production Line'],
  ['داستان و ماموریت شرکت', 'Company Story & Mission'],
  ['استانداردهای کنترل کیفیت و تعهد فنی آرسی', 'Arsi Quality Control Standards & Technical Commitment'],
  [
    'گروه صنعتی آرسی با هدف ارتقای بهره‌وری کارگاه‌ها و کارخانه‌های صنایع چوب، مجموعه‌ای از دقیق‌ترین ماشین‌آلات برش، CNC و لبه چسبان را عرضه می‌کند.\n\nتمامی دستگاه‌ها پیش از تحویل تحت آزمون‌های دقیق هندسی، آزمون اسپیندل و کالیبراسیون کنترلر قرار می‌گیرند تا خط تولید مشتری بدون توقف آغاز به کار کند.',
    'Arsi Industrial Group supplies precision CNC routers, panel saws, and edge banders built to elevate woodworking plant productivity.\n\nEvery machine undergoes strict geometric alignment checks, spindle runout verification, and controller calibration before dispatch so your production floor launches seamlessly.',
  ],
  ['اعتماد برندهای پیشرو صنعت مبلمان', 'Trusted by Leading Furniture & Cabinetry Brands'],
  [
    'دقت برش و کیفیت سرویس دوره‌ای آرسی باعث شد ضایعات ورق ما به شکل محسوسی کاهش یابد.',
    'Arsi cutting precision and disciplined preventive maintenance measurably reduced our board offcut waste.',
  ],
  ['مجتمع تولیدی نمونه', 'Sample Manufacturing Complex'],
  ['مدیر خط تولید کابینت', 'Cabinetry Line Director'],
  [
    'تامین سریع قطعات و پاسخگویی صادقانه تیم فنی، مهم‌ترین دلیل تداوم همکاری ما بوده است.',
    'Rapid spare-parts dispatch and transparent technical support are why we continue scaling our plant with Arsi.',
  ],
  ['صنایع چوب پارس (نمونه)', 'Pars Wood Industries (Sample)'],
  ['مدیرعامل', 'Managing Director'],
  ['نقشه دفتر مرکزی و کارخانه', 'Headquarters & Plant Map'],
  ['موقعیت مکانی نمایشگاه و واحد فنی', 'Showroom & Technical Center Location'],
  [
    'دسترسی مستقیم از اتوبان اصلی شهرک صنعتی جهت بازدید حضوری و تست دستگاه.',
    'Direct highway access to our industrial park showroom for live machine demonstrations.',
  ],
  ['35.6892° N, 51.3890° E', '35.6892° N, 51.3890° E'],
  ['خدمات واحد فنی RCG', 'RCG Engineering Services'],
  ['واحد خدمات مهندسی و پشتیبانی آرسی', 'Arsi Engineering Service & Support Division'],
  [
    'اعزام کارشناس، عیب‌یابی کنترلر، بالانس اسپیندل و تأمین قطعات اصلی.',
    'On-site technician dispatch, controller diagnostics, spindle balancing, and genuine OEM parts.',
  ],
  ['نصب و تراز لیزری', 'Laser Installation & Leveling'],
  ['راه‌اندازی استاندارد خطوط برش و CNC در سراسر کشور.', 'Nationwide turnkey commissioning for CNC & cutting lines.'],
  ['کالیبراسیون و سرویس دوره‌ای', 'Calibration & Scheduled Maintenance'],
  ['تنظیم گونیا، ریل‌های خطی و سیستم وکیوم.', 'Squaring gantry alignment, linear guides, and vacuum manifolds.'],
  ['عیب‌یابی آنلاین و تلفنی', 'Remote & Phone Diagnostics'],
  ['پاسخگویی سریع مهندسان برق و مکانیک.', 'Fast response from electrical and mechanical CNC engineers.'],
  ['تأمین قطعات اورجینال', 'OEM Spare Parts Supply'],
  ['ارسال فوری تیغه‌اره، الماسه، رله و قطعات مکانیکی.', 'Same-day dispatch of saw blades, diamond cutters, relays, and bearings.'],
  ['راهنمای نگهداری و پرسش‌های فنی', 'Maintenance Guide & Technical FAQ'],
  ['سوالات متداول بخش تعمیرات و نگهداری', 'Repairs & Maintenance FAQ'],
  ['دوره پیشنهادی گریس‌کاری ریل‌ها و بال‌اسکرو چیست؟', 'How often should linear rails and ballscrews be lubricated?'],
  [
    'در شیفت کاری تک‌نوبته، بازبینی هفتگی و روان‌کاری مطابق جدول دفترچه دستگاه توصیه می‌شود.',
    'For single-shift operation, weekly inspection and automated or manual lubrication per your machine manual chart is recommended.',
  ],
  ['چگونه درخواست اعزام کارشناس ثبت کنیم؟', 'How do we schedule a field technician visit?'],
  [
    'از طریق فرم پایین صفحه، شماره سریال دستگاه و شرح خطا را ارسال نمایید.',
    'Submit your machine serial number and fault summary through the ticket form below.',
  ],
  ['ثبت تیکت خدمات پس از فروش', 'Submit After-Sales Service Ticket'],
  [
    'پاسخگویی اولویت‌دار برای دستگاه‌های دارای قرارداد نگهداری فعال.',
    'Priority engineering response for facilities covered by an active maintenance agreement.',
  ],
  ['واحد خدمات مرکزی', 'Central Service Center'],
  ['شهرک صنعتی، سوله خدمات مهندسی آرسی', 'Industrial Zone, Arsi Engineering Service Hall'],
  ['خط ویژه فنی', 'Technical Hotline'],
  ['شیفت پشتیبانی', 'Support Shift'],
  ['ارسال درخواست فنی', 'Submit Technical Request'],
  ['مهندسی مدرن صنایع چوب', 'Modern Woodworking Engineering'],
  ['دقت صنعتی در طراحی مدرن خطوط برش و CNC', 'Industrial Precision in Modern CNC & Cutting Lines'],
  [
    'انتخابی مطمئن برای برندهای معماری داخلی و تولیدکنندگان مبلمان صادراتی.',
    'The trusted choice for architectural millwork studios and export-grade furniture manufacturers.',
  ],
  ['دریافت کاتالوگ 1405', 'Download 2026 Catalog'],
  ['محصولات برگزیده', 'Featured Machinery'],
  ['کیفیت ساخت بالا و طراحی ارگونومیک کاربری', 'Heavy-duty build quality with ergonomic operator controls'],
  ['CNC', 'CNC'],
  ['سی‌ان‌سی سری دقیق RCG', 'RCG Precision CNC Series'],
  ['عملکرد بی‌صدا و راندمان بالا در شیفت‌های طولانی.', 'Low-noise operation and sustained accuracy across multi-shift production.'],
  ['اطلاعات بیشتر', 'Learn More'],
  ['دورکن اتوماتیک سری پرو', 'Pro Series Automatic Panel Saw'],
  ['تنظیم دیجیتال زاویه و ارتفاع اره با دقت دهم میلی‌متر.', 'Digital blade tilt and height positioning to 0.1 mm precision.'],
  ['لبه چسبان پیش‌فرزدار', 'Pre-Milling Edge Bander'],
  ['خط چسب فوق‌العاده ظریف برای ورق‌های هایگلاس و مات.', 'Zero-glue-line finish tailored for high-gloss and matte laminated boards.'],
  ['شروع', 'Get Started'],
  ['کلید جدید', 'New Button'],
  ['مناسب خطوط تولید پیوسته', 'Designed for continuous production lines'],
  ['لبه چسبان 6 ایستگاهه', '6-Station Edge Bander'],
  ['دستگاه CNC مینیمال', 'Minimalist CNC Machine'],
  ['شوکیس ماشین‌آلات CNC (مدل Webflow Industrial)', 'CNC Machinery Showcase (Webflow Style)'],
  [
    'لندینگ کامل با هدر، بخش معرفی پرقدرت، آمار فنی، محصولات، نظرات مشتریان و دعوت به اقدام.',
    'Complete industrial landing page with hero, metrics strip, machinery grid, testimonials & CTA.',
  ],
  ['کاتالوگ نمایشگاهی بنتو (مدل Framer Marketplace)', 'Bento Machinery Catalog (Framer Style)'],
  [
    'چیدمان کاتالوگ مدرن با معرفی متمرکز، گالری نمایشگاهی، ردیف‌های مشخصات و مقایسه سرویس‌ها.',
    'Modern catalog layout featuring centered hero, visual gallery, detailed product rows & tiers.',
  ],
  ['لندینگ تبدیل سرنخ B2B (مدل Relume Kit)', 'B2B Lead Conversion (Relume Kit)'],
  [
    'معماری هدفمند برای دریافت سرنخ فروش شامل مزیت‌های رقابتی، تعرفه خدمات، سوالات متداول و فرم تماس.',
    'High-converting B2B funnel with feature grid, service tiers, FAQ accordion, and lead capture form.',
  ],
  ['صفحه معرفی کارخانه و برند (مدل Tailwind Corporate)', 'Corporate Plant & Brand (Tailwind Style)'],
  [
    'مناسب صفحه درباره ما و معرفی زیرساخت‌های مهندسی، گالری خط تولید و دیدگاه شرکای تجاری.',
    'Editorial corporate profile with rich narrative, stats, workshop gallery, and customer quotes.',
  ],
  ['پورتال خدمات فنی و گارانتی (مدل Flowbite)', 'Technical Service & Support (Flowbite Style)'],
  [
    'ساختار آماده برای صفحه خدمات پس از فروش، درخواست تعمیرکار، پرسش‌های فنی و قرارداد نگهداری.',
    'Dedicated after-sales support portal with service grid, maintenance tiers, FAQ & dispatch form.',
  ],
  ['قالب روشن و مینیمال مهندسی (مدل Clean Light)', 'Clean Light Engineering (Awwwards Style)'],
  [
    'قالب روشن با کنتراست استاندارد سرمه‌ای روی پس‌زمینه سفید و جزئیات نارنجی برای ارائه کاتالوگ مدرن.',
    'Crisp light-mode corporate aesthetic pairing high-contrast navy typography on clean white surfaces.',
  ],
];

const memoryFaToEn = new Map<string, string>();
const memoryEnToFa = new Map<string, string>();

export function normalizeLookupKey(text: string): string {
  return text
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, '\u200c')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

const dictFaToEn = new Map<string, string>();
const dictEnToFa = new Map<string, string>();

for (const [fa, en] of FA_TO_EN_PAIRS) {
  const normFa = normalizeLookupKey(fa);
  const normEn = normalizeLookupKey(en);
  if (!dictFaToEn.has(normFa)) dictFaToEn.set(normFa, en);
  if (!dictEnToFa.has(normEn)) dictEnToFa.set(normEn, fa);
}

export function rememberTranslationPair(sourceText: string, translatedText: string, targetLang: Language): void {
  const srcNorm = normalizeLookupKey(sourceText);
  const dstNorm = normalizeLookupKey(translatedText);
  if (!srcNorm || !dstNorm) return;
  if (targetLang === 'en') {
    memoryFaToEn.set(srcNorm, translatedText);
    memoryEnToFa.set(dstNorm, sourceText);
  } else {
    memoryEnToFa.set(srcNorm, translatedText);
    memoryFaToEn.set(dstNorm, sourceText);
  }
}

function toPersianDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function toLatinDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

function translateDynamicPattern(text: string, targetLang: Language): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (targetLang === 'en') {
    const copyMatch = trimmed.match(/^(.+?)\s*\(کپی\)$/);
    if (copyMatch) {
      const base = lookupDictionaryOrCache(copyMatch[1], 'en') ?? copyMatch[1];
      return `${base} (Copy)`;
    }
    const newProjMatch = toLatinDigits(trimmed).match(/^پروژه جدید\s*\((\d+)\)$/);
    if (newProjMatch) {
      return `New Project (${newProjMatch[1]})`;
    }
    const pageTitleBrandMatch = trimmed.match(/^(.+?)\s*\|\s*گروه صنعتی آرسی$/);
    if (pageTitleBrandMatch) {
      const prefix = lookupDictionaryOrCache(pageTitleBrandMatch[1], 'en') ?? pageTitleBrandMatch[1];
      return `${prefix} | Arsi Industrial Group`;
    }
    const descDashBrandMatch = trimmed.match(/^(.+?)\s*—\s*گروه صنعتی آرسی \(RCG\)$/);
    if (descDashBrandMatch) {
      const prefix = lookupDictionaryOrCache(descDashBrandMatch[1], 'en') ?? descDashBrandMatch[1];
      return `${prefix} — Arsi Industrial Group (RCG)`;
    }
  } else {
    const copyMatch = trimmed.match(/^(.+?)\s*\(Copy\)$/i);
    if (copyMatch) {
      const base = lookupDictionaryOrCache(copyMatch[1], 'fa') ?? copyMatch[1];
      return `${base} (کپی)`;
    }
    const newProjMatch = trimmed.match(/^New Project\s*\((\d+)\)$/i);
    if (newProjMatch) {
      return `پروژه جدید (${toPersianDigits(newProjMatch[1])})`;
    }
    const pageTitleBrandMatch = trimmed.match(/^(.+?)\s*\|\s*Arsi Industrial Group$/i);
    if (pageTitleBrandMatch) {
      const prefix = lookupDictionaryOrCache(pageTitleBrandMatch[1], 'fa') ?? pageTitleBrandMatch[1];
      return `${prefix} | گروه صنعتی آرسی`;
    }
    const descDashBrandMatch = trimmed.match(/^(.+?)\s*—\s*Arsi Industrial Group \(RCG\)$/i);
    if (descDashBrandMatch) {
      const prefix = lookupDictionaryOrCache(descDashBrandMatch[1], 'fa') ?? descDashBrandMatch[1];
      return `${prefix} — گروه صنعتی آرسی (RCG)`;
    }
  }

  return null;
}

export function lookupDictionaryOrCache(text: string, targetLang: Language): string | null {
  if (!text || !text.trim()) return null;
  const norm = normalizeLookupKey(text);
  const direct =
    targetLang === 'en'
      ? memoryFaToEn.get(norm) ?? dictFaToEn.get(norm)
      : memoryEnToFa.get(norm) ?? dictEnToFa.get(norm);
  if (direct) return direct;

  return translateDynamicPattern(text, targetLang);
}

export function isNonTranslatableValue(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^(https?:\/\/|data:|blob:|mailto:|tel:|#|\/)/i.test(trimmed)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return true;
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) return true;
  // Pure numbers, coordinates, units without prose
  if (/^[0-9۰-۹٠-۹.,:;+\-–—°'"()/\s%]+$/.test(trimmed)) return true;
  if (/^\d+(\.\d+)?°\s*[NS],\s*\d+(\.\d+)?°\s*[EW]$/i.test(trimmed)) return true;
  return false;
}

const KNOWN_TECHNICAL_LATIN_TOKENS = new Set([
  'RCG',
  'CNC',
  'CNC-A',
  'CNC-B',
  'MDF',
  'HDF',
  'HPL',
  'PVC',
  'ABS',
  'SEO',
  'OG',
  'G-CODE',
  'GCODE',
  'CAD',
  'CAM',
  'API',
  'UI',
  'UX',
  'HTML',
  'CSS',
  'ZIP',
  'JSON',
  'URL',
  'HTTP',
  'HTTPS',
  'POST',
  'GET',
  'B2B',
  'CTA',
  'FAQ',
  'ISO',
  'MM',
  'CM',
  'KW',
  'RPM',
  'HERO',
  'FOOTER',
  'NAVBAR',
  'HEAVY',
  'PANEL',
  'SIZING',
  'SAW',
  'WEBFLOW',
  'FRAMER',
  'RELUME',
  'TAILWIND',
  'FLOWBITE',
  'AWWWARDS',
]);

export function needsTranslationForTarget(text: string, targetLang: Language): boolean {
  if (isNonTranslatableValue(text)) return false;

  const hasPersian = /[\u0600-\u06FF]/.test(text);
  if (targetLang === 'en') {
    return hasPersian;
  }

  // targetLang === 'fa': check if there are untranslated English words that aren't purely technical tokens
  const latinWords = text.match(/[A-Za-z][A-Za-z0-9-]*/g);
  if (!latinWords || latinWords.length === 0) return false;
  if (hasPersian) {
    // Mixed text (e.g. "دستگاه CNC") does not need translation to Persian
    return false;
  }
  const nonAcronymWords = latinWords.filter(
    (w) => w.length >= 2 && !KNOWN_TECHNICAL_LATIN_TOKENS.has(w.toUpperCase())
  );
  return nonAcronymWords.length > 0;
}

const TRANSLATABLE_CONTENT_KEYS = [
  'brandName',
  'ctaLabel',
  'kicker',
  'headline',
  'subheadline',
  'primaryCta',
  'secondaryCta',
  'imageAlt',
  'heading',
  'subheading',
  'description',
  'submitLabel',
  'addressLabel',
  'addressValue',
  'phoneLabel',
  'phoneValue',
  'hoursLabel',
  'hoursValue',
  'caption',
  'coordinates',
  'body',
  'summary',
  'copyright',
  'address',
  'phone',
] as const;

const TRANSLATABLE_ITEM_KEYS = [
  'value',
  'label',
  'title',
  'description',
  'category',
  'ctaLabel',
  'caption',
  'quote',
  'author',
  'role',
  'question',
  'answer',
] as const;

interface FieldSlot {
  key: string;
  get: () => string | undefined;
  set: (next: string) => void;
  maxLen?: number;
}

function collectLinkSlots(
  prefix: string,
  link: LinkTarget | undefined,
  slots: FieldSlot[]
): void {
  if (!link || typeof link.labelSnapshot !== 'string') return;
  slots.push({
    key: `${prefix}.labelSnapshot`,
    get: () => link.labelSnapshot,
    set: (v) => {
      link.labelSnapshot = v;
    },
  });
}

function collectBlockSlots(prefix: string, block: Partial<BlockInstance>, slots: FieldSlot[]): void {
  if (typeof block.label === 'string') {
    slots.push({
      key: `${prefix}.label`,
      get: () => block.label,
      set: (v) => {
        block.label = v;
      },
    });
  }

  const c = block.content;
  if (!c || typeof c !== 'object') return;

  for (const field of TRANSLATABLE_CONTENT_KEYS) {
    if (typeof c[field] === 'string') {
      slots.push({
        key: `${prefix}.c.${field}`,
        get: () => c[field],
        set: (v) => {
          c[field] = v;
        },
      });
    }
  }

  collectLinkSlots(`${prefix}.c.primaryLink`, c.primaryLink as LinkTarget | undefined, slots);
  collectLinkSlots(`${prefix}.c.secondaryLink`, c.secondaryLink as LinkTarget | undefined, slots);
  collectLinkSlots(`${prefix}.c.ctaLink`, c.ctaLink as LinkTarget | undefined, slots);

  if (Array.isArray(c.buttons)) {
    (c.buttons as ActionButtonItem[]).forEach((btn, idx) => {
      if (!btn || typeof btn !== 'object') return;
      if (typeof btn.label === 'string') {
        slots.push({
          key: `${prefix}.btn.${idx}.label`,
          get: () => btn.label,
          set: (v) => {
            btn.label = v;
          },
        });
      }
      collectLinkSlots(`${prefix}.btn.${idx}.link`, btn.link, slots);
    });
  }

  if (Array.isArray(c.items)) {
    c.items.forEach((item: Record<string, any>, idx: number) => {
      if (!item || typeof item !== 'object') return;
      for (const field of TRANSLATABLE_ITEM_KEYS) {
        if (typeof item[field] === 'string') {
          slots.push({
            key: `${prefix}.item.${idx}.${field}`,
            get: () => item[field],
            set: (v) => {
              item[field] = v;
            },
          });
        }
      }
      collectLinkSlots(`${prefix}.item.${idx}.ctaLink`, item.ctaLink as LinkTarget | undefined, slots);
    });
  }

  if (Array.isArray(c.plans)) {
    c.plans.forEach((plan: Record<string, any>, idx: number) => {
      if (!plan || typeof plan !== 'object') return;
      for (const field of ['name', 'price', 'description', 'ctaLabel'] as const) {
        if (typeof plan[field] === 'string') {
          slots.push({
            key: `${prefix}.plan.${idx}.${field}`,
            get: () => plan[field],
            set: (v) => {
              plan[field] = v;
            },
          });
        }
      }
      if (Array.isArray(plan.features)) {
        plan.features.forEach((feat: unknown, fIdx: number) => {
          if (typeof feat === 'string') {
            slots.push({
              key: `${prefix}.plan.${idx}.feat.${fIdx}`,
              get: () => plan.features[fIdx],
              set: (v) => {
                plan.features[fIdx] = v;
              },
            });
          }
        });
      }
      collectLinkSlots(`${prefix}.plan.${idx}.ctaLink`, plan.ctaLink as LinkTarget | undefined, slots);
    });
  }
}

function collectProjectSlots(project: ProjectData): FieldSlot[] {
  const slots: FieldSlot[] = [];

  slots.push({
    key: 'projectName',
    get: () => project.projectName,
    set: (v) => {
      project.projectName = v.slice(0, 140);
    },
    maxLen: 140,
  });

  (project.navMenu || []).forEach((item: NavMenuItem, idx: number) => {
    slots.push({
      key: `nav.${idx}.label`,
      get: () => item.label,
      set: (v) => {
        item.label = v;
      },
    });
    collectLinkSlots(`nav.${idx}.link`, item.link, slots);
  });

  (project.assets || []).forEach((asset, idx) => {
    slots.push({
      key: `asset.${idx}.name`,
      get: () => asset.name,
      set: (v) => {
        asset.name = v;
      },
    });
    if (Array.isArray(asset.tags)) {
      asset.tags.forEach((_, tIdx) => {
        slots.push({
          key: `asset.${idx}.tag.${tIdx}`,
          get: () => asset.tags[tIdx],
          set: (v) => {
            asset.tags[tIdx] = v;
          },
        });
      });
    }
  });

  (project.pages || []).forEach((page: PageData, pIdx: number) => {
    slots.push({
      key: `p.${pIdx}.title`,
      get: () => page.title,
      set: (v) => {
        page.title = v.slice(0, 140);
      },
      maxLen: 140,
    });
    if (page.seo) {
      slots.push({
        key: `p.${pIdx}.seoTitle`,
        get: () => page.seo.title,
        set: (v) => {
          page.seo.title = v.slice(0, 200);
        },
        maxLen: 200,
      });
      slots.push({
        key: `p.${pIdx}.seoDesc`,
        get: () => page.seo.description,
        set: (v) => {
          page.seo.description = v.slice(0, 600);
        },
        maxLen: 600,
      });
    }
    (page.blocks || []).forEach((blk, bIdx) => {
      collectBlockSlots(`p.${pIdx}.b.${bIdx}`, blk, slots);
    });
  });

  return slots;
}

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

function applySlotTranslation(slot: FieldSlot, currentVal: string, nextVal: string, targetLang: Language): void {
  const safeVal = slot.maxLen ? nextVal.slice(0, slot.maxLen) : nextVal;
  rememberTranslationPair(currentVal, safeVal, targetLang);
  slot.set(safeVal);
}

/**
 * Translates a single block (or template block) synchronously via the specialized dictionary & cache.
 */
export function translateBlockLocally<T extends Partial<BlockInstance>>(block: T, targetLang: Language): T {
  const cloned = deepClone(block);
  const slots: FieldSlot[] = [];
  collectBlockSlots('blk', cloned, slots);

  for (const slot of slots) {
    const current = slot.get();
    if (!current || !needsTranslationForTarget(current, targetLang)) continue;
    const hit = lookupDictionaryOrCache(current, targetLang);
    if (hit) {
      applySlotTranslation(slot, current, hit, targetLang);
    }
  }
  return cloned;
}

/**
 * Translates all matching built-in & previously cached strings across the entire ProjectData
 * synchronously, and returns any remaining custom user strings that still need AI translation.
 */
export function translateProjectLocally(
  project: ProjectData,
  targetLang: Language
): {
  project: ProjectData;
  changedCount: number;
  pendingEntries: Array<{ key: string; text: string }>;
} {
  const cloned = deepClone(project);
  const slots = collectProjectSlots(cloned);
  let changedCount = 0;
  const pendingMap = new Map<string, string>();

  for (const slot of slots) {
    const current = slot.get();
    if (!current || !needsTranslationForTarget(current, targetLang)) continue;

    const hit = lookupDictionaryOrCache(current, targetLang);
    if (hit) {
      applySlotTranslation(slot, current, hit, targetLang);
      changedCount += 1;
    } else {
      pendingMap.set(slot.key, current);
    }
  }

  const pendingEntries = Array.from(pendingMap.entries()).map(([key, text]) => ({
    key,
    text,
  }));

  return {
    project: cloned,
    changedCount,
    pendingEntries,
  };
}

/**
 * Applies AI-translated key->text entries onto a ProjectData clone and updates bidirectional cache.
 */
export function applyTranslatedEntriesToProject(
  project: ProjectData,
  translatedByKey: Map<string, string>,
  targetLang: Language
): { project: ProjectData; appliedCount: number } {
  const cloned = deepClone(project);
  const slots = collectProjectSlots(cloned);
  let appliedCount = 0;

  for (const slot of slots) {
    const current = slot.get();
    if (!current) continue;
    const translated = translatedByKey.get(slot.key);
    if (translated && translated.trim() && translated.trim() !== current.trim()) {
      applySlotTranslation(slot, current, translated.trim(), targetLang);
      appliedCount += 1;
    }
  }

  return { project: cloned, appliedCount };
}

/**
 * Calls server-side Gemini translation endpoint in clean batches for custom user copy.
 */
export async function translatePendingEntriesViaAI(
  entries: Array<{ key: string; text: string }>,
  targetLang: Language
): Promise<{ ok: boolean; translations: Map<string, string>; unavailable?: boolean }> {
  const result = new Map<string, string>();
  if (entries.length === 0) {
    return { ok: true, translations: result };
  }

  // Deduplicate identical source strings before calling AI to preserve consistency & speed
  const uniqueTextToKeys = new Map<string, string[]>();
  const dedupedBatch: Array<{ key: string; text: string }> = [];

  for (const entry of entries) {
    const norm = normalizeLookupKey(entry.text);
    const existingKeys = uniqueTextToKeys.get(norm);
    if (existingKeys) {
      existingKeys.push(entry.key);
    } else {
      uniqueTextToKeys.set(norm, [entry.key]);
      dedupedBatch.push({ key: entry.key, text: entry.text });
    }
  }

  const BATCH_SIZE = 45;
  try {
    for (let i = 0; i < dedupedBatch.length; i += BATCH_SIZE) {
      const chunk = dedupedBatch.slice(i, i + BATCH_SIZE);
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate-project',
          payload: {
            targetLang,
            entries: chunk,
          },
        }),
      });

      if (res.status === 503) {
        return { ok: false, translations: result, unavailable: true };
      }
      if (!res.ok) {
        return { ok: false, translations: result };
      }

      const data = await res.json();
      const translatedList = Array.isArray(data?.result) ? data.result : [];
      const keyToOrigNorm = new Map<string, string>();
      chunk.forEach((item) => keyToOrigNorm.set(item.key, normalizeLookupKey(item.text)));

      for (const item of translatedList) {
        const itemKey = typeof item?.key === 'string' ? item.key : '';
        const itemText = typeof item?.text === 'string' ? item.text : '';
        if (!itemKey || !itemText.trim()) continue;
        const origNorm = keyToOrigNorm.get(itemKey);
        const mappedKeys = origNorm ? uniqueTextToKeys.get(origNorm) ?? [itemKey] : [itemKey];
        for (const k of mappedKeys) {
          result.set(k, itemText.trim());
        }
      }
    }
    return { ok: true, translations: result };
  } catch {
    return { ok: false, translations: result };
  }
}
