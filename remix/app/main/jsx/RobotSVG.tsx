import React from "react"

export const RobotSVG = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      fill="#37d0ee"
      d="M21 8.8V19a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h8.2a3 3 0 0 1 2 .9l4 3.8a3 3 0 0 1 .8 2.1Z"
    />
    <path
      fill="#2fb1cb"
      d="M21 8.8V10h-4a3 3 0 0 1-3-3V2h.2a3 3 0 0 1 2 .9l4 3.8a3 3 0 0 1 .8 2.1Z"
    />
    <path
      fill="#fff"
      d="M11.3 17a1 1 0 0 1-.8-.3L9 15.2a1 1 0 0 1 1.5-1.4l.8.8 2.2-2.3a1 1 0 0 1 1.5 1.4l-3 3a1 1 0 0 1-.8.3Z"
    />
  </svg>
)
