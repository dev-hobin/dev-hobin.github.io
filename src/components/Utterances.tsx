import { useEffect, useRef } from 'react'

export default function Utterances() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const script = document.createElement('script')
    const currentTheme = localStorage.getItem('theme')

    Object.entries({
      src: 'https://utteranc.es/client.js',
      repo: 'dev-hobin/dev-hobin.github.io',
      'issue-term': 'pathname',
      theme: currentTheme == 'light' ? 'github-light' : 'github-dark',
      crossorigin: 'anonymous',
    }).forEach(([key, value]) => {
      script.setAttribute(key, value)
    })

    ref.current?.appendChild(script)
  }, [ref])

  return <div id="utterances-container" ref={ref} />
}
