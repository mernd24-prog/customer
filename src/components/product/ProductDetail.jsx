import { useState, useEffect } from "react";
import { productDetailData } from "../../data/productDetails";
import { CiStar } from "react-icons/ci";
import { FaStar, FaChevronDown } from "react-icons/fa";
import FAQAccordion from "../faq/FAQAccordion";
import { productDetailFAQ } from "../../data/productDetailFAQ";
import { MdZoomOutMap } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";

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
      type="button"
      className={`max-w-xs py-2 ${textColor} ${border} rounded-full ${bgColor} w-full`}
    >
      {text}
    </button>
  );
}

function SizeSelectionOption({ name, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`Select size ${name}`}
      className={`border w-10 h-10 flex items-center   justify-center rounded-md cursor-pointer transition-colors ${
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
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`Select ${color.name}`}
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

function ProductGallery({
  sideImages,
  activeImage,
  setActiveImage,
  isModal = false,
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleClick = () => {
    setIsZoomed((prev) => !prev);
  };

  return (
    <div
      className={`flex flex-col ${isModal ? "lg:flex-row" : "md:flex-row"} gap-4 w-full ${isModal ? "h-[90vh] lg:h-[85vh] items-center justify-center max-w-[1400px] mx-auto px-4 lg:px-10" : "xl:justify-end justify-start items-start"}`}
    >
      <div
        className={`flex order-2 ${isModal ? "lg:order-1 lg:flex-col lg:max-h-[70vh]  lg:w-24 xl:w-32" : "md:order-1 md:flex-col"} flex-row gap-4 shrink-0 overflow-auto ${isModal ? "max-h-[20vh] w-full pr-2" : "w-full md:w-auto"}`}
      >
        {/* Thumbnail Images */}
        {sideImages.map((ele, index) => (
          <div
            key={index}
            onMouseEnter={() => {
              setActiveImage(ele.img);
              setIsZoomed(false);
            }}
            className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-200 shrink-0 ${
              activeImage === ele.img
                ? "border-blue"
                : "border-transparent hover:border-gray"
            }`}
          >
            <img
              src={ele.img}
              alt={`product-thumbnail-${index}`}
              className={`${isModal ? "w-[100px] h-[100px] mx-auto lg:mx-0" : "w-full h-28 md:w-[100px] md:h-[120px] xl:w-[120px] xl:h-[120px]"} object-contain hover:scale-105 transition-transform duration-200`}
            />
          </div>
        ))}
      </div>

      {/* Main Center Image */}
      <div
        className={`order-1 ${isModal ? "lg:order-2 flex-1 w-auto" : "md:order-2 w-full xl:max-w-[650px]"} relative ${isModal ? "h-full max-h-[85vh]" : ""}`}
      >
        <div
          className={`w-full h-full ${isModal ? "aspect-[1/5]" : "aspect-[5/5]"} overflow-hidden relative touch-none ${
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={handleClick}
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          onMouseLeave={() => setIsZoomed(false)}
        >
          {/* Normal Image */}
          <img
            src={activeImage}
            alt="product"
            className={`h-full w-full object-contain transition-transform duration-300 rounded-lg ${
              isZoomed ? "scale-[2.5]" : "scale-100"
            }`}
            style={{
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ProductImages({ data }) {
  const { mainImage, sideImages = [] } = data?.images || {};
  const [activeImage, setActiveImage] = useState(mainImage);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full 2xl:w-1/2 xl:justify-end justify-start items-start relative">
      <ProductGallery
        sideImages={sideImages}
        activeImage={activeImage}
        setActiveImage={setActiveImage}
      />

      {/* Zoom and wishlist Option */}
      <div className="absolute top-4 right-4 flex flex-row gap-2 z-10">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Open image gallery"
          className="w-8 h-8 bg-white rounded-full hidden lg:flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <MdZoomOutMap className="text-black text-xl" />
        </button>
        <button
          type="button"
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          aria-label="Add product to wishlist"
        >
          <CiHeart className="text-black text-xl" />
        </button>
      </div>

      {/* eBay Style Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            aria-label="Close image gallery"
            className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <IoMdClose className="text-2xl" />
          </button>

          <ProductGallery
            sideImages={sideImages}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            isModal={true}
          />
        </div>
      )}
    </div>
  );
}

function ProductInfo() {
  const [selectedSize, setSelectedSize] = useState("M");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="xl:w-1/2 w-full">
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
        <h3 className="text-xl md:text-3xl font-semibold max-w-xl py-4 font-montserrat">
          Wanderdoll Classic Slim Fit Co-Ord Set for Men in Espresso
        </h3>
        <div className="flex flex-row items-center gap-4">
          {/* Price */}
          <h4 className="font-semibold text-2xl">₹ 959.00</h4>
          <h5 className="font-light text-md line-through text-gray">
            ₹1299.00
          </h5>
          <span className="inline-flex bg-blue text-white text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">
            Sale 15%
          </span>
        </div>
        {/* Size Option */}
        <div className="mt-4">
          <p className="font-montserrat text-lg font-semibold text-ink">
            Size: <span className="text-blue">{selectedSize}</span>
          </p>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 my-2 relative">
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
                type="button"
                onClick={() => setShowSizeChart(!showSizeChart)}
                aria-expanded={showSizeChart}
                className="flex items-center gap-1 text-md font-semibold text-ink/80 transition-all"
              >
                Size Chart{" "}
                <FaChevronDown
                  className={`text-xs transition-transform duration-300 ${showSizeChart ? "rotate-180" : ""}`}
                />
              </button>

              {/* Size Chart Dropdown */}
              {showSizeChart && (
                <div className="absolute top-full left-0 mt-4 bg-white border border-border rounded-xl p-5 z-20 w-[280px]">
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
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="py-2 font-bold">{item.size}</td>
                          <td className="py-2">{item.chest}&quot;</td>
                          <td className="py-2">{item.length}&quot;</td>
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
            <div className="max-w-[250px] h-[32px] flex flex-row items-center justify-between rounded-full border border-grayBorder w-full px-4">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-xl"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <p className="font-medium text-md text-blue">{quantity}</p>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="text-xl"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
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

        {/* Details */}
        <div className="mt-4">
          <p className="py-2  font-montserrat text-lg font-semibold text-ink">
            Details
          </p>

          <div className="space-y-3">
            {productInfo.map((ele, index) => {
              return (
                <div key={index} className="flex items-start">
                  <h4 className="w-40 font-montserrat text-md font-semibold text-ink">
                    {ele.label}
                  </h4>

                  <p className="font-montserrat text-md font-medium text-ink">
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

export default function ProductDetailPage() {
  return (
    <section className="py-16">
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <ProductImages data={productDetailData} />
        <ProductInfo />
      </div>
      <div className="my-14">
        <FAQAccordion faqs={productDetailFAQ} variant="productDetailPageFAQ" />
      </div>
    </section>
  );
}
