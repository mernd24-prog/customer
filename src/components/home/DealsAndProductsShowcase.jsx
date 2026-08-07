import React, { useState, useEffect } from "react";
import { getPublicDeals, getProducts, searchProducts } from "@/api/deals";
import { getProductImage, getProductMrp, getProductPrice, getProductTitle } from "@/utils/ecommerce";

/**
 * Example component showing how to fetch and display deals and products
 */
export const DealsAndProductsShowcase = () => {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch public deals on component mount
  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await getPublicDeals({
        limit: 10,
        offset: 0,
        placement_type: "featured",
      });
      setDeals(response.data || []);
      setError(null);
    } catch (err) {
      // console.error("Error fetching deals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        limit: 20,
        offset: 0,
        sort: "newest",
      });
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      // console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await searchProducts(searchTerm, {
        limit: 20,
        offset: 0,
      });
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      // console.error("Error searching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Deals & Products</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Deals Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Current Deals</h2>
        {loading ? (
          <div>Loading Deals...</div>
        ) : deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-lg mb-2">{deal.title}</h3>
                <p className="text-gray-600 mb-2">{deal.description}</p>
                <div className="text-lg font-bold text-green-600 mb-4">
                  {deal.discount_type === "percentage"
                    ? `${deal.discount_value}% OFF`
                    : `₹${deal.discount_value} OFF`}
                </div>
                <p className="text-sm text-gray-500">
                  Valid Till {new Date(deal.end_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No Deals Available</p>
        )}
      </section>

      {/* Products Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Products..."
            className="w-full px-4 py-2 border rounded-lg"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div>Loading Products...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {getProductImage(product) && (
                  <img
                    src={getProductImage(product)}
                    alt={getProductTitle(product)}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold truncate">{getProductTitle(product)}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold">
                      ₹{getProductPrice(product) || 0}
                    </span>
                    {getProductMrp(product) && (
                      <span className="text-gray-500 line-through">
                        ₹{getProductMrp(product)}
                      </span>
                    )}
                  </div>
                  {product.rating && (
                    <p className="text-yellow-500 text-sm">
                      ★ {product.rating.average} ({product.rating.count} Reviews)
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No Products Found</p>
        )}
      </section>
    </div>
  );
};

export default DealsAndProductsShowcase;
