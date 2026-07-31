'use client';

interface ActionButtonProps {
  title: string;
  description: string;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: 'orange' | 'slate' | 'emerald';
}

const variantStyles = {
  orange: {
    border: 'border-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconHoverBg: 'group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60',
    iconColor: 'text-orange-600 dark:text-orange-400',
    gradientFrom: 'from-orange-50 dark:from-orange-950/50',
    gradientHoverFrom: 'hover:from-orange-100 dark:hover:from-orange-950',
    textHover: 'group-hover:text-orange-700 dark:group-hover:text-orange-400',
    arrowHover: 'group-hover:text-orange-500 dark:group-hover:text-orange-400',
  },
  slate: {
    border: 'border-slate-400',
    iconBg: 'bg-slate-100 dark:bg-slate-800/40',
    iconHoverBg: 'group-hover:bg-slate-200 dark:group-hover:bg-slate-800/60',
    iconColor: 'text-slate-600 dark:text-slate-400',
    gradientFrom: 'from-slate-50 dark:from-slate-950/50',
    gradientHoverFrom: 'hover:from-slate-100 dark:hover:from-slate-950',
    textHover: 'group-hover:text-slate-700 dark:group-hover:text-slate-400',
    arrowHover: 'group-hover:text-slate-500 dark:group-hover:text-slate-400',
  },
  emerald: {
    border: 'border-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconHoverBg: 'group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    gradientFrom: 'from-emerald-50 dark:from-emerald-950/50',
    gradientHoverFrom: 'hover:from-emerald-100 dark:hover:from-emerald-950',
    textHover: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400',
    arrowHover: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
  },
};

export function ActionButton({
  title,
  description,
  onClick,
  icon,
  variant = 'orange',
}: ActionButtonProps) {
  const s = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left p-5 border-l-4 ${s.border} bg-gradient-to-r ${s.gradientFrom} to-transparent ${s.gradientHoverFrom} transition-all duration-200 hover:shadow-md rounded-r-lg dark:bg-black`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-11 h-11 ${s.iconBg} rounded-full flex items-center justify-center ${s.iconHoverBg} transition-colors`}>
            <span className={s.iconColor}>{icon}</span>
          </div>
          <div>
            <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${s.textHover} transition-colors`}>
              {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-300 ${s.arrowHover} group-hover:translate-x-1 transition-all shrink-0`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}