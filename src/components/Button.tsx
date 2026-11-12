import type { ButtonHTMLAttributes, ReactNode } from "react";

/** 버튼 색상 변형: 추가(primary) / 수정 완료(success) / 삭제(danger) / 기본(default) */
const VARIANTS = {
  default: "bg-slate-200 text-slate-900",
  primary: "bg-violet-600 text-white",
  success: "bg-lime-300 text-slate-900",
  danger: "bg-rose-500 text-white",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  icon?: ReactNode;
}

/**
 * 공용 버튼. 테두리 + 오프셋 그림자로 입체감을 준다.
 * 모바일에서 아이콘만 보이게 하려면 children을 <span className="hidden md:inline">로 감싸서 넘긴다.
 */
export default function Button({ variant = "default", icon, children, className = "", ...rest }: Props) {
  return (
    <button
      className={`flex h-14 shrink-0 items-center justify-center gap-1 rounded-3xl border-2 border-slate-900 px-4 font-bold shadow-[3px_3px_0_0] shadow-slate-900 transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[168px] ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
