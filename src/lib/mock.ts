import type { Todo } from "@/types/todo";

// shortcut: UI 확인용 목업 데이터, API 연결이 끝나면 이 파일과 import를 지울 것
export const MOCK_TODOS: Todo[] = [
  { id: 1, tenantId: "mock", name: "비타민 챙겨 먹기", memo: null, imageUrl: null, isCompleted: false },
  { id: 2, tenantId: "mock", name: "맥주 마시기", memo: null, imageUrl: null, isCompleted: false },
  { id: 3, tenantId: "mock", name: "운동하기", memo: "오오 오늘 저녁에 비 온대", imageUrl: null, isCompleted: true },
];
