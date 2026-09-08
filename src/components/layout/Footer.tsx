import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            © {new Date().getFullYear()} اعرفني
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              من نحن
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              اتصل بنا
            </Link>
            <Link href="/privacy-policy" className="text-gray-600 hover:text-blue-600 transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
              شروط الاستخدام
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
