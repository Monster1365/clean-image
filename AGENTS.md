<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Clean Image — 프로젝트 가이드

## 필수 규칙

- **모든 설명·답변·요약은 한국어(한글)로 작성한다.** 코드, 식별자, 커맨드, 에러 메시지 원문은 그대로 두되, 그에 대한 설명은 한국어로 한다.
- 코드 주석은 영어 또는 한국어 모두 허용하되, 한 파일 안에서는 하나로 통일한다.

## 프로젝트 방향

- 브라우저에서 동작하는 **이미지 변환 사이트** (PNG, JPG, WEBP, AVIF, GIF, BMP).
- 이미지는 서버로 업로드하지 않고 **클라이언트(브라우저) 안에서만 처리**하는 것을 원칙으로 한다.
- 디자인 톤: **깔끔하고 모던, 여백이 많은 미니멀 UI.** 기능을 늘리더라도 화면은 단순하게 유지한다.
- 현재 단계: 테마와 레이아웃만 완성된 상태이며, 변환 기능은 아직 구현되지 않았다.

## 기술 스택

- Next.js 16 (App Router, TypeScript) — 위 Next.js 안내대로 `node_modules/next/dist/docs/`를 먼저 확인한다.
- Tailwind CSS v4 (`@theme inline`으로 토큰 매핑, 별도 config 파일 없음)
- 아이콘: `lucide-react`
- 폰트: Pretendard(한글, CDN) + Geist(영문)

## 디자인 규칙

- **색상은 시맨틱 토큰만 사용한다** (`bg-background`, `bg-surface`, `bg-surface-muted`, `border-border`, `border-border-strong`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-primary-soft` 등). `bg-white`, `text-gray-500`, 임의의 hex 값을 컴포넌트에 직접 쓰지 않는다. 토큰은 `app/globals.css`에 정의되어 있다.
- **하늘색(sky)은 포인트로만 사용한다.** 주요 버튼(primary), 아이콘 강조, 포커스 링 정도에 한정하고, 배경·큰 면적·그라디언트에는 쓰지 않는다. 기본 바탕은 흰색/회색 중립 톤.
- **모서리는 살짝만 둥글게.** `rounded-sm`(4px), `rounded-md`(6px), `rounded-lg`(8px)까지만 사용한다. 원형 요소(로고, 아바타) 외에는 `rounded-xl` 이상·`rounded-full`을 쓰지 않는다.
- **여백은 넉넉하게.** 섹션 간 간격을 크게 두고, 본문 폭은 좁게(`max-w-2xl` 수준) 유지한다. 그림자는 최소화하고 테두리로 구분한다.
- **라이트/다크 모드 모두 지원해야 한다.** 테마는 `<html data-theme="light|dark">`로 제어되며, 속성이 없으면 OS 설정을 따른다. 새 색상을 추가할 때는 `app/globals.css`의 라이트 값과 다크 값(두 곳: `[data-theme="dark"]`, `prefers-color-scheme` 블록)을 함께 추가한다.
- 모바일(최소 360px 폭)에서 가로 스크롤이 생기지 않아야 한다.

## 코드 구조

- `app/` — 페이지, 레이아웃, `globals.css`(테마 토큰), 파비콘(`icon.png`, `apple-icon.png`)
- `components/ui/` — 공통 UI 요소 (`Button`, `Card`, `Badge`). 새 UI는 가능한 한 이것들을 재사용·확장한다.
- `components/layout/` — `Header`, `Footer`
- `components/theme/` — `ThemeToggle` (테마 저장·적용 로직 포함)
- 경로 별칭은 `@/*`를 사용한다.

## 작업 규칙

- 작업 후 `npm run lint`와 `npm run build`가 통과하는지 확인한다.
- 빌드(프리렌더) 중 `new Date()` 등 현재 시간 값을 쓰면 Next 16에서 빌드가 실패하므로 피한다.
- 요청받지 않은 기능이나 섹션을 임의로 추가하지 않는다.
