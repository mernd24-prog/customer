const fs = require('fs');
let content = fs.readFileSync('src/modules/products/controllers/useProductDetailController.js', 'utf8');

// Replace variants logic
const variantsRegex = /const variantOptions = useMemo[\s\S]*?variants\.find\(\n        \(variant\) => String\(variant\.attributes\?\.\[axis\]\) === String\(value\),\n      \)\n    \);\n  \};/m;
content = content.replace(variantsRegex, '');

// Replace pricing logic
const pricingRegex = /const selectedVariantPrice = getVariantPrice\(selectedVariant\);[\s\S]*?mrp > price \? Math\.round\(\(\(mrp - price\) \/ mrp\) \* 100\) : 0;/m;
content = content.replace(pricingRegex, '');

// Replace image logic
const imageRegex = /const fallbackProductImage =[\s\S]*?product\?.video \|\| \"\";/m;
content = content.replace(imageRegex, '');

// Add imports
const imports = `
import { useProductDetailPricing } from "./useProductDetailPricing";
import { useProductDetailImages } from "./useProductDetailImages";
import { useProductDetailVariants } from "./useProductDetailVariants";
`;
content = content.replace(/import \{ useSearchParams \} from \"react-router-dom\";/, imports + 'import { useSearchParams } from "react-router-dom";');

// Add hook calls
const hookCalls = `
  const { variantOptions, selectedAttributes, findVariantForSelection } = useProductDetailVariants({ product, variants, selectedVariant });
  const { selectedVariantPrice, productPrice, activeDealPrice, activeDealOriginalPrice, activeDealBadge, dynamicPrice, baseDisplayPrice, safeDynamicPrice, price, mrp, discount } = useProductDetailPricing({ product, selectedVariant, dynamicState, productId });
  const { fallbackProductImage, variantImages, commonImages, productImages, rawMergedImages, images, productVideo } = useProductDetailImages({ product, selectedVariant });
`;
content = content.replace(/  \/\/ Derived State extracted from Page/, '  // Derived State extracted from Page\n' + hookCalls);

fs.writeFileSync('src/modules/products/controllers/useProductDetailController.js', content);
