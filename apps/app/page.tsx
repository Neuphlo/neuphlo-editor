import Editor from "./_components/Editor"
import Content from "@/components/content/example-content"

export default function Home() {
  return (
    <main className="min-h-screen max-w-5xl mx-auto p-6 flex flex-col gap-6 mt-20">
      <Editor content={Content} />
    </main>
  )
}
