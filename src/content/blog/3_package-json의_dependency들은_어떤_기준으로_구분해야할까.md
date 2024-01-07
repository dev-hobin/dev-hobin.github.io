---
title: package.json의 dependency들은 어떤 기준으로 구분해야 할까?
author: 장호빈
pubDatetime: 2024-1-7T12:05:00
postSlug: how-to-classify-the-dependencies-of-package-json
featured: false
draft: false
tags:
  - 의존성
  - dependency
  - package
  - 글또

description: 'package.json에서 의존성 패키지의 구분을 어떤 기준으로 해야 하는지 정리했다.'
---

## 시작하며

이번 글에서는 `package.json`의 `dependencies`, `devDependencies`, `peerDependencies`를 어떤 기준으로 구분하여 사용해야 하는지 알아보려고 한다. 이것을 제대로 구분할 수 있어야 프로젝트를 할 때 개발 환경에서 열심히 개발해 놓고서 배포 후에 실제 사용할 때 기능이 고장 나는 슬픈 참사를 막을 수 있다.

## 의존성 패키지의 구분

- `dependencies`  
  의존성 패키지를 나타낼 때 사용한다.
- `devDependencies`  
  개발환경에서만 필요한 의존성 패키지를 나타낼 때 사용한다.
- `peerDependencies`  
  호스트 패키지와의 호환성을 나타내야 할 때 사용한다.

위의 내용만 보고 적절히 의존성 패키지를 구분할 수 있다면 글을 더 읽을 필요는 없을 것이다. 앞으로 나올 내용은 어떤 기준으로 의존성 패키지를 구분해야 하는지에 대한 내용이다.

_주의: 더 많은 의존성 패키지의 구분이 있지만 위의 3가지에만 집중한다 (참고 : [npm의 package.json 문서](https://docs.npmjs.com/cli/v10/configuring-npm/package-json))_

## 사용할 프로젝트

```json
/* package.json */
{
  "name": "project",
  "scripts": {
    "build": "esbuild app.jsx --bundle --outfile=out.js"
  },
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "esbuild": "^0.19.11"
  }
}
```

```jsx
/* app.jsx */
import * as React from 'react'
import * as Server from 'react-dom/server'

const Greet = () => <h1>Hello, world!</h1>
console.log(Server.renderToString(<Greet />))
```

- Node: v20.10.0
- 패키지 매니저: npm@10.2.3

이번 글에서 여러 작업을 해보고 결과를 비교해 볼 프로젝트다.

## 사전 지식

### 외부 패키지 (External package)

먼저 프로젝트를 빌드하여 결과를 보자.

```js
/* out.js */
;(() => {
  // ... 생략

  // node_modules/react/index.js
  var require_react = __commonJS({
    'node_modules/react/index.js'(exports, module) {
      // ...생략
    },
  })

  // node_modules/react-dom/server.browser.js
  var require_server_browser = __commonJS({
    'node_modules/react-dom/server.browser.js'(exports) {
      // ...생략
    },
  })

  // ...생략

  // app.jsx
  var React = __toESM(require_react())
  var Server = __toESM(require_server_browser())
  var Greet = () =>
    /* @__PURE__ */ React.createElement('h1', null, 'Hello, world!')
  console.log(
    Server.renderToString(/* @__PURE__ */ React.createElement(Greet, null)),
  )
})()
```

위와 같이 기본적으로 프로젝트의 `node_modules`에 설치된 모듈을 직접 사용하는 방식으로 파일이 번들된다.

다음은 `react`, `react-dom` 패키지를 외부 패키지로 설정하고 빌드해보자.

```json
/* package.json */
{
  "name": "project",
  "scripts": {
    "build": "esbuild app.jsx --bundle --external:react --external:react-dom --outfile=out.js"
  }
}
```

프로젝트의 스크립트를 다음과 같이 변경하여 `react`와 `react-dom` 패키지를 외부 패키지로 만든다.

```js
;(() => {
  // ...생략

  // app.jsx
  var React = __toESM(__require('react'))
  var Server = __toESM(__require('react-dom/server'))
  var Greet = () =>
    /* @__PURE__ */ React.createElement('h1', null, 'Hello, world!')
  console.log(
    Server.renderToString(/* @__PURE__ */ React.createElement(Greet, null)),
  )
})()
```

빌드해보면 위와 같이 외부 패키지는 프로젝트의 `node_modules`에 있는 모듈을 사용하는 것이 아니라 외부에서 import 하는 방식으로 바뀌며 외부 패키지 자체는 번들에서 제외된다.

### 의존성 해결 (Dependency Resolution)

`npm install`을 실행하면 호스트 프로젝트의 `dependencies`, `peerDependencies`, `devDependencies`가 모두 설치된다. 그 과정에서 `devDependencies`로 구분된 패키지를 제외한 다른 패키지들은 계속 타고 내려가 의존하고 있는 패키지들을 모두 설치하게 된다.

```json
/* package.json */
{
  "name": "project",
  "dependencies": {
    // ...생략
    "@hobin/deps": "0.0.1"
  }
}
```

프로젝트에 `@hobin/deps@0.0.1` 패키지를 추가하자.

```json
/* @hobin/deps@0.0.1 package.json */
{
  "name": "@hobin/deps",
  "version": "0.0.1",
  "dependencies": {
    "xstate": "^5.4.1"
  }
}
```

`npm install`을 다시 실행시키면 `node_modules` 폴더에 `@hobin/deps` 패키지가 의존하고 있는 `xstate` 패키지가 설치된 것을 확인할 수 있을 것이다.

그런데 만약에 프로젝트에서 이미 다른 버전의 `xstate` 패키지에 의존하고 있었다면 의존성 해결이 어떻게 될까?

```json
/* package.json */
{
  "name": "project",
  "dependencies": {
    // ...생략
    "xstate": "^4.38.3"
  }
}
```

`xstate@4.38.3` 패키지를 `dependencies`에 추가하고 다시 패키지를 설치해보면

```bash
node_modules
├── xstate@4.38.3
└── @hobin/deps
	└── node_modules
		└── xstate@5.4.1
```

위와 같이 `node_modules`를 중첩하여 각각 의존하고 있는 버전의 `xstate` 패키지를 따로 설치한다.

### 정리

1. **외부 패키지** - 패키지를 외부화하여 번들링하면 import 표시만 남기고 외부에서 패키지에 대한 모듈을 제공하기를 기대한다
2. **의존성 해결**
   - 패키지를 설치하면 해당 패키지가 의존하고 있는 패키지들까지 모두 호스트 프로젝트의 `node_modules`에 설치된다.
   - 다른 버전의 패키지에 의존하고 있다면 중첩된 `node_modules`를 만들어 각각 따로 설치하여 의존성을 해결한다.

많은 사람들이 기본적으로 알고 있는 내용이겠지만, 앞으로 나오는 글의 이해를 위해 최소한의 내용을 정리해 보았다. 이제 프로젝트를 다시 초기화하고 다음 내용을 보자.

## 의존성 패키지 구분 기준

### 1. 운영환경과 개발환경의 차이

개발 환경은 개발자들이 코드를 다루기 편하게 하는 것과 운영에 올라갈 최적화된 코드를 만드는 것이 중요하다. 운영환경은 만들어진 잘 최적화된 코드를 사용하고 그 코드에서 사용되는 최소한의 의존성 패키지만 설치한다.

따라서, 개발 환경에서만 사용되는 의존성 패키지(번들링, 린트, 타입 정의, ...)를 구분할 필요가 있다. 그 용도로 쓰이는 것이 `package.json`의 `devDependencies` 다.

```bash
npm install --omit=dev
```

위의 스크립트를 프로젝트에서 실행시켜보면 `devDependencies`를 제외한 패키지들만 `node_modules`에 설치된 것을 확인할 수 있을 것이다.

`dependencies`와 `devDependencies`를 구분해놓으면 운영환경(`NODE_ENV=PRODUCTION`)에서는 기본적으로 `devDependencies`를 제외한 패키지만 설치된다.

### 2. 플러그인으로 사용되는지 여부

플러그인으로 사용된다는 것은 현재 패키지(플러그인 패키지)가 다른 패키지(호스트 패키지)의 "부품"으로 쓰인다는 것을 의미한다. 부품으로 쓰이기 위해서는 호스트 패키지와 "규격"이 맞아야 한다.

비유를 해보자면 호스트 패키지가 자동차라고 한다면 플러그인 패키지는 자동차의 바퀴를 의미한다. 자동차에 자동차 바퀴를 끼우려면 서로 호환 가능해야 한다. 이것을 프로그래밍 용어로 "인터페이스가 맞아야 한다."라고 표현한다.

호스트 패키지와 플러그인 패키지는 인터페이스를 공유하는 **같은 의존성 패키지를 사용 중**일 것이다. 하지만, 같은 의존성 패키지라고 하더라도 의존성 패키지 버전에 따라 제공하는 인터페이스가 다를 수 있다.

여기까지 보았을 때 두 가지를 알 수 있다.

1. 인터페이스를 공유하는 의존성 패키지는 플러그인 패키지 쪽에서 외부화해야 한다.  
   호스트 패키지에서 사용될 것이 확실한 패키지를 플러그인 패키지의 번들 결과에 포함할 필요가 없다.
2. 플러그인 패키지는 호환가능한 의존성 패키지를 명시해야한다.  
   플러그인 패키지는 호스트 패키지가 호환하는 의존성 패키지를 제공하기를 바랄 수밖에 없다. 그렇다면 적어도 플러그인 패키지 자신은 외부화한 의존성 패키지가 어떤 버전을 가져야 호환 가능한지를 스스로 알려야 한다. => **여기서부터 `peerDependencies`가 필요해진다.**

다음 패키지를 프로젝트의 의존성 패키지로 추가하고 패키지를 설치해보자.

```json
// @hobin/deps@0.0.2 package.json
{
  "name": "@hobin/deps",
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  }
}
```

```json
// package.json
{
  "name": "project",
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "@hobin/deps": "0.0.2"
  }
}
```

_설치하려고 하면 `peerDependencies` 조건을 만족하지 않았다면 에러를 발생시키는 것을 볼 수 있을 것이다. (npm@10.2.3 기준)_

```json
// package.json
{
  "name": "project",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@hobin/deps": "0.0.2"
  }
}
```

에러가 알려주는 대로 `peerDependencies`의 기준에 맞춰 버전을 올려주고 다시 패키지를 설치하면 정상적으로 설치되는 것을 확인할 수 있을 것이다.

## 결론

운영환경에서 필요한 핵심적인 기능을 제공하는 의존성 패키지는 `dependencies`에 포함시키고, 개발 및 빌드 시에만 필요한 의존성 패키지는 `devDependencies`로 분류한다. 만약 패키지가 다른 패키지의 플러그인으로 사용되는 경우, 호환이 필요한 의존성 패키지들을 찾아 `dependencies`에서 빼내 호환되는 버전을 명시적으로 지정하여 `peerDependencies`에 포함시킨다.

_p.s. 글을 다 쓰고 보니 당연한 결론이 나온 느낌이 드는데, 글로만 보았을 때 와닿지 않았던 것을 실제로 실험해 보며 와닿게 하는 과정이었다..._
