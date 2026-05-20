import { Link } from "react-router-dom";

export default function FooterLink({ href, children, className = "", ariaLabel }) {
  return (
    <Link to={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
