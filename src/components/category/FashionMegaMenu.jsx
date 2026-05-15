import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Sparkles } from "lucide-react";

export default function MegaMenu({ data, activeHeaderCategory }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const handleToggle = (item) => {
    setActiveCategory(item);

    setMobileExpanded(mobileExpanded === item.name ? null : item.name);
  };

  return (
    <div className="absolute left-0 top-full z-50 w-full overflow-y-auto rounded-b-2xl border-t border-gray-100 bg-white/95 shadow-[0_30px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-500 max-h-[85vh] lg:max-h-none hide-scrollbar">
      <div className="w-container mx-auto flex flex-col lg:flex-row">
        {/* LEFT SECTION */}
        <div className="w-full lg:w-[24%] border-b border-gray-100 bg-gray-50/40 p-5 lg:border-b-0 lg:border-r lg:p-8">
          <div className="mb-6 flex items-center gap-2 border-b border-blue-100 pb-3">
            <Sparkles size={16} className="animate-pulse text-blue-500" />

            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-600">
              {activeHeaderCategory?.name || data?.leftSections?.[0]?.title}
            </h3>
          </div>

          <ul className="flex flex-col gap-1.5">
            {data?.leftSections?.[0]?.items?.map((item) => {
              const isActive = activeCategory?.name === item.name;

              return (
                <li
                  key={item.name}
                  className="relative"
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  {/* CATEGORY BUTTON */}
                  <div
                    onMouseEnter={() => setActiveCategory(item)}
                    onClick={() => handleToggle(item)}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 text-[15px] transition-all duration-300 ${isActive
                        ? "translate-x-2 bg-white font-bold text-blue-600 shadow-[0_10px_25px_rgba(59,130,246,0.1)]"
                        : "text-gray-500 hover:translate-x-1 hover:bg-white/80 hover:text-blue-500"
                      }`}
                  >
                    <span>{item.name}</span>

                    {/* DESKTOP ICON */}
                    <ChevronRight
                      size={14}
                      className={`hidden lg:block transition-all duration-300 ${isActive ? "opacity-100" : "-rotate-90 opacity-0"
                        }`}
                    />

                    {/* MOBILE ICON */}
                    <ChevronDown
                      size={16}
                      className={`block lg:hidden transition-transform duration-300 ${mobileExpanded === item.name ? "rotate-180" : ""
                        }`}
                    />
                  </div>

                  {/* MOBILE SUBMENU */}
                  {mobileExpanded === item.name && (
                    <div className="mt-1 rounded-xl bg-white/40 py-3 pl-6 pr-2 lg:hidden">
                      <ul className="grid grid-cols-2 gap-3">
                        {item?.subItems?.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.link}
                              className="text-[13px] text-gray-500 transition-all hover:text-blue-600"
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* DESKTOP SUBMENU */}
                  {isActive && (
                    <div className="absolute left-[105%] top-[-10px] z-[60] hidden w-[300px] rounded-2xl border border-white/50 bg-white/95 p-8 shadow-[30px_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-md animate-in fade-in zoom-in-95 slide-in-from-left-6 duration-300 lg:block">
                      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-blue-400"></div>

                        <h4 className="text-[17px] font-black tracking-tight text-gray-900">
                          {item.name}
                        </h4>
                      </div>

                      <ul className="grid gap-3.5">
                        {item?.subItems?.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.link}
                              className="group/sub flex items-center gap-3 text-[14px] text-gray-500 transition-all duration-300 hover:pl-3 hover:text-blue-600"
                            >
                              <div className="h-1 w-1 rounded-full bg-gray-300 transition-all duration-300 group-hover/sub:w-4 group-hover/sub:bg-blue-400"></div>

                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* CENTER SECTION */}
        <div className="w-full border-b border-gray-100 p-6 lg:w-[22%] lg:border-b-0 lg:border-r lg:p-8">
          <h3 className="mb-6 border-b border-gray-100 pb-3 text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">
            {data?.leftSections?.[1]?.title}
          </h3>

          <ul className="grid grid-cols-2 gap-3 lg:flex lg:flex-col">
            {data?.leftSections?.[1]?.items?.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.link}
                  className="block rounded-xl px-4 py-2.5 text-[14px] text-gray-600 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-inner"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT PROMO SECTION */}
        <div className="w-full p-5 lg:w-[54%] lg:p-7">
          <div className="group relative h-[250px] w-full overflow-hidden rounded-[2rem] shadow-2xl lg:h-full">
            {/* IMAGE */}
            <div className="absolute inset-0">
              <img
                src={data?.promo?.image}
                alt={data?.promo?.title}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/30 to-transparent transition-all duration-500 group-hover:via-black/20"></div>
            </div>

            {/* CONTENT */}
            <div className="relative z-10 flex h-full flex-col items-start justify-center px-10 lg:pl-16 lg:pr-24">
              <h2 className="text-3xl font-black leading-[1.1] tracking-tighter text-white drop-shadow-2xl lg:text-5xl xl:text-6xl">
                {data?.promo?.title}

                <br />

                <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-white bg-clip-text text-transparent">
                  {data?.promo?.highlight}
                </span>
              </h2>

              <Link
                to={data?.promo?.link}
                className="group/btn relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-3 text-[15px] font-black text-gray-900 shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all hover:shadow-white/40 active:scale-95 lg:mt-12 lg:px-12 lg:py-4 lg:text-[17px]"
              >
                <span className="relative z-10">
                  {data?.promo?.buttonText || "Explore Now"}
                </span>

                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100"></div>

                <ChevronRight
                  size={22}
                  className="relative z-10 ml-2 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:text-white"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
