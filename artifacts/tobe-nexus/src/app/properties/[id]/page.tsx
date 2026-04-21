import PageHeader from "@/components/PageHeader";
import PropertyForm from "@/components/PropertyForm";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="編輯物件"
        badge="Properties"
        subtitle="修改現有房產物件資料"
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <PropertyForm id={id} />
      </main>
    </div>
  );
}
