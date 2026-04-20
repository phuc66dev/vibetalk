type FieldProps = {
  icon: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
};

function Field({ icon, label, onChange, type = 'text', value }: FieldProps) {
  return (
    <label className="flex flex-col gap-[0.55rem]">
      <span className="text-[0.72rem] font-bold tracking-[0.16em] uppercase text-text-muted">{label}</span>
      <div className="relative">
        <span className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted/70 material-symbols-outlined">{icon}</span>
        <input
          className="w-full min-h-[3.5rem] rounded-2xl border border-transparent bg-surface-lowest py-[0.9rem] pr-4 pl-12 text-text outline-none transition-all duration-200 focus:border-primary/36 focus:shadow-[0_0_0_3px_rgba(221,184,255,0.12)]"
          onChange={(event) => onChange(event.target.value)}
          type={type}
          value={value}
        />
      </div>
    </label>
  );
}

export default Field;
