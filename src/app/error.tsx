"use client";

/**
 * I added an error boundary with a retry button so an unexpected
 * rendering error shows a clear message instead of a blank page.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <div className="alert alert-error">Algo deu errado: {error.message}</div>
      <button className="btn" onClick={reset}>Tentar novamente</button>
    </div>
  );
}
