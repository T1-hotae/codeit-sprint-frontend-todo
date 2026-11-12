import type { Todo } from "@/types/todo";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_TENANT_ID}`;

/** 공통 fetch: 실패 시 에러를 던진다 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, init);
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

const json = (body: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/** getTodos : 할 일 목록 조회 */
export const getTodos = () => request<Todo[]>("/items?pageSize=100");

/** getTodo : 특정 할 일 조회 */
export const getTodo = (id: string) => request<Todo>(`/items/${id}`);

/** createTodo : 할 일 생성 */
export const createTodo = (name: string) =>
  request<Todo>("/items", { method: "POST", ...json({ name }) });

/** updateTodo : 할 일 수정 */
export const updateTodo = (
  id: number | string,
  data: Partial<Pick<Todo, "name" | "memo" | "imageUrl" | "isCompleted">>,
) => request<Todo>(`/items/${id}`, { method: "PATCH", ...json(data) });

/** deleteTodo : 할 일 삭제 */
export const deleteTodo = (id: number | string) =>
  request<unknown>(`/items/${id}`, { method: "DELETE" });

/** uploadImage : 이미지 업로드 → 업로드된 이미지 url 반환 (필드명은 "image") */
export async function uploadImage(file: File) {
  const form = new FormData();
  form.append("image", file);
  const { url } = await request<{ url: string }>("/images/upload", {
    method: "POST",
    body: form,
  });
  return url;
}
