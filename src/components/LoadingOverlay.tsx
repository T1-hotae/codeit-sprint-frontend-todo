/** 로딩 오버레이: 검정 반투명 배경 위에 흰색 스피너 + "로딩중" (화면 전체를 덮어 클릭 차단) */
export default function LoadingOverlay() {
  return (
    <div
      role="status"
      aria-label="로딩중"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      <span className="font-bold text-white">로딩중</span>
    </div>
  );
}
