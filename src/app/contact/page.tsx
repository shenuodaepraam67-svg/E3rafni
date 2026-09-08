import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اتصل بنا | اعرفني",
  description: "تواصل مع فريق اعرفني للاستفسارات والملاحظات والمساعدة في حل مشكلات الموقع.",
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: "اتصل بنا | اعرفني",
    description: "تواصل مع فريق اعرفني للاستفسارات والملاحظات والمساعدة في حل مشكلات الموقع.",
    url: 'https://e3rafni.vercel.app/contact',
    siteName: 'اعرفني',
    locale: 'ar_AR',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-3xl font-bold text-center mb-8">اتصل بنا</h1>
          
          <section className="bg-white rounded-lg shadow-md p-8 space-y-8">
            <div>
              <p className="text-gray-600 text-sm mb-4">آخر تحديث: سبتمبر 2026</p>
              <p className="text-gray-700 leading-relaxed">
                يسعدنا تواصلك معنا.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                إذا واجهت مشكلة أثناء استخدام موقع &quot;اعرفني&quot;، أو لديك سؤال أو اقتراح لتحسين الموقع، يمكنك التواصل معنا من خلال وسائل التواصل التالية.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">البريد الإلكتروني</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                يمكنك استخدام البريد الإلكتروني للاستفسارات العامة، والمشكلات التقنية، والملاحظات والاقتراحات.
              </p>
              <a 
                href="mailto:shenuodaepraam@gmail.com"
                className="text-blue-600 hover:text-blue-700 underline break-all"
              >
                shenuodaepraam@gmail.com
              </a>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Facebook</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                يمكنك التواصل معنا عبر صفحة Facebook:
              </p>
              <a 
                href="https://www.facebook.com/share/1ba8R2cFB9/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline break-all"
              >
                https://www.facebook.com/share/1ba8R2cFB9/
              </a>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Telegram</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                يمكنك أيضًا التواصل معنا عبر Telegram:
              </p>
              <a 
                href="https://t.me/E3rafni"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline break-all"
              >
                https://t.me/E3rafni
              </a>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">عند الإبلاغ عن مشكلة</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا كنت تواجه مشكلة تقنية، يُفضل أن توضح:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-4 space-y-2">
                <li>المشكلة التي ظهرت لك.</li>
                <li>الخطوات التي أدت إلى ظهور المشكلة.</li>
                <li>رابط الصفحة التي حدثت فيها المشكلة، إن أمكن.</li>
                <li>صورة للشاشة إذا كانت ستساعد في توضيح المشكلة.</li>
              </ul>
            </div>

            <div>
              <p className="text-gray-700 leading-relaxed">
                نحاول مراجعة الرسائل والمساعدة في حل المشكلات المتعلقة بالموقع في أقرب وقت ممكن.
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
