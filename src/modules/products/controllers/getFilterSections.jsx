
import React from 'react';
import {
  CheckboxListFilter,
  OptionFilter,
  PriceRangeFilter,
  RatingFilter,
} from "../components/ProductFilterSidebar";
import { parseMultiValue, serializeMultiValue } from "../../../utils/filterUtils";
import { capitalizeFirst } from "../../../utils/stringUtils";

export function getFilterSections({
  categoryOptions,
  brandOptions,
  collectionOptions,
  productFacets,
  attributeFacets,
  availabilityCounts,
  absolutePriceLimits,
  effectiveRatingCounts,
  searchParams,
  updateParam,
  handlePriceChange,
}) {
  const selectedBrands = parseMultiValue(searchParams.get("brand"));
  const selectedRatings = parseMultiValue(searchParams.get("rating"));

  return [
    categoryOptions.length > 0 && {
      key: "category",
      title: "Category",
      content: (
        <OptionFilter
          name="category"
          options={categoryOptions}
          selected={parseMultiValue(searchParams.get("category"))}
          multiple
          onChange={(values) =>
            updateParam("category", serializeMultiValue(values))
          }
        />
      ),
    },
    brandOptions.length > 0 && {
      key: "brand",
      title: "Brand",
      content: (
        <OptionFilter
          name="brand"
          options={brandOptions}
          selected={selectedBrands}
          multiple
          onChange={(values) =>
            updateParam("brand", serializeMultiValue(values))
          }
        />
      ),
    },
    collectionOptions.length > 0 && {
      key: "collectionIds",
      title: "Collections",
      content: (
        <OptionFilter
          name="collectionIds"
          options={collectionOptions}
          selected={parseMultiValue(searchParams.get("collectionIds"))}
          multiple
          onChange={(values) =>
            updateParam("collectionIds", serializeMultiValue(values))
          }
        />
      ),
    },
    // tagOptions.length > 0 && {
    // key: "tags",
    // title: "Tags",
    // content: (
    // <OptionFilter
    // name="tags"
    // options={tagOptions}
    // selected={parseMultiValue(searchParams.get("tags"))}
    // multiple
    // onChange={(values) =>
    // updateParam("tags", serializeMultiValue(values))
    // }
    // />
    // ),
    // },
    Object.values(productFacets.merchandising || {}).some(
      (count) => Number(count) > 0,
    ) && {
      key: "merchandising",
      title: "Discover",
      content: (
        <CheckboxListFilter
          name="merchandising"
          options={[
            {
              value: "featured",
              label: "Featured",
              count: productFacets.merchandising?.featured,
            },
            {
              value: "bestSeller",
              label: "Best Seller",
              count: productFacets.merchandising?.bestSeller,
            },
            {
              value: "newArrival",
              label: "New Arrival",
              count: productFacets.merchandising?.newArrival,
            },
          ].filter((option) => Number(option.count || 0) > 0)}
          selected={["featured", "bestSeller", "newArrival"].filter(
            (value) => searchParams.get(value) === "true",
          )}
          onChange={(values) => {
            const selectedValues = new Set(values);
            updateParams([
              ["featured", selectedValues.has("featured") ? "true" : undefined],
              [
                "bestSeller",
                selectedValues.has("bestSeller") ? "true" : undefined,
              ],
              [
                "newArrival",
                selectedValues.has("newArrival") ? "true" : undefined,
              ],
            ]);
          }}
        />
      ),
    },
    absolutePriceLimits.min != null &&
      absolutePriceLimits.max != null &&
      absolutePriceLimits.max > 0 &&
      absolutePriceLimits.min < absolutePriceLimits.max && {
        key: "price",
        title: "Price Range",
        content: (
          <PriceRangeFilter
            min={searchParams.get("minPrice")}
            max={searchParams.get("maxPrice")}
            minLimit={absolutePriceLimits.min}
            maxLimit={absolutePriceLimits.max}
            onChange={handlePriceChange}
          />
        ),
      },
    Object.values(effectiveRatingCounts).some((count) => Number(count) > 0) && {
      key: "rating",
      title: "Rating",
      content: (
        <RatingFilter
          selected={selectedRatings}
          multiple
          counts={effectiveRatingCounts}
          onChange={(values) =>
            updateParam("rating", serializeMultiValue(values))
          }
        />
      ),
    },
    ...attributeFacets.map((attribute) => ({
      key: `attr_${attribute.key}`,
      title: attribute.label,
      content: (
        <OptionFilter
          name={`attr_${attribute.key}`}
          options={attribute.values}
          selected={parseMultiValue(searchParams.get(`attr_${attribute.key}`))}
          multiple
          onChange={(values) =>
            updateParam(`attr_${attribute.key}`, serializeMultiValue(values))
          }
        />
      ),
    })),

    availabilityCounts.inStock > 0 || availabilityCounts.outOfStock > 0
      ? {
          key: "inStock",
          title: "Availability",
          content: (
            <CheckboxListFilter
              name="availability"
              options={[
                {
                  value: "inStock",
                  label: "In Stock",
                  count: availabilityCounts.inStock,
                },
                {
                  value: "outOfStock",
                  label: "Out of Stock",
                  count: availabilityCounts.outOfStock,
                },
              ].filter((option) => Number(option.count || 0) > 0)}
              selected={["inStock", "outOfStock"].filter(
                (value) => searchParams.get(value) === "true",
              )}
              onChange={(values) => {
                const selectedValues = new Set(values);
                updateParams([
                  [
                    "inStock",
                    selectedValues.has("inStock") ? "true" : undefined,
                  ],
                  [
                    "outOfStock",
                    selectedValues.has("outOfStock") ? "true" : undefined,
                  ],
                ]);
              }}
            />
          ),
        }
      : false,
  ].filter(Boolean);



}
