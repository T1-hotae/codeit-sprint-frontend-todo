import Link from "next/link";
import CheckButton from "./CheckButton";
import type { Todo } from "@/types/todo";

interface Props {
  todo: Todo;
  onToggle: (todo: Todo) => void;
}

/** 목록의 할 일 한 줄. 체크 버튼은 상태 토글, 이름 클릭은 상세 페이지 이동 */
export default function TodoItem({ todo, onToggle }: Props) {
  return (
    <li
      className={`flex h-[50px] items-center gap-4 rounded-[27px] border-2 border-slate-900 px-3 ${
        todo.isCompleted ? "bg-violet-100" : "bg-white"
      }`}
    >
      <CheckButton checked={todo.isCompleted} onClick={() => onToggle(todo)} />
      <Link
        href={`/items/${todo.id}`}
        className={`flex-1 truncate text-slate-800 ${todo.isCompleted ? "line-through" : ""}`}
      >
        {todo.name}
      </Link>
    </li>
  );
}
