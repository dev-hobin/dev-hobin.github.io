import { useEffect, useRef } from 'react'

export default function Giscus() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const theme =
      document.firstElementChild?.getAttribute('data-theme') ?? 'light'

    const attributes = {
      src: 'https://giscus.app/client.js',
      'data-repo': 'dev-hobin/dev-hobin.github.io',
      'data-repo-id': 'R_kgDOKyEt3w',
      'data-category': 'Comments',
      'data-category-id': 'DIC_kwDOKyEt384CbShT',
      'data-mapping': 'pathname',
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': theme,
      'data-lang': 'ko',
      'data-loading': 'lazy',
      crossorigin: 'anonymous',
      async: '',
    }

    const script = document.createElement('script')
    Object.entries(attributes).forEach(([key, value]) =>
      script.setAttribute(key, value),
    )

    ref.current?.appendChild(script)
  }, [ref])

  return <div className="giscus" ref={ref} />
}
