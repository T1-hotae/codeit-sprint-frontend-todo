import { CheckIcon } from "./Icons";

interface Props {
  checked: boolean;
  onClick: () => void;
}

/** 할 일 왼쪽의 원형 체크 버튼. 진행 중 ↔ 완료 토글 (목록·상세 공용) */
export default function CheckButton({ checked, onClick }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? "진행 중으로 변경" : "완료로 변경"}
      onClick={onClick}
      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 ${
        checked ? "bg-violet-600 text-white" : "bg-yellow-50"
      }`}
    >
      {checked && <CheckIcon />}
    </button>
  );
}
