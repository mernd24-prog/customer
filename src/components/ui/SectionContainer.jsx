export default function SectionContainer({
    title,
    subtitle,
    bgColor,
    children,
}) {
    return (
        <div >
            <header className={`w-[auto] h-[111px] opacity-20 rounded-t-[20px] ${bgColor}`}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    </div>
                    <button className="text-sm font-medium">
                        View More →
                    </button>
                </div>
            </header>
            <body>
                {children}
            </body>

        </div>
    );
}