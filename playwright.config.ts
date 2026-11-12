import { defineConfig } from "@playwright/test";

// API는 테스트에서 모킹하므로 dev 서버만 띄우면 된다.
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
