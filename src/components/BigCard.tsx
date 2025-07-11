'use client';

interface BigCardProps {
  title: string;
  subtitle?: string;
  onClick: () => void;
  className?: string;
}

export function BigCard({ title, subtitle, onClick, className = "" }: BigCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden
        w-full aspect-square
        bg-warm-100 dark:bg-warm-100 
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-sm hover:shadow-md
        transition-all duration-200 ease-in-out
        hover:scale-105 hover:border-primary
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        p-6 flex flex-col justify-center items-center text-center
        ${className}
      `}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Arrow icon */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg 
          className="w-5 h-5 text-primary" 
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
