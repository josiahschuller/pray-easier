'use client';

interface BigCardProps {
  title: string;
  subtitle?: string;
  onClick: () => void;
  className?: string;
  width?: string;
  height?: string;
  variant?: 'primary' | 'secondary';
}

export function BigCard({ title, subtitle, onClick, className = "", width = "w-full", height = "aspect-square", variant = "secondary" }: BigCardProps) {
  // Define styling based on variant
  const getVariantStyles = () => {
    if (variant === 'primary') {
      return {
        base: 'bg-primary dark:bg-primary border-primary dark:border-primary text-white',
        hoverBorder: 'hover:border-primary-dark',
        hoverGradient: 'from-white/10 to-transparent',
        titleColor: 'text-white group-hover:text-white/90',
        subtitleColor: 'text-white/80 group-hover:text-white/70',
        arrowColor: 'text-white'
      };
    } else {
      return {
        base: 'bg-warm-100 dark:bg-warm-100 border-gray-200 dark:border-gray-700',
        hoverBorder: 'hover:border-primary',
        hoverGradient: 'from-primary/5 to-transparent',
        titleColor: 'text-gray-900 dark:text-gray-100 group-hover:text-primary',
        subtitleColor: 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300',
        arrowColor: 'text-primary'
      };
    }
  };

  const styles = getVariantStyles();
  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden
        ${width} ${height}
        ${styles.base}
        border rounded-xl shadow-sm hover:shadow-md
        transition-all duration-200 ease-in-out
        hover:scale-105 ${styles.hoverBorder}
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        p-6 flex flex-col justify-center items-center text-center
        ${className}
      `}
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
      
      {/* Content */}
      <div className="relative z-10 w-full flex justify-between items-center">
        <h3 className={`text-2xl font-bold transition-colors ${styles.titleColor}`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-sm transition-colors ${styles.subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Arrow icon */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg 
          className={`w-5 h-5 ${styles.arrowColor}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </div>
    </button>
  );
}
