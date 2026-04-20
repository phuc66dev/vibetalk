type FeatureCardProps = {
  icon: string;
  subtitle: string;
  title: string;
};

function FeatureCard({ icon, subtitle, title }: FeatureCardProps) {
  return (
    <article className="relative rounded-3xl border border-outline bg-[#1f1f23]/88 p-[1.4rem] text-left shadow-main">
      <span className="material-symbols-outlined mb-[0.75rem] text-[2rem] text-primary">{icon}</span>
      <h3 className="m-0 mb-[0.45rem] font-jakarta font-extrabold tracking-tight">{title}</h3>
      <p className="m-0 text-text-muted">{subtitle}</p>
    </article>
  );
}

export default FeatureCard;
