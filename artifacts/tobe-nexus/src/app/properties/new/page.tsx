import PageHeader from "@/components/PageHeader";
import PropertyForm from "@/components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="新增物件"
        badge="Properties"
        subtitle="登錄新的房產物件資訊"
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <PropertyForm />
      </main>
    </div>
  );
}
