import { Search } from "lucide-react";
import Button from "./Button";

export default function SearchBar({
    value,
    onChange,
    onSearch,
    onKeyDown,
    placeholder = "Search...",
    micIcon,
    className = "",
    showButtonLabel = true,
}) {
    const borderGradient =
        "linear-gradient(90deg, #A26D27 0%, #CE9F2D 100%)";

    return (
        <div className={`group w-full ${className}`}>
            <div
                className="rounded-full p-[2px]"
                style={{ background: borderGradient }}
            >
                <div className="flex h-[44px] w-full items-center overflow-hidden rounded-full bg-white pl-3 pr-1 sm:h-[48px] sm:pl-4 lg:h-[54px] lg:pl-6">

                    <input
                        type="text"
                        value={value}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        className="h-full w-full border-none bg-transparent text-sm text-gray-700 outline-none ring-0 focus:ring-0 lg:text-base"
                    />

                    <div className="ml-1 flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-6">

                        {micIcon && (
                            <img
                                src={micIcon}
                                alt="mic"
                                className="h-4 w-4 cursor-pointer object-contain hover:opacity-80 sm:h-5 sm:w-5 lg:h-7 lg:w-7"
                            />
                        )}

                        <Button
                            variant="gradient"
                            className={`font-medium 2xl:px-6 ${showButtonLabel
                                ? "px-4"
                                : "h-8 w-8 p-0"
                                }`}
                            onClick={onSearch}
                        >
                            <Search size={18} />
                            {showButtonLabel ? "Search" : ""}
                        </Button>

                    </div>
                </div>
            </div>
        </div>
    );
}
