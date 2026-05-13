import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/catalog", label: "Catalog Masters" },
  { to: "/admin/brands", label: "Brands" },
  { to: "/admin/rbac", label: "RBAC" },
];

export default function AdminShell({ title, children }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}
