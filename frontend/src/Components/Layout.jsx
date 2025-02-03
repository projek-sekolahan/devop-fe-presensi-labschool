import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Layout({ children, link, label }) {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
        document.documentElement.style.setProperty("--header-height", `${headerRef.current.offsetHeight}px`);
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  return (
    <div className="layout">
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-50 bg-orange-500 p-6 shadow-lg text-white"
      >
        {link && (
            <Link to={link}>
              <ArrowLeftIcon className="w-6 h-6 text-white" />
            </Link>
        )}
        {label && <h1 className="section-container">{label}</h1>}
      </header>
      <main style={{ paddingTop: `${headerHeight}px` }} className="w-full min-h-screen px-8">
        {children}
      </main>
    </div>
  );
}