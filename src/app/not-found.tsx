import Link from "next/link";

export default function NotFound() {
  return (
    <div className="muted">
      <p>Tarefa não encontrada.</p>
      <Link href="/" className="btn">Voltar para a lista</Link>
    </div>
  );
}
