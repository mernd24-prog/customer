export default function CategoryCard({ image, title, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`w-[301.24px] h-[311px] rounded-[20px] border border-card-border p-2 cursor-pointer transition
        hover:bg-card-border border-card-border`}
        >
            <div className="rounded-lg overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-[284px] h-[256px] object-cover"
                />
            </div>
            <p className="text-center mt-3 font-medium text-[18px] leading-[34px] tracking-normal font-montserrat">
                {title}
            </p>
        </div>
    );
}