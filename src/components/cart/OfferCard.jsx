export default function OfferCard({
    title,
    subtitle,
    linkText,
}) {
    return (
        <div className="mt-5 rounded-xl bg-[#f7f7f7] p-4">
            <h4 className="text-sm font-bold text-[#111]">
                {title}
            </h4>

            <p className="mt-1 text-sm text-gray-600">
                {subtitle}
            </p>

            <button className="mt-3 text-sm font-semibold underline">
                {linkText}
            </button>
        </div>
    );
}