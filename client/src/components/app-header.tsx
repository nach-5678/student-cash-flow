import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/notification-center";

interface AppHeaderProps {
  user?: {
    username: string;
  };
}

export default function AppHeader({ user }: AppHeaderProps) {
  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : "JS";

  return (
    <header className="bg-app-surface shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-app-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-wallet text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-semibold text-app-secondary">PocketTrack</h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <div className="w-8 h-8 bg-app-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{userInitials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}