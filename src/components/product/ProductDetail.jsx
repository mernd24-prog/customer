import { useState } from "react";
import { productDetailData } from "../../data/productDetails";
import { CiStar } from "react-icons/ci";
import { FaStar, FaChevronDown } from "react-icons/fa";

const sizes = ["S", "M", "L", "XL", "XXL"];

const sizeChartData = [
  { size: "S", chest: "38", length: "27" },
  { size: "M", chest: "40", length: "28" },
  { size: "L", chest: "42", length: "29" },
  { size: "XL", chest: "44", length: "30" },
  { size: "XXL", chest: "46", length: "31" },
];

const colors = [
  { name: "Coffee", hex: "#7A5C4A" },
  { name: "Navy", hex: "#0F1121" },
  { name: "Beige", hex: "#E8D9CC" },
  { name: "Black", hex: "#1A1919" },
  { name: "Silver", hex: "#EBEBEB" },
];

const productInfo = [
  {
    label: "Fabric",
    value: "100% Premium Cotton",
  },
  {
    label: "Fit",
    value: "Slim Fit",
  },
  {
    label: "Sleeve",
    value: "Full Sleeve",
  },
  {
    label: "Pattern",
    value: "Solid",
  },
  {
    label: "Collar",
    value: "Spread Collar",
  },
  {
    label: "Wash Care",
    value: "Machine Wash Cold",
  },
  {
    label: "Occasion",
    value: "Casual / Semi-Formal",
  },
];

function TransparentButton({ text, bgColor, textColor, border }) {
  return (
    <button
      className={`max-w-xs py-2 ${textColor} ${border} rounded-full ${bgColor} w-full`}
    >
      {text}
    </button>
  );
}

function SizeSelectionOption({ name, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`border w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors ${
        isSelected ? "bg-blue border-blue text-white" : "border-gray text-gray"
      }`}
    >
      <h6 className="font-medium text-md">{name}</h6>
    </button>
  );
}

function ColorSelector({ color, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
        isSelected ? "border-blue p-[2px]" : "border-transparent"
      }`}
    >
      <div
        className="w-full h-full rounded-full shadow-sm"
        style={{ backgroundColor: color.hex }}
        title={color.name}
      />
    </button>
  );
}

function ProductImages({ data }) {
  const { mainImage, sideImages } = data?.images;
  return (
    <div className="flex  flex-row gap-6 w-1/2 justify-end">
      <div className="flex flex-col gap-4">
        {/* Slide Images for Preview Purpose */}
        {sideImages.map((ele, index) => (
          <div key={index}>
            <img
              src={ele.img}
              alt="product"
              className="max-w-[130px] aspect-square"
            />
          </div>
        ))}
      </div>
      <div className="max-w-[650px]">
        {/* Main Image Of the Product */}
        <img
          src={mainImage}
          alt="product"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

function ProductInfo() {
  const [selectedSize, setSelectedSize] = useState("M");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="w-1/2 ">
      {/* Rating of the Product */}
      <div className="flex flex-row gap-1 items-center">
        <FaStar className="text-primary text-xl" />
        <FaStar className="text-primary text-xl" />
        <FaStar className="text-primary text-xl" />
        <FaStar className="text-primary text-xl" />
        <CiStar className="text-primary text-xl" />
      </div>

      {/* Product Name and Details */}
      <div>
        <h3 className="text-3xl font-semibold max-w-xl py-4  font-montserrat">
          Wanderdoll Classic Slim Fit Co-Ord Set for Men in Espresso
        </h3>
        <div className="flex flex-row items-center gap-4">
          {/* Price */}
          <h4 className="font-semibold text-2xl">₹ 959.00</h4>
          <h5 className="font-light text-md line-through text-gray">
            ₹1299.00
          </h5>
          <button className="bg-blue text-white text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">
            Sale 15%
          </button>
        </div>
        {/* Size Option */}
        <div className="mt-4">
          <p className="font-montserrat text-lg font-semibold text-ink">
            Size: <span className="text-blue">{selectedSize}</span>
          </p>
          <div className="flex flex-row items-center gap-6 my-2 relative">
            <div className="flex flex-row gap-2">
              {sizes.map((ele, index) => (
                <SizeSelectionOption
                  key={index}
                  name={ele}
                  isSelected={selectedSize === ele}
                  onSelect={() => setSelectedSize(ele)}
                />
              ))}
            </div>

            {/* Size Chart Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSizeChart(!showSizeChart)}
                className="flex items-center gap-1 text-md font-semibold text-ink/80 transition-all"
              >
                Size Chart{" "}
                <FaChevronDown
                  className={`text-xs transition-transform duration-300 ${showSizeChart ? "rotate-180" : ""}`}
                />
              </button>

              {/* Size Chart Dropdown */}
              {showSizeChart && (
                <div className="absolute top-full left-0 mt-4 bg-white border border-border  rounded-xl p-5 z-20 w-[280px]">
                  <h6 className="font-bold text-ink mb-3">
                    Size Guide (Inches)
                  </h6>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="text-gray border-b border-border">
                        <th className="pb-2">Size</th>
                        <th className="pb-2">Chest</th>
                        <th className="pb-2">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChartData.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/50   last:border-0"
                        >
                          <td className="py-2 font-bold">{item.size}</td>
                          <td className="py-2">{item.chest}"</td>
                          <td className="py-2">{item.length}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Color Selector */}
        <div className="mt-8">
          <p className="font-montserrat text-lg font-semibold text-ink">
            Color: <span className="text-blue">{selectedColor}</span>
          </p>
          <div className="flex flex-row items-center gap-2 mt-2">
            {colors.map((ele, index) => (
              <ColorSelector
                key={index}
                color={ele}
                isSelected={selectedColor === ele.name}
                onSelect={() => setSelectedColor(ele.name)}
              />
            ))}
          </div>
        </div>

        {/* Quantity Increment */}
        <div className="mt-6">
          <div>
            <p className="font-montserrat text-lg font-semibold text-ink py-2">
              Quantity
            </p>
            <button className="max-w-[250px] h-[32px] flex flex-row items-center justify-between rounded-full border border-grayBorder  w-full px-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-xl"
              >
                -
              </button>
              <p className="font-medium text-md text-blue">{quantity}</p>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-xl"
              >
                +
              </button>
            </button>
          </div>
          <div className="flex flex-row gap-2 mt-4">
            <div className="w-4 h-4 rounded-full bg-green my-auto"></div>
            <p className="font-medium font-montserrat text-base">52 in stock</p>
          </div>
        </div>

        {/* Add to Cart and Buy It Now Button */}
        <div className="flex flex-col gap-4 mt-4">
          <TransparentButton
            text="Add To Cart"
            bgColor="bg-primary"
            textColor="text-white"
            border="border border-primary"
          />
          <TransparentButton
            text="Buy It Now"
            bgColor="bg-white"
            textColor="text-blue"
            border="border border-blue"
          />
        </div>

        {/* Details  */}
        <div className="mt-4">
          <h3>Details</h3>
          <div>
            {productInfo.map((ele, index) => {
              return (
                <div key={index} className="flex gap-16 my-1 max-w-xl w-full">
                  <h4 className="font-montserrat font-semibold min-w-md d  text-md text-ink">
                    {ele.label}
                  </h4>
                  <p className="font-montserrat font-medium text-md  text-ink">
                    {ele.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductFaq() {}

export default function ProductDetailPage() {
  return (
    <section className="py-16">
      <div className="flex flex-row gap-8 ">
        <ProductImages data={productDetailData} />
        <ProductInfo />
      </div>
      <ProductFaq />
    </section>
  );
}
