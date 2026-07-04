import { useState, useEffect } from "react";

export default function CampusBanner({ studentName, darkMode, images = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  const bg = darkMode ? "bg-neutral-800" : "bg-neutral-100";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className="flex flex-col sm:flex-row h-48 sm:h-56 overflow-hidden">
      <div className={`flex-1 ${bg} flex flex-col justify-center px-8`}>
        <div className="-translate-y-2">
          <p className={`text-xs uppercase tracking-widest ${textSecondary} mb-2`}>
            Welcome back
          </p>
          <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
            {studentName || "Student"}
          </h1>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {images.map((img, i) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              opacity: i === index ? 1 : 0,
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? "linear-gradient(90deg, rgba(38,38,38,1) 0%, rgba(38,38,38,0) 30%)"
              : "linear-gradient(90deg, rgba(245,245,245,1) 0%, rgba(245,245,245,0) 30%)",
          }}
        />
      </div>
    </div>
  );
}