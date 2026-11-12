/**
 * 상단 헤더. 로고 클릭 시 "/"로 이동 + 새로고침.
 * Next <Link>는 클라이언트 이동이라 새로고침이 안 되므로 일반 <a>를 쓴다.
 */
/* eslint-disable @next/next/no-img-element -- 정적 SVG라 next/image 최적화가 필요 없음 */
export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-15 max-w-[1200px] items-center px-4 md:px-6">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- 요구사항: 새로고침 */}
        <a href="/" aria-label="do it; 홈으로">
          {/* 모바일은 작은 로고, 태블릿 이상은 큰 로고 */}
          <img src="/images/logo-small.svg" alt="" width={71} height={40} className="md:hidden" />
          <img src="/images/logo-large.svg" alt="" width={151} height={40} className="hidden md:block" />
        </a>
      </div>
    </header>
  );
}
