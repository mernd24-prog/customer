import { Link } from "react-router-dom";

export default function SocialIcons({ data, className = "" }) {
  const { href, icon, alt, label } = data;

  return (
    <Link
      to={href}
      aria-label={label || alt}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white bg-[#494949] transition-colors duration-300 ease-in-out hover:border-white hover:bg-white/40 ${className}`}
    >
      <img src={icon} alt={alt} className="h-5 w-5 object-contain" />
    </Link>
  );
}
