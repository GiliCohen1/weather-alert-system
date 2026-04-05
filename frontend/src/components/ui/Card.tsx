import React from "react";

/* ===== Compound Card Component ===== */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ children, className = "", hover = false }) => {
  return (
    <div className={`${hover ? "card-hover" : "card"} ${className}`}>
      {children}
    </div>
  );
};

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardSectionProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`pb-4 border-b border-gray-100 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

const CardBody: React.FC<CardSectionProps> = ({ children, className = "" }) => (
  <div className={`py-4 ${className}`}>{children}</div>
);

const CardFooter: React.FC<CardSectionProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`pt-4 border-t border-gray-100 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
