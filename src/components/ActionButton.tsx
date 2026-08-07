'use client';

/**
 * ActionButton - A reusable button component for dashboard actions
 * 
 * This component creates a clickable action button with an icon, title, description,
 * and customizable styling. It includes hover effects, gradients, and responsive design.
 */
interface ActionButtonProps {
  /** The main title text displayed prominently */
  title: string;
  /** The subtitle/description text displayed below the title */
  description: string;
  /** Function to call when the button is clicked */
  onClick: () => void;
  /** React node containing the SVG icon to display */
  icon: React.ReactNode;
  
  // Color and styling props - all use Tailwind CSS classes
  /** Tailwind class for the left border color (e.g., "border-blue-500") */
  borderColor: string;
  /** Tailwind class for the icon container background (e.g., "bg-blue-100 dark:bg-blue-900/40") */
  iconBgColor: string;
  /** Tailwind class for the icon container background on hover (e.g., "group-hover:bg-blue-200") */
  iconHoverBgColor: string;
  /** Tailwind class for the title text color on hover (e.g., "group-hover:text-blue-600") */
  textHoverColor: string;
  /** Tailwind class for the initial gradient background (e.g., "from-blue-50 dark:from-blue-900/20") */
  gradientFrom: string;
  /** Tailwind class for the gradient background on hover (e.g., "hover:from-blue-100") */
  gradientHoverFrom: string;
  /** Tailwind class for the arrow icon color on hover (e.g., "group-hover:text-blue-600") */
  arrowHoverColor: string;
}

/**
 * ActionButton Component
 * 
 * Renders a styled button with icon, title, description, and hover effects.
 * Used primarily on the dashboard for navigation actions.
 */
export function ActionButton({
  title,
  description,
  onClick,
  icon,
  borderColor,
  iconBgColor,
  iconHoverBgColor,
  textHoverColor,
  gradientFrom,
  gradientHoverFrom,
  arrowHoverColor
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`action-button group w-full text-left p-6 border-l-4 ${borderColor} bg-linear-to-r ${gradientFrom} to-transparent ${gradientHoverFrom} transition-all duration-200 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        {/* Left side: Icon and text content */}
        <div className="flex items-center space-x-4">
          {/* Circular icon container */}
          <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center ${iconHoverBgColor} transition-colors`}>
            {icon}
          </div>
          {/* Title and description */}
          <div>
            <h2 className={`text-xl font-semibold text-gray-900 dark:text-white ${textHoverColor} transition-colors`}>{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        {/* Right side: Arrow indicator that slides on hover */}
        <svg className={`w-5 h-5 text-gray-400 ${arrowHoverColor} group-hover:translate-x-1 transition-all`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
