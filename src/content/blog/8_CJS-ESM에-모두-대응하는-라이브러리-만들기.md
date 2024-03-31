---
title: CJS, ESM에 모두 대응하는 라이브러리 만들기
author: 장호빈
pubDatetime: 2024-03-31T20:15:00
postSlug: dual-package-cheatsheet
featured: false
draft: false
tags:
  - 듀얼패키지
  - 라이브러리
  - 롤업
  - 글또
description: 'CJS, ESM 에 모두 대응하는 라이브러리를 만드는 방법에 대해 간략히 정리해보았습니다.'
---

## 시작하며

이번 글에서는 어떻게 CJS, ESM에 모두 대응하며 타입 지원까지 하는 라이브러리를 만드는 지 정리할 것이다. 번들러로는 rollup을 사용하며, 간단한 버튼 컴포넌트를 제공하는 라이브러리를 예시로 들어 나중에 참고할 수 있는 정도로만 주요 설정들을 설명할 것이다. 일종의 치트시트 느낌으로 나중에 참고할 수 있도록 간략히 써보려고 한다.

## 전략

- `tsc`는 선언 파일을 만드는 용도로만 사용한다.
- 바벨로 타입스크립트 파일을 cjs, esm format 으로 각각 트랜스파일한다.
- cjs 포맷의 타입 지원을 위해 만들어진 _.d.ts 선언 파일을 복사하여 _.d.cts 파일을 만든다.

## 소스코드

- src/Button.tsx

```tsx
import { ComponentPropsWithoutRef } from 'react'

export type ButtonProps = ComponentPropsWithoutRef<'button'>
export const Button = (props: ButtonProps) => {
  return <button {...props} />
}
```

- src/index.ts

```ts
export * from './Button.tsx'
```

따로 설명할 필요없는 라이브러리가 제공할 아주 간단한 버튼 컴포넌트 코드다.

## TSConfig 주요 설정

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "Preserve",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

기본적으로는 선언파일만 생성할 수 있도록 설정이 되어있다.
`allowImportingTsExtensions: true` 속성이 중요한데

```ts
// src/index.ts
export * from './Button.tsx'
```

위와 같이 .ts(x) 를 붙여 import를 할 수 있게하면

```ts
// dist/index.d.ts
export * from './Button.tsx'

// dist/index.d.cts
export * from './Button.tsx'
```

모든 과정을 지나 만들어진 선언 파일들에도 위와 같이 .ts(x) 가 붙어서 생성되고, 이것은 각각 `index` 파일의 확장자에 알맞게 `Button.d.ts`, `Button.d.cts` 선언 파일을 찾아갈 수 있게 된다.

또한, TS 5.4 버전부터 `module: "Preserve"` 속성을 쓸 수 있게 되었는데, 번들러를 사용중이라면 지금까지 가장 단점([자세한 내용](https://devblogs.microsoft.com/typescript/announcing-typescript-5-4/#support-for-require-calls-in---moduleresolution-bundler-and---module-preserve))이 없는 최신 설정값이므로 이 설정값을 사용한다.

## 바벨 설정

- babel.config.json

```json
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "automatic" }], // 'react/jsx-runtime' 코드를 알아서 주입시켜준다.
    "@babel/preset-typescript" // typescript 파일을 해석할 수 있도록 한다.
  ],
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

## 롤업 설정

- rollup.config.js

```js
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
    },
    {
      dir: 'dist',
      format: 'cjs',
      preserveModules: true,
      entryFileNames: '[name].cjs',
    },
  ],
  plugins: [
    typescript({ noForceEmit: true }),
    babel({
      babelHelpers: 'runtime',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    nodeResolve(),
    commonjs(),
  ],
  external: [/react/, /@babel\/runtime/],
}
```

output 설정을 보면 하나의 `index.ts` 파일을 가지고 esm, cjs format의 번들 결과물을 만들어내는 것을 알 수 있다.  
또한 `preserveModules: true` 설정은 하나의 파일로 번들링 결과물을 내는 것이 아니라 번들되는 파일들의 폴더구조를 유지하며 번들 결과물을 만들어내게 한다.

plugins 설정을 보면 순서대로

1. `typescript({ noForceEmit: true })` : tsconfig를 기준으로 하여 선언 파일을 생성한다.
2. `babel({ ... })` : 소스코드를 `babel.config.json` 를 기준으로 트랜스파일한다.
3. `nodeResolve()` : 라이브러리 내에서 써드 파티 모듈을 사용할 수 있게 한다.
4. `commonjs()` : 롤업은 common js 모듈을 import하는 코드를 해석하지 못하는데, 이 모듈을 es6로 변환하여 번들에 포함될 수 있게한다.

### d.cts 파일 만들기

- scripts/dts.js

```js
import { readdirSync, copyFileSync } from 'fs'
import { join } from 'path'

const folder = 'dist'

function getFiles(folderPath) {
  try {
    return readdirSync(folderPath, { recursive: true })
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

function copyFiles(files) {
  for (const file of files) {
    if (file.endsWith('.d.ts')) {
      try {
        const sourceFile = join(folder, file)
        const destinationFile = join(folder, file.replace('.d.ts', '.d.cts'))
        copyFileSync(sourceFile, destinationFile)
      } catch (error) {
        console.error('Error copying file:', error)
      }
    }
  }
}

copyFiles(getFiles(folder))
```

`tsc` 는 하나의 타입스크립트 파일로 한번에 d.cts, d.ts 선언 파일을 생성할 수 없다. 따라서 트랜스파일링 후에 d.ts 파일을 복사하여 d.cts 파일을 만드는 스크립트를 사용한다.

## 패키지 설정

- package.json

```json
{
  // 기본적으로 esm 사용
  "type": "module",
  "scripts": {
    "build:clean": "rm -rf dist",
    // 클린 -> 번들 -> dts 생성(cjs 전용)
    "build": "pnpm build:clean && rollup -c && node scripts/dts"
  },
  "files": ["dist"],
  "exports": {
    ".": {
      // CJS 대응
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      },
      // ESM 대응
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  }
}
```

## 참고

[package.json 을 어떻게 설정해야 하는가?](https://twitter.com/atcb/status/1634653476600025088)

[CommonJS와 ESM에 모두 대응하는 라이브러리 개발하기: exports field](https://toss.tech/article/commonjs-esm-exports-field)

[TS 5.4에서의 module: preserve를 통한 require() 지원](https://devblogs.microsoft.com/typescript/announcing-typescript-5-4/#support-for-require-calls-in---moduleresolution-bundler-and---module-preserve)
