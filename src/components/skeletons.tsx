/**
 * I chose skeletons shaped like the real content (instead of a spinner
 * or "Carregando...") because they show what is coming, keep the layout from
 * jumping when the data arrives, and make the wait feel shorter.
 * I also marked them with `aria-busy` plus hidden text so screen readers
 * announce the loading while the placeholders themselves stay silent.
 */

/**
 * I decided to build the card skeleton from the real card's tags and classes
 * (h2, p, small, .btn) with invisible text, instead of bars with fixed heights,
 * because its size then comes from the same fonts, margins and paddings, and it
 * follows any style change automatically.
 * Tradeoff: it matches cards whose text fits on one line. Cards with longer
 * text are taller, since the content is unknown while it loads.
 */
export function TaskCardSkeletons({ count = 3 }: { count?: number }) {
  return (
    // I kept the screen-reader text outside the <ul> because a <ul>
    // may only contain <li>, and React reports invalid nesting as a hydration error.
    <div aria-busy="true">
      <span className="sr-only">Carregando tarefas...</span>
      <ul className="task-list">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="task" aria-hidden="true">
            <div className="task-content">
              <h2 className="skeleton skeleton-text" style={{ width: "55%" }}>&nbsp;</h2>
              <p className="skeleton skeleton-text" style={{ width: "80%" }}>&nbsp;</p>
              <small className="skeleton skeleton-text" style={{ width: "30%" }}>&nbsp;</small>
            </div>
            <div className="task-actions">
              <span className="btn skeleton skeleton-text">Editar</span>
              <span className="btn skeleton skeleton-text">Excluir</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TaskFormSkeleton() {
  return (
    <div className="form" aria-busy="true">
      <span className="sr-only">Carregando tarefa...</span>
      <div className="field" aria-hidden="true">
        <div className="skeleton skeleton-label" />
        <div className="skeleton skeleton-input" />
      </div>
      <div className="field" aria-hidden="true">
        <div className="skeleton skeleton-label" />
        <div className="skeleton skeleton-textarea" />
      </div>
      <div className="form-actions" aria-hidden="true">
        <div className="skeleton skeleton-button" />
        <div className="skeleton skeleton-button skeleton-button-wide" />
      </div>
    </div>
  );
}
