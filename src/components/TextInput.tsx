import type { InputHTMLAttributes } from "react";

/** 공용 텍스트 입력창 (목록 상단 할 일 입력에 사용) */
export default function TextInput({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-14 w-full min-w-0 rounded-3xl border-2 border-slate-900 bg-slate-100 px-6 shadow-[3px_3px_0_0] shadow-slate-900 outline-none placeholder:text-slate-500 ${className}`}
      {...rest}
    />
  );
}
