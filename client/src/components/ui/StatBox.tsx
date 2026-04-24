type StatBoxProps = {
  label: string;
  value: string;
};

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="rounded-2xl bg-surface-low/90 p-4">
      <strong className="mb-[0.4rem] block font-jakarta text-[1.25rem] font-extrabold">{value}</strong>
      <span className="text-[0.72rem] uppercase tracking-[0.16em] text-text-muted">{label}</span>
    </div>
  );
}

export default StatBox;
