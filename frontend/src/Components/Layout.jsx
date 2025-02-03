import { useState, useEffect } from "react";

export default function Layout({ children }) {
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const updateHeaderHeight = () => {
      setTimeout(() => {
        const header = document.querySelector("header");
        if (header) {
          const height = header.offsetHeight;
          setHeaderHeight(height);
          document.documentElement.style.setProperty("--header-height", `${height}px`);
        }
      }, 100); // Tunggu sebentar agar header benar-benar ada di DOM
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  return (
    <div className="layout">
      <main style={{ paddingTop: `${headerHeight}px` }}>
        {children}
      </main>
    </div>
  );
}