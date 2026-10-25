# 황동태 홈페이지 · 리뷰 전시관

울산 황동태의 홈페이지 제작 제안용 정적 웹사이트입니다. 모바일 홈페이지와 클릭으로 캐릭터가 움직이는 리뷰 전시관을 포함합니다.

공개 홈페이지: https://kasa500000-png.github.io/Webmake/

리뷰 전시관: https://kasa500000-png.github.io/Webmake/game.html

## 다른 컴퓨터에서 시작하기

Git과 Node.js 20 이상을 설치한 뒤 실행합니다. 정적 홈페이지 실행에는 추가 설치가 필요 없고, 관리자 코드 수정·테스트·빌드에는 `npm ci`를 먼저 실행합니다.

```sh
git clone https://github.com/kasa500000-png/Webmake.git
cd Webmake
npm start
```

브라우저에서 http://localhost:4318 을 엽니다. 리뷰 전시관은 http://localhost:4318/game.html 입니다. 포트가 이미 사용 중이면 기존 서버를 종료하거나 `PORT` 환경 변수를 다른 번호로 지정합니다.

## 수정할 파일

| 파일 | 내용 |
| --- | --- |
| `index.html`, `style.css`, `script.js` | 식당 홈페이지와 지도 |
| `game.html`, `game.css`, `game.js` | 모바일 배치, 캐릭터·카메라·이동·전시 연출 |
| `museum.js`, `museum.css` | 리뷰 작성, 사진 처리, 저장, 감상창 |
| `sound.js` | 효과음과 음소거 |
| `assets/` | 음식 사진과 실제 네이버 지도 캡처 |

```sh
npm run check
git add .
git commit -m "Describe changes"
git push
```

## 현재 구현

- 조림 중심 첫 화면, 오늘의 생선·날짜·판매 상태, 사전 전화 문의 버튼
- `admin.html`: 지정 관리자 이메일 로그인, 비밀번호 설정/재설정, 오늘 메뉴 저장, 동일 생선 재등록, 품절 전환
- 오늘의 메뉴는 Neon에 공유 저장되며, 한국 날짜가 바뀌면 전화 확인 안내로 전환

- 클릭·터치로만 이동, 약 2.5초 경로 이동, 문 열림과 화면 전환
- 별점별 5개 전시실, 액자 확대 후 리뷰 감상
- 모바일에서 캐릭터와 선택 액자를 함께 보여 주는 부드러운 카메라
- 입장 이름 자동 입력 → 별점 → 사진(선택)과 글 → 등록
- 등록한 작품을 액자로 전시하는 연출, 이름·소리 설정 기억

## 저장과 목업 범위

리뷰·사진은 방문자 자신의 브라우저 `localStorage`에만 저장됩니다. 다른 컴퓨터로 Git 저장소를 복제해도 기존 브라우저의 리뷰는 옮겨지지 않습니다. 오늘의 메뉴용 관리자 로그인과 Neon DB는 구현되어 있지만, 리뷰 공유 DB·방문자 로그인·방문 인증·실제 식사권 추첨은 구현하지 않았습니다. 예시 리뷰는 가상 데이터이며 이벤트는 제안입니다.

## 오늘의 조림 관리

관리 화면: https://kasa500000-png.github.io/Webmake/admin.html (로컬: http://localhost:4318/admin.html)

최초 이용 시 지정 관리자 이메일을 입력하고 **처음 이용하시나요? / 비밀번호 재설정**을 누릅니다. 이메일 링크에서 비밀번호를 설정한 뒤 로그인합니다. 생선 이름과 판매 상태를 입력하고 **오늘 메뉴로 저장**을 누르면 홈페이지에 최대 1분 이내 반영됩니다. **오늘도 같은 생선**은 마지막 저장 생선을 오늘 판매 중으로 등록합니다.

매일 한국 시간 자정에 이전 날짜의 생선명은 표시되지 않습니다. 당일 미등록·API 장애 시 전화 문의 안내를 표시하며, 브라우저에 이전 메뉴를 캐시하지 않습니다. 운영 데이터에는 테스트용 생선을 넣지 않습니다.

### Neon 구성

- 프로젝트: `falling-credit-33175798` (Hwangdongtae, AWS Singapore)
- 운영: `br-dry-darkness-aojqqeau` / 개발: `br-super-mouse-aofihlgv`
- 각 브랜치의 Neon Auth와 `menu` Function은 독립적입니다. 개발 브랜치의 QA 계정·메뉴는 운영에 복사하지 않습니다.
- `site-config.js`에는 공개 API/Auth URL만 있습니다. 비밀번호와 DB 연결 문자열은 넣지 마세요.
- `backend/schema.sql`로 테이블을 생성합니다. `menu_admins`에는 사전에 지정한 Auth 사용자 ID만 등록합니다. 회원가입이나 로그인 성공만으로 수정 권한이 생기지 않습니다.
- API: 공개 `GET /today-menu`, Bearer JWT + 관리자 권한이 필요한 `GET/PUT /admin/today-menu`. 저장 본문은 `{ "fishName": "생선명", "status": "available" }` 또는 `sold_out`입니다. 날짜는 DB가 한국 시간으로 기록합니다.
- Auth 허용 도메인은 GitHub Pages 원본과 로컬 개발입니다. API CORS도 이 출처만 허용합니다.
- 현재 메일은 Neon 기본 공용 발송 서비스를 사용합니다. 비밀번호 재설정은 지원하지만, 정식 운영 시 Neon Console → Settings → Better Auth에서 전용 SMTP를 설정해야 합니다. 발송 계정 비밀키는 저장소에 넣지 마세요.

### 수정·검증·배포

```sh
npm ci
npm test
npm run check
npm run build
```

`assets/admin.bundle.js`는 GitHub Pages에서 실행하는 관리자 번들입니다. `admin.js`, `today-menu.js`, `site-config.js`를 수정한 뒤에는 다시 빌드해 함께 커밋합니다. 백엔드 번들은 `.build/function/index.mjs`에 생성되며 Git에서는 제외됩니다.

Neon CLI에 로그인한 환경에서는 해당 프로젝트·브랜치를 명시적으로 연결한 뒤 `neon.ts` 설정으로 배포합니다. CLI 명령은 설치 버전의 `--help`로 확인하세요. MCP 배포 시 `.build/function/index.mjs`를 ZIP의 루트에 넣고 `menu` Function에 업로드합니다. Neon이 DB 연결과 Auth JWKS 주소를 주입합니다. DB 변경은 개발 브랜치에 먼저 적용·검증하고 운영에 같은 SQL을 적용합니다.

음식 사진은 네이버 등록 사진을 바탕으로 화질 보정한 제안용 자산입니다. 매장 실사진 원본·사용 권한을 확인한 후 정식 운영에 사용하세요. 지도는 2026-10-25 네이버 지도에서 위치를 확인한 캡처이며, 표시와 출처를 유지합니다. 글꼴은 Google Fonts에서 불러옵니다.

## 배포와 이어서 작업

**GitHub Pages 자동 배포가 연결되어 있습니다.** `main` 브랜치에 push하면 저장소 루트의 홈페이지가 자동으로 배포됩니다. GitHub 웹에서 파일을 수정하고 `main`에 커밋해도 동일하게 반영됩니다. 반영까지 수 분이 걸릴 수 있습니다.

- 배포 설정: 저장소 Settings → Pages → Deploy from a branch → `main` / `/ (root)`
- 배포 진행 및 실패 확인: 저장소 Actions의 `pages build and deployment`
- `.nojekyll`은 HTML·CSS·JavaScript를 그대로 게시하도록 유지합니다.
- 별도 배포 토큰이나 로컬 서버 실행 없이 공개 주소를 이용할 수 있습니다.
- 이전 주소 https://hwangdongtae-review-gallery.shk1122.chatgpt.site 는 기존 버전으로 남으며 GitHub 수정 사항이 자동 반영되지 않습니다. 새 공개 주소를 공유하세요.

- Sites 프로젝트 ID: `appgprj_6add2f8766008191921f96ebae00aef6`
- 이전 Sites 공개 버전: 4 (모바일 카메라 중앙 구도 및 부드러운 추적 포함)
- Sites의 소스 저장소는 이 GitHub 저장소와 별개입니다. Sites 업데이트 시 해당 프로젝트를 열고 수정 파일을 동기화한 뒤 배포해야 합니다.
- 인증 키·토큰은 저장소에 포함하지 않습니다.

다른 컴퓨터의 Codex에서 이 폴더를 열고 “README를 읽고 황동태 홈페이지 작업을 이어서 진행해줘”라고 요청하면 됩니다.
