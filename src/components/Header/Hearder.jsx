import React from "react";
import { Link } from "react-router-dom";
import ImageSkeleton from "../ui/Image";

const categories = [
  { name: "For You", img: "/assets/icon/ForYou.png" },
  { name: "Fashion", img: "/assets/icon/Fashion.png" },
  { name: "Mobiles", img: "/assets/icon/Mobiles.png" },
  { name: "Beauty", img: "/assets/icon/Beauty.png" },
  { name: "Electronics", img: "/assets/icon/Electronics.png" },
  { name: "Home", img: "/assets/icon/Home.png" },
  { name: "Appliances", img: "/assets/icon/Appliances.png" },
  { name: "Toys", img: "/assets/icon/ToysBaby.png" },
  { name: "Food", img: "/assets/icon/FoodHealth.png" },
  { name: "Auto", img: "/assets/icon/food.png" },
  { name: "Wheelers", img: "/assets/icon/food.png" },
  { name: "Sports", img: "/assets/icon/SportsFitness.png" },
  { name: "Furniture", img: "/assets/icon/Furniture.png" },
];

const Header = () => {
  return (
    <header className="topbar-second">
      <div className="flex gap-8 px-3 py-2 justify-center">
        {categories?.map((item, index) => (
          <Link
            key={index}
            to=""
            className="flex flex-col items-center min-w-[70px] flex-shrink-0"
          >
            <div className="mx-auto flex items-center justify-center">
              <ImageSkeleton src={item?.img} alt={item?.name} />
            </div>

            {/* Label */}
            <span className="text-[15px] mt-1 text-center leading-tight">
              {item?.name}
            </span>
          </Link>
        ))}
      </div>
    </header>
  );
};

export default Header;
