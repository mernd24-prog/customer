# Customer Deals & Products API Documentation

## Overview
This document outlines all the APIs available for the customer application to fetch and display deals and products.

## Base Configuration
- **Base URL**: `http://45.195.90.183:4000` (can be configured via `VITE_API_BASE_URL`)
- **API Prefix**: `/api/v1`
- **Full Endpoint Format**: `{BASE_URL}{API_PREFIX}{endpoint}`

---

## Public APIs (No Authentication Required)

### 1. Get Public Deals/Placements
Fetch active promotional deals and placements available to customers.

**Endpoint:**
```
GET /api/v1/deals/public/placements
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `placement_type` | string | No | Type of placement: 'banner', 'featured', 'sponsored', etc. |
| `category_id` | string | No | Filter deals by category ID |
| `limit` | number | No | Results per page (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |

**Example Request:**
```javascript
import { getPublicDeals } from "@/api/deals";

const deals = await getPublicDeals({
  placement_type: "featured",
  limit: 10,
  offset: 0
});
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deal_001",
      "title": "Summer Sale",
      "description": "Get up to 50% off",
      "discount_type": "percentage",
      "discount_value": 50,
      "placement_type": "featured",
      "products": [
        {
          "id": "prod_001",
          "name": "Product Name",
          "price": 999,
          "image": "image_url",
          "seller_id": "seller_001"
        }
      ],
      "start_date": "2024-06-01T00:00:00Z",
      "end_date": "2024-06-30T23:59:59Z",
      "status": "active"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

---

### 2. List Products
Fetch all public products available in the marketplace.

**Endpoint:**
```
GET /api/v1/products
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Results per page (default: 20, max: 100) |
| `offset` | number | No | Pagination offset (default: 0) |
| `sort` | string | No | Sort order: 'newest', 'price_asc', 'price_desc', 'rating', 'popular' |
| `category_id` | string | No | Filter by category ID |
| `search` | string | No | Search keyword in product name/description |
| `min_price` | number | No | Minimum price filter |
| `max_price` | number | No | Maximum price filter |
| `seller_id` | string | No | Filter by seller |

**Example Request:**
```javascript
import { getProducts } from "@/api/deals";

const products = await getProducts({
  limit: 20,
  offset: 0,
  sort: "newest",
  category_id: "cat_001",
  min_price: 100,
  max_price: 5000
});
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "Product Name",
      "description": "Product description",
      "category_id": "cat_001",
      "seller_id": "seller_001",
      "seller_name": "Seller Name",
      "pricing": {
        "cost_price": 1000,
        "selling_price": 899,
        "currency": "INR"
      },
      "images": [
        {
          "id": "img_001",
          "url": "image_url",
          "alt": "Product image"
        }
      ],
      "rating": {
        "average": 4.5,
        "count": 250
      },
      "in_stock": true,
      "stock_count": 50
    }
  ],
  "total": 1500,
  "limit": 20,
  "offset": 0
}
```

---

### 3. Get Product Detail
Fetch detailed information about a specific product.

**Endpoint:**
```
GET /api/v1/products/{productId}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | string | Yes | Product ID |

**Example Request:**
```javascript
import { getProductDetail } from "@/api/deals";

const productDetail = await getProductDetail("prod_001");
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "name": "Product Name",
    "description": "Detailed product description",
    "category_id": "cat_001",
    "seller_id": "seller_001",
    "pricing": {
      "cost_price": 1000,
      "selling_price": 899,
      "discount_percentage": 10,
      "currency": "INR"
    },
    "images": [...],
    "specifications": {
      "color": "Red",
      "size": "M",
      "material": "Cotton"
    },
    "rating": {
      "average": 4.5,
      "count": 250
    },
    "reviews_count": 50,
    "in_stock": true,
    "stock_count": 50,
    "return_eligible": true,
    "warranty": {
      "type": "1 Year",
      "description": "Manufacturer warranty"
    }
  }
}
```

---

### 4. Search Products
Search for products using keywords.

**Endpoint:**
```
GET /api/v1/search?q={searchQuery}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `limit` | number | No | Results per page (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |
| `category_id` | string | No | Filter by category |

**Example Request:**
```javascript
import { searchProducts } from "@/api/deals";

const results = await searchProducts("laptop", {
  limit: 20,
  offset: 0
});
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "Laptop Pro",
      "pricing": {
        "selling_price": 45999
      },
      "rating": {
        "average": 4.8,
        "count": 500
      },
      "images": [{"url": "image_url"}]
    }
  ],
  "total": 1200,
  "limit": 20,
  "offset": 0
}
```

---

### 5. Get Product Reviews
Fetch customer reviews for a specific product.

**Endpoint:**
```
GET /api/v1/products/{productId}/reviews
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Results per page (default: 10) |
| `offset` | number | No | Pagination offset (default: 0) |
| `sort` | string | No | Sort by: 'recent', 'helpful', 'rating_high', 'rating_low' |

**Example Request:**
```javascript
import { getProductReviews } from "@/api/deals";

const reviews = await getProductReviews("prod_001", {
  limit: 10,
  offset: 0,
  sort: "recent"
});
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "review_001",
      "product_id": "prod_001",
      "customer_name": "John Doe",
      "rating": 5,
      "title": "Excellent product",
      "comment": "Great quality and fast delivery",
      "helpful_count": 25,
      "created_at": "2024-06-15T10:30:00Z",
      "verified_purchase": true
    }
  ],
  "total": 250,
  "limit": 10,
  "offset": 0
}
```

---

### 6. Get Related Products
Fetch products related to a specific product.

**Endpoint:**
```
GET /api/v1/products/{productId}/related
```

**Example Request:**
```javascript
import { getRelatedProducts } from "@/api/deals";

const relatedProducts = await getRelatedProducts("prod_001");
```

---

## Usage in React Components

### Using the Service Module
Create or update API calls using the provided `deals.js` service:

```javascript
// Import the service functions
import {
  getPublicDeals,
  getProducts,
  searchProducts,
  getProductDetail,
  getProductReviews,
  getRelatedProducts
} from "@/api/deals";

// In your component
export const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({
          limit: 20,
          sort: "newest"
        });
        setProducts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>₹{product.pricing.selling_price}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## Error Handling

All API calls may throw errors. Handle them appropriately:

```javascript
try {
  const deals = await getPublicDeals();
} catch (error) {
  if (error.response?.status === 404) {
    console.log("No deals found");
  } else if (error.response?.status === 500) {
    console.log("Server error");
  } else {
    console.log("Network error:", error.message);
  }
}
```

---

## Endpoint Configuration

Endpoints are defined in `src/api/endpoints.js`:

```javascript
export const endpoints = {
  deals: {
    publicPlacements: `${API_PREFIX}/deals/public/placements`,
  },
  products: {
    list: `${API_PREFIX}/products`,
    detail: (productId) => `${API_PREFIX}/products/${productId}`,
    reviews: (productId) => `${API_PREFIX}/products/${productId}/reviews`,
    related: (productId) => `${API_PREFIX}/products/${productId}/related`,
  },
  search: {
    main: `${SEARCH_PREFIX}`,
  },
};
```

---

## Performance Tips

1. **Use pagination**: Always specify `limit` and `offset` to avoid fetching too much data
2. **Cache results**: Use React query or SWR for automatic caching
3. **Debounce search**: Add debouncing to search input to reduce API calls
4. **Image optimization**: Use lazy loading for product images
5. **Sort strategically**: Use `sort` parameter to reduce data processing on frontend

---

## Example: Complete Product Listing Component

See [DealsAndProductsShowcase.jsx](./components/DealsAndProductsShowcase.jsx) for a complete working example.
