import { Explorer } from '@/components/Explorer'
import { FileEditor } from '@/components/FileEditor'

export default function App() {
  return (
    <div className="flex h-dvh overflow-hidden bg-vsc-bg text-vsc-text antialiased">
      <aside className="flex h-full w-full shrink-0 flex-col border-b border-vsc-border md:w-[min(300px,38vw)] md:max-w-[360px] md:border-b-0 md:border-r">
        <Explorer />
      </aside>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <FileEditor />
      </main>
    </div>
  )
}
