import { useEffect, useRef } from "react";

/**
 * I chose an IntersectionObserver on a sentinel element (placed after
 * the list) instead of listening to scroll events, because the browser itself
 * reports when the end of the list is visible: no throttling, and no code
 * running on every scroll.
 *
 * `enabled` is false while a page is loading or when nothing is left. When it
 * turns true again, the observer is recreated and fires right away if the
 * sentinel is still visible, so pages keep loading until the screen is full.
 */
export function useInfiniteScroll<T extends Element>(onReachEnd: () => void, enabled: boolean) {
  const sentinelRef = useRef<T>(null);
  // The callback lives in a ref so the observer always calls the
  // latest one without being recreated on every render.
  const callbackRef = useRef(onReachEnd);

  useEffect(() => {
    callbackRef.current = onReachEnd;
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current();
      },
      // Loading starts 200px before the end so the next page is
      // usually ready by the time the user gets there.
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled]);

  return sentinelRef;
}
