import React from "react";

const Card = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-lg rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children }) => {
  return <div className="p-2">{children}</div>;
};

export { Card, CardContent };
