"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import TodoSection from "@/components/TodoSection";
import { PlusIcon } from "@/components/Icons";
import { createTodo, getTodos, updateTodo } from "@/lib/api";
import type { Todo } from "@/types/todo";

/** 할 일 목록 페이지 (/) : 추가 / 진행·완료 구분 조회 / 완료 토글 */
export default function HomePage() {
  // TODO(API): 초기값을 []로 바꾸고 useEffect에서 목록 조회
  const [todos, setTodos] = useState<Todo[]>([]);
  const [name, setName] = useState("");

  // 목록 조회
  const load = () =>
    getTodos()
      .then(setTodos)
      .catch(() => alert("목록을 불러오지 못했어요."));

  // 사이드 이펙트 : 페이지 로딩 시 목록 조회
  useEffect(() => {
    load();
  }, []);

  /**
   * 할 일 추가
   * form submit 하나로 "추가하기 버튼 클릭"과 "엔터"를 모두 처리
   *  */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await createTodo(trimmed);
    setName("");
    load();
  };

  // 완료 토글
  const handleToggle = async (todo: Todo) => {
    await updateTodo(todo.id, { isCompleted: !todo.isCompleted });
    load(); // 변경된 상태를 목록에 반영
  };

  const isEmpty = todos.length === 0;

  return (
    <>
      <form onSubmit={handleAdd} className="mb-10 flex gap-2 md:gap-4">
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="할 일을 입력해주세요"
          aria-label="할 일 입력"
        />
        {/* 할 일이 없을 땐 보라색으로 강조 */}
        <Button
          type="submit"
          variant={isEmpty ? "primary" : "default"}
          icon={<PlusIcon />}
          aria-label="추가하기"
        >
          <span className="hidden md:inline">추가하기</span>
        </Button>
      </form>

      {/* 모바일·태블릿: 위아래 / 데스크탑: 좌우 2열 */}
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-6">
        <TodoSection
          type="todo"
          todos={todos.filter((t) => !t.isCompleted)}
          onToggle={handleToggle}
        />
        <TodoSection
          type="done"
          todos={todos.filter((t) => t.isCompleted)}
          onToggle={handleToggle}
        />
      </div>
    </>
  );
}
