"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/Button";
import CheckButton from "@/components/CheckButton";
import ImageUpload from "@/components/ImageUpload";
import { CheckIcon, XIcon } from "@/components/Icons";
import { deleteTodo, getTodo, updateTodo, uploadImage } from "@/lib/api";
import type { Todo } from "@/types/todo";

/** 할 일 상세 페이지 (/items/{itemId}) : 이름·상태·메모·이미지 수정, 삭제 */
export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();

  // 상세 데이터 (로딩 전에는 null)
  const [todo, setTodo] = useState<Todo | null>(null);

  // 진입 시 상세 조회
  useEffect(() => {
    getTodo(itemId)
      .then(setTodo)
      .catch(() => alert("할 일을 불러오지 못했어요."));
  }, [itemId]);

  // 수정 사항이 생기면 "수정 완료" 버튼을 lime 색으로 강조 (시안)
  const [dirty, setDirty] = useState(false);

  if (!todo)
    return <p className="py-20 text-center text-slate-400">불러오는 중...</p>;

  // 화면 상태(todo)를 부분 갱신하고 dirty 표시
  const update = (patch: Partial<Todo>) => {
    setTodo({ ...todo, ...patch });
    setDirty(true);
  };

  // 이미지 선택 시 업로드 후 imageUrl 갱신
  const handleImageSelect = async (file: File) => {
    update({ imageUrl: await uploadImage(file) });
  };

  // 수정 완료 버튼 클릭 시 수정 사항을 서버에 반영하고 목록 페이지로 이동
  const handleSubmit = async () => {
    await updateTodo(todo.id, {
      name: todo.name,
      memo: todo.memo ?? "",
      isCompleted: todo.isCompleted,
      ...(todo.imageUrl && { imageUrl: todo.imageUrl }), // imageUrl은 null을 보내면 안 됨 (스펙상 string)
    });
    router.push("/");
  };

  // 삭제 버튼 클릭 시 삭제 후 목록 페이지로 이동
  const handleDelete = async () => {
    await deleteTodo(todo.id);
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
        <CheckButton
          checked={todo.isCompleted}
          onClick={() => update({ isCompleted: !todo.isCompleted })}
        />
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
          <span className="mb-4 text-center font-extrabold text-amber-800">
            Memo
          </span>
          <textarea
            value={todo.memo ?? ""}
            onChange={(e) => update({ memo: e.target.value })}
            className="flex-1 resize-none bg-transparent text-center leading-8 outline-none"
          />
        </label>
      </div>

      {/* 버튼: 모바일·태블릿 가운데, 데스크탑 오른쪽 정렬 */}
      <div className="flex justify-center gap-2 md:gap-4 lg:justify-end">
        <Button
          variant={dirty ? "success" : "default"}
          icon={<CheckIcon />}
          onClick={handleSubmit}
        >
          수정 완료
        </Button>
        <Button variant="danger" icon={<XIcon />} onClick={handleDelete}>
          삭제하기
        </Button>
      </div>
    </div>
  );
}
