import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن | اعرفني",
  description: "تعرف على موقع اعرفني وفكرته وكيف يمكنك إنشاء اختبار عن نفسك ومشاركته مع أصدقائك.",
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: "من نحن | اعرفني",
    description: "تعرف على موقع اعرفني وفكرته وكيف يمكنك إنشاء اختبار عن نفسك ومشاركته مع أصدقائك.",
    url: 'https://e3rafni.vercel.app/about',
    siteName: 'اعرفني',
    locale: 'ar_AR',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-3xl font-bold text-center mb-8">من نحن؟</h1>
          
          <section className="bg-white rounded-lg shadow-md p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">مرحبًا بك في اعرفني 👋</h2>
              <p className="text-gray-700 leading-relaxed">
                أنا شنوده (Shenuoda)، صاحب فكرة ومطوّر موقع اعرفني.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                بدأت فكرة الموقع من سؤال بسيط وممتع:
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                هل أصحابك يعرفوك فعلًا؟ 🤔
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                قد نقضي وقتًا طويلًا مع أصدقائنا، ونتشارك معهم الكثير من التفاصيل، لكن يظل السؤال: من منهم يعرفنا حقًا؟
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                من هنا جاءت فكرة اعرفني.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">ما هو اعرفني؟</h2>
              <p className="text-gray-700 leading-relaxed">
                اعرفني هو موقع ترفيهي يتيح لك إنشاء اختبار عن نفسك ومشاركته مع أصدقائك، ثم معرفة مدى معرفتهم بك.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                تحتاج إلى إنشاء حساب حتى تتمكن من إنشاء اختبارك الخاص. وبعد إنشاء الاختبار، يمكنك مشاركة الاختبار مع أصدقائك، ويمكن لأصدقائك الإجابة عن الاختبار دون الحاجة إلى إنشاء حساب أو تسجيل الدخول.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                بعد أن يجيب أصدقاؤك، تستطيع معرفة من استطاع الإجابة عن أسئلتك بشكل صحيح ومن يعرفك أكثر.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">كيف يعمل الموقع؟</h2>
              <p className="text-gray-700 leading-relaxed">
                الأمر بسيط:
              </p>
              <ol className="list-decimal list-inside text-gray-700 leading-relaxed mt-4 space-y-2">
                <li>أنشئ حسابًا في اعرفني.</li>
                <li>أنشئ اختبارًا عن نفسك.</li>
                <li>أضف الأسئلة والإجابات التي تعبر عنك.</li>
                <li>شارك الاختبار مع أصدقائك.</li>
                <li>يمكن لأصدقائك الدخول إلى الاختبار والإجابة عليه بدون تسجيل دخول.</li>
                <li>شاهد النتائج واكتشف من يعرفك أكثر.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">ماذا لو أعجبني اختبار صديقي؟</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا حللت اختبار أحد أصدقائك وأعجبتك الفكرة، يمكنك إنشاء اختبار خاص بك أيضًا.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                لكن إنشاء اختبار جديد يتطلب تسجيل الدخول إلى حسابك.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                وبذلك يستطيع كل شخص إنشاء اختباره الخاص ومشاركته مع أصدقائه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">ما الهدف من اعرفني؟</h2>
              <p className="text-gray-700 leading-relaxed">
                هدف اعرفني هو تقديم تجربة اجتماعية وترفيهية بسيطة تجمع الأصدقاء وتمنحهم طريقة ممتعة لاختبار مدى معرفتهم ببعضهم.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                الموقع ليس اختبارًا علميًا للشخصية، ولا يقدم تشخيصًا أو تقييمًا نفسيًا. النتائج هي جزء من لعبة ترفيهية تعتمد على الأسئلة التي يختارها صاحب الاختبار وإجابات أصدقائه.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">من وراء الموقع؟</h2>
              <p className="text-gray-700 leading-relaxed">
                شنوده (Shenuoda) هو صاحب فكرة الموقع والمطوّر المسؤول عن تطويره وتحسينه.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                أعمل على تطوير اعرفني وإضافة المزيد من المميزات التي تجعل إنشاء الاختبارات ومشاركتها مع الأصدقاء تجربة سهلة وممتعة.
              </p>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-700 leading-relaxed font-semibold">
                شكرًا لزيارتك اعرفني ❤️
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
