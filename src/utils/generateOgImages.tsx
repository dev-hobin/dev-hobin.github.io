import satori, { type SatoriOptions } from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { type CollectionEntry } from 'astro:content'
import postOgImage from './og-templates/post'
import siteOgImage from './og-templates/site'

const fetchFonts = async () => {
  const fontFileRegular = await fetch(
    '/fonts/Pretendard/Pretendard-Regular.woff',
  )
  const fontRegular: ArrayBuffer = await fontFileRegular.arrayBuffer()

  const fontFileSemiBold = await fetch(
    '/fonts/Pretendard/Pretendard-SemiBold.woff',
  )
  const fontSemiBold: ArrayBuffer = await fontFileSemiBold.arrayBuffer()

  return { fontRegular, fontSemiBold }
}

const { fontRegular, fontSemiBold } = await fetchFonts()

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: 'Pretendard',
      data: fontRegular,
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Pretendard',
      data: fontSemiBold,
      weight: 600,
      style: 'normal',
    },
  ],
}

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg)
  const pngData = resvg.render()
  return pngData.asPng()
}

export async function generateOgImageForPost(post: CollectionEntry<'blog'>) {
  const svg = await satori(postOgImage(post), options)
  return svgBufferToPngBuffer(svg)
}

export async function generateOgImageForSite() {
  const svg = await satori(siteOgImage(), options)
  return svgBufferToPngBuffer(svg)
}
