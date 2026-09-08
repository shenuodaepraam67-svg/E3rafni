import type { Metadata } from "next";
import HomeInteractive from '@/components/home/HomeInteractive'

export const metadata: Metadata = {
  title: "اعرفني - اختبر أصحابك وشوف مين يعرفك أكتر",
  description: "اعرفني هو منصة ترفيهية اجتماعية تساعدك على إنشاء اختبار شخصي عن نفسك ومشاركته مع أصدقائك. اكتشف من يعرفك حقًا بطريقة ممتعة وتفاعلية.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "اعرفني - اختبر أصحابك وشوف مين يعرفك أكتر",
    description: "اعرفني هو منصة ترفيهية اجتماعية تساعدك على إنشاء اختبار شخصي عن نفسك ومشاركته مع أصدقائك. اكتشف من يعرفك حقًا بطريقة ممتعة وتفاعلية.",
    url: 'https://e3rafni.vercel.app',
    siteName: 'اعرفني',
    locale: 'ar_AR',
    type: 'website',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            قد إيه أنت تعرفني؟
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            اختبر أصحابك وشوف مين يعرفك أكتر من غيره
          </p>
          
          {/* Interactive Components */}
          <HomeInteractive />
        </div>

        {/* What is E3rafni Section */}
        <section className="mt-20 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ما هو موقع اعرفني؟</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              اعرفني هو منصة ترفيهية اجتماعية تساعدك على إنشاء اختبار شخصي عن نفسك ومشاركته مع أصدقائك، لتعرف مدى معرفتهم بك حقًا.
            </p>
            <p className="text-gray-700 leading-relaxed">
              الفكرة بسيطة: أنت تضيف أسئلة عن نفسك وإجاباتها، ثم ترسل الاختبار لأصدقائك. عندما يجيبون، تظهر لك النتائج وتعرف من منهم يعرفك أكثر ومن يحتاج ليتعرف عليك أكتر.
            </p>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">كيف يعمل الموقع؟</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>ابدأ بإنشاء حساب في اعرفني أو سجل دخولك إذا كان لديك حساب بالفعل.</p>
              <p>أنشئ اختبارًا شخصيًا عن نفسك وأضف الأسئلة التي تريد أن يعرفها أصدقاؤك عنك.</p>
              <p>لكل سؤال، حدد الإجابة الصحيحة التي تعبر عنك.</p>
              <p>بعد الانتهاء، شارك رابط الاختبار أو كود الاختبار مع أصدقائك عبر أي وسيلة تفضلها.</p>
              <p>أصدقاؤك يدخلون إلى الاختبار ويجيبون عن الأسئلة دون الحاجة إلى إنشاء حساب.</p>
              <p>عندما يكمل أصدقاؤك الاختبار، تظهر لك النتائج في لوحة التحكم وتعرف من يعرفك أكثر.</p>
            </div>
          </div>
        </section>

        {/* No Account Needed Section */}
        <section className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">هل يحتاج صديقك إلى حساب؟</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              لا، الشخص الذي يريد حل اختبار صديقه لا يحتاج إلى إنشاء حساب أو تسجيل دخول للمشاركة في الاختبار.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              كل ما يحتاجه هو رابط الاختبار أو كود الاختبار، ويمكنه الدخول مباشرة والإجابة عن الأسئلة.
            </p>
            <p className="text-gray-700 leading-relaxed">
              إذا أعجبته الفكرة وأراد إنشاء اختبار خاص به، يمكنه في أي وقت إنشاء حساب وتسجيل الدخول لإنشاء اختباره الخاص ومشاركته مع أصدقائه.
            </p>
          </div>
        </section>

        {/* Why Use E3rafni Section */}
        <section className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">لماذا تستخدم اعرفني؟</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              اعرفني يقدم تجربة ترفيهية واجتماعية ممتعة تجمعك مع أصدقائك بطريقة جديدة.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              يمكنك اكتشاف من يعرفك حقًا ومن يحتاج ليتعرف عليك أكتر، بطريقة تفاعلية وممتعة.
            </p>
            <p className="text-gray-700 leading-relaxed">
              الموقع مناسب للتجمعات مع الأصدقاء، أو للتواصل الاجتماعي، أو حتى كسر الروتين بتجربة جديدة ومختلفة.
            </p>
          </div>
        </section>

        {/* After Quiz Section */}
        <section className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ماذا يحدث بعد حل الاختبار؟</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              بعد أن يكمل أصدقاؤك الاختبار، يمكنك الدخول إلى لوحة التحكم الخاصة بك لمشاهدة النتائج.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              ستجد إحصائيات عن المشاركين، مثل عدد الأشخاص الذين دخلوا الاختبار، وعدد المشاركات الفعلية، ونتائج كل مشارك.
            </p>
            <p className="text-gray-700 leading-relaxed">
              يمكنك أيضًا معرفة ترتيب كل صديق بناءً على إجاباته الصحيحة، ومعرفة من منهم حقق أعلى نسبة معرفة بك.
            </p>
          </div>
        </section>

        {/* Nature of the Site Section */}
        <section className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">طبيعة الموقع</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              اعرفني موقع ترفيهي واجتماعي بالدرجة الأولى.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              الاختبارات الموجودة على الموقع مخصصة للترفيه والتسلية بين الأصدقاء، ولا تمثل اختبارات علمية أو نفسية أو أدوات لتشخيص الشخصية.
            </p>
            <p className="text-gray-700 leading-relaxed">
              النتائج تعتمد على الأسئلة التي يختارها صاحب الاختبار وإجابات أصدقائه، وهي جزء من تجربة ترفيهية وليست تقييمًا علميًا.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
