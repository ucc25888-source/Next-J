import CopywritingPage from "@/components/CopywritingPage";

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <CopywritingPage id={id} />
    </main>
  );
}
