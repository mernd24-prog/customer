function normalizeImageUrl(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";
  
  let finalUrl = value;
  if (/^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value)) {
    finalUrl = value;
  } else {
    finalUrl = `http://localhost:4000/${value.replace(/^\/+/, "")}`;
  }

  // Optimize Cloudinary URLs automatically
  if (finalUrl.includes("res.cloudinary.com") && finalUrl.includes("/image/upload/")) {
    let transforms = [];
    if (!finalUrl.includes("f_auto") && !finalUrl.includes("q_auto")) {
      transforms.push("f_auto,q_auto");
    }
    
    if (!finalUrl.includes("w_") && !finalUrl.includes("h_") && !finalUrl.includes("c_")) {
      if (finalUrl.includes("/thumbnails/")) {
        transforms.push("w_256,c_limit");
      } else if (finalUrl.includes("/product/")) {
        transforms.push("w_1000,c_limit");
      }
    }

    if (transforms.length > 0) {
      finalUrl = finalUrl.replace("/image/upload/", `/image/upload/${transforms.join(',')}/`);
    }
  }

  return finalUrl;
}

const urls = [
  "https://res.cloudinary.com/drp9ddo4b/image/upload/v1786615590/ecommerce/upload/product/image-1-0f9a0c5f-9f31-4129-a63e-88a7c4157d99.webp",
  "https://res.cloudinary.com/drp9ddo4b/image/upload/v1786626033/ecommerce/upload/thumbnails/image-47ce455b-245a-4662-9aed-6cf40bc1f551.png",
  "https://res.cloudinary.com/drp9ddo4b/image/upload/f_auto/v1786615590/ecommerce/upload/product/image-1.webp",
  "https://res.cloudinary.com/drp9ddo4b/image/upload/c_scale,w_500/v1/product/img.jpg",
  "/image/png/rakhii.png",
];

for (const url of urls) {
  console.log(normalizeImageUrl(url));
}
