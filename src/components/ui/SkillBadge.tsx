interface SkillBadgeProps {
  label: string;
}

export default function SkillBadge({ label }: SkillBadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--surface-secondary)] text-[#6e6e73] dark:text-[#a1a1a6] transition-colors">
      {label}
    </span>
  );
}
