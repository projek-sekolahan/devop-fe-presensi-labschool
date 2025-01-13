// import React from "react";
import { ChevronDoubleUpIcon, ChevronDoubleDownIcon } from "@heroicons/react/24/outline";

export default function ToggleButton({ isOpen, onToggle }) {
  return (
    <div className="btn-toggle" onClick={onToggle}>
      {isOpen ? (
        <ChevronDoubleDownIcon className="h-6 w-6 mx-auto text-white" />
      ) : (
        <ChevronDoubleUpIcon className="h-6 w-6 mx-auto text-white" />
      )}
    </div>
  );
}
