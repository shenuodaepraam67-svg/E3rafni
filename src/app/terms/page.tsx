import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام | اعرفني",
  description: "تعرف على شروط استخدام موقع اعرفني وقواعد إنشاء الاختبارات والمشاركة فيها واستخدام خدمات الموقع.",
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: "شروط الاستخدام | اعرفني",
    description: "تعرف على شروط استخدام موقع اعرفني وقواعد إنشاء الاختبارات والمشاركة فيها واستخدام خدمات الموقع.",
    url: 'https://e3rafni.vercel.app/terms',
    siteName: 'اعرفني',
    locale: 'ar_AR',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-3xl font-bold text-center mb-8">شروط الاستخدام</h1>
          
          <section className="bg-white rounded-lg shadow-md p-8 space-y-8">
            <div>
              <p className="text-gray-600 text-sm mb-4">آخر تحديث: سبتمبر 2026</p>
              <p className="text-gray-700 leading-relaxed">
                مرحبًا بك في موقع اعرفني.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                باستخدامك موقع &quot;اعرفني&quot;، فإنك توافق على الالتزام بشروط الاستخدام الموضحة في هذه الصفحة. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الموقع.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">1. عن الموقع</h2>
              <p className="text-gray-700 leading-relaxed">
                &quot;اعرفني&quot; هو موقع ترفيهي يتيح للمستخدم إنشاء اختبارات عن نفسه ومشاركتها مع أصدقائه، ثم مشاهدة النتائج والإحصائيات المتعلقة بالمشاركين.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                الاختبارات الموجودة على الموقع مخصصة للترفيه والتسلية، ولا تمثل اختبارات نفسية أو علمية أو تقييمًا متخصصًا للشخصية.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">2. إنشاء الحساب</h2>
              <p className="text-gray-700 leading-relaxed">
                يمكن للمستخدم إنشاء حساب باستخدام البريد الإلكتروني وكلمة المرور.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                يكون المستخدم مسؤولًا عن الحفاظ على سرية كلمة المرور الخاصة بحسابه، وعن جميع الأنشطة التي تتم من خلال الحساب.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                يجب عدم استخدام حساب شخص آخر أو محاولة الوصول إلى حساب أو بيانات مستخدم آخر دون إذنه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">3. إنشاء الاختبارات</h2>
              <p className="text-gray-700 leading-relaxed">
                يستطيع المستخدم المسجل إنشاء اختبار خاص به وإضافة الأسئلة والإجابات التي يريد مشاركتها مع أصدقائه.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                يجب أن تكون الأسئلة والمحتويات التي يضيفها المستخدم مناسبة للاستخدام على الموقع وألا تخالف القوانين أو حقوق الآخرين.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">4. حل اختبارات الأصدقاء</h2>
              <p className="text-gray-700 leading-relaxed">
                يمكن لأي شخص حل اختبار تمت مشاركته معه دون الحاجة إلى إنشاء حساب.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد يُطلب من المشارك إدخال اسمه بنفسه حتى يستطيع صاحب الاختبار معرفة من شارك في الاختبار.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                يتم استخدام الاسم والإجابات والنتيجة في إطار الاختبار الذي تمت المشاركة فيه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">5. المحتوى الذي يضيفه المستخدمون</h2>
              <p className="text-gray-700 leading-relaxed">
                المستخدم مسؤول عن المحتوى الذي يقوم بإضافته إلى الموقع، بما في ذلك الأسئلة والإجابات وأي نصوص أخرى يكتبها داخل الاختبارات.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                يُمنع استخدام الموقع لإنشاء أو نشر محتوى:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-4 space-y-2">
                <li>مسيء أو مهين للآخرين.</li>
                <li>يتضمن تهديدًا أو تحريضًا على العنف.</li>
                <li>يتضمن مضايقة أو تنمرًا متعمدًا.</li>
                <li>يتضمن معلومات شخصية حساسة عن أشخاص آخرين دون إذنهم.</li>
                <li>ينتهك حقوق الملكية الفكرية للآخرين.</li>
                <li>يخالف القوانين المعمول بها.</li>
                <li>يهدف إلى الاحتيال أو خداع المستخدمين.</li>
                <li>يحتوي على برمجيات ضارة أو روابط ضارة.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">6. احترام خصوصية الآخرين</h2>
              <p className="text-gray-700 leading-relaxed">
                يجب على المستخدم عدم استخدام الاختبارات لجمع أو نشر معلومات شخصية حساسة عن الآخرين دون موافقتهم.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                كما يجب عدم استخدام الموقع لانتحال شخصية شخص آخر أو نشر محتوى بهدف الإضرار به أو الإساءة إليه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">7. النتائج والإحصائيات</h2>
              <p className="text-gray-700 leading-relaxed">
                يعرض الموقع نتائج وإحصائيات مبنية على إجابات المشاركين في الاختبارات.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                هذه النتائج مخصصة للترفيه فقط، ولا ينبغي اعتبارها تقييمًا دقيقًا أو علميًا لشخصية أي شخص أو معرفته بالآخرين.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد تتغير بعض الإحصائيات أو النتائج نتيجة لتحديثات الموقع أو تصحيح الأخطاء التقنية.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">8. لوحة التحكم</h2>
              <p className="text-gray-700 leading-relaxed">
                يستطيع صاحب الاختبار استخدام لوحة التحكم لمتابعة نتائج واستخدام اختباراته.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد تتضمن لوحة التحكم معلومات مثل:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-4 space-y-2">
                <li>نتائج المشاركين.</li>
                <li>عدد مرات فتح الاختبار.</li>
                <li>عدد الأشخاص الذين دخلوا الاختبار.</li>
                <li>عدد المشاركات.</li>
                <li>أسماء المشاركين الذين أدخلوا أسماءهم.</li>
                <li>إحصائيات الإجابات والمشاركة.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                هذه البيانات يتم عرضها وفقًا لوظائف الموقع وصلاحيات الحساب.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">9. الاستخدام المقبول للموقع</h2>
              <p className="text-gray-700 leading-relaxed">
                يوافق المستخدم على استخدام الموقع بطريقة قانونية ومسؤولة.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                يُمنع محاولة:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-4 space-y-2">
                <li>اختراق الموقع أو تعطيل خدماته.</li>
                <li>الوصول غير المصرح به إلى حسابات أو بيانات الآخرين.</li>
                <li>استغلال الأخطاء البرمجية للإضرار بالموقع أو المستخدمين.</li>
                <li>استخدام وسائل آلية أو برمجيات لإرسال طلبات ضارة أو مفرطة إلى الموقع.</li>
                <li>التحايل على أنظمة الحماية أو القيود الموجودة في الموقع.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">10. الإعلانات والخدمات الخارجية</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يحتوي الموقع على إعلانات أو خدمات مقدمة من جهات خارجية.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد تخضع هذه الخدمات لشروط وسياسات الخصوصية الخاصة بمقدميها، ولا يتحمل موقع &quot;اعرفني&quot; مسؤولية محتوى أو سياسات الخدمات الخارجية التي لا يديرها بشكل مباشر.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">11. توفر الخدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                نسعى إلى إبقاء الموقع متاحًا ويعمل بصورة صحيحة، ولكن لا نضمن أن الموقع سيعمل دون انقطاع أو أخطاء في جميع الأوقات.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد يتم إيقاف الموقع أو بعض وظائفه مؤقتًا بسبب الصيانة أو التحديثات أو المشكلات التقنية أو لأسباب خارجة عن إرادتنا.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">12. تعديل أو إيقاف الميزات</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بالحق في تعديل أو إضافة أو إزالة بعض وظائف الموقع أو تغيير طريقة عملها عند الحاجة.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                وقد يتم إجراء تحديثات لتحسين الأداء أو الأمان أو تجربة المستخدم.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">13. تعليق أو إنهاء الحساب</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا تم استخدام الموقع بطريقة تخالف هذه الشروط أو تضر بالموقع أو المستخدمين، فقد يتم اتخاذ إجراءات مناسبة، وقد تشمل تعليق الحساب أو تقييد الوصول إلى بعض الخدمات أو إنهاء الحساب، وفقًا لطبيعة المخالفة.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">14. مسؤولية المستخدم</h2>
              <p className="text-gray-700 leading-relaxed">
                المستخدم مسؤول عن المحتوى الذي ينشئه وعن طريقة استخدامه للموقع.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                يجب على المستخدم التأكد من أن المحتوى الذي ينشره لا ينتهك حقوق أو خصوصية الآخرين.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">15. الملكية الفكرية</h2>
              <p className="text-gray-700 leading-relaxed">
                اسم وتصميم وبرمجيات وواجهة موقع &quot;اعرفني&quot;، بالإضافة إلى العناصر الأصلية التي تم إنشاؤها للموقع، قد تكون محمية بحقوق الملكية الفكرية.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                لا يجوز نسخ أو إعادة استخدام أجزاء من الموقع أو محتواه الأصلي بطريقة تنتهك حقوق مالكيه دون الحصول على إذن مناسب.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                أما المحتوى الذي يضيفه المستخدمون، فيظل المستخدم مسؤولًا عن امتلاكه للحقوق اللازمة لاستخدامه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">16. الروابط الخارجية</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يحتوي الموقع على روابط تؤدي إلى مواقع أو خدمات خارجية.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                هذه المواقع لا تخضع لسيطرة موقع &quot;اعرفني&quot;، ولذلك فإننا لا نتحمل مسؤولية محتواها أو سياساتها أو ممارساتها.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                ننصح المستخدم بمراجعة شروط وسياسات الخصوصية الخاصة بأي موقع خارجي قبل استخدامه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">17. التغييرات على شروط الاستخدام</h2>
              <p className="text-gray-700 leading-relaxed">
                قد نقوم بتحديث شروط الاستخدام من وقت لآخر بسبب تطوير الموقع أو تغيير وظائفه أو إضافة خدمات جديدة.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                سيتم تحديث تاريخ &quot;آخر تحديث&quot; الموجود في أعلى هذه الصفحة عند إجراء تغييرات عليها.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                استمرارك في استخدام الموقع بعد تحديث الشروط يعني موافقتك على الشروط المحدثة، بالقدر الذي يسمح به القانون المعمول به.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">18. التواصل معنا</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا كان لديك سؤال أو استفسار يتعلق بشروط الاستخدام أو استخدام الموقع، يمكنك التواصل معنا من خلال صفحة اتصل بنا.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                البريد الإلكتروني: <a href="mailto:shenuodaepraam@gmail.com" className="text-blue-600 hover:text-blue-700 underline break-all">shenuodaepraam@gmail.com</a>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed text-center">
                اعرفني — موقع ترفيهي لإنشاء الاختبارات ومشاركتها مع الأصدقاء.
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
