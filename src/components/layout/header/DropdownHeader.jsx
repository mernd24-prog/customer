import { Link } from "react-router-dom";

export default function DropdownHeader({ title, actionText, actionPath }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
      <h3 className="text-[13px] font-bold uppercase tracking-wide text-black">
        {title}
      </h3>

      {actionText ? (
        <Link
          to={actionPath}
          className="text-[12px] font-medium text-blue-600 hover:underline text-black"
        >
          {actionText}
        </Link>
      ) : null}
    </div>
  );
}
