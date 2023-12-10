---
title: 간단한 UI 라이브러리 만들어보기 (feat. TS 지원, ESM,CJS 지원, 모노레포, Yarn Berry)
author: 장호빈
pubDatetime: 2023-12-10T23:30:00
postSlug: setting-ui-library
featured: false
draft: false
tags:
  - UI 라이브러리
  - 모노레포
  - Yarn Berry
  - 글또

description: 'UI 라이브러리를 차근차근 만드는 과정을 정리해보았습니다'
---

## 개요

UI 라이브러리를 만들 때, 항상 Lerna 와 Turbo 와 같은 미리 만들어져있는 탬플릿을 사용했는데, 이번 기회에 차근차근 UI 라이브러리를 바닥부터 세팅해보려고 한다.

## 기본 세팅

### 프로젝트 생성

```bash
mkdir hobin-ui
cd hobin-ui
```

먼저 작업할 폴더를 생성하고 yarn berry 프로젝트를 만든다.

```bash
yarn init -2
```

워크스페이스로 설정할 폴더를 만든다.

```bash
mkdir packages
```

package.json 기본세팅을 하고 워크스페이스를 설정한다.

```json
// package.json
{
  "name": "hobin-ui",
  "private": true,
  "workspaces": ["packages/*"], // <- 워크스페이스 설정
  "packageManager": "yarn@4.0.2",
  "license": "MIT"
}
```

### Typescript, Prettier 설정

```bash
yarn add -D typescript prettier
```

```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "all",
  "singleQuote": true
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

타입스크립트 설정과 prettier 설정은 상황에 맞게 알아서 하면 되고, 지금같은 경우는 공통적으로 활용할 설정들이기 때문에 루트 폴더에서 만들었다.

### 사용할 라이브러리 설치

```bash
yarn add -D tsup @changesets/cli
```

tsup은 번들러다. tsup을 사용하는 이유는

- 간편한 타입선언파일(d.mts, d.cts) 생성
  cjs, esm을 모두 지원하기 위해서는 타입 선언 파일도 각각에 맞게 (.mts, .cts) 따로 만들어주어야 하는데, 그 선언 파일들을 알아서 만들어준다. (tsc 명령어는 .ts 파일 하나만으로는 이 두 타입의 선언파일들을 생성해주지 못한다.)
- dependencies, peerDependencies 가 번들링에 포함되지 않는것이 디폴트다.
  즉, react, react-dom 등 번들링에 포함되지 말아야할 라이브러리들을 일일히 external 설정을 안해도 된다.

changesets는 멀티 패키지 저장소의 패키지 버전관리를 위한 툴이다.
간단한 스크립트로 전체 패키지들의 버전 관리와 변경내역을 관리할 수 있어 사용한다.

#### Changeset 기본 세팅

```bash
yarn changeset init
```

```json
// .changeset/config.json
{
  // ... 생략
  "access": "public",
  "baseBranch": "master"
}
```

changeset 초기화를 하고 config.json에서 UI 라이브러리를 누구나 사용 가능하게 할 것이기 때문에 access : public 으로 변경하고, baseBranch는 본인의 메인 브렌치에 이름을 맞춰준다.

#### Yarn Editor SDK 설치

```bash
yarn dlx @yarnpkg/sdks vscode
```

https://yarnpkg.com/getting-started/editor-sdks 를 참고하여 필요한 SDK를 설치하자.

## 버튼 라이브러리 추가하기

### 프로젝트 생성

이번 예제에서는 가장 간단하게 버튼 컴포넌트만 만들어볼 것이다.

```bash
mkdir packages/button
cd packages/button
```

```json
// package.json
{
  "name": "@hobin-ui/button",
  "type": "module",
  "version": "0.0.0",
  "license": "MIT"
}
```

기본적인 package.json을 만들었다.
여기서 name 속성은 중요한데, npmjs에서 본인의 계정이 organization 이름을 소유하고 있어야 배포 가능하다 (지금같은 경우는 hobin-ui)

### Eslint, Typescript 설정

먼저, Eslint나 tsconfig 설정은 정답이 있는 문제는 아니기 때문에 참고만 하길 바란다.

```bash
yarn add -D eslint typescript
```

```json
// tsconfig.json
{
  "extends": "../../tsconfig.json", // 루트 폴더에서 만든 tsconfig 확장
  "compilerOptions": {
    "target": "ES6", // tsup의 번들링 타켓이 됨
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"] // Button 컴포넌트 작업할 공간
}
```

tsup은 내부에서 esbuild에 의존하고 있는데, esbuild가 참고하는 속성이 정해져있다.
https://esbuild.github.io/content-types/#typescript-caveats

```js
// .eslintrc.js
module.exports = {
  // ... 생략
  "parserOptions": {
    // ... 생략
    "project": "./tsconfig.json"
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "project": "./tsconfig.json",
      },
  },
}
```

Eslint 설정에서 한번 짚고 넘어가고 싶은 부분은, 항상 해당 패키지의 tsconfig 를 바라보도록 project 속성에 tsconfig.json 경로를 설정해주었다.

### 버튼 컴포넌트 만들기

```bash
yarn add -D react react-dom @types/react @types/react-dom
```

필요한 리액트 라이브러리를 설치하였다.

## peerDependencies 설정

```json
// package.json
{
  "name": "@hobin-ui/button",
  // ... 생략
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  }
}
```

지금 만드는 컴포넌트는 결국 배포되어 다른 사람들이 사용할 컴포넌트다.
컴포넌트 사용자들은 자체적으로 react, react-dom 등의 라이브러리를 사용하고 있을것이다.

이때, 컴포넌트가 react에 의존하고 있는 기능이 사용자 환경의 react와 호환되지 않아 예상치 못한 에러가 발생할 수 있다.

peerDependency는 이러한 문제를 방지하기 위해 사용되며, peerDependency를 사용하면 컴포넌트가 의존하는 라이브러리의 최소 버전과 최대 버전을 지정할 수 있다.

즉, peerDependency를 설정하면 사용자에게 안전하게 이 라이브러리를 사용하려면 어떤 라이브러리를 어떤 버전으로 설치해야하는지 알려줄 수 있다.

```bash
mkdir src && mkdir src/Button.tsx && mkdir src/index.tsx
```

```tsx
// src/Button.tsx
import { ComponentPropsWithRef } from 'react'

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  label: string
  size?: 'small' | 'medium' | 'large'
}
export const Button = ({ label, size = 'medium', ...props }: ButtonProps) => {
  return (
    <button type="button" {...props}>
      {label}
    </button>
  )
}
```

```tsx
// src/index.tsx
export { Button, type ButtonProps } from './Button'
```

아주 간단한 버튼 컴포넌트를 제작하였다.

```json
// package.json
{
  "name": "@hobin-ui/button",
  // ... 생략
  "scripts": {
    "dev": "run -T tsup src/index.tsx --format esm,cjs --watch --dts",
    "build": "run -T tsup src/index.tsx --format esm,cjs --dts"
  }
}
```

만든 컴포넌트를 tsup을 이용하여 번들링하는 스크립트를 추가하였다.
스크립트를 설명을 해보면, "src/index.tsx를 진입점으로 해서 esm, cjs 포맷으로 선언파일과 함께 tsconfig에서 설정한 ES6 타겟으로 번들링해줘" 라는 의미다.

```bash
yarn build
```

```bash
├── dist
│ ├── index.d.cts
│ ├── index.cjs
│ ├── index.d.ts
│ └── index.js
```

build를 해보면 dist 폴더에 각각의 js,cjs 파일과 선언 파일들이 만들어진 것을 확인할 수 있다.

### TS, ESM, CJS 지원하기

버튼 컴포넌트를 배포했을 때 TS, ESM, CJS를 모두 지원하려면 package.json에 설정해주어야 할 것들이 있다.

```json
// package.json
{
  "name": "@hobin-ui/button",
  // ...생략
  "exports": {
    // esm 지원
    "import": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    // cjs 지원
    "require": {
      "types": "./dist/index.d.cts",
      "default": "./dist/index.cjs"
    }
  },
  "main": "dist/index.cjs",
  // 배포시 제공할 파일들
  "files": ["dist"]
  // ... 생략
}
```

## 버전 관리

버튼 컴포넌트 패키지를 완성했으니 다시 루트 폴더로 돌아와서 버전 관리를 해보자.

```bash
yarn changeset
```

1. patch 선택
2. 변경내용 작성
3. 확인

```bash
yarn changeset version
```

이제 버튼 패키지를 보면 CHANGELOG.md 파일과 함께 package.json 의 version 속성이 0.0.1로 올라간 것을 확인할 수 있다.

## 스토리북 추가하기

### 기본 세팅

```json
{
  "name": "hobin-ui",
  // ... 생략
  "workspaces": ["packages/*", "apps/docs"]
}
```

apps/docs 폴더를 workspace로 추가했다.

```bash
mkdir apps && mkdir apps/docs && cd apps/docs
yarn create vite .
yarn dlx storybook@latest init
```

리액트 탬플릿을 설치하고 스토리북을 세팅했다.

### 버튼 컴포넌트 설치

```json
// package.json
{
  "name": "docs",
  // ... 생략
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@hobin-ui/button": "workspace:*" // <- 의존성 추가
  }
}
```

### 스토리북 관련된 파일만 남기고 모두 삭제하기

apps/docs 폴더

```bash
├── docs
│ ├── .storybook
│ ├── src
│ │ └── stories
│ │   └── Button.stories.ts
│ ├── vite-env.d.ts
│ ├── vite.config.ts
│ ├── package.json
│ └── ... tsconfig, lint 등 설정파일들...
```

### 버튼 스토리 만들기

```ts
// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@hobin-ui/button'

// ... 생략
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    size: 'medium',
    label: 'Button',
  },
}
```

기존에 있던 버튼 스토리 내용을 업데이트 시켜주었다.

### 스크립트 업데이트

```json
// package.json
{
  "name": "docs",
  // ... 생략
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## 루트 폴더에서 워크스페이스 관리하기

```json
// package.json
{
  "name": "hobin-ui",
  // ...생략
  "scripts": {
    "button:dev": "yarn workspaces foreach -Wp --from '{@hobin-ui/button,docs}' run dev",
    "button:build": "yarn workspace @hobin-ui/button build"
  }
}
```

루트 폴더에서 button:dev 스크립트를 실행하면 스토리북이 함께 작동하며 버튼 컴포넌트 작업을 위한 개발환경이 만들어졌음을 알 수 있다.
또한 button:build 스크립트로 버튼 컴포넌트만 빌드할 수 있게되었다.
더 많은 설정은 https://yarnpkg.com/cli 를 참고하기를 바란다.
