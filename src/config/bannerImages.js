const modules = import.meta.glob("../assets/banner/*.{jpg,jpeg,png}", { eager: true });
export const bannerImages = Object.values(modules).map((mod) => mod.default);