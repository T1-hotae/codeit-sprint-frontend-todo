import { expect, test, type Page } from "@playwright/test";

/**
 * 평가 체크리스트(docs/[00] checklist.md) E2E 테스트.
 * describe 구성은 체크리스트 섹션(공통 / 목록 / 상세)과 같다.
 * 외부 API는 mockApi()로 인메모리 모킹하므로 네트워크·서버 데이터와 무관하게 결정적으로 동작한다.
 * 배포 접근 여부는 코드로 검증할 수 없어 제외.
 */

// ---------- 테스트 도구 ----------

type Item = { id: number; tenantId: string; name: string; memo: string | null; imageUrl: string | null; isCompleted: boolean };
// 업로드 테스트용 1x1 PNG
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const IMG_URL = `data:image/png;base64,${PNG.toString("base64")}`;
// 모킹 응답에 붙이는 CORS 헤더 (브라우저가 다른 origin 응답을 막지 않도록)
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };

/** API 전체를 가로채 seed 데이터를 가진 가짜 서버로 대체한다 (목록/생성/수정/삭제/이미지 업로드) */
async function mockApi(page: Page, seed: Item[] = []) {
  const db = [...seed];
  let nextId = 100;
  await page.route(/assignment-todolist-api\.vercel\.app\/api\//, async (route) => {
    const req = route.request();
    // tenantId 앞부분을 제거해 "/items/1" 같은 리소스 경로만 남긴다
    const path = new URL(req.url()).pathname.replace(/^.*\/api\/[^/]+/, "");
    const m = path.match(/^\/items\/(\d+)$/);
    const ok = (body: unknown) => route.fulfill({ json: body, headers: CORS });
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    if (path === "/images/upload") return ok({ url: IMG_URL });
    if (!m) {
      if (req.method() === "POST") {
        const item = { id: nextId++, tenantId: "t", memo: null, imageUrl: null, isCompleted: false, ...req.postDataJSON() };
        db.push(item);
        return ok(item);
      }
      return ok(db);
    }
    const item = db.find((i) => i.id === Number(m[1]))!;
    if (req.method() === "PATCH") return ok(Object.assign(item, req.postDataJSON()));
    if (req.method() === "DELETE") {
      db.splice(db.indexOf(item), 1);
      return ok({});
    }
    return ok(item);
  });
}

// 테스트 데이터 생성 헬퍼
const todo = (id: number, name: string, isCompleted = false): Item => ({ id, tenantId: "t", name, memo: null, imageUrl: null, isCompleted });
// 이미지 업로드용 숨겨진 file input
const fileInput = (page: Page) => page.locator('input[type="file"]');

test.describe("공통", () => {
  test("컬러 시스템: 시안 토큰이 적용된다", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    // 할 일이 없을 때 추가하기 버튼은 시안의 violet-600(#7c3aed)
    await expect(page.getByRole("button", { name: "추가하기" })).toHaveCSS("background-color", "rgb(124, 58, 237)");
  });

  for (const [name, width, height] of [["모바일", 375, 800], ["태블릿", 768, 1024], ["데스크탑", 1280, 800]] as const) {
    test(`반응형: ${name} 레이아웃`, async ({ page }) => {
      await mockApi(page, [todo(1, "진행 항목"), todo(2, "완료 항목", true)]);
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await expect(page.getByText("진행 항목")).toBeVisible();

      // 1) 가로 스크롤이 생기지 않는다
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      // 2) 모바일은 버튼 텍스트 숨김(아이콘만), 태블릿 이상은 표시
      await expect(page.getByText("추가하기", { exact: true })).toBeVisible({ visible: width >= 768 });
      // 3) 데스크탑(lg 이상)만 TODO/DONE 좌우 2열, 그 외는 위아래
      const a = (await page.getByRole("heading", { name: "TODO" }).boundingBox())!;
      const b = (await page.getByRole("heading", { name: "DONE" }).boundingBox())!;
      if (width >= 1024) expect(b.x).toBeGreaterThan(a.x + a.width);
      else expect(b.y).toBeGreaterThan(a.y);
    });
  }
});

test.describe("할 일 목록 페이지 (/)", () => {
  test("로고 클릭 시 / 로 이동(새로고침)", async ({ page }) => {
    await mockApi(page, [todo(1, "a")]);
    await page.goto("/items/1");
    await page.getByRole("link", { name: /do it/ }).click();
    await expect(page).toHaveURL("/");
    // 클라이언트 이동이면 window 마커가 남고, 전체 새로고침이면 사라진다
    await page.evaluate(() => ((window as unknown as { __m: number }).__m = 1));
    await page.getByRole("link", { name: /do it/ }).click();
    await page.waitForLoadState("load");
    expect(await page.evaluate(() => (window as unknown as { __m?: number }).__m)).toBeUndefined();
  });

  test("진행 중 / 완료 구분 표시", async ({ page }) => {
    await mockApi(page, [todo(1, "진행 항목"), todo(2, "완료 항목", true)]);
    await page.goto("/");
    const todoSec = page.locator("section", { hasText: "TODO" });
    const doneSec = page.locator("section", { hasText: "DONE" });
    await expect(todoSec.getByText("진행 항목")).toBeVisible();
    await expect(todoSec.getByText("완료 항목")).toHaveCount(0);
    await expect(doneSec.getByText("완료 항목")).toBeVisible();
  });

  test("추가하기 버튼으로 할 일 생성", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await page.getByLabel("할 일 입력").fill("버튼으로 추가");
    await page.getByRole("button", { name: "추가하기" }).click();
    await expect(page.getByText("버튼으로 추가")).toBeVisible();
  });

  test("엔터로 할 일 생성", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await page.getByLabel("할 일 입력").fill("엔터로 추가");
    await page.keyboard.press("Enter");
    await expect(page.getByText("엔터로 추가")).toBeVisible();
  });

  test("체크박스로 완료 ↔ 진행 중 토글", async ({ page }) => {
    await mockApi(page, [todo(1, "토글 항목")]);
    await page.goto("/");
    const todoSec = page.locator("section", { hasText: "TODO" });
    const doneSec = page.locator("section", { hasText: "DONE" });

    await todoSec.getByRole("checkbox").click();
    await expect(doneSec.getByText("토글 항목")).toBeVisible();

    await doneSec.getByRole("checkbox").click();
    await expect(todoSec.getByText("토글 항목")).toBeVisible();
  });
});

test.describe("할 일 상세 페이지 (/items/{itemId})", () => {
  test("이름·상태·메모·이미지 수정 → 수정 완료 → 목록 이동 → 재진입 시 유지", async ({ page }) => {
    await mockApi(page, [todo(1, "원래 이름")]);
    await page.goto("/items/1");

    await page.getByLabel("할 일 이름").fill("바뀐 이름");
    await page.getByRole("checkbox").click(); // 상태를 완료로 변경
    await page.locator("textarea").fill("메모 내용");
    await fileInput(page).setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG });
    await expect(page.getByAltText("첨부 이미지")).toBeVisible();

    await page.getByRole("button", { name: "수정 완료" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.locator("section", { hasText: "DONE" }).getByText("바뀐 이름")).toBeVisible();

    await page.getByText("바뀐 이름").click();
    await expect(page.getByLabel("할 일 이름")).toHaveValue("바뀐 이름");
    await expect(page.locator("textarea")).toHaveValue("메모 내용");
    await expect(page.getByAltText("첨부 이미지")).toBeVisible();
  });

  test("이미지: 한글 파일명은 거부", async ({ page }) => {
    await mockApi(page, [todo(1, "a")]);
    await page.goto("/items/1");
    const msg = page.waitForEvent("dialog").then(async (d) => {
      await d.accept();
      return d.message();
    });
    await fileInput(page).setInputFiles({ name: "사진.png", mimeType: "image/png", buffer: PNG });
    expect(await msg).toContain("영어");
    await expect(page.getByAltText("첨부 이미지")).toHaveCount(0);
  });

  test("이미지: 5MB 초과는 거부", async ({ page }) => {
    await mockApi(page, [todo(1, "a")]);
    await page.goto("/items/1");
    const msg = page.waitForEvent("dialog").then(async (d) => {
      await d.accept();
      return d.message();
    });
    await fileInput(page).setInputFiles({ name: "big.png", mimeType: "image/png", buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
    expect(await msg).toContain("5MB");
    await expect(page.getByAltText("첨부 이미지")).toHaveCount(0);
  });

  test("삭제하기 → 삭제되고 목록으로 이동", async ({ page }) => {
    await mockApi(page, [todo(1, "지울 항목")]);
    await page.goto("/items/1");
    await page.getByRole("button", { name: "삭제하기" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText("지울 항목")).toHaveCount(0);
  });
});
