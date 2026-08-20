// GA4 pageview/이벤트 전송 헬퍼. index.html의 gtag 스니펫이 로드되기 전이거나
// (예: 애드블록) window.gtag가 없는 환경에서도 조용히 무시한다.

export function trackPageView(path) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
