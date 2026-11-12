import { expect, test, type Page } from "@playwright/test";

/**
 * 평가 체크리스트(docs/[00] checklist.md)를 실제 브라우저로 직접 눌러보며 확인하는 테스트.
 *
 * - 사람이 하듯이 "페이지 열기 → 입력 → 클릭 → 화면에 보이는지 확인" 순서로 동작한다.
 * - 진짜 서버 대신 아래 mockApi()가 만든 가짜 서버를 쓴다. (인터넷·서버 상태와 상관없이 항상 같은 결과)
 * - 구성은 체크리스트와 같다: 공통 → 목록 페이지 → 상세 페이지
 * - 배포 링크 접근 여부는 코드로 확인할 수 없어서 제외했다.
 *
 * 실행: npm test
 */

// ======================================================================
// 준비물 (테스트에서 공통으로 쓰는 도구들)
// ======================================================================

// 할 일 하나의 모양 (서버가 주는 데이터와 같은 형태)
type Item = { id: number; tenantId: string; name: string; memo: string | null; imageUrl: string | null; isCompleted: boolean };

// 업로드 테스트에 쓸 아주 작은(1x1) 이미지 파일
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
// 가짜 서버가 "업로드 성공했어요" 하고 돌려줄 이미지 주소
const IMG_URL = `data:image/png;base64,${PNG.toString("base64")}`;
// 브라우저는 다른 주소의 서버 응답을 기본으로 막는다. 이 헤더를 붙이면 허용된다.
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };

/**
 * 가짜 서버 만들기.
 * 앱이 보내는 API 요청을 중간에서 가로채 대신 답해준다.
 * 실제 서버처럼 목록 조회 / 생성 / 수정 / 삭제 / 이미지 업로드를 지원하고,
 * 데이터는 메모리(db)에만 저장되므로 테스트가 끝나면 사라진다.
 *
 * @param seed 처음부터 들어 있을 할 일 목록 (기본: 빈 목록)
 */
async function mockApi(page: Page, seed: Item[] = []) {
  const db = [...seed]; // 가짜 서버의 데이터 저장소
  let nextId = 100; // 새로 만든 할 일에 붙일 id

  // 실제 API 주소로 가는 모든 요청을 가로챈다
  await page.route(/assignment-todolist-api\.vercel\.app\/api\//, async (route) => {
    const req = route.request();
    // 주소에서 tenantId까지 떼어내고 "/items/1" 같은 뒤쪽 경로만 남긴다
    const path = new URL(req.url()).pathname.replace(/^.*\/api\/[^/]+/, "");
    const m = path.match(/^\/items\/(\d+)$/); // "/items/숫자" 형태면 특정 할 일 요청
    const ok = (body: unknown) => route.fulfill({ json: body, headers: CORS });

    // 브라우저가 본 요청 전에 보내는 "보내도 되나요?" 확인(OPTIONS)에는 바로 허락해 준다
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    // 이미지 업로드 → 항상 성공으로 처리
    if (path === "/images/upload") return ok({ url: IMG_URL });

    // /items : 목록 조회(GET) 또는 새 할 일 생성(POST)
    if (!m) {
      if (req.method() === "POST") {
        const item = { id: nextId++, tenantId: "t", memo: null, imageUrl: null, isCompleted: false, ...req.postDataJSON() };
        db.push(item);
        return ok(item);
      }
      return ok(db);
    }

    // /items/{id} : 상세 조회(GET) / 수정(PATCH) / 삭제(DELETE)
    const item = db.find((i) => i.id === Number(m[1]))!;
    if (req.method() === "PATCH") return ok(Object.assign(item, req.postDataJSON()));
    if (req.method() === "DELETE") {
      db.splice(db.indexOf(item), 1);
      return ok({});
    }
    return ok(item);
  });
}

// 테스트용 할 일 데이터를 짧게 만들어 주는 함수. 예) todo(1, "공부", true) → 완료된 "공부"
const todo = (id: number, name: string, isCompleted = false): Item => ({ id, tenantId: "t", name, memo: null, imageUrl: null, isCompleted });

// 이미지 첨부 칸의 파일 선택창(화면에는 숨겨져 있음). 여기에 파일을 직접 넣어 업로드를 흉내 낸다.
const fileInput = (page: Page) => page.locator('input[type="file"]');

// ======================================================================
// 1. 공통 (컬러 시스템 / 반응형)
// ======================================================================
test.describe("공통", () => {
  test("컬러 시스템: 시안 토큰이 적용된다", async ({ page }) => {
    await mockApi(page); // 할 일이 하나도 없는 상태
    await page.goto("/");
    // 할 일이 없으면 "추가하기" 버튼이 보라색(시안의 violet-600 = #7c3aed)으로 강조된다.
    // 화면에 실제로 칠해진 색이 그 값인지 확인한다.
    await expect(page.getByRole("button", { name: "추가하기" })).toHaveCSS("background-color", "rgb(124, 58, 237)");
  });

  // 화면 폭 3가지(모바일 / 태블릿 / 데스크탑)로 같은 검사를 반복한다
  for (const [name, width, height] of [["모바일", 375, 800], ["태블릿", 768, 1024], ["데스크탑", 1280, 800]] as const) {
    test(`반응형: ${name} 레이아웃`, async ({ page }) => {
      await mockApi(page, [todo(1, "진행 항목"), todo(2, "완료 항목", true)]);
      await page.setViewportSize({ width, height }); // 브라우저 창 크기를 해당 기기처럼 맞춘다
      await page.goto("/");
      await expect(page.getByText("진행 항목")).toBeVisible(); // 화면이 다 그려질 때까지 대기

      // ① 화면이 옆으로 삐져나와 가로 스크롤이 생기면 안 된다
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

      // ② "추가하기" 글자: 모바일은 공간이 좁아 아이콘만 보이고, 태블릿 이상은 글자도 보인다
      await expect(page.getByText("추가하기", { exact: true })).toBeVisible({ visible: width >= 768 });

      // ③ TODO / DONE 배치: 데스크탑은 좌우로 나란히, 모바일·태블릿은 위아래로 쌓인다
      const a = (await page.getByRole("heading", { name: "TODO" }).boundingBox())!;
      const b = (await page.getByRole("heading", { name: "DONE" }).boundingBox())!;
      if (width >= 1024) expect(b.x).toBeGreaterThan(a.x + a.width); // DONE이 TODO의 오른쪽에 있음
      else expect(b.y).toBeGreaterThan(a.y); // DONE이 TODO의 아래에 있음
    });
  }
});

// ======================================================================
// 2. 할 일 목록 페이지 ( / )
// ======================================================================
test.describe("할 일 목록 페이지 (/)", () => {
  test("로고 클릭 시 / 로 이동(새로고침)", async ({ page }) => {
    await mockApi(page, [todo(1, "a")]);
    await page.goto("/items/1"); // 일부러 상세 페이지에서 시작
    await page.getByRole("link", { name: /do it/ }).click(); // 로고 클릭
    await expect(page).toHaveURL("/"); // 목록 페이지로 이동했는지

    // "진짜 새로고침"인지 확인하는 방법:
    // 페이지에 메모(__m)를 적어 두고 로고를 다시 누른다.
    // 새로고침되면 페이지가 처음부터 다시 로드되어 메모가 지워진다.
    // (새로고침 없이 화면만 바뀌는 이동이라면 메모가 그대로 남는다)
    await page.evaluate(() => ((window as unknown as { __m: number }).__m = 1));
    await page.getByRole("link", { name: /do it/ }).click();
    await page.waitForLoadState("load");
    expect(await page.evaluate(() => (window as unknown as { __m?: number }).__m)).toBeUndefined();
  });

  test("진행 중 / 완료 구분 표시", async ({ page }) => {
    await mockApi(page, [todo(1, "진행 항목"), todo(2, "완료 항목", true)]);
    await page.goto("/");
    // TODO 영역 / DONE 영역을 각각 잡는다
    const todoSec = page.locator("section", { hasText: "TODO" });
    const doneSec = page.locator("section", { hasText: "DONE" });
    await expect(todoSec.getByText("진행 항목")).toBeVisible(); // 진행 중 항목은 TODO에만
    await expect(todoSec.getByText("완료 항목")).toHaveCount(0); // TODO에 완료 항목이 섞이면 안 됨
    await expect(doneSec.getByText("완료 항목")).toBeVisible(); // 완료 항목은 DONE에
  });

  test("추가하기 버튼으로 할 일 생성", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await page.getByLabel("할 일 입력").fill("버튼으로 추가"); // 입력창에 글자 입력
    await page.getByRole("button", { name: "추가하기" }).click(); // 버튼 클릭
    await expect(page.getByText("버튼으로 추가")).toBeVisible(); // 목록에 나타났는지
  });

  test("엔터로 할 일 생성", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await page.getByLabel("할 일 입력").fill("엔터로 추가");
    await page.keyboard.press("Enter"); // 버튼 대신 엔터 키
    await expect(page.getByText("엔터로 추가")).toBeVisible();
  });

  test("체크박스로 완료 ↔ 진행 중 토글", async ({ page }) => {
    await mockApi(page, [todo(1, "토글 항목")]); // 처음엔 진행 중
    await page.goto("/");
    const todoSec = page.locator("section", { hasText: "TODO" });
    const doneSec = page.locator("section", { hasText: "DONE" });

    // 진행 중 → 완료: 체크하면 DONE 영역으로 옮겨진다
    await todoSec.getByRole("checkbox").click();
    await expect(doneSec.getByText("토글 항목")).toBeVisible();

    // 완료 → 진행 중: 다시 체크하면 TODO 영역으로 돌아온다
    await doneSec.getByRole("checkbox").click();
    await expect(todoSec.getByText("토글 항목")).toBeVisible();
  });
});

// ======================================================================
// 3. 할 일 상세 페이지 ( /items/{itemId} )
// ======================================================================
test.describe("할 일 상세 페이지 (/items/{itemId})", () => {
  test("이름·상태·메모·이미지 수정 → 수정 완료 → 목록 이동 → 재진입 시 유지", async ({ page }) => {
    await mockApi(page, [todo(1, "원래 이름")]);
    await page.goto("/items/1");

    // [수정] 이름 바꾸기 / 완료로 바꾸기 / 메모 쓰기 / 이미지 첨부
    await page.getByLabel("할 일 이름").fill("바뀐 이름");
    await page.getByRole("checkbox").click(); // 상태를 완료로 변경
    await page.locator("textarea").fill("메모 내용");
    await fileInput(page).setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG });
    await expect(page.getByAltText("첨부 이미지")).toBeVisible(); // 업로드된 이미지가 보이는지

    // [저장] 수정 완료 → 목록 페이지로 이동하고, 완료 상태이므로 DONE에 보여야 한다
    await page.getByRole("button", { name: "수정 완료" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.locator("section", { hasText: "DONE" }).getByText("바뀐 이름")).toBeVisible();

    // [재확인] 다시 들어갔을 때 방금 저장한 이름·메모·이미지가 그대로 있어야 한다
    await page.getByText("바뀐 이름").click();
    await expect(page.getByLabel("할 일 이름")).toHaveValue("바뀐 이름");
    await expect(page.locator("textarea")).toHaveValue("메모 내용");
    await expect(page.getByAltText("첨부 이미지")).toBeVisible();
  });

  test("이미지: 한글 파일명은 거부", async ({ page }) => {
    await mockApi(page, [todo(1, "a")]);
    await page.goto("/items/1");
    // 경고창(alert)이 뜨면 "확인"을 누르고 그 안내 문구를 기억해 둔다.
    // (파일을 넣기 "전에" 대기를 걸어 둬야 경고창을 놓치지 않는다)
    const msg = page.waitForEvent("dialog").then(async (d) => {
      await d.accept();
      return d.message();
    });
    await fileInput(page).setInputFiles({ name: "사진.png", mimeType: "image/png", buffer: PNG }); // 파일명이 한글
    expect(await msg).toContain("영어"); // "영어로만..." 안내가 떴는지
    await expect(page.getByAltText("첨부 이미지")).toHaveCount(0); // 이미지가 첨부되지 않았는지
  });

  test("이미지: 5MB 초과는 거부", async ({ page }) => {
    await mockApi(page, [todo(1, "a")]);
    await page.goto("/items/1");
    // 위 테스트와 같은 방식으로 경고창 문구를 받아 둔다
    const msg = page.waitForEvent("dialog").then(async (d) => {
      await d.accept();
      return d.message();
    });
    // 5MB보다 딱 1바이트 큰 가짜 파일
    await fileInput(page).setInputFiles({ name: "big.png", mimeType: "image/png", buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
    expect(await msg).toContain("5MB"); // "5MB 이하만..." 안내가 떴는지
    await expect(page.getByAltText("첨부 이미지")).toHaveCount(0);
  });

  test("삭제하기 → 삭제되고 목록으로 이동", async ({ page }) => {
    await mockApi(page, [todo(1, "지울 항목")]);
    await page.goto("/items/1");
    await page.getByRole("button", { name: "삭제하기" }).click();
    await expect(page).toHaveURL("/"); // 목록 페이지로 이동
    await expect(page.getByText("지울 항목")).toHaveCount(0); // 목록에서 사라졌는지
  });
});
