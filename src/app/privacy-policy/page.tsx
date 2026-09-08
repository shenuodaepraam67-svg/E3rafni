import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | اعرفني",
  description: "تعرف على كيفية تعامل موقع اعرفني مع بيانات الحسابات والاختبارات والنتائج والمعلومات المرتبطة بالمشاركة.",
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: "سياسة الخصوصية | اعرفني",
    description: "تعرف على كيفية تعامل موقع اعرفني مع بيانات الحسابات والاختبارات والنتائج والمعلومات المرتبطة بالمشاركة.",
    url: 'https://e3rafni.vercel.app/privacy-policy',
    siteName: 'اعرفني',
    locale: 'ar_AR',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-3xl font-bold text-center mb-8">سياسة الخصوصية</h1>
          
          <section className="bg-white rounded-lg shadow-md p-8 space-y-8">
            <div>
              <p className="text-gray-600 text-sm mb-4">آخر تحديث: سبتمبر 2026</p>
              <p className="text-gray-700 leading-relaxed">
                مرحبًا بك في موقع اعرفني.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                نحن نهتم بخصوصية مستخدمي الموقع ونسعى إلى توضيح كيفية التعامل مع المعلومات التي يتم تقديمها أثناء استخدام الموقع والاختبارات الموجودة عليه.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                باستخدامك لموقع &quot;اعرفني&quot;، فإنك توافق على ما هو موضح في سياسة الخصوصية هذه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">1. ما هو موقع اعرفني؟</h2>
              <p className="text-gray-700 leading-relaxed">
                &quot;اعرفني&quot; هو موقع ترفيهي يتيح للمستخدم إنشاء اختبار عن نفسه ومشاركته مع أصدقائه، ثم معرفة مدى معرفة أصدقائه به من خلال إجاباتهم ونتائج الاختبار.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                الموقع مخصص للترفيه والتواصل بين الأصدقاء، ولا تعتبر الاختبارات الموجودة عليه اختبارات علمية أو نفسية أو أدوات لتشخيص الشخصية.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">2. الحسابات وتسجيل الدخول</h2>
              <p className="text-gray-700 leading-relaxed">
                يمكن للمستخدم إنشاء حساب على الموقع باستخدام:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-4 space-y-2">
                <li>البريد الإلكتروني.</li>
                <li>كلمة المرور.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                يحتاج المستخدم إلى تسجيل الدخول حتى يتمكن من إنشاء وإدارة الاختبارات الخاصة به.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                أما الشخص الذي يريد حل اختبار تمت مشاركته معه، فلا يحتاج إلى إنشاء حساب أو تسجيل الدخول لحل الاختبار.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">3. المعلومات التي يتم إدخالها عند حل الاختبار</h2>
              <p className="text-gray-700 leading-relaxed">
                عند حل اختبار أحد الأصدقاء، قد يُطلب من المشارك كتابة اسمه بنفسه حتى يستطيع صاحب الاختبار معرفة من قام بالمشاركة.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                الاسم الذي يدخله المشارك، بالإضافة إلى إجاباته ونتيجته، يتم عرضها لصاحب الاختبار المرتبط بذلك الاختبار.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                نحن لا نعرض هذه المعلومات بشكل عام للزوار الآخرين.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">4. بيانات الاختبارات والنتائج</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يتم حفظ البيانات المرتبطة بالاختبارات بهدف تشغيل الخدمة وإظهار النتائج والإحصائيات لصاحب الاختبار.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                وتشمل هذه البيانات، بحسب استخدام الاختبار:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-4 space-y-2">
                <li>الأسئلة والإجابات.</li>
                <li>اسم الشخص الذي أدخل اسمه عند المشاركة.</li>
                <li>نتيجة الاختبار.</li>
                <li>تاريخ المشاركة باليوم.</li>
                <li>عدد مرات فتح الاختبار.</li>
                <li>عدد الأشخاص الذين دخلوا الاختبار.</li>
                <li>بعض الإحصائيات المتعلقة بالمشاركة والإجابات.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                يتم استخدام هذه البيانات لتوفير وظائف الموقع وعرض التحليلات الموجودة في لوحة التحكم.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">5. لوحة التحكم</h2>
              <p className="text-gray-700 leading-relaxed">
                يستطيع صاحب الاختبار الوصول إلى لوحة التحكم الخاصة به لمشاهدة نتائج وإحصائيات اختباراته.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد تتضمن لوحة التحكم:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-4 space-y-2">
                <li>نتائج المشاركين.</li>
                <li>عدد مرات فتح الاختبار.</li>
                <li>عدد الأشخاص الذين دخلوا الاختبار.</li>
                <li>عدد المشاركات.</li>
                <li>الأشخاص الذين شاركوا في الاختبار.</li>
                <li>الإحصائيات المتعلقة بالإجابات والمشاركة.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                هذه المعلومات الخاصة بالاختبارات لا يتم عرضها للعامة، وإنما تكون متاحة لصاحب الاختبار وفقًا لصلاحيات حسابه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">6. تخزين البيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                يستخدم الموقع خدمة Supabase للمساعدة في إدارة الحسابات وتخزين البيانات اللازمة لتشغيل الموقع.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد يتم تخزين بيانات الحساب والاختبارات والنتائج والمعلومات المرتبطة بالمشاركة وفقًا للوظائف التي يوفرها الموقع.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">7. حماية البيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                نحاول اتخاذ إجراءات مناسبة للمساعدة في حماية البيانات من الوصول غير المصرح به أو الاستخدام غير المناسب.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                ومع ذلك، لا يمكن ضمان أن أي خدمة على الإنترنت ستكون آمنة بنسبة 100%، ولذلك لا ينبغي للمستخدم إدخال معلومات حساسة أو سرية داخل الاختبارات.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">8. المعلومات الحساسة</h2>
              <p className="text-gray-700 leading-relaxed">
                ننصح المستخدمين بعدم إدخال معلومات شخصية حساسة أو سرية داخل الأسئلة أو الإجابات، مثل كلمات المرور أو أرقام البطاقات البنكية أو المعلومات المالية أو أي بيانات لا يرغب المستخدم في مشاركتها.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">9. ملفات تعريف الارتباط والتقنيات المشابهة</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يستخدم الموقع ملفات تعريف الارتباط (Cookies) أو تقنيات مشابهة عند الحاجة لتشغيل بعض وظائف الموقع وتحسين تجربة المستخدم.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                كما قد تستخدم خدمات الإعلانات التابعة لجهات خارجية، مثل Google AdSense، تقنيات مثل ملفات تعريف الارتباط لتقديم الإعلانات وقياس أدائها، وذلك وفقًا للسياسات والإعدادات المعمول بها لدى تلك الخدمات.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">10. الإعلانات</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يعرض الموقع إعلانات من خلال خدمات إعلانية تابعة لجهات خارجية.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                عند عرض الإعلانات، قد تستخدم الجهات الإعلانية تقنيات مثل ملفات تعريف الارتباط أو معرّفات الإعلانات وفقًا لسياساتها الخاصة.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                يمكن للمستخدم مراجعة سياسات الخصوصية الخاصة بمقدمي خدمات الإعلانات لمعرفة المزيد حول كيفية تعاملهم مع البيانات.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">11. مشاركة المعلومات</h2>
              <p className="text-gray-700 leading-relaxed">
                لا نبيع المعلومات الشخصية للمستخدمين.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد تتم معالجة بعض البيانات بواسطة مزودي الخدمات التقنية الذين يعتمد عليهم الموقع لتشغيل خدماته، مثل Supabase، وذلك بالقدر اللازم لتوفير وظائف الموقع.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                كما قد يتم الكشف عن المعلومات إذا كان ذلك مطلوبًا بموجب القانون أو لحماية حقوق الموقع ومستخدميه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">12. حذف البيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا كان لديك حساب أو بيانات مرتبطة باستخدامك للموقع وترغب في معرفة الخيارات المتاحة لحذفها أو تعديلها، يمكنك التواصل معنا من خلال صفحة اتصل بنا.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">13. خصوصية الأطفال</h2>
              <p className="text-gray-700 leading-relaxed">
                الموقع مخصص للاستخدام العام والترفيهي. ننصح أولياء الأمور بمتابعة استخدام الأطفال لخدمات الإنترنت والتأكد من عدم إدخالهم معلومات شخصية حساسة داخل الاختبارات.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">14. التغييرات على سياسة الخصوصية</h2>
              <p className="text-gray-700 leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر نتيجة لتغيير وظائف الموقع أو الخدمات المستخدمة فيه أو المتطلبات المتعلقة بالخدمة.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                عند إجراء تغييرات مهمة، سيتم تحديث تاريخ &quot;آخر تحديث&quot; الموجود في أعلى هذه الصفحة.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">15. التواصل معنا</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا كان لديك سؤال أو استفسار يتعلق بالخصوصية أو البيانات الموجودة على الموقع، يمكنك التواصل معنا من خلال صفحة اتصل بنا.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                البريد الإلكتروني: <a href="mailto:shenuodaepraam@gmail.com" className="text-blue-600 hover:text-blue-700 underline break-all">shenuodaepraam@gmail.com</a>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed text-center">
                موقع اعرفني — منصة ترفيهية لإنشاء الاختبارات ومشاركتها مع الأصدقاء.
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
