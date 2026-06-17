export const ratingBreakdown = [
  {
    label: "Excellent",
    count: 2648,
    color: "bg-[var(--customer-success)]",
    width: "72%",
  },
  {
    label: "Very Good",
    count: 395,
    color: "bg-[var(--customer-success)]",
    width: "11%",
  },
  {
    label: "Good",
    count: 342,
    color: "bg-[var(--customer-warning)]",
    width: "9%",
  },
  { label: "Average", count: 290, color: "bg-[#f0793d]", width: "8%" },
  {
    label: "Poor",
    count: 574,
    color: "bg-[var(--customer-danger)]",
    width: "16%",
  },
];

export const reviewImages = [
  "/image/jpg/productImg1.jpg",
  "/image/jpg/productImg2.jpg",
  "/image/jpg/productImg3.jpg",
  "/image/jpg/productImg4.jpg",
  "/image/png/luxury-watches.png",
  "/image/png/gold-watch-with-rhinestones 1.png",
];

export const reviews = [
  {
    name: "Pooja",
    rating: "5.0",
    date: "5 Mar 2026",
    text: "I'm truly happy with my purchase – the wireless mouse is absolutely wonderful! It looks sleek and stylish, feels great in hand, and works so smoothly without any lag. It's extremely easy to use and quick and hassle-free connectivity.",
    helpful: 136,
    images: reviewImages.slice(0, 4),
  },
  {
    name: "Meesho User",
    rating: "4.0",
    date: "6 June 2026",
    text: "I'm truly happy with my purchase – the wireless mouse is absolutely wonderful! It looks sleek and stylish",
    helpful: 0,
    images: reviewImages.slice(1, 4),
  },
  {
    name: "Vinay Shah",
    rating: "3.0",
    date: "7 June 2026",
    text: "It looks classy and feels comfortable, but delivery packaging could be better.",
    helpful: 4,
    images: reviewImages.slice(4, 5),
  },
  {
    name: "Rajni Kashyap",
    rating: "2.0",
    date: "10 June 2026",
    text: "Average product. Finish is nice, but size was not as expected.",
    helpful: 2,
    images: reviewImages.slice(5, 6),
  },
  {
    name: "Amit Kumar",
    rating: "1.0",
    date: "12 June 2026",
    text: "Not satisfied with the product quality.",
    helpful: 1,
    images: [],
  },
];
