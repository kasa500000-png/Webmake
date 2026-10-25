# 황동태 홈페이지 · 리뷰 전시관

울산 황동태의 홈페이지 제작 제안용 정적 웹사이트입니다. 모바일 홈페이지와 클릭으로 캐릭터가 움직이는 리뷰 전시관을 포함합니다.

공개 홈페이지: https://kasa500000-png.github.io/Webmake/

리뷰 전시관: https://kasa500000-png.github.io/Webmake/game.html

## 다른 컴퓨터에서 시작하기

Git과 Node.js 20 이상을 설치한 뒤 실행합니다. 추가 패키지 설치는 필요 없습니다.

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

- 클릭·터치로만 이동, 약 2.5초 경로 이동, 문 열림과 화면 전환
- 별점별 5개 전시실, 액자 확대 후 리뷰 감상
- 모바일에서 캐릭터와 선택 액자를 함께 보여 주는 부드러운 카메라
- 입장 이름 자동 입력 → 별점 → 사진(선택)과 글 → 등록
- 등록한 작품을 액자로 전시하는 연출, 이름·소리 설정 기억

## 저장과 목업 범위

리뷰·사진은 방문자 자신의 브라우저 `localStorage`에만 저장됩니다. 다른 컴퓨터로 Git 저장소를 복제해도 기존 브라우저의 리뷰는 옮겨지지 않습니다. 공유 리뷰 DB, 로그인, 방문 인증, 실제 식사권 추첨은 구현하지 않았습니다. 예시 리뷰는 가상 데이터이며 이벤트는 제안입니다.

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
