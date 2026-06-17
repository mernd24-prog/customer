import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import Seo from "../../components/common/Seo";
import { BrandCard } from "../../components/ecommerce";
import ProductFilterSidebar from "../../components/ecommerce/ProductFilterSidebar";
import CUSTOMER_ROUTES from "../../constants/routes";
import { fetchBrands } from "../../features/catalog/catalogSlice";
import { getImageUrlFromValue } from "../../utils/ecommerce";

function listFromPayload(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.brands)) return data.brands;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getBrandName(brand = {}) {
  return typeof brand === "string"
    ? brand
    : brand.name || brand.brandName || brand.title || brand.code || "";
}

function slugifyBrand(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBrandRouteKey(brand = {}) {
  if (typeof brand === "string") return slugifyBrand(brand);
  return brand.slug || brand.code || slugifyBrand(getBrandName(brand));
}

function getBrandLogo(brand = {}) {
  if (typeof brand === "string") return "";
  return (
    getImageUrlFromValue(brand.thumbnails) ||
    getImageUrlFromValue(brand.thumbnail) ||
    getImageUrlFromValue(brand.logoUrl) ||
    getImageUrlFromValue(brand.logo) ||
    getImageUrlFromValue(brand.imageUrl) ||
    getImageUrlFromValue(brand.image)
  );
}

function OutletBrandList({ brands }) {
  return (
    <nav className="grid max-h-72 gap-2 overflow-y-auto pr-1 [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
      {brands.map((brand) => (
        <Link
          key={brand.key}
          to={CUSTOMER_ROUTES.brand(brand.key)}
          className="block truncate text-sm font-medium text-[var(--customer-ink)] transition-colors duration-200 hover:text-[var(--customer-gold-dark)]"
        >
          {brand.label}
        </Link>
      ))}
    </nav>
  );
}

export default function BrandOutletPage() {
  const dispatch = useDispatch();
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    dispatch(fetchBrands({ params: { limit: 100 } }))
      .then((result) => {
        setBrandList(listFromPayload(result?.payload));
      })
      .catch((err) => {
        setError(String(err?.message || err || "Failed to load brands"));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  const brands = useMemo(
    () =>
      brandList
        .map((brand) => ({
          ...brand,
          displayName: getBrandName(brand),
          routeKey: getBrandRouteKey(brand),
          displayLogo: getBrandLogo(brand),
        }))
        .filter((brand) => brand.displayName && brand.routeKey),
    [brandList],
  );

  const sidebarBrands = useMemo(
    () =>
      brands.map((brand) => ({
        label: brand.displayName,
        key: brand.routeKey,
      })),
    [brands],
  );

  const sidebarSections = useMemo(
    () => [
      {
        key: "brands",
        title: "Shop by brand",
        content: <OutletBrandList brands={sidebarBrands} />,
      },
    ],
    [sidebarBrands],
  );

  return (
    <>
      <Seo
        title="Brand Outlet | Sam Global"
        description="Shop Brand Outlet brands at Sam Global."
      />

      <main className="bg-white text-[var(--customer-ink)]">
        <div className="customer-container grid w-full grid-cols-1 gap-6 py-5 sm:py-6 lg:grid-cols-[288px_minmax(0,1fr)] lg:items-start lg:gap-10">
          <ProductFilterSidebar
            sections={sidebarSections}
            className="hidden lg:block lg:w-full"
          />

          <div className="min-w-0 w-full">
            <div className="mb-6 grid gap-3 lg:hidden">
              <h2 className="text-sm font-bold sm:text-base">Shop by brand</h2>

              <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
                {sidebarBrands.slice(0, 24).map((brand) => (
                  <Link
                    key={brand.key}
                    to={CUSTOMER_ROUTES.brand(brand.key)}
                    className="shrink-0 rounded-full border border-[var(--customer-border)] px-3 py-1.5 text-xs font-semibold text-[var(--customer-ink)] transition-colors duration-200 hover:border-[var(--customer-gold)] hover:bg-[var(--customer-gold-soft)] sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {brand.label}
                  </Link>
                ))}
              </div>
            </div>

            <section className="pb-7">
              <h1 className="mb-4 text-[20px] font-bold leading-tight text-[var(--customer-ink)] sm:mb-6 sm:text-[26px] lg:mb-7 lg:text-[28px]">
                Shop brands available now
              </h1>

              {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[190px] animate-pulse rounded-[14px] bg-[var(--customer-surface-soft)] sm:h-[215px] lg:h-[235px]"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-[12px] border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              ) : brands.length ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                  {brands.map((brand) => (
                    <BrandCard
                      key={brand.routeKey}
                      name={brand.displayName}
                      image={brand.displayLogo}
                      subtitle=""
                      href={CUSTOMER_ROUTES.brand(brand.routeKey)}
                      className="min-h-0 items-center border-0 bg-transparent p-0 text-center shadow-none hover:translate-y-0 hover:border-transparent hover:shadow-none [&>div:first-child]:h-[150px] [&>div:first-child]:w-full [&>div:first-child]:rounded-[14px] [&>div:first-child]:border-0 [&>div:first-child]:bg-[var(--customer-surface-soft)] [&>div:first-child]:p-7 [&>div:first-child_img]:max-h-[90px] [&>div:first-child_img]:max-w-[120px] [&>div:nth-child(2)]:mt-3 [&>div:nth-child(2)]:flex-none [&>div:nth-child(2)_p]:hidden sm:[&>div:first-child]:h-[170px] sm:[&>div:first-child_img]:max-h-[110px] sm:[&>div:first-child_img]:max-w-[140px] lg:[&>div:first-child]:h-[190px] lg:[&>div:first-child_img]:max-h-[125px] lg:[&>div:first-child_img]:max-w-[155px]"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[12px] border border-[var(--customer-border)] bg-[var(--customer-cream)] p-6 text-center">
                  <p className="text-sm font-semibold text-[var(--customer-ink)]">
                    No brands available right now.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
