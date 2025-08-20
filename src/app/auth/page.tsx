import { AuthForm } from '@/components/AuthForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { APP_NAME, CATCH_PHRASE } from '@/utils/constants';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Theme toggle positioned in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-center text-base text-gray-600 dark:text-gray-300">
            <i>{CATCH_PHRASE}</i>
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
} 