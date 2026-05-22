import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Seo from "../../components/common/Seo";
import { Breadcrumbs, BrandCard } from "../../components/ecommerce";
import { fetchBrands } from "../../features/catalog/catalogSlice";

function getBrandName(brand = {}) {
  return brand.name || brand.brandName || brand.title || brand.code || "";
}

function getBrandImage(brand = {}) {
  return brand.logoUrl || brand.logo || brand.imageUrl || brand.image || brand.thumbnailUrl || "";
}

function getBrandCount(brand = {}) {
  return brand.productCount ?? brand.productsCount ?? brand.totalProducts ?? brand.count;
}

function getBrandsFromPayload(payload) {
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.current?.items)) return payload.current.items;
  if (Array.isArray(payload?.current?.list)) return payload.current.list;
  if (Array.isArray(payload?.current?.brands)) return payload.current.brands;
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.brands)) return data.brands;
  return [];
}

function BrandGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="h-[170px] animate-pulse rounded-[12px] bg-gray-200" />
      ))}
    </div>
  );
}

export default function BrandListingPage() {
  const dispatch = useDispatch();
  const catalogState = useSelector((state) => state.catalog);

  useEffect(() => {
    dispatch(
      fetchBrands({
        params: { limit: 100 },
        cacheKey: `brands-list-${Date.now()}`,
      }),
    ).catch(() => {});
  }, [dispatch]);

  const brands = useMemo(
    () =>
      getBrandsFromPayload(catalogState)
        .map((brand) => ({
          ...brand,
          displayName: getBrandName(brand),
          displayImage: getBrandImage(brand),
          productCount: getBrandCount(brand),
        }))
        .filter((brand) => brand.displayName),
    [catalogState],
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brands" },
  ];

  return (
    <>
      <Seo
        title="Brands | Sam Global"
        description="Browse all brands available on Sam Global."
      />

      <div className="border-b border-[#e7dfd1] bg-[#FAF6EE] px-4 py-6 sm:px-6">
        <div className="w-container">
          <Breadcrumbs items={breadcrumbItems} className="mb-2 text-[#A6A6A6]" />
          <h1 className="font-montserrat text-[26px] font-bold text-[#2E2E2E] sm:text-[32px]">
            Brands
          </h1>
          <p className="mt-1 max-w-2xl font-montserrat text-sm text-[#787878]">
            Explore products by brand.
          </p>
        </div>
      </div>

      <section className="w-container py-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="font-montserrat text-sm font-semibold text-[#2E2E2E]">
            {brands.length.toLocaleString()} brands
          </p>
        </div>

        {catalogState.loading && !brands.length ? (
          <BrandGridSkeleton />
        ) : brands.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {brands.map((brand) => (
              <BrandCard
                key={brand._id || brand.id || brand.displayName}
                name={brand.displayName}
                image={brand.displayImage}
                subtitle={brand.description}
                productCount={brand.productCount}
                href={`/brands/${encodeURIComponent(brand.displayName)}`}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[12px] border border-[#e7dfd1] bg-white px-6 py-12 text-center">
            <h2 className="font-montserrat text-xl font-bold text-[#2E2E2E]">
              No brands found
            </h2>
            <p className="mt-2 font-montserrat text-sm text-[#787878]">
              Please check back later.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
