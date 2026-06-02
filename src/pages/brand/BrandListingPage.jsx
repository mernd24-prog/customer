import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Seo from "../../components/common/Seo";
import { Breadcrumbs, BrandCard } from "../../components/ecommerce";
import CUSTOMER_ROUTES from "../../constants/routes";
import { fetchBrands } from "../../features/catalog/catalogSlice";
import { getImageUrlFromValue } from "../../utils/ecommerce";

function getBrandName(brand = {}) {
  return brand.name || brand.brandName || brand.title || brand.code || "";
}

function slugifyBrand(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBrandRouteKey(brand = {}) {
  return brand.slug || brand.code || slugifyBrand(getBrandName(brand));
}

function getBrandImage(brand = {}) {
  return (
    getImageUrlFromValue(brand.thumbnails) ||
    getImageUrlFromValue(brand.thumbnail) ||
    getImageUrlFromValue(brand.logoUrl) ||
    getImageUrlFromValue(brand.logo) ||
    getImageUrlFromValue(brand.imageUrl) ||
    getImageUrlFromValue(brand.image)
  );
}

function getBrandCount(brand = {}) {
  return (
    brand.productCount ??
    brand.productsCount ??
    brand.totalProducts ??
    brand.count
  );
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
        <div
          key={index}
          className="h-[188px] animate-pulse rounded-lg bg-gray-200"
        />
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

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Brands" }];

  return (
    <>
      <Seo
        title="Brands | Sam Global"
        description="Browse all brands available on Sam Global."
      />

      <div className="border-b border-border bg-cream px-4 py-6 sm:px-6">
        <div className="w-container">
          <Breadcrumbs items={breadcrumbItems} className="mb-2 text-gray" />
          <h1 className=" text-[26px] font-bold text-ink sm:text-[32px]">
            Brands
          </h1>
          <p className="mt-1 max-w-2xl  text-sm text-muted">
            Explore products by brand.
          </p>
        </div>
      </div>

      <section className="w-container py-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between">
          <p className=" text-sm font-semibold text-ink">
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
                href={CUSTOMER_ROUTES.brand(
                  encodeURIComponent(getBrandRouteKey(brand)),
                )}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[12px] border border-border bg-white px-6 py-12 text-center">
            <h2 className=" text-xl font-bold text-ink">
              No brands found
            </h2>
            <p className="mt-2  text-sm text-muted">
              Please check back later.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
