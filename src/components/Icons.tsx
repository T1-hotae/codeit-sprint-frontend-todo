// 공용 SVG 아이콘 모음 (색은 currentColor라 부모 text 색을 따른다)

/** 더하기 (추가하기·이미지 추가) */
export const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** 체크 표시 (체크 버튼·수정 완료 버튼) */
export const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 엑스 (삭제하기 버튼) */
export const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** 연필 (이미지 변경) */
export const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path d="M10.5 2.5l3 3L6 13H3v-3l7.5-7.5z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
  </svg>
);
