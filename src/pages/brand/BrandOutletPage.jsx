import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import Seo from "../../components/common/Seo";
import { BrandCard } from "../../components/ecommerce";
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

  const brandGridClass =
    "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5";
  const stateContainerClass = "rounded-[12px] p-6 text-center";

  return (
    <>
      <Seo
        title="Brand Outlet | Sam Global"
        description="Shop Brand Outlet brands at Sam Global."
      />

      <main className="bg-white text-[var(--customer-ink)]">
        <div className=" w-full  ">
          <div className="mt-6 lg:mt-10">
            <section className="pb-7">
              <h1 className="mb-4 text-[20px] font-bold leading-tight text-[var(--customer-ink)] sm:mb-6 sm:text-[26px] lg:mb-7 lg:text-[28px]">
                Shop brands available now
              </h1>

              {loading ? (
                <div className={brandGridClass}>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[190px] animate-pulse rounded-[14px] bg-[var(--customer-surface-soft)] sm:h-[215px] lg:h-[235px]"
                    />
                  ))}
                </div>
              ) : error ? (
                <div
                  className={`${stateContainerClass} border border-red-200 bg-red-50`}
                >
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              ) : brands.length ? (
                <div className={brandGridClass}>
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
                <div
                  className={`${stateContainerClass} border border-[var(--customer-border)] bg-[var(--customer-cream)]`}
                >
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
