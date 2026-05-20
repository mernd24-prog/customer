import { Link } from "react-router-dom";

export default function SocialIcons({ data, className = "" }) {
  const { href, icon, alt, label } = data;

  return (
    <Link
      to={href}
      aria-label={label || alt}
      className={`flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition ${className}`}
    >
      <img src={icon} alt={alt} className="h-5 w-5 object-contain" />
    </Link>
  );
}
