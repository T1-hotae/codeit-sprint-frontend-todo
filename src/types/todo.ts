/** API(Item 스키마)와 동일한 할 일 타입 */
export interface Todo {
  id: number;
  tenantId: string;
  name: string;
  memo: string | null;
  imageUrl: string | null;
  isCompleted: boolean;
}
