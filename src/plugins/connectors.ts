import { registerConnector } from './registry';

let connectorsInitialized = false;

export function initializeBuiltInConnectors(): void {
  if (connectorsInitialized) return;
  connectorsInitialized = true;

  // 1. Google Analytics 4 Connector
  registerConnector({
    id: 'google-analytics',
    nameFa: 'تحلیلگر گوگل آنالیتیکس (GA4)',
    nameEn: 'Google Analytics (GA4)',
    descriptionFa: 'تزریق خودکار شناسه اندازه‌گیری GA4 در تگ head خروجی HTML صفحات.',
    descriptionEn: 'Injects your GA4 Measurement ID snippet into the exported HTML head.',
    fields: [
      {
        key: 'measurementId',
        labelFa: 'شناسه اندازه‌گیری (Measurement ID)',
        labelEn: 'Measurement ID',
        placeholder: 'G-XXXXXXXXXX',
        type: 'text',
      },
    ],
    injectHeadHtml: (values) => {
      const id = (values.measurementId || '').trim();
      if (!id) return '';
      const safeId = id.replace(/[^A-Za-z0-9_-]/g, '');
      return `<!-- Google Analytics (Connector) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${safeId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${safeId}');
</script>`;
    },
  });

  // 2. Contact Form Webhook Connector
  registerConnector({
    id: 'contact-webhook',
    nameFa: 'وب‌هوک فرم تماس و استعلام (Webhook)',
    nameEn: 'Contact Form Webhook',
    descriptionFa: 'ارسال اطلاعات فرم‌های تماس و درخواست مشاوره به آدرس وب‌هوک CRM یا سرور داخلی.',
    descriptionEn: 'Posts contact form inquiries from exported pages directly to your webhook URL.',
    fields: [
      {
        key: 'webhookUrl',
        labelFa: 'نشانی وب‌هوک (Endpoint URL)',
        labelEn: 'Webhook URL',
        placeholder: 'https://hooks.example.com/arsi-lead',
        type: 'url',
      },
      {
        key: 'method',
        labelFa: 'متد ارسال',
        labelEn: 'HTTP Method',
        placeholder: 'POST',
        type: 'select',
        options: [
          { value: 'POST', labelFa: 'POST (استاندارد)', labelEn: 'POST' },
          { value: 'PUT', labelFa: 'PUT', labelEn: 'PUT' },
        ],
      },
    ],
    injectFormAttributes: (values): Record<string, string> => {
      const url = (values.webhookUrl || '').trim();
      if (!url) return {};
      return {
        action: url,
        method: values.method || 'POST',
      };
    },
  });

  // 3. Newsletter Provider Connector
  registerConnector({
    id: 'newsletter-provider',
    nameFa: 'سرویس خبرنامه صنعتی (Newsletter)',
    nameEn: 'Newsletter Provider',
    descriptionFa: 'اتصال فرم‌های اشتراک فوتر و بنرها به سرویس خبرنامه ایمیلی یا پیامکی.',
    descriptionEn: 'Connects footer & banner subscription forms to your newsletter provider.',
    fields: [
      {
        key: 'provider',
        labelFa: 'ارائه‌دهنده سرویس',
        labelEn: 'Provider',
        placeholder: 'mailerlite',
        type: 'select',
        options: [
          { value: 'custom', labelFa: 'سرویس اختصاصی (Webhook)', labelEn: 'Custom Endpoint' },
          { value: 'mailchimp', labelFa: 'Mailchimp', labelEn: 'Mailchimp' },
          { value: 'mailerlite', labelFa: 'MailerLite', labelEn: 'MailerLite' },
        ],
      },
      {
        key: 'listId',
        labelFa: 'شناسه لیست یا فرم (List ID)',
        labelEn: 'Audience / List ID',
        placeholder: 'arsi-industrial-news',
        type: 'text',
      },
    ],
  });
}
