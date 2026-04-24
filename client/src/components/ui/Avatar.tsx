function Avatar({ alias, size }: { alias: string; size: 'large' | 'medium' }) {
  const initials = alias
    .split(/[^a-z0-9]/i)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong font-jakarta font-extrabold text-[#2c0051] shadow-soft ${
        size === 'large' ? 'h-[8.5rem] w-[8.5rem] text-[2.2rem]' : 'h-16 w-16 text-[1.2rem]'
      }`}
    >
      {initials || 'AN'}
    </div>
  );
}

export default Avatar;
