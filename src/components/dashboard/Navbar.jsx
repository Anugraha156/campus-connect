import { GraduationCap, Moon, Sun, LogOut } from "lucide-react";

export default function Navbar({ tabs, activeTab, setActiveTab, darkMode, setDarkMode, onLogout }) {
  const bg = darkMode ? "bg-neutral-900" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`${bg} border-b ${border} sticky top-0 z-30`}>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} className="text-blue-500" />
          <span className={`font-bold text-lg ${textPrimary}`}>CampusConnect</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-9 h-9 rounded-full flex items-center justify-center border ${border}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} className="text-slate-300" /> : <Moon size={16} className="text-slate-600" />}
          </button>
          <button
            onClick={onLogout}
            className={`flex items-center gap-1.5 text-sm ${textSecondary} px-3 py-2 rounded-lg hover:bg-black/5`}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-1 px-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
          isActive
          ? "text-blue-500"
          : `${textSecondary} hover:text-blue-400`
      }`}
      >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
