export function generateStaticParams() {
  return [{ id: "test-1" }, { id: "test-2" }];
}

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="pt-32 p-12">
      <h1>Test Page: {id}</h1>
    </div>
  );
}
