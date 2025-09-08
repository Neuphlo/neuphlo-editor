// Next
import Image from "next/image"
import Link from "next/link"

// Components
import { IconBrandGithub, IconBrandNpm } from "@tabler/icons-react"

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-[#0d0e10]/80 dark:supports-[backdrop-filter]:bg-[#0d0e10]/60">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Image
                src="/logos/logo_cyan.svg"
                alt="Neuphlo"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-bold text-md text-slate-900 dark:text-white">
                Neuphlo Editor
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="https://www.npmjs.com/package/neuphlo-editor"
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-lg p-1 text-slate-600 transition-colors duration-200 hover:text-cyan-600 hover:bg-cyan-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600/40 dark:text-white/80 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/10 dark:focus-visible:ring-cyan-500/40"
            >
              <IconBrandNpm className="size-5" />
            </Link>
            <Link
              href="https://github.com/Neuphlo/neuphlo-editor"
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-lg p-1 text-slate-600 transition-colors duration-200 hover:text-cyan-600 hover:bg-cyan-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600/40 dark:text-white/80 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/10 dark:focus-visible:ring-cyan-500/40"
            >
              <IconBrandGithub className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
