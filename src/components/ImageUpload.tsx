"use client";

import { useRef } from "react";
import { EditIcon, PlusIcon } from "./Icons";

interface Props {
  imageUrl: string | null;
  /** 검증을 통과한 파일만 넘겨준다. 실제 업로드(API)는 부모에서 처리 */
  onSelect: (file: File) => void;
}

const MAX_SIZE = 5 * 1024 * 1024;
// 파일명(확장자 포함)이 영문·숫자·일부 기호로만 이루어졌는지 검사
const ENGLISH_NAME = /^[A-Za-z0-9._\-() ]+$/;

/** 이미지 첨부 박스. 파일 이름(영문) / 크기(5MB 이하) 검증 후 onSelect 호출 */
export default function ImageUpload({ imageUrl, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일을 다시 선택해도 onChange가 동작하도록
    if (!file) return;
    if (!ENGLISH_NAME.test(file.name)) return alert("이미지 파일 이름은 영어로만 이루어져야 합니다.");
    if (file.size > MAX_SIZE) return alert("이미지는 5MB 이하만 첨부할 수 있습니다.");
    onSelect(file);
  };

  return (
    <div
      className={`relative flex h-[311px] items-center justify-center overflow-hidden rounded-3xl bg-slate-50 ${
        imageUrl ? "" : "border-2 border-dashed border-slate-300"
      }`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 업로드 이미지 도메인이 고정되어 있지 않음
        <img src={imageUrl} alt="첨부 이미지" className="size-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 정적 SVG
        <img src="/images/ic-img.svg" alt="" width={64} height={64} />
      )}
      <button
        type="button"
        aria-label={imageUrl ? "이미지 변경" : "이미지 추가"}
        onClick={() => inputRef.current?.click()}
        className={`absolute right-4 bottom-4 flex size-16 items-center justify-center rounded-full ${
          imageUrl ? "border-2 border-slate-900 bg-slate-900/50 text-white" : "bg-slate-200 text-slate-500"
        }`}
      >
        {imageUrl ? <EditIcon /> : <PlusIcon />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
    </div>
  );
}
