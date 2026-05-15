import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Sparkles } from "lucide-react";
import { fashionMenuData as fashionData } from "../../data/megaMenu";
import { megaMenu as megaMenuImages } from "../../constant/image.constant";

export default function FashionMegaMenu() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const toggleCategory = (item) => {
    setActiveCategory(item);
    setMobileExpanded(mobileExpanded === item.name ? null : item.name);
  };

  return (
    <div className="absolute left-0 top-full z-50 w-full border-t border-gray-100 bg-white/95 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-top-4 duration-500 overflow-y-auto max-h-[85vh] lg:max-h-none rounded-b-2xl hide-scrollbar">
      <div className="w-container mx-auto flex flex-col lg:flex-row min-h-0 lg:min-h-[480px] relative">
        <div className="flex flex-col lg:flex-row w-full">
          <div className="w-full lg:w-[24%] p-5 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/40">
            <div className="flex items-center gap-2 mb-6 border-b border-blue-100 pb-3">
              <Sparkles size={16} className="text-blue-500 animate-pulse" />
              <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em]">
                {fashionData.leftSections[0].title}
              </h3>
            </div>

            <ul className="flex flex-col gap-1.5">
              {fashionData.leftSections[0].items.map((item) => (
                <li 
                  key={item.name} 
                  className="relative"
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div
                    onMouseEnter={() => setActiveCategory(item)}
                    onClick={() => toggleCategory(item)}
                    className={`group text-[15px] py-3.5 px-4 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 ${
                      activeCategory?.name === item.name
                        ? "bg-white text-blue-600 shadow-[0_10px_25px_rgba(59,130,246,0.1)] translate-x-2 font-bold"
                        : "text-gray-500 hover:bg-white/80 hover:text-blue-500 hover:translate-x-1"
                    }`}
                  >
                    <span className="flex-1">{item.name}</span>
                    <ChevronRight
                      size={14}
                      className={`transition-all duration-300 ${activeCategory?.name === item.name ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                    />
                  </div>

                  {/* MOBILE: Sub-items Accordion */}
                  {mobileExpanded === item.name && (
                    <div className="lg:hidden pl-6 pr-2 py-3 bg-white/40 rounded-xl mt-1 animate-in zoom-in-95 duration-200">
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {item.subItems?.map((sub) => (
                          <li key={sub}>
                            <Link
                              to={`/categories/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                              className="text-[13px] text-gray-500 hover:text-blue-600 active:scale-95 transition-all"
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeCategory?.name === item.name && (
                    <div className="hidden lg:block absolute left-[105%] top-[-10px] w-[300px] bg-white/95 backdrop-blur-md shadow-[30px_30px_80px_rgba(0,0,0,0.12)] border border-white/50 rounded-2xl p-8 z-[60] animate-in fade-in zoom-in-95 slide-in-from-left-6 duration-300">
                      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                        <h4 className="text-[17px] font-black text-gray-900 tracking-tight">
                          {item.name}
                        </h4>
                      </div>
                      <ul className="grid grid-cols-1 gap-3.5">
                        {item.subItems?.map((sub) => (
                          <li key={sub}>
                            <Link
                              to={`/categories/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                              className="text-[14px] text-gray-500 hover:text-blue-600 hover:pl-3 transition-all duration-300 flex items-center gap-3 group/sub"
                            >
                              <div className="w-1 h-1 rounded-full bg-gray-300 group-hover/sub:w-4 group-hover/sub:bg-blue-400 transition-all duration-300"></div>
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full lg:w-[22%] p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-3">
              {fashionData.leftSections[1].title}
            </h3>
            <ul className="grid grid-cols-2 lg:flex lg:flex-col gap-3">
              {fashionData.leftSections[1].items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={`/categories/${item.slug}`}
                    className="text-[14px] py-2.5 px-4 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-inner transition-all duration-300 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full lg:w-[54%] p-5 lg:p-7">
            <div className="relative h-[250px] lg:h-full w-full overflow-hidden rounded-[2rem] group shadow-2xl">
              <div className="absolute inset-0">
                <img
                  src={megaMenuImages.fashionPromo}
                  alt="Fashion"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/30 to-transparent group-hover:via-black/20 transition-all duration-500"></div>
              </div>

              <div className="relative z-10 flex h-full flex-col items-start justify-center pl-10 lg:pl-16 pr-10 lg:pr-24">
                <h2 className="text-3xl lg:text-5xl xl:text-6xl font-black text-white drop-shadow-2xl tracking-tighter leading-[1.1]">
                  Redefine Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-white">
                    Elegance.
                  </span>
                </h2>
                <Link
                  to={fashionData.promo.link}
                  className="mt-8 lg:mt-12 group/btn relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 lg:px-12 py-3 lg:py-4 text-[15px] lg:text-[17px] font-black text-gray-900 shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all hover:shadow-white/40 active:scale-95"
                >
                  <span className="relative z-10">Explore Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  <ChevronRight
                    size={22}
                    className="ml-2 relative z-10 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all duration-300"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
