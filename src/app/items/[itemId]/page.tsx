"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/Button";
import CheckButton from "@/components/CheckButton";
import ImageUpload from "@/components/ImageUpload";
import { CheckIcon, XIcon } from "@/components/Icons";
import { MOCK_TODOS } from "@/lib/mock";
import type { Todo } from "@/types/todo";

/** 할 일 상세 페이지 (/items/{itemId}) : 이름·상태·메모·이미지 수정, 삭제 */
export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();

  // TODO(API): 초기값을 null로 바꾸고 useEffect에서 상세 조회
  const [todo, setTodo] = useState<Todo | null>(MOCK_TODOS.find((t) => t.id === Number(itemId)) ?? MOCK_TODOS[0]);

  // 수정 사항이 생기면 "수정 완료" 버튼을 lime 색으로 활성화 (시안)
  const [dirty, setDirty] = useState(false);

  if (!todo) return <p className="py-20 text-center text-slate-400">불러오는 중...</p>;

  // 폼 필드 하나만 바꾸는 헬퍼
  const update = (patch: Partial<Todo>) => {
    setTodo({ ...todo, ...patch });
    setDirty(true);
  };

  const handleImageSelect = (file: File) => {
    // TODO(API): 이미지 업로드 → 응답 url로 update({ imageUrl: url })
    update({ imageUrl: URL.createObjectURL(file) });
  };

  const handleSubmit = () => {
    // TODO(API): name, memo, imageUrl, isCompleted 수정 요청
    router.push("/");
  };

  const handleDelete = () => {
    // TODO(API): 삭제 요청
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-6 bg-white px-0 lg:-mx-6 lg:-my-6 lg:min-h-[calc(100vh-61px)] lg:px-24 lg:py-6">
      {/* 이름 + 상태 */}
      <div
        className={`flex h-16 items-center justify-center gap-4 rounded-3xl border-2 border-slate-900 px-4 ${
          todo.isCompleted ? "bg-violet-100" : "bg-white"
        }`}
      >
        <CheckButton checked={todo.isCompleted} onClick={() => update({ isCompleted: !todo.isCompleted })} />
        <input
          value={todo.name}
          onChange={(e) => update({ name: e.target.value })}
          aria-label="할 일 이름"
          size={Math.max(todo.name.length * 2, 4)} // field-sizing 미지원 브라우저용 폴백 (한글은 글자 폭이 넓음)
          className="field-sizing-content max-w-full min-w-0 bg-transparent text-xl font-bold underline-offset-4 outline-none focus:underline"
        />
      </div>

      {/* 이미지 / 메모: 모바일·태블릿 위아래, 데스크탑 좌우 */}
      <div className="grid gap-6 lg:grid-cols-[384px_1fr]">
        <ImageUpload imageUrl={todo.imageUrl} onSelect={handleImageSelect} />
        <label className="flex h-[311px] flex-col rounded-3xl bg-amber-50 bg-[repeating-linear-gradient(transparent,transparent_31px,#fde68a_32px)] p-4">
          <span className="mb-4 text-center font-extrabold text-amber-800">Memo</span>
          <textarea
            value={todo.memo ?? ""}
            onChange={(e) => update({ memo: e.target.value })}
            className="flex-1 resize-none bg-transparent text-center leading-8 outline-none"
          />
        </label>
      </div>

      {/* 버튼: 모바일·태블릿 가운데, 데스크탑 오른쪽 정렬 */}
      <div className="flex justify-center gap-2 md:gap-4 lg:justify-end">
        <Button variant={dirty ? "success" : "default"} icon={<CheckIcon />} onClick={handleSubmit}>
          수정 완료
        </Button>
        <Button variant="danger" icon={<XIcon />} onClick={handleDelete}>
          삭제하기
        </Button>
      </div>
    </div>
  );
}
