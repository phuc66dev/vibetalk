type ActivityRowProps = {
  icon: string;
  subtitle: string;
  title: string;
};

function ActivityRow({ icon, subtitle, title }: ActivityRowProps) {
  return (
    <article className="relative rounded-3xl border border-outline bg-[#1f1f23]/88 p-4 shadow-main lg:px-[1.2rem]">
      <div className="flex items-center gap-3">
        <div className="grid h-[2.6rem] w-[2.6rem] place-items-center rounded-[0.9rem] bg-primary/14 text-primary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col gap-[0.2rem] text-left">
          <strong className="text-text">{title}</strong>
          <span className="text-[0.85rem] text-text-muted">{subtitle}</span>
        </div>
      </div>
    </article>
  );
}

export default ActivityRow;
