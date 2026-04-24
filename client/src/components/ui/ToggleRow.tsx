type ToggleRowProps = {
  description: string;
  icon: string;
  isActive: boolean;
  label: string;
  onToggle: () => void;
};

function ToggleRow({ description, icon, isActive, label, onToggle }: ToggleRowProps) {
  return (
    <button
      className="relative flex items-center justify-between gap-4 px-[1.2rem] py-4 rounded-3xl border border-outline bg-[#1f1f23]/88 shadow-main transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
      onClick={onToggle}
      type="button"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-[2.6rem] w-[2.6rem] place-items-center rounded-[0.9rem] bg-primary/14 text-primary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col gap-[0.2rem] text-left">
          <strong className="text-text font-bold">{label}</strong>
          <span className="text-[0.85rem] text-text-muted">{description}</span>
        </div>
      </div>
      <span
        className={`relative inline-flex items-center w-12 h-7 rounded-full transition-colors duration-160 p-1 ${
          isActive
            ? 'bg-gradient-to-br from-primary to-primary-strong'
            : 'bg-surface-highest/68'
        }`}
      >
        <span
          className={`w-[1.15rem] h-[1.15rem] rounded-full bg-white transition-transform duration-160 ${
            isActive ? 'translate-x-[1.25rem]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

export default ToggleRow;
