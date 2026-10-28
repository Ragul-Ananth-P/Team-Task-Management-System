export default function Toasts({ toasts }) {
  return (
    <div id="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.err ? "err" : ""}`}>{t.msg}</div>
      ))}
    </div>
  );
}
