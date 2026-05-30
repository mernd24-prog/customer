import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import Seo from "../../components/common/Seo";
import { BrandCard } from "../../components/ecommerce";
import ProductFilterSidebar from "../../components/ecommerce/ProductFilterSidebar";
import CUSTOMER_ROUTES from "../../constants/routes";
import {
  fetchBrands,
  fetchCategories,
} from "../../features/catalog/catalogSlice";

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
  return (
    category.title ||
    category.name ||
    category.label ||
    category.categoryKey ||
    category.key ||
    ""
  );
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
  return (
    brand.logoUrl ||
    brand.logo ||
    brand.imageUrl ||
    brand.image ||
    brand.thumbnailUrl ||
    ""
  );
}


function OutletLinkList({ items, getHref }) {
  return (
    <nav className="grid max-h-64 gap-2 overflow-y-auto pr-1">
      {items.map((item) => (
        <Link
          key={item.key || item.label || item}
          to={getHref(item)}
          className="block truncate font-montserrat text-sm text-[#2E2E2E] "
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
            getHref={(brand) =>
              CUSTOMER_ROUTES.brand(encodeURIComponent(brand.key))
            }
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
        <div className="mx-auto grid w-full max-w-[1470px] grid-cols-1 gap-6 px-3 py-5 sm:px-5 sm:py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8">
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:w-60 lg:shrink-0 lg:self-start">
            <div>
              <ProductFilterSidebar sections={sidebarSections} />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 grid gap-4 lg:hidden">
              {sidebarCategories.length > 0 && (
                <div className="min-w-0">
                  <h2 className="mb-2 text-sm font-bold sm:text-base">
                    Shop by category
                  </h2>
                  <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                    {sidebarCategories.map((category) => (
                      <Link
                        key={category.key}
                        to={CUSTOMER_ROUTES.category(
                          encodeURIComponent(category.key),
                        )}
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
                  <h2 className="mb-2 text-sm font-bold sm:text-base">
                    Shop by brand
                  </h2>
                  <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                    {sidebarBrands.slice(0, 16).map((brand) => (
                      <Link
                        key={brand.key}
                        to={CUSTOMER_ROUTES.brand(
                          encodeURIComponent(brand.key),
                        )}
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[190px] animate-pulse rounded-[14px] bg-[#f4f4f4] sm:h-[215px] lg:h-[235px]"
                    />
                  ))}
                </div>
              ) : brands.length ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                  {brands.map((brand) => {
                    const name = getBrandName(brand);
                    return (
                      <BrandCard
                        key={getBrandRouteKey(brand)}
                        name={name}
                        image={getBrandLogo(brand)}
                        subtitle=""
                        href={CUSTOMER_ROUTES.brand(
                          encodeURIComponent(getBrandRouteKey(brand)),
                        )}
                        className="min-h-0 items-center border-0 bg-transparent p-0 text-center shadow-none hover:translate-y-0 hover:border-transparent hover:shadow-none [&>div:first-child]:h-[165px] [&>div:first-child]:w-[165px] [&>div:first-child]:rounded-[14px] [&>div:first-child]:border-0 [&>div:first-child]:bg-[#f4f4f4] [&>div:first-child]:p-8 [&>div:first-child_img]:max-h-[105px] [&>div:first-child_img]:max-w-[130px] [&>div:nth-child(2)]:mt-3 [&>div:nth-child(2)]:flex-none [&>div:nth-child(2)_p]:hidden sm:[&>div:first-child]:h-[185px] sm:[&>div:first-child]:w-[185px] sm:[&>div:first-child_img]:max-h-[120px] sm:[&>div:first-child_img]:max-w-[145px] lg:[&>div:first-child]:h-[200px] lg:[&>div:first-child]:w-[200px] lg:[&>div:first-child_img]:max-h-[130px] lg:[&>div:first-child_img]:max-w-[160px]"
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
