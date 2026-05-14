export default function CategoryCard({ image, title, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`h-full w-full rounded-[20px] border border-card-border p-4 bg-white transition hover:bg-card-border ${active ? "ring-2 ring-primary/50" : ""} cursor-pointer`}
        >
            <div className="rounded-lg overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="aspect-[284/256] w-full object-cover"
                />
            </div>
            <p className="mt-3 line-clamp-1 text-center font-montserrat text-[15px] font-medium leading-6 tracking-normal sm:text-[16px] lg:text-[18px]">
                {title}
            </p>
        </div>
    );
}
