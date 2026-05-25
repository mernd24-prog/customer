import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import Seo from "../../components/common/Seo";
import { BrandCard } from "../../components/ecommerce";
import ProductFilterSidebar from "../../components/ecommerce/ProductFilterSidebar";
import CUSTOMER_ROUTES from "../../constants/routes";
import { fetchBrands, fetchCategories } from "../../features/catalog/catalogSlice";

function listFromPayload(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.brands)) return data.brands;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
}

function getCategoryLabel(category = {}) {
  return category.title || category.name || category.label || category.categoryKey || category.key || "";
}

function slugifyCategory(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryKey(category = {}) {
  return (
    category.categoryKey ||
    category.key ||
    category.slug ||
    slugifyCategory(getCategoryLabel(category))
  );
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
  return brand.logoUrl || brand.logo || brand.imageUrl || brand.image || brand.thumbnailUrl || "";
}

function OutletLinkList({ items, getHref }) {
  return (
    <nav className="grid max-h-64 gap-2 overflow-y-auto pr-1">
      {items.map((item) => (
        <Link
          key={item.key || item.label || item}
          to={getHref(item)}
          className="block truncate font-montserrat text-sm text-[#2E2E2E] hover:text-[#3665f3] hover:underline"
        >
          {item.label || item}
        </Link>
      ))}
    </nav>
  );
}

export default function BrandOutletPage() {
  const dispatch = useDispatch();
  const [categoryList, setCategoryList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      dispatch(fetchCategories({ limit: 100 })),
      dispatch(fetchBrands({ limit: 100 })),
    ]).then(([categoriesResult, brandsResult]) => {
      if (categoriesResult.status === "fulfilled") {
        setCategoryList(listFromPayload(categoriesResult.value?.payload));
      }
      if (brandsResult.status === "fulfilled") {
        setBrandList(listFromPayload(brandsResult.value?.payload));
      }
      setLoading(false);
    });
  }, [dispatch]);

  const sidebarCategories = useMemo(() => {
    return categoryList
      .map((category) => ({
        label: getCategoryLabel(category),
        key: getCategoryKey(category),
      }))
      .filter((category) => category.label && category.key)
      .slice(0, 18);
  }, [categoryList]);

  const sidebarBrands = useMemo(() => {
    return brandList
      .map((brand) => ({
        label: getBrandName(brand),
        key: getBrandRouteKey(brand),
      }))
      .filter((brand) => brand.label && brand.key)
      .slice(0, 32);
  }, [brandList]);

  const brands = useMemo(
    () =>
      brandList
      .filter((brand) => getBrandName(brand))
      .map((brand) => ({
        ...brand,
        discount: `Shop ${getBrandName(brand)}`,
      })),
    [brandList],
  );

  const sidebarSections = useMemo(
    () => [
      {
        key: "categories",
        title: "Shop by category",
        content: (
          <OutletLinkList
            items={sidebarCategories}
            getHref={(category) =>
              CUSTOMER_ROUTES.category(encodeURIComponent(category.key))
            }
          />
        ),
      },
      {
        key: "brands",
        title: "Shop by brand",
        content: (
          <OutletLinkList
            items={sidebarBrands}
            getHref={(brand) => CUSTOMER_ROUTES.brand(encodeURIComponent(brand.key))}
          />
        ),
      },
    ],
    [sidebarBrands, sidebarCategories],
  );

  return (
    <>
      <Seo
        title="Brand Outlet | Sam Global"
        description="Shop Brand Outlet deals by category and brand at Sam Global."
      />

      <main className="bg-white font-montserrat text-[#191919]">
        <div className="mx-auto grid w-full max-w-[1470px] grid-cols-1 gap-6 px-3 py-5 sm:px-5 sm:py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-8">
          <aside className="hidden lg:block">
            <ProductFilterSidebar sections={sidebarSections} className="sticky top-4" />
          </aside>

          <div className="min-w-0">
            <div className="mb-6 grid gap-4 lg:hidden">
              {sidebarCategories.length > 0 && (
              <div className="min-w-0">
                <h2 className="mb-2 text-sm font-bold sm:text-base">Shop by category</h2>
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {sidebarCategories.map((category) => (
                    <Link
                      key={category.key}
                      to={CUSTOMER_ROUTES.category(encodeURIComponent(category.key))}
                      className="shrink-0 rounded-full border border-[#d8d8d8] px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
              )}
              {sidebarBrands.length > 0 && (
              <div className="min-w-0">
                <h2 className="mb-2 text-sm font-bold sm:text-base">Shop by brand</h2>
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {sidebarBrands.slice(0, 16).map((brand) => (
                    <Link
                      key={brand.key}
                      to={CUSTOMER_ROUTES.brand(encodeURIComponent(brand.key))}
                      className="shrink-0 rounded-full border border-[#d8d8d8] px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {brand.label}
                    </Link>
                  ))}
                </div>
              </div>
              )}
            </div>

            <section className="pb-7">
              <h1 className="mb-4 text-[20px] font-bold leading-tight text-[#191919] sm:mb-6 sm:text-[26px] lg:mb-7 lg:text-[28px]">
                Shop brands available now
              </h1>
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[160px] animate-pulse rounded-[12px] bg-[#f4f4f4] sm:h-[180px] lg:h-[190px]"
                    />
                  ))}
                </div>
              ) : brands.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4 xl:grid-cols-5">
                  {brands.map((brand) => {
                    const name = getBrandName(brand);
                    return (
                      <BrandCard
                        key={getBrandRouteKey(brand)}
                        name={name}
                        image={getBrandLogo(brand)}
                        subtitle={brand.discount || `Shop ${name}`}
                        href={CUSTOMER_ROUTES.brand(encodeURIComponent(getBrandRouteKey(brand)))}
                        className="p-3 sm:p-4 [&_div:first-child]:h-16 [&_div:first-child]:w-16 [&_div:first-child]:rounded-[14px] [&_div:first-child]:bg-[#f4f4f4] sm:[&_div:first-child]:h-20 sm:[&_div:first-child]:w-20 lg:[&_div:first-child]:h-24 lg:[&_div:first-child]:w-24 xl:[&_div:first-child]:h-28 xl:[&_div:first-child]:w-28"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[12px] border border-[#e7dfd1] bg-[#FAF6EE] p-6 text-center">
                  <p className="font-montserrat text-sm font-semibold text-[#2E2E2E]">
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
