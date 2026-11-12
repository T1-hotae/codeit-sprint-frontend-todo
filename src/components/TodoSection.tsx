import TodoItem from "./TodoItem";
import type { Todo } from "@/types/todo";

interface Props {
  type: "todo" | "done";
  todos: Todo[];
  onToggle: (todo: Todo) => void;
}

const META = {
  todo: { label: "TODO", badge: "bg-lime-300 text-green-700", empty: "할 일이 없어요.\nTODO를 새롭게 추가해주세요!" },
  done: { label: "DONE", badge: "bg-green-700 text-amber-300", empty: "아직 다 한 일이 없어요.\n해야 할 일을 체크해보세요!" },
};

/** 진행 중(TODO) / 완료(DONE) 섹션. 비어 있으면 안내 문구 표시 */
export default function TodoSection({ type, todos, onToggle }: Props) {
  const meta = META[type];
  return (
    <section className="min-w-0 flex-1">
      <h2 className={`mb-4 inline-block rounded-full px-6 py-1 text-lg font-extrabold ${meta.badge}`}>{meta.label}</h2>
      {todos.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-8">
          {/* 모바일은 120px, 태블릿 이상은 240px 일러스트 */}
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 SVG */}
          <img src={`/images/empty-${type}-large.svg`} alt="" className="size-[120px] md:size-[240px]" />
          <p className="text-center font-bold whitespace-pre-line text-slate-400">{meta.empty}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </section>
  );
}
