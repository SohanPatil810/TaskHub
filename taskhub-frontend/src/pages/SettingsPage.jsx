import { User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences.</p>
      </div>
      <div className="grid gap-4">
        {[
          { icon: User, title: 'Profile', desc: 'Update your personal info and avatar' },
          { icon: Bell, title: 'Notifications', desc: 'Choose what updates you receive' },
          { icon: Shield, title: 'Security', desc: 'Password, two-factor and sessions' },
          { icon: Palette, title: 'Appearance', desc: 'Theme, language and display settings' },
        ].map(item => (
          <div key={item.title} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-sm transition-shadow cursor-pointer group">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-colors">
              <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
