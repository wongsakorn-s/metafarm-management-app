import PublicLayout from "@/components/public-layout";

type PublicPlaceholderProps = {
  title: string;
};

export default function PublicPlaceholder({ title }: PublicPlaceholderProps) {
  return (
    <PublicLayout>
      <main className="px-5 py-10 text-stone-900 md:px-8 md:py-16">
        <section className="mx-auto max-w-5xl rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-[0_30px_80px_-40px_rgba(68,64,60,0.35)] md:p-12">
          <div className="space-y-3">
            <h1 className="text-4xl font-black md:text-6xl">{title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-500 md:text-lg">
              หน้านี้ถูกเตรียมไว้สำหรับพัฒนาเนื้อหาในลำดับถัดไป
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
