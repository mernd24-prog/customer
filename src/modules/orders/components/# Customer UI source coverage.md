# Customer UI source coverage

Generated from the local source on 2026-11-11. All JSX files are listed. Signals are candidates, not confirmed defects: native controls inside primitives, hidden inputs and specialized controls can be intentional. Line numbers refer to this snapshot. Import lists are syntactic and include commented imports. See the main audit for reviewed findings and preservation requirements.

## Suggestions for all source signals

Every non-color signal below has an action and its preservation requirements. Paths in suggestion text are relative to `customer/src/`. Suggestions are static review guidance, not verified drop-in substitutions. A native element inside a reusable primitive is often the correct implementation.

| Signal | Meaning | Starting point |
|---|---|---|
| `raw_button` | Native `<button>` markup | Shared Button/IconButton, with specialized interaction preserved |
| `raw_input` | Native `<input>` markup, including hidden/file inputs | Shared text/checkbox/radio field where appropriate; retain native hidden/file controls |
| `raw_select` | Native `<select>` markup | Canonical native select field |
| `raw_textarea` | Native multiline input | Add or extend a shared textarea field |
| `raw_img` | Native `<img>` markup | Shared ordinary image/fallback behavior; retain specialized media |
| `literal_hex` | Fixed hexadecimal color | Per-color suggestions in each file section |
| `inline_currency` | Rupee symbol, Intl formatter or locale-number formatting | Shared money/amount/count formatter according to actual value |
| `inline_date` | Inline locale date/time calls | Shared formatter with explicit timezone/display options |
| `overlay_or_scroll_lock` | Fixed backdrop, portal or body-scroll modification | Shared overlay lifecycle; distinguish loading blockers and dropdown portals |
| `brand_literal` | Literal `Sam Global` text | Site configuration for identity, CMS/content for editorial text |
| `local_product_grid_page` | Locally defined catalog page shell | Export one shared shell, keeping data sources separate |

For files with no scanned signals, no substitution is inferred. The dependency list documents current composition; absence of these patterns does not prove the file has no other reuse opportunities. Broader findings and the journey checklist remain in [the audit report](README.md).

## How to read color findings

`literal_hex: 24;48` means lines 24 and 48 contain fixed hexadecimal colors, such as `text-[#201B78]`. These are review candidates, not automatic errors.

Each affected file below includes its actual colors, source lines and a suggestion:

- **Existing token:** an exact match in the current CSS palette. Use the variable in the same property, keeping responsive/hover modifiers and opacity. Example: `hover:bg-[#D6A323]/20` → `hover:bg-[var(--customer-gold)]/20`; `border-[#E4DDCF]` → `border-[var(--customer-border)]`.
- **Palette decision:** a legacy brand shade differs from the shared token. Adopting the token changes the appearance and needs visual review.
- **Review custom color:** no exact token exists. Keep intentional illustration/campaign colors; if a recurring UI role needs this shade, define a semantic token first. Do not replace it with the nearest color automatically.

For inline styles, use `color: "var(--customer-navy)"`; gradients/SVG attributes can also use `var(--customer-...)` when theming is appropriate. A matching white token does not mean every image/illustration highlight should become theme-dependent. Preserve alpha in 4/8-digit hex colors and Tailwind `/opacity` suffixes.

Token suggestions use `customer/src/styles.css`, including its later `--customer-muted`/`--customer-subtle` overrides. Tailwind semantic classes also exist, but CSS variables are used here to show the shared source explicitly. Color suggestions reflect the current source; the original signal line numbers remain the audit snapshot.

## `customer/src/App.jsx`

Shared/module dependencies: `./utils/ecommerce/cart`, `./utils/pages/categoryUtils`, `./components/ui/ScrollToTop`, `./modules/support/components/AiSupportChatWidget`, `./modules/support/components/RaiseTicketModal`, `./modules/support/components/TicketSuccessModal`, `./components/ui/ServiceUnavailableDialog`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/faq/FAQAccordion.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 24.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 24 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/components/faq/FAQContentSection.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/faq/FAQHeroSection.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/faq/FAQSidebar.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 17.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 17 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/components/home/CategoryCard.jsx`

Shared/module dependencies: `../../utils/ecommerce`, `../../utils/common`.

Source signals (line numbers): raw_button: 70 | raw_img: 28.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 70 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 28 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

## `customer/src/components/home/FeaturedCollectionsSection.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 31.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 31 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

## `customer/src/components/home/FeaturedProductsSection.jsx`

Shared/module dependencies: `../../modules/products/components/ProductCard`, `../../modules/products/controllers/actions`, `../../utils/ecommerce`, `../../components/ui/skeleton`.

Source signals (line numbers): literal_hex: 64.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FAF8F5` | 64 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5EEE2` | 64 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/home/HomeCategoryGrid.jsx`

Shared/module dependencies: `../../components/ui/skeleton`, `../../utils/pages/categoryUtils`, `../../utils/common`.

Source signals (line numbers): raw_button: 162;251 | literal_hex: 22;23;26;27;29;271;272.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 162, 251 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E8D9B7` | 22 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 23 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 26, 29, 272 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFF8E8` | 26 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7EBCF` | 27 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D8D8D8` | 271 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/home/HomeProductsForYouSection.jsx`

Shared/module dependencies: `../../modules/products/components/ProductCard`, `../../modules/products/controllers/actions`, `../../utils/ecommerce`, `../../utils/filterUtils`.

Source signals (line numbers): raw_button: 162 | literal_hex: 166.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 162 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#3E4093` | 166 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/components/home/PromoCampaignCarousel.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 137;148 | raw_img: 175 | literal_hex: 131;143;154;208.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 137, 148 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 175 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFF4D6` | 131 | Existing token: `var(--customer-gold-soft)`. Use in the same CSS property; retain modifiers/opacity. |
| `#FAF6EE` | 131 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |
| `#F2EADC` | 131 | Existing token: `var(--customer-cream-strong)`. Use in the same CSS property; retain modifiers/opacity. |
| `#333` | 143, 154 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 208 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#B88B22` | 208 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/home/ShoppingBanner.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 69;70;77;78;84;85.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFDF00` | 69, 77, 84 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6B4226` | 70, 78, 85 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/home/ShowcaseSection.jsx`

Shared/module dependencies: `../../components/ui/skeleton`, `../../components/ui/SectionContainer`, `../../components/ui/TopDealCard`, `../../utils/content`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/policy/PolicyHeader.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/policy/PolicySection.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 135 | literal_hex: 35.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 135 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#8226` | 35 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/static/CardGridSection.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/static/PageHero.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/swiper/CustomSwiper.jsx`

Shared/module dependencies: `../../utils/common`.

Source signals (line numbers): raw_button: 64;153.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 64, 153 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/components/swiper/InfiniteLoopSwiper.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/ActiveFilterChips.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 41;72 | literal_hex: 48;51;53;54;56;64;75.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 41, 72 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E3D6B6` | 48 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#172033` | 51, 64 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D1A128` | 53, 56 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFBF0` | 54 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6B7280` | 64 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2874F0` | 75 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/ApiState.jsx`

Shared/module dependencies: `../../utils/apiErrors`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/AppErrorBoundary.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 32.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 32 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/components/ui/AuthCard.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 26;42 | literal_hex: 17;56.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 26, 42 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F7F8FC` | 17 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 56 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/CheckboxField.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_input: 9.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 9 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. |

## `customer/src/components/ui/CustomDropdown.jsx`

Shared/module dependencies: `../../utils/common`, `../../hooks/useAnimatedPresence`.

Source signals (line numbers): raw_button: 220;343 | raw_input: 300 | literal_hex: 213;248;250;252;253;254;255;276;293;299;315;356;359;360;400 | overlay_or_scroll_lock: 73.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 220, 343 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 300 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 73 | This is a dropdown portal, not a modal. Keep dropdown positioning/portal behavior in `CustomDropdown`; share only applicable outside-click, keyboard and focus helpers. Do not replace the popup with BaseModal or introduce body scroll locking without a product need. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#2E2E2E` | 213, 360 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 248, 252, 253, 254, 255, 276, 293, 315, 400 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D60` | 250, 359, 360 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#E7D9B8` | 299, 315 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E5DAB5` | 356 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8F1E2` | 356, 359 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#A96F14` | 400 | Existing token: `var(--customer-gold-dark)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/components/ui/CustomerToast.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 67.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 67 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/components/ui/FallbackImage.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 31.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 31 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Compare source changes, error/fallback handling, skeleton/loading state and alt/dimensions across image APIs. |

## `customer/src/components/ui/FilterDropdown.jsx`

Shared/module dependencies: `../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/FormField.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 91 | raw_input: 74 | literal_hex: 87;88.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 91 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 74 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 87, 88 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |

## `customer/src/components/ui/HorizontalScrollControls.jsx`

Shared/module dependencies: `../../utils/common`.

Source signals (line numbers): raw_button: 89;201 | literal_hex: 84.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 89, 201 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E8D9B7` | 84 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 84 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 84 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFF8E8` | 84 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/Image.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 16.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 16 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Compare source changes, error/fallback handling, skeleton/loading state and alt/dimensions across image APIs. |

## `customer/src/components/ui/InfoCard.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/LazySection.jsx`

Shared/module dependencies: `../../hooks/useInView`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/LazyToast.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/Loader.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 5.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 5 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

## `customer/src/components/ui/NewArrivalCard.jsx`

Shared/module dependencies: `../../utils/common`, `../../utils/ecommerce`.

Source signals (line numbers): raw_img: 42 | literal_hex: 16;17;23;28;32;51;57;61.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 42 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D6066` | 16, 32 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 17, 57 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#FFFFFF` | 23, 28 | Existing token: `var(--customer-surface)`. Use in the same CSS property; retain modifiers/opacity. |
| `#2E2E2E` | 51 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#737373` | 61 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/OtpInput.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_input: 54.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 54 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. |

## `customer/src/components/ui/PageHeader.jsx`

Shared/module dependencies: `../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/PageIntroBanner.jsx`

Shared/module dependencies: `../../utils/common`.

Source signals (line numbers): literal_hex: 12;14.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#17145F` | 12, 14 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#111050` | 14 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/PhoneField.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_input: 41;51.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 41, 51 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. Explicit hidden input(s) near lines 41: keep native hidden form wiring; do not add a visible field. |

## `customer/src/components/ui/PricePill.jsx`

Shared/module dependencies: `../../modules/products/components/Price`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/ScrollToTop.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/ScrollTopButton.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 37 | literal_hex: 42.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 37 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 42 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/components/ui/SearchBar.jsx`

Shared/module dependencies: `../../utils/ecommerce/product`, `../../hooks/useDebouncedValue`.

Source signals (line numbers): raw_button: 509;564;624;635;659 | raw_input: 593 | raw_img: 155;700 | literal_hex: 165;500;523;540;570;572;588;619;638;641;650;667;668;684.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 509, 564, 624, 635, 659 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 593 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_img` — Native images | 155, 700 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F8F3E7` | 165, 572 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 165, 638, 667, 668 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D604D` | 500, 588 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#03014D` | 523, 570, 572, 638, 641 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D601A` | 540 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 619 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6E6D6D` | 619 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D6020` | 650 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#0B63F6` | 684 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/SectionContainer.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 33;53;66.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#3E4093` | 33, 53, 66 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/components/ui/SelectField.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_input: 76 | raw_select: 60.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 76 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. |
| `raw_select` — Native selects | 60 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Compare option normalization, controlled values and fallback behavior before selecting a canonical API. |

## `customer/src/components/ui/Seo.jsx`

Shared/module dependencies: `../../config/site`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/ServiceUnavailableDialog.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 92;120 | literal_hex: 90 | brand_literal: 21.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 92, 120 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `brand_literal` — Brand-name literals | 21 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#15115D` | 90 | Existing token: `var(--customer-navy-dark)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/components/ui/SocialIcons.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 21 | literal_hex: 19.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 21 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#494949` | 19 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/TopDealCard.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 16.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 16 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

## `customer/src/components/ui/banner/PageHeroBanner.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_img: 53 | literal_hex: 6;12;16;18;19;22.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 53 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#17145F` | 6, 12 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#111050` | 12 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF8F3` | 16, 22 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#18156D` | 16, 18, 19 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#D4A52A` | 18 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |

## `customer/src/components/ui/button/button.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/button/static.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_img: 203 | literal_hex: 9;11;13;16;18;19;22;25;28;31;33;37;41;217;218;225;259.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 203 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1F2430` | 9, 18, 28 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 9, 16, 18, 19, 22, 28, 33, 37 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#BD9025` | 9, 28, 33 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#18156D` | 11, 13, 18, 41 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#3E4093` | 11, 13, 41 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#B88419` | 18 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#03014D` | 19 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 22, 25, 37 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D4D` | 31 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D6A323` | 31 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |
| `#8A6500` | 33 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#7A5A00` | 33 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D600D` | 37 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2A2B66` | 41 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1E204A` | 217, 218 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D2D2D` | 218 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D347D` | 225 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D9B15A` | 259 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/buttons/Button.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_button: 60.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 60 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align loading, disabled, focus and link/button semantics across the button APIs. |

## `customer/src/components/ui/buttons/IconButton.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_button: 32.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 32 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align loading, disabled, focus and link/button semantics across the button APIs. |

## `customer/src/components/ui/display/Avatar.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_img: 29.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 29 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Compare source changes, error/fallback handling, skeleton/loading state and alt/dimensions across image APIs. |

## `customer/src/components/ui/display/Badge.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/display/Divider.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/display/ImageWithFallback.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_img: 30.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 30 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Compare source changes, error/fallback handling, skeleton/loading state and alt/dimensions across image APIs. |

## `customer/src/components/ui/display/ResponsiveGrid.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/display/StarRating.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 58;143 | literal_hex: 34;35;135;136;150;161;165;166;169;171;175;177;198;215;216;221;228;232;247;261;262;269 | inline_currency: 18;26.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 58, 143 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `inline_currency` — Inline currency/number formatting | 18, 26 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#16A34A` | 34, 35, 165, 166, 215, 216, 221, 261, 262 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F59E0B` | 135 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9CA3AF` | 136, 228 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#201B78` | 150 | Existing token: `var(--customer-navy)`. Use in the same CSS property; retain modifiers/opacity. |
| `#F0FDF4` | 161 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#BBF7D0` | 169, 175 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1F2430` | 171 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#065F46` | 177 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DCFCE7` | 177 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#388E3C` | 198 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6F7480` | 232, 247, 269 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/components/ui/display/StatusTimeline.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/feedback/ComponentLoader.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/feedback/EmptyState.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_img: 42 | literal_hex: 27;28;35;63.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 42 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E7D9B8` | 27 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF6` | 27, 28 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E8F0FA` | 35 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#52749B` | 35 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D8E3F0` | 35 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 63 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#32347C` | 63 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/feedback/EmptyStateIllustration.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 4;5;6;7;8;9;10;11;12;13.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EEE5CF` | 4 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F6E6B3` | 5 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DAA51C` | 6 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#987D3F` | 7 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAC66B` | 8, 12 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#BE994C` | 9, 11 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF7` | 10 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#211B69` | 13 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/components/ui/feedback/ErrorState.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/feedback/NoDataFound.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/feedback/PageLoader.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/feedback/ReviewEmptyIllustration.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 4;5;7;9;10;12.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EEE5CF` | 4 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8E7B5` | 5 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAC66B` | 5, 9 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF6` | 7, 10 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#BE994C` | 7 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#211B69` | 10 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#DAA51C` | 12 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/icons/AllOrdersIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 18;23.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D6A323` | 18, 23 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/components/ui/icons/BotanicalLeavesSvg.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 3;27;37;42;52.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 3 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#D6A323` | 27, 37, 52 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |
| `#B8871B` | 42 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/icons/CategoryBotanicalLeafSvg.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 2.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D6A323` | 2 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/components/ui/icons/CategoryWavyDividerSvg.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/icons/CheckIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/icons/CloseIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/icons/FailedIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/icons/HomeIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/icons/InfoCircleIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/icons/LockIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/icons/SpinnerIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/icons/WarningIcon.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/inputs/CheckboxInput.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_input: 22.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 22 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. |

## `customer/src/components/ui/inputs/PriceRangeInput.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 65 | raw_input: 40;51 | inline_currency: 7.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 65 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 40, 51 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. |
| `inline_currency` — Inline currency/number formatting | 7 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

## `customer/src/components/ui/inputs/QuantityInput.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_button: 49;69.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 49, 69 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/components/ui/inputs/RadioInput.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_input: 23.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 23 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. |

## `customer/src/components/ui/inputs/SearchInput.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_button: 92;102 | raw_input: 78.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 92, 102 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 78 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |

## `customer/src/components/ui/inputs/SelectInput.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_select: 29.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_select` — Native selects | 29 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Compare option normalization, controlled values and fallback behavior before selecting a canonical API. |

## `customer/src/components/ui/inputs/TextInput.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_input: 28.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 28 | Keep the native element here: this file implements a shared primitive. Improve its common API/behavior and migrate consumers to it; do not wrap the component in itself. Align labels, errors, registration/controlled values and explicit sanitization across the field APIs. |

## `customer/src/components/ui/label/Label.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): literal_hex: 6;8;11;14;18;23.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D4D` | 6 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D1A` | 6 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8A6500` | 6, 8, 11 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E8B84B` | 8, 11 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1F2430` | 14, 23 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 14, 23 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D60` | 18 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/components/ui/layout/Container.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/layout/DetailSectionCard.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 10;19;23.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D80` | 10 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAD9B6` | 19 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 23 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/layout/LazySection.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/layout/PageContainer.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/layout/PageWrapper.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/layout/SectionHeader.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/layout/SectionWrapper.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/layout/SidebarLayout.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/layout/StickySidebarLayout.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/overlay/AuthModal.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`, `../../../utils/common`, `../../../components/ui/icons`.

Source signals (line numbers): raw_button: 96;149;164;182 | overlay_or_scroll_lock: 29;34;41;62;66.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 96, 149, 164, 182 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 29, 34, 41, 62, 66 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

## `customer/src/components/ui/overlay/BaseModal.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_button: 46 | overlay_or_scroll_lock: 19;21;27;61.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 46 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 19, 21, 27, 61 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

## `customer/src/components/ui/overlay/ConfirmModal.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`.

Source signals (line numbers): raw_img: 44 | literal_hex: 18;19;43;70;76;95;107.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 44 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F5E9C9` | 18 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 19, 70, 76, 95 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#E7E7E7` | 43 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8F9FA` | 43 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F4F6FF` | 95 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D93C3C` | 107 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#C52F2F` | 107 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/overlay/Drawer.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`.

Source signals (line numbers): raw_button: 59 | overlay_or_scroll_lock: 20;21;29;30;45.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 59 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 20, 21, 29, 30, 45 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

## `customer/src/components/ui/overlay/GuestOtpAuthModal.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`, `../../../utils/common`, `../../../utils/ecommerce/cart`, `../../../utils/notify`.

Source signals (line numbers): raw_button: 267;404;439 | raw_input: 331 | literal_hex: 283;311;322;325;329;359;400 | overlay_or_scroll_lock: 60;64;74;250;254.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 267, 404, 439 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 331 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 60, 64, 74, 250, 254 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F7F8FC` | 283 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 311, 359, 400 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D6D9DE` | 322, 329 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 322 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#5F6470` | 325 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/overlay/NotifyMeModal.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`, `../../../utils/ecommerce`.

Source signals (line numbers): raw_input: 249;279 | raw_img: 209 | literal_hex: 161;165;166;169;173;174;183;192;196;199;207;212;221;227;258;261;288;291;321 | inline_currency: 233.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 249, 279 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_img` — Native images | 209 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_currency` — Inline currency/number formatting | 233 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EEDFB9` | 161, 207, 212, 261, 291 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 161, 212 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 165, 166, 183, 321 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#2D347D` | 169, 174, 196, 221 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6F7480` | 173, 199, 227 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#B88C22` | 183, 321 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 192 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#2E2E2E` | 258, 288 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8D8F98` | 258, 288 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/components/ui/skeleton/SkeletonBox.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/components/ui/skeleton/SkeletonLoader.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/layouts/AppLayout.jsx`

Shared/module dependencies: `../utils/ecommerce`, `../utils/ecommerce/cart`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/layouts/Footer.jsx`

Shared/module dependencies: `../utils/content`, `../components/ui`, `../components/ui/skeleton/SkeletonBox`, `../utils/stringUtils`.

Source signals (line numbers): raw_button: 154 | raw_img: 162;225;254 | literal_hex: 92;140;144;152;160;177;180;185;209;343;357 | brand_literal: 231.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 154 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 162, 225, 254 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 231 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 92, 343, 357 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1C1C1C` | 140 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D6033` | 144 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5F8FB` | 144 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D2E2F4` | 152, 160, 185 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 177, 185 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#2E2E2E` | 180, 209 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/layouts/Header.jsx`

Shared/module dependencies: `../hooks/useProfileImage`, `../components/ui/Image`, `../components/ui/SearchBar`, `../components/ui/button/static`, `../components/ui/overlay/ConfirmModal`, `../modules/catalog/components/CategoryMegaMenu`, `../utils/notify`, `../utils/content`, `../utils/stringUtils`.

Source signals (line numbers): raw_img: 332;382;453 | literal_hex: 376;378;395;420;438;466;470;478;484;507;753;762;765;816;817;825;839;841;842;847;865;924;933;934;941;994;995;1003;1017;1019;1020;1025 | brand_literal: 318;335.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 332, 382, 453 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 318, 335 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 376, 378, 420, 438, 825, 847, 1003, 1025 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFFFFF` | 395 | Existing token: `var(--customer-surface)`. Use in the same CSS property; retain modifiers/opacity. |
| `#2E2E2E` | 466, 470, 817, 842, 995, 1020 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 478 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#03014D` | 484, 816, 817, 839, 841, 994, 995, 1017, 1019 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DC2626` | 507 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B91C1C` | 507 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAD8B5` | 753, 762, 765, 865 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF8ED` | 753, 865 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D347D` | 924, 941 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1E204A` | 933, 934 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D2D2D` | 934 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/layouts/HeroBanner.jsx`

Shared/module dependencies: `../hooks/useCmsRecord`.

Source signals (line numbers): literal_hex: 68.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 68 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/layouts/HeroSwiper.jsx`

Shared/module dependencies: `../components/ui/label/Label`, `../components/ui/button/static`.

Source signals (line numbers): raw_img: 40 | literal_hex: 37;51;59;63;74.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 40 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 37, 51 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 59, 74 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFF8E7` | 59 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#18156D` | 59 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#A8790A` | 63 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/layouts/header/CategoryBar.jsx`

Shared/module dependencies: `../../components/ui/Image`, `../../components/ui/button/static`, `../../modules/catalog/components/CategoryMegaMenu`, `../../hooks/useCmsRecord`, `../../utils/content`.

Source signals (line numbers): literal_hex: 220;229;231;263;311;319;320;328.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFF8ED` | 220, 263 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAD8B5` | 220, 229, 231, 263 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D347D` | 311, 328 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1E204A` | 319, 320 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D2D2D` | 320 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/layouts/header/CompactCategoryBar.jsx`

Shared/module dependencies: `../../modules/catalog/components/CategoryMegaMenu`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/layouts/header/DropdownHeader.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/layouts/header/HeaderDropdown.jsx`

Shared/module dependencies: `../../utils/common`.

Source signals (line numbers): raw_button: 46;120.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 46, 120 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/layouts/header/MenuDropdown.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 28.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 28 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/layouts/header/Navbar.jsx`

Shared/module dependencies: `../../hooks/useProfileImage`, `../../components/ui/SearchBar`, `../../components/ui/button/static`, `../../components/ui/overlay/ConfirmModal`, `../../utils/notify`, `../../utils/content`.

Source signals (line numbers): raw_img: 183;223;296 | literal_hex: 236;262;272;280;309;313;321;327;350 | brand_literal: 173;186.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 183, 223, 296 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 173, 186 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFFFFF` | 236 | Existing token: `var(--customer-surface)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 262, 280 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D6099` | 272 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D600D` | 272 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 272, 321 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#2E2E2E` | 309, 313 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#03014D` | 327 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DC2626` | 350 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B91C1C` | 350 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/layouts/header/StickyNavStrip.jsx`

Shared/module dependencies: `../../utils/content`.

Source signals (line numbers): literal_hex: 39;40;45;56;57;62.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#03014D` | 39, 40, 56, 57 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 40, 57 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 45, 62 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |

## `customer/src/layouts/header/TopHeader.jsx`

Shared/module dependencies: `../../components/ui/button/static`, `../../components/ui/overlay/ConfirmModal`, `../../utils/notify`, `../../utils/content`.

Source signals (line numbers): raw_img: 78 | literal_hex: 33;35;47;61;76;125.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 78 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFFFFF` | 33, 35, 47, 61, 76 | Existing token: `var(--customer-surface)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 47, 61, 76 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#DC2626` | 125 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B91C1C` | 125 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/layouts/header/categoryHelpers.jsx`

Shared/module dependencies: `../../utils/content`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/main.jsx`

Shared/module dependencies: `./components/ui/LazyToast`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/account/pages/AccountPage.jsx`

Shared/module dependencies: `../../../components/ui/ApiState`, `../../../components/ui/Seo`, `../../../components/ui/layout`.

Source signals (line numbers): raw_button: 129 | raw_img: 75 | literal_hex: 42;67;69;70;73;90;102;103;111;134;141 | brand_literal: 250.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 129 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 75 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 250 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E23B3B` | 42 | Existing token: `var(--customer-danger)`. Use in the same CSS property; retain modifiers/opacity. |
| `#04258626` | 67 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF9E9` | 69, 70 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFC82E` | 73 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 73, 90, 102, 103, 141 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#2E2E2E` | 103 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E4E4E` | 111 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#171A3A` | 134 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/account/pages/AddressTab.jsx`

Shared/module dependencies: `../../common/components/address/AddressFormFields`, `../../common/components/address/AddressEditModal`, `../../common/components/address/SharedAddressCard`, `../../../components/ui/overlay/ConfirmModal`, `../controllers/useAddressBook`.

Source signals (line numbers): raw_button: 106;200;235 | literal_hex: 59;60;65;68;74;75;76;77;87;89;94;98;159;160;199;203;222;223;227;231;238;261.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 106, 200, 235 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E7D9B8` | 59, 74, 87, 160, 199 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5E9C9` | 60, 75, 76, 77, 89, 223 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 60, 65, 89, 203, 223, 227 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#64708A` | 68, 98, 231 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#171A3A` | 94 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EADCB0` | 159 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D7B55D` | 159 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 203, 222, 238 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFF8E8` | 203 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFCF5` | 222 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DC2626` | 261 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B91C1C` | 261 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/account/pages/ProfileTab.jsx`

Shared/module dependencies: `../../../components/ui/buttons/Button`, `../../../components/ui/OtpInput`, `../../../hooks/useToastThunk`, `../../../utils/notify`, `../../../hooks/useProfileImage`.

Source signals (line numbers): raw_button: 411;452;572;612;650 | raw_input: 421;472;504;557 | raw_img: 397 | literal_hex: 363;365;367;385;392;416;434;438;489;521;544;555;569;576;602;611;616;634;639;643;646;657 | overlay_or_scroll_lock: 634.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 411, 452, 572, 612, 650 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 421, 472, 504, 557 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. Explicit file input(s) near lines 421: keep native file selection and its ref/reset behavior; share upload validation/preview lifecycle separately from endpoint-specific upload policy. |
| `raw_img` — Native images | 397 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 634 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#171A3A` | 363, 365, 367, 434, 569, 616, 634, 643 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 365, 385, 611, 639 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAFAFC` | 365 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#04258633` | 367, 569 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 385 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E6E8F0` | 392 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F2F4F8` | 392, 657 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 416, 576 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#343B91` | 416 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#64708A` | 438, 646, 657 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8D92A3` | 489, 521, 544, 555, 602 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2C3080` | 576 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D9DCE5` | 616 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7F7F9` | 616 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/account/pages/SecurityTab.jsx`

Shared/module dependencies: `../../../components/ui/OtpInput`, `../../../utils/notify`, `../../../components/ui/FormField`, `../../../components/ui/buttons/Button`, `../../../components/ui/overlay/ConfirmModal`, `../../../hooks/useToastThunk`.

Source signals (line numbers): raw_button: 211;220 | literal_hex: 110;112;117;121;140;201;210;215;224.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 211, 220 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E7D9B8` | 110 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5E9C9` | 112 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 112, 215, 224 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#171A3A` | 117 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#64708A` | 121, 140, 215 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D2D2D` | 201 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F0E6D2` | 210 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/auth/components/BuyerRegisterForm.jsx`

Shared/module dependencies: `../../../components/ui/buttons/Button`, `../../../components/ui/FormField`, `../../../components/ui/PhoneField`, `../utils/buildBuyerRegistrationPayload`.

Source signals (line numbers): literal_hex: 36.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#4B5265` | 36 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/auth/context/AuthModalContext.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/auth/pages/BuyerRegisterPage.jsx`

Shared/module dependencies: `../../../components/ui/AuthCard`, `../../../components/ui/Seo`, `../components/BuyerRegisterForm`, `../controllers/useBuyerRegister`.

Source signals (line numbers): brand_literal: 12;13.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 12, 13 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/auth/pages/ForgotPasswordPage.jsx`

Shared/module dependencies: `../../../components/ui/AuthCard`, `../../../components/ui/buttons/Button`, `../../../components/ui/FormField`, `../../../components/ui/Seo`, `../controllers/useForgotPassword`.

Source signals (line numbers): brand_literal: 23.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 23 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/auth/pages/LoginPage.jsx`

Shared/module dependencies: `../../../components/ui/AuthCard`, `../../../components/ui/buttons/Button`, `../../../components/ui/FormField`, `../../../components/ui/Seo`, `../controllers/useLogin`.

Source signals (line numbers): raw_img: 123 | brand_literal: 34;35;39.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 123 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 34, 35, 39 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/auth/pages/RegisterOtpPage.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): brand_literal: 17.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 17 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/auth/pages/ResetPasswordPage.jsx`

Shared/module dependencies: `../../../components/ui/AuthCard`, `../../../components/ui/buttons/Button`, `../../../components/ui/FormField`, `../../../components/ui/OtpInput`, `../../../components/ui/Seo`, `../../../components/ui/AppErrorBoundary`, `../controllers/useResetPassword`.

Source signals (line numbers): raw_button: 90 | raw_input: 50 | brand_literal: 27.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 90 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 50 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. Explicit hidden input(s) near lines 50: keep native hidden form wiring; do not add a visible field. |
| `brand_literal` — Brand-name literals | 27 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/auth/pages/VerifyRegistrationPage.jsx`

Shared/module dependencies: `../../../components/ui/AuthCard`, `../../../components/ui/buttons/Button`, `../../../components/ui/FormField`, `../../../components/ui/OtpInput`, `../../../components/ui/Seo`, `../controllers/useVerifyRegistration`.

Source signals (line numbers): raw_button: 95 | raw_input: 48;66 | brand_literal: 29.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 95 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 48, 66 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. Explicit hidden input(s) near lines 48, 66: keep native hidden form wiring; do not add a visible field. |
| `brand_literal` — Brand-name literals | 29 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/cart/components/AddedToCartModal.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`, `../../../components/ui/overlay/BaseModal`, `../../../components/ui/button/static`, `../../../utils/ecommerce`.

Source signals (line numbers): raw_button: 179;243 | raw_img: 115;210 | literal_hex: 140;238;249;256.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 179, 243 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 115, 210 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 140, 238, 249 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1F2430` | 140, 238 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#FFF8E8` | 140, 238 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FCFCFB` | 256 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/cart/components/CartItemCard.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../utils/ecommerce/money`, `../../products/components/ProductPriceBlock`, `../../products/components/ProductStockStatus`, `../../../components/ui/display/StarRating`.

Source signals (line numbers): raw_button: 251;269;280 | raw_input: 108 | raw_img: 128;146 | literal_hex: 93;113;169;174;212;213;249;256;257;273;285.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 251, 269, 280 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 108 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_img` — Native images | 128, 146 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E9DFC8` | 93, 249 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFEFB` | 93 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFCF4` | 93 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#C9CDD6` | 113 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3F4095` | 113 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D2D2D` | 169, 174 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 169, 256, 257, 273, 285 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#001F3F` | 212 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#737373` | 213 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAE6DC` | 249 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8F5EE` | 249 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#51545A` | 256, 273, 285 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5F0E7` | 256, 273, 285 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/cart/components/QuantitySelector.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 44;71 | literal_hex: 39;40;50;51;64;77;79;80.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 44, 71 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 39, 40, 50, 51, 64, 79, 80 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#F8F5EE` | 39 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F4F4F8` | 40 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F1F0EB` | 50 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F0E4C6` | 50 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E8E8F3` | 51 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2F346F` | 77 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/cart/pages/CartPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../../components/ui/skeleton`, `../../../components/ui`, `../../../components/ui/layout/StickySidebarLayout`, `../components/CartItemCard`, `../../../components/ui/buttons/Button`, `../../products/components/ProductCard`, `../../common/components/Breadcrumbs`, `../../../components/ui/overlay/GuestOtpAuthModal`, `../../orders/components/OrderPaymentSummary`, `../../../components/ui/button/static`, `../../../components/ui/skeleton/layouts`, `../../../utils/ecommerce/money`, `../../../components/ui/layout`, `../../../utils/ecommerce/cart`, `../../../utils/ecommerce`, `../../../utils/pages/cartUtils`, `../controllers/useCart`.

Source signals (line numbers): raw_button: 231 | raw_input: 246 | literal_hex: 243;245;256;262;265 | brand_literal: 166.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 231 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 246 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `brand_literal` — Brand-name literals | 166 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D5D9E2` | 243 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#252936` | 245 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#C9CDD6` | 256 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3F4095` | 256 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D9DCE4` | 262 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#555B68` | 265 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/catalog/components/BrandCard.jsx`

Shared/module dependencies: `../../../utils/common`, `../../../utils/ecommerce`.

Source signals (line numbers): raw_button: 116 | raw_img: 72 | literal_hex: 50;51;56 | inline_currency: 108.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 116 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 72 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_currency` — Inline currency/number formatting | 108 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EEE8DA` | 50 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF8F3` | 51 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E5D6B5` | 56 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/catalog/components/BrandLoadingSkeleton.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/catalog/components/CategoryMegaMenu.jsx`

Shared/module dependencies: `../../../utils/ecommerce`.

Source signals (line numbers): raw_button: 404;440 | raw_img: 331.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 404, 440 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 331 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

## `customer/src/modules/catalog/components/CategorySidebarNav.jsx`

Shared/module dependencies: `../../../utils/pages/categoryUtils`.

Source signals (line numbers): literal_hex: 14;38;39;47;49;53;54;71.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#3E4093` | 14 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#B8BBC5` | 14 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EEDFB9` | 38 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#111827` | 39, 47, 49, 53, 54, 71 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/catalog/components/SubCategoryStrip.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../utils/pages/categoryUtils`.

Source signals (line numbers): raw_img: 47 | literal_hex: 35;45;63.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 47 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#2F4384` | 35, 63 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F0F1FA` | 35, 45 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D1B165` | 45 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7E9F8` | 45 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/catalog/controllers/useCategory.jsx`

Shared/module dependencies: `../../../modules/products/components`, `../../../modules/products/controllers/useCatalogFilters`, `../../../modules/products/controllers/useFacetCache`, `../../../modules/products/controllers/actions`, `../../../utils/ecommerce`, `../../../utils/pages/categoryUtils`, `../../../utils/filterUtils`, `../../../utils/stringUtils`, `../../../modules/products/controllers/getFilterSections`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/catalog/pages/BrandOutletPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../common/components/Breadcrumbs`, `../components/BrandCard`, `../../../components/ui`, `../../../modules/products/components`, `../../../components/ui/FilterDropdown`, `../../../components/ui/layout`, `../../../utils/pages/brandUtils`, `../../../utils/common`.

Source signals (line numbers): raw_button: 206 | raw_input: 196 | literal_hex: 193;202;210;279;287 | brand_literal: 176;177.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 206 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 196 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `brand_literal` — Brand-name literals | 176, 177 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#9E886A` | 193 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E4DDCF` | 202 | Existing token: `var(--customer-border)`. Use in the same CSS property; retain modifiers/opacity. |
| `#FAF6EE` | 202 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |
| `#1F2430` | 202, 210 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#6F7480` | 202, 210 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#D6A323` | 202 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |
| `#B8891F` | 279, 287 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 279, 287 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#3E4093` | 279 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#1B1D60` | 279, 287 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#FAF8F3` | 287 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/catalog/pages/BrandPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../common/components/Breadcrumbs`, `../../../modules/products/components`, `../../../modules/products/controllers/actions`, `../../../utils/ecommerce`, `../../../utils/pages/brandUtils`, `../../../utils/common`, `../components/BrandLoadingSkeleton`, `../controllers/useBrandPageController`.

Source signals (line numbers): literal_hex: 88;97;115 | inline_currency: 132.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `inline_currency` — Inline currency/number formatting | 132 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 88 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 97, 115 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |

## `customer/src/modules/catalog/pages/CategoryListingPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../common/components/Breadcrumbs`, `../../../components/ui/feedback`, `../../../components/ui/layout`, `../../../components/ui/FilterDropdown`, `../../../modules/products/components`, `../../../utils/pages/categoryUtils`, `../../../utils/common`.

Source signals (line numbers): raw_button: 444 | raw_input: 416 | raw_img: 107 | literal_hex: 84;85;90;412;427;428;431;432;435;438;454;456;495;501;502;550;556;557 | inline_currency: 152 | brand_literal: 390;391.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 444 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 416 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_img` — Native images | 107 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_currency` — Inline currency/number formatting | 152 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |
| `brand_literal` — Brand-name literals | 390, 391 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EEE8DA` | 84 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF8F3` | 85 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E5D6B5` | 90 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9E886A` | 412 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E4DDCF` | 427, 435 | Existing token: `var(--customer-border)`. Use in the same CSS property; retain modifiers/opacity. |
| `#FAF6EE` | 428 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |
| `#1F2430` | 431, 456 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#6F7480` | 432, 454 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#D6A323` | 438 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |
| `#B8891F` | 495, 550 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 495, 550 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#3E4093` | 501, 556 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#1B1D60` | 502, 557 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/catalog/pages/CategoryPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/AppErrorBoundary`, `../../../modules/products/components`, `../../../utils/apiErrors`, `../controllers/useCategory`, `../components/SubCategoryStrip`, `../components/CategorySidebarNav`.

Source signals (line numbers): brand_literal: 84.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 84 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/catalog/pages/DealsPage.jsx`

Shared/module dependencies: `../../common/components/Breadcrumbs`, `../../../modules/products/components`, `../../../modules/products/controllers/actions`, `../controllers/useDealsPageController`, `../../../hooks/useCmsRecord`.

Source signals (line numbers): literal_hex: 79;87.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 79 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 87 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |

## `customer/src/modules/catalog/pages/NewArrivalsPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../products/components`, `../../products/controllers/actions`.

Source signals (line numbers): brand_literal: 25 | local_product_grid_page: 11.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 25 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |
| `local_product_grid_page` — Copied product-grid page shell | 11 | Extract the local `ProductGridPage` into one exported catalog page shell composed from `PageHeader`, `ApiState` and `ProductGrid`. Share the shell across new arrivals, recently uploaded, recently viewed, trending and related routes; retain route-specific queries, selectors, local history and source-product context. |

## `customer/src/modules/catalog/pages/RecentlyUploadedPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../products/components`, `../../products/controllers/actions`.

Source signals (line numbers): brand_literal: 25 | local_product_grid_page: 11.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 25 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |
| `local_product_grid_page` — Copied product-grid page shell | 11 | Extract the local `ProductGridPage` into one exported catalog page shell composed from `PageHeader`, `ApiState` and `ProductGrid`. Share the shell across new arrivals, recently uploaded, recently viewed, trending and related routes; retain route-specific queries, selectors, local history and source-product context. |

## `customer/src/modules/catalog/pages/RecentlyViewedPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../products/components`, `../../products/controllers/actions`, `../../../utils/recentlyViewed`.

Source signals (line numbers): brand_literal: 24 | local_product_grid_page: 10.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 24 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |
| `local_product_grid_page` — Copied product-grid page shell | 10 | Extract the local `ProductGridPage` into one exported catalog page shell composed from `PageHeader`, `ApiState` and `ProductGrid`. Share the shell across new arrivals, recently uploaded, recently viewed, trending and related routes; retain route-specific queries, selectors, local history and source-product context. |

## `customer/src/modules/catalog/pages/RelatedProductsPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../products/components`, `../../products/controllers/actions`.

Source signals (line numbers): brand_literal: 29 | local_product_grid_page: 15.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 29 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |
| `local_product_grid_page` — Copied product-grid page shell | 15 | Extract the local `ProductGridPage` into one exported catalog page shell composed from `PageHeader`, `ApiState` and `ProductGrid`. Share the shell across new arrivals, recently uploaded, recently viewed, trending and related routes; retain route-specific queries, selectors, local history and source-product context. |

## `customer/src/modules/catalog/pages/SearchPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/PageHeader`, `../../../modules/products/components`, `../../../modules/products/controllers/actions`, `../controllers/useSearchPageController`.

Source signals (line numbers): inline_currency: 58 | brand_literal: 67.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `inline_currency` — Inline currency/number formatting | 58 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |
| `brand_literal` — Brand-name literals | 67 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/catalog/pages/TrendingNowPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../products/components`, `../../products/controllers/actions`.

Source signals (line numbers): brand_literal: 28 | local_product_grid_page: 14.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 28 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |
| `local_product_grid_page` — Copied product-grid page shell | 14 | Extract the local `ProductGridPage` into one exported catalog page shell composed from `PageHeader`, `ApiState` and `ProductGrid`. Share the shell across new arrivals, recently uploaded, recently viewed, trending and related routes; retain route-specific queries, selectors, local history and source-product context. |

## `customer/src/modules/checkout/components/AddressSelection.jsx`

Shared/module dependencies: `../../../components/ui/buttons/Button`, `../../common/components/address/AddressFormFields`, `../../common/components/address/AddressEditModal`, `../../../components/ui/layout/DetailSectionCard`, `../../../components/ui/overlay/BaseModal`, `../../../hooks/useToastThunk`, `../../../utils/common`, `../../../utils/formErrors`, `../../../utils/pages/checkoutUtils`.

Source signals (line numbers): raw_button: 297;416;449 | raw_input: 370 | literal_hex: 289;300;327;328;339;383;386;419.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 297, 416, 449 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 370 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 289, 327, 419 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#3E4093` | 300, 383 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 328, 419 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#2E2E2E` | 339, 386 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D6099` | 419 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D600D` | 419 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D1A` | 419 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/checkout/components/CheckoutSummary.jsx`

Shared/module dependencies: `../../../modules/orders/components/OrderPaymentSummary`, `../../../utils/ecommerce`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/checkout/components/DiscountsSection.jsx`

Shared/module dependencies: `../../../components/ui/FormField`, `../../../utils/ecommerce`, `../../../components/ui/layout/DetailSectionCard`.

Source signals (line numbers): raw_input: 64;76 | literal_hex: 50;51;56;59;66.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 64, 76 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. Explicit hidden input(s) near lines 76: keep native hidden form wiring; do not add a visible field. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 50, 51, 56, 59, 66 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |

## `customer/src/modules/checkout/components/ShippingAddressForm.jsx`

Shared/module dependencies: `../../common/components/address/AddressFormFields`, `../../../components/ui/buttons/Button`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/checkout/pages/CheckoutPage.jsx`

Shared/module dependencies: `../controllers/useCheckout`, `../../../components/ui/AppErrorBoundary`, `../utils/checkoutUtils`, `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../common/components/Breadcrumbs`, `../../orders/components/OrderDetailLayout`, `../components/AddressSelection`, `../components/DiscountsSection`, `../components/CheckoutSummary`, `../../common/components/address/AddressEditModal`, `../../../components/ui/overlay/GuestOtpAuthModal`, `../../../components/ui/Loader`, `../../../components/ui/skeleton/layouts`, `../../../components/ui/layout`.

Source signals (line numbers): raw_button: 152;219 | raw_input: 166;172 | literal_hex: 206;207;211;215;226 | overlay_or_scroll_lock: 96 | brand_literal: 107.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 152, 219 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 166, 172 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. Explicit hidden input(s) near lines 166, 172: keep native hidden form wiring; do not add a visible field. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 96 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |
| `brand_literal` — Brand-name literals | 107 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D9B86D` | 206 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 206 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5E9C9` | 207 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 207, 211 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#64708A` | 215 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#C69D2A` | 226 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#B98A1F` | 226 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/checkout/pages/PaymentResultPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../common/components/Breadcrumbs`, `../../../components/ui/buttons/Button`, `../../../utils/orderHelpers`, `../../../components/ui/icons`, `../../../utils/routeTokens`, `../../../components/ui/layout/PageContainer`.

Source signals (line numbers): raw_img: 368 | literal_hex: 230;238;364;379;383;417 | brand_literal: 297;332;343;344;384.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 368 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 297, 332, 343, 344, 384 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#3E4093` | 230, 379 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#2E2E2E` | 238, 383 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 364, 417 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFFCF6` | 364 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF4D7` | 417 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 417 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/common/components/Breadcrumbs.jsx`

Shared/module dependencies: `../../../utils/common`, `../../../utils/notify`, `../../../components/ui/icons`.

Source signals (line numbers): raw_button: 161 | literal_hex: 48;49;102;114;137;145;166.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 161 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 48, 49, 114, 166 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#201B78` | 49, 145 | Existing token: `var(--customer-navy)`. Use in the same CSS property; retain modifiers/opacity. |
| `#2E2E2E` | 102, 114, 166 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8A6500` | 137 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/common/components/SectionHeader.jsx`

Shared/module dependencies: `../../../components/ui/layout/SectionHeader`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/common/components/address/AddressEditModal.jsx`

Shared/module dependencies: `../../../../hooks/useAnimatedPresence`, `../../../../components/ui/overlay/BaseModal`, `../../../../components/ui/buttons/Button`.

Source signals (line numbers): literal_hex: 35;36;40;41;64.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E8ECF3` | 35, 64 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF7E6` | 36 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 36 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#171A3A` | 40 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#64708A` | 41 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/common/components/address/AddressFormFields.jsx`

Shared/module dependencies: `../../../../components/ui/buttons/Button`, `../../../../components/ui/FormField`, `../../../../components/ui/PhoneField`, `../../../../components/ui/CustomDropdown`.

Source signals (line numbers): raw_input: 80;147;148;239 | literal_hex: 81;100;143;232;235;236;245.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 80, 147, 148, 239 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. Explicit hidden input(s) near lines 80, 147, 148: keep native hidden form wiring; do not add a visible field. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#171A3A` | 81, 235 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 100, 245 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFF7E6` | 100 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9A6500` | 100 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E1E7F0` | 100, 232 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#40506B` | 100 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 100 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAFBFD` | 143, 232 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#64708A` | 236 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CBD5E1` | 245 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/common/components/address/SharedAddressCard.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 61;69;73 | literal_hex: 45;63;70;85;91;98.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 61, 69, 73 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FAF0D7` | 45 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#171A3A` | 45, 85 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF8E8` | 63, 70 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FDEEC6` | 70 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E4E4E` | 91 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#525252` | 98 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/home/pages/HomePage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/AppErrorBoundary`, `../../../components/home/HomeCategoryGrid`, `../../../components/ui/LazySection`, `../../../hooks/useCmsRecord`, `../../../components/home/ShoppingBanner`, `../../../components/home/FeaturedProductsSection`, `../../../components/home/PromoCampaignCarousel`, `../../../components/home/HomeProductsForYouSection`, `../../../utils/ecommerce`.

Source signals (line numbers): brand_literal: 85;86.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 85, 86 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/notifications/components/NotificationCard.jsx`

Shared/module dependencies: `../utils/notificationUtils`.

Source signals (line numbers): literal_hex: 61;62;74;85;86;94;99;108.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EAEFF5` | 61, 94 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D9DDE8` | 61 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F0E6D2` | 62 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FCFAF2` | 62 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1597D4` | 74 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 85 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 86 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#3E4093` | 94 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#F3F4F9` | 94 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8E8E8E` | 99 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6E6E6E` | 108 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E4E4E` | 108 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/notifications/components/NotificationFilterBar.jsx`

Shared/module dependencies: `../../../components/ui/FilterDropdown`.

Source signals (line numbers): raw_button: 34 | raw_input: 26 | literal_hex: 23;30;38.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 34 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 26 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#9E886A` | 23 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E4CA8E` | 30 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1F2430` | 30, 38 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#6F7480` | 30, 38 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/notifications/components/PreferenceChannelCard.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): literal_hex: 14;15;23;24;31;34;45;46.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E2D2B2` | 14 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF6EE` | 14, 15 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |
| `#ECE2D0` | 15 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 15, 45, 46 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FAF4E6` | 23 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9A751E` | 23 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EADBBD` | 23 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8FAFC` | 24 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#64748B` | 24 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E2E8F0` | 24 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F1F5F9` | 24 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 24, 31 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#6F7480` | 34 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CBD5E1` | 46 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/notifications/components/PreferenceScheduleFields.jsx`

Shared/module dependencies: `../../../components/ui/CustomDropdown`.

Source signals (line numbers): literal_hex: 14;18;19;21;29;36;37;39;47.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F2EADC` | 14 | Existing token: `var(--customer-cream-strong)`. Use in the same CSS property; retain modifiers/opacity. |
| `#1B1D60` | 18, 19, 29, 36, 37, 47 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#6F7480` | 21, 39 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 29, 47 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |

## `customer/src/modules/notifications/pages/NotificationsPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../../modules/common/components/Breadcrumbs`, `../../../components/ui/layout`, `../../../components/ui/skeleton/skeletonPresets`, `../controllers/useNotifications`, `../components/NotificationCard`, `../components/NotificationFilterBar`.

Source signals (line numbers): raw_button: 84 | literal_hex: 90 | brand_literal: 41.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 84 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `brand_literal` — Brand-name literals | 41 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D9DDE8` | 90 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 90 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#F3F3F7` | 90 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/notifications/pages/PreferencesPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../../utils/common`, `../controllers/useNotificationPreferences`, `../components/PreferenceChannelCard`, `../components/PreferenceScheduleFields`.

Source signals (line numbers): raw_button: 99 | literal_hex: 33;36;48;52;56;59;104 | brand_literal: 27.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 99 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `brand_literal` — Brand-name literals | 27 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 33, 56 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#6F7480` | 36, 59 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#E7D9B8` | 48 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F4F6FB` | 52 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E2E8F0` | 52 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 52 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#D6A323` | 104 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 104 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#B8871B` | 104 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/notifications/utils/notificationUtils.jsx`

Shared/module dependencies: `../../../components/ui/icons`.

Source signals (line numbers): literal_hex: 57;58;76;77;91;92;105;106;112;113 | brand_literal: 162.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 162 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#3E4093` | 57, 58, 76, 77, 105, 106, 112, 113 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 91, 92 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |

## `customer/src/modules/orders/components/CancelOrderModal.jsx`

Shared/module dependencies: `../../../components/ui/overlay/ConfirmModal`, `../../../components/ui/CustomDropdown`, `../../../utils/pages/orderUtils`, `../../../utils/ecommerce`.

Source signals (line numbers): raw_input: 123 | raw_textarea: 223 | raw_img: 146 | literal_hex: 56;76;128;154;159;165;191;211;218;225;228.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 123 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_textarea` — Native textareas | 223 | Add a shared `TextareaField` using the existing input label/error conventions, or extend a field with an explicit textarea mode. Preserve multiline values, limits, resize, registration and errors; chat composers may need different Enter behavior. |
| `raw_img` — Native images | 146 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 56, 128 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#A96F14` | 56 | Existing token: `var(--customer-gold-dark)`. Use in the same CSS property; retain modifiers/opacity. |
| `#E7D9B8` | 76 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF9` | 76 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 154, 165, 191, 211, 218, 225 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#5F6078` | 159 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DCDDE5` | 211, 228 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8C8E9E` | 225 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/components/OrderActions.jsx`

Shared/module dependencies: `../../support/controllers/useSupportController`.

Source signals (line numbers): raw_button: 50;65;114;123 | literal_hex: 42;136.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 50, 65, 114, 123 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E9DFC8` | 42, 136 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#51545A` | 42 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5F0E7` | 42 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 42 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 42 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#EAE6DC` | 136 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/components/OrderAddressCard.jsx`

Shared/module dependencies: `../../../utils/orderHelpers`.

Source signals (line numbers): literal_hex: 20;21;26;27;32;33;37;38;57.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 20, 21 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#2E2E2E` | 26, 32, 37 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D4A428` | 27, 33, 38 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 57 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 57 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/components/OrderCancellations.jsx`

Shared/module dependencies: `../../../utils/cancellationRequester`, `../../../utils/ecommerce`, `../../../components/ui/layout/DetailSectionCard`.

Source signals (line numbers): literal_hex: 107.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFF7E6` | 107 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8A5A00` | 107 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/components/OrderDetailInfoGrid.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 5;14;17.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D66` | 5 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 5 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 5 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#2E2E2E` | 14 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 17 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/orders/components/OrderDetailLayout.jsx`

Shared/module dependencies: `../../../components/ui/layout/StickySidebarLayout`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/orders/components/OrderDocuments.jsx`

Shared/module dependencies: `../../../components/ui/buttons/Button`.

Source signals (line numbers): literal_hex: 22;25;26;29;35;40;43;49;63.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D40` | 22, 35 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 25, 26, 29 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D80` | 35 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 40 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#2E2E2E` | 43 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D1A` | 49 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 49, 63 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D60` | 63 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#FFF9EA` | 63 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/components/OrderItemCard.jsx`

Shared/module dependencies: `../../../utils/cancellationRequester`, `../utils/orderItems`.

Source signals (line numbers): raw_img: 390 | literal_hex: 260;264;272;288;296;304;315;330;339;352;362;400;410;416;451;452;457;459;465;469;470;504;508;510;517;518;528;529;536;539 | inline_currency: 342.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 390 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_currency` — Inline currency/number formatting | 342 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#6F7480` | 260, 451, 457, 470, 510, 518, 528, 539 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#1B1D60` | 264, 272, 288, 296, 304, 330, 339, 362 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#1F2430` | 315, 352, 410, 452, 459, 465, 504, 529, 536 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 362, 416 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFF9EA` | 362 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8EDCF` | 362 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9E886A` | 400 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E4DDCF` | 469, 508, 517 | Existing token: `var(--customer-border)`. Use in the same CSS property; retain modifiers/opacity. |
| `#FAF6EE` | 469, 508, 517 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/orders/components/OrderItemReview.jsx`

Shared/module dependencies: `../../products/components/ReviewImageUploader`, `../../products/components/ReviewMediaLightbox`, `../../../components/ui/overlay/BaseModal`, `../../../utils/showMore`, `../../../components/ui/display/StarRating`, `../../../utils/notify`, `../utils/orderItems`.

Source signals (line numbers): raw_button: 27;152;313;321;361 | raw_input: 277 | raw_textarea: 291 | raw_img: 159 | literal_hex: 40;41;60;61;92;97;101;102;110;113;132;133;142;143;147;156;259;260;266;275;284;289;301;315;323;354;363.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 27, 152, 313, 321, 361 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 277 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_textarea` — Native textareas | 291 | Add a shared `TextareaField` using the existing input label/error conventions, or extend a field with an explicit textarea mode. Preserve multiline values, limits, resize, registration and errors; chat composers may need different Enter behavior. |
| `raw_img` — Native images | 159 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F59E0B` | 40, 60 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D7D7E0` | 41, 61, 315 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 92 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E9F7ED` | 97 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#21812C` | 97, 110 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 101, 133, 143, 259, 315, 354, 363 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#6B6B80` | 102, 147 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#BFE5C6` | 110 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFFAF1` | 110 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D39B` | 110 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF8E5` | 110 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8B650B` | 110 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2DA33A` | 113 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 113, 156, 323, 354, 363 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#22232B` | 132 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E505C` | 142 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E2E3EA` | 156 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7F7FA` | 156 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#5F6078` | 260 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 266, 275, 289 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D66` | 284, 301 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF9EA` | 354, 363 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8EDCF` | 354, 363 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/components/OrderItemSummaryCard.jsx`

Shared/module dependencies: `../../../components/ui/display/StarRating`, `../../../utils/showMore`, `../../../utils/routeTokens`, `../../../utils/ecommerce`, `../utils/orderItems`, `../../../utils/pages/orderUtils`.

Source signals (line numbers): raw_img: 163;232 | literal_hex: 85;88;101;152;158;175;181;185;190;200;207;227;241;246;254;260;261;268;269;279;290;294.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 163, 232 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FF9F00` | 85 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#26A541` | 88 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FF6161` | 101 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E5E1DA` | 152 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E4CA8E` | 152 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FCFBF8` | 158, 227 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9E886A` | 175, 241 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#292929` | 181 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#707070` | 185 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#777777` | 190 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#202020` | 200 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EDE8DE` | 207 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1F2430` | 246, 260, 268, 279, 290 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#201B78` | 254 | Existing token: `var(--customer-navy)`. Use in the same CSS property; retain modifiers/opacity. |
| `#E4DDCF` | 260, 268 | Existing token: `var(--customer-border)`. Use in the same CSS property; retain modifiers/opacity. |
| `#FAF6EE` | 260, 268 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |
| `#6F7480` | 261, 269, 294 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/orders/components/OrderItemsSection.jsx`

Shared/module dependencies: `../../../components/ui/buttons/Button`, `../../../utils/showMore`, `../utils/orderItems`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/orders/components/OrderListStatusBadge.jsx`

Shared/module dependencies: `../../../utils/pages/orderUtils`.

Source signals (line numbers): literal_hex: 5;20.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D7A522` | 5 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 20 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/orders/components/OrderPackageCard.jsx`

Shared/module dependencies: `../utils/orderItems`, `../utils/orderTimelineUtils`.

Source signals (line numbers): literal_hex: 315;379.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E9DFC8` | 315 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFEFB` | 315 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFCF4` | 315 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 379 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF6EE` | 379 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/orders/components/OrderPaymentSummary.jsx`

Shared/module dependencies: `../../../components/ui/layout/DetailSectionCard`, `../../../utils/ecommerce/money`, `../../../utils/showMore`.

Source signals (line numbers): raw_button: 449;463 | raw_input: 385 | literal_hex: 19;29;38;68;71;90;93;171;182;184;192;196;216;228;239;246;276;286;297;308;323;333;342;348;356;371;382;391;395;412;426;436;453;466;475.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 449, 463 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 385 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#2E2E2E` | 19, 68, 90, 184, 371, 395, 475 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 29, 38, 71, 93, 192, 196 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#008425` | 38 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D66` | 171 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#04258626` | 182, 216, 228, 239, 276, 286, 297, 308, 323, 342, 356, 412, 426 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#65718B` | 246, 333, 348 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 382, 453, 466 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#3E4093` | 391 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#228B221A` | 436 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#117A65` | 436 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1F2430` | 453, 466 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/orders/components/OrderReturns.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../utils/pages/orderUtils`.

Source signals (line numbers): literal_hex: 34;123.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#3E4093` | 34 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#FFF7E6` | 123 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8A5A00` | 123 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/components/OrderTimeline.jsx`

Shared/module dependencies: `../../../utils/showMore`, `../utils/orderTimelineUtils`.

Source signals (line numbers): literal_hex: 87;88;96;126;127;136;137;138;154;155;162;249;254;269;270;277;294;295;305;306;316;317;327;328;335;339.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E53935` | 87, 136 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#26A541` | 88, 155, 254 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E0E0E0` | 96, 249 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D7D7D7` | 126, 269 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5F5F5` | 126, 269 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B0B0B0` | 127, 270 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 137, 154, 277, 294, 305, 316 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6F7480` | 138, 162, 277, 327 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 295, 306, 317, 328 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D60` | 335, 339 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/orders/components/ReturnStatus.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 65;67;70;75;76.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFF9EA` | 65 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 65 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#8A5A00` | 67, 75 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 70, 76 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/orders/components/ShipmentTrackingPanel.jsx`

Shared/module dependencies: `../../../components/ui/layout/DetailSectionCard`.

Source signals (line numbers): literal_hex: 26;27;31;73;74;163;165;166;176;185;197;206;217;230;273;280;304;308;318 | inline_currency: 10.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `inline_currency` — Inline currency/number formatting | 10 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D66` | 26 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 27, 73, 165 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#6F7480` | 31, 74, 308, 318 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#2E2E2E` | 163, 304 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F9F5EB` | 165 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8A5A00` | 166 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 176, 185, 197, 206, 217, 230 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#E0E0E0` | 273 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E53935` | 280, 304 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#26A541` | 280 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/pages/OrderDetailPage.jsx`

Shared/module dependencies: `../components/CancelOrderModal`, `../../../components/ui/ApiState`, `../../../components/ui/skeleton/skeletonPresets`, `../../../components/ui/Seo`, `../../../components/ui/buttons/Button`, `../../common/components/Breadcrumbs`, `../../../components/ui/layout/StickySidebarLayout`, `../components/OrderItemsSection`, `../components/OrderPaymentSummary`, `../components/OrderDetailInfoGrid`, `../controllers/useOrderDetail`, `../../../utils/pages/orderUtils`, `../../../utils/ecommerce`, `../../../components/ui/layout`.

Source signals (line numbers): literal_hex: 257;258;259;266;269;286 | brand_literal: 94.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 94 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E7D9B8` | 257 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 257 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 258, 286 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#3E4093` | 259 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D40` | 266 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D80` | 266 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 269 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 286 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFF9EA` | 286 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/orders/pages/OrderListPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../../components/ui/FilterDropdown`, `../../../components/ui/icons`, `../../../components/ui/layout`, `../../common/components/Breadcrumbs`, `../../products/components/Pagination`, `../../support/components/NeedHelpPanel`, `../controllers/useOrderList`, `../components/OrderItemReview`, `../components/OrderItemSummaryCard`, `../../../utils/routeTokens`, `../utils/orderItems`, `../../../components/ui/skeleton/layouts`, `../../../utils/pages/orderUtils`.

Source signals (line numbers): raw_button: 230 | raw_input: 218 | literal_hex: 215;226;234 | brand_literal: 199.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 230 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 218 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `brand_literal` — Brand-name literals | 199 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#9E886A` | 215 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E4CA8E` | 226 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1F2430` | 226, 234 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#6F7480` | 226, 234 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/orders/pages/OrdersPageLayout.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../utils/routeTokens`.

Source signals (line numbers): brand_literal: 37;48.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 37, 48 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/products/components/AddToCartButton.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_button: 12.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 12 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/modules/products/components/CollectionToolbar.jsx`

Shared/module dependencies: `../../../components/ui/CustomDropdown`.

Source signals (line numbers): raw_button: 63 | literal_hex: 38;50;66;68.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 63 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#03014D` | 38, 50, 66 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 66 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 66, 68 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#F8F3E7` | 66 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/DeliveryChecker.jsx`

Shared/module dependencies: `../../../components/ui/overlay/ConfirmModal`.

Source signals (line numbers): raw_button: 162;192 | raw_input: 272 | literal_hex: 157;167;182;258;259;268;291 | inline_currency: 324.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 162, 192 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 272 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `inline_currency` — Inline currency/number formatting | 324 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#6F7480` | 157 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#1B1D60` | 167, 182, 291 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#F4F4F8` | 167 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2F346F` | 182 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5E9C9` | 258 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#A96F14` | 259, 268 | Existing token: `var(--customer-gold-dark)`. Use in the same CSS property; retain modifiers/opacity. |
| `#CE9F2D` | 268, 291 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#DCDDE5` | 291 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8C8E9E` | 291 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/IconActionButton.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 8 | literal_hex: 11.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 8 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F5F8FB` | 11 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAF0F8` | 11 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ImageGallery.jsx`

Shared/module dependencies: `../../../utils/ecommerce`.

Source signals (line numbers): raw_button: 156;267;433 | raw_img: 192;213;305 | literal_hex: 208;240;291;404;412;421 | overlay_or_scroll_lock: 365;368;373;431;432.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 156, 267, 433 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 192, 213, 305 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 365, 368, 373, 431, 432 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 208, 240, 291 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#B88716` | 240 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 404, 412, 421 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/products/components/ImageVariantPicker.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../components/ui/HorizontalScrollControls`.

Source signals (line numbers): raw_button: 58 | raw_img: 72.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 58 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 72 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

## `customer/src/modules/products/components/Pagination.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_button: 38;50;67.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 38, 50, 67 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/modules/products/components/Price.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../utils/common`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/products/components/ProductActionButtons.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../components/ui/overlay/NotifyMeModal`.

Source signals (line numbers): raw_button: 21;32;48 | literal_hex: 27;42;51.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 21, 32, 48 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFF8E8` | 27 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF1CC` | 27 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#A97810` | 42, 51 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ProductCard.jsx`

Shared/module dependencies: `../../../components/ui/label/Label`, `../../../components/ui/button/static`, `../../wishlist/components/WishlistButton`, `../../../utils/stringUtils`, `../../../utils/ecommerce`, `../../../utils/common`, `../../../components/ui/display/StarRating`.

Source signals (line numbers): raw_button: 445;534;694 | raw_img: 396;609 | literal_hex: 421;455;527;528;547;553;554;563;569;584;639;663;673;674;682;697;707;720 | inline_currency: 80.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 445, 534, 694 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 396, 609 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_currency` — Inline currency/number formatting | 80 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 421, 455, 547, 569, 663, 674, 682, 720 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#EAE2D3` | 527 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 527, 528, 563, 639, 697 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#E11D48` | 553, 554 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF8F5` | 584 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 673 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B8860B` | 697 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#171A3A` | 707 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ProductFilterSidebar.jsx`

Shared/module dependencies: `../../../utils/stringUtils`.

Source signals (line numbers): raw_button: 93;104;119;399;464;740;947 | raw_input: 79;348;359;520;700;785;848 | literal_hex: 14;21;75;77;78;91;96;107;112;122;335;339;372;380;389;402;459;460;473;479;551;630;725;733;743;766;806;872;880;897;940;943;944;950 | inline_currency: 390;392;393.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 93, 104, 119, 399, 464, 740, 947 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 79, 348, 359, 520, 700, 785, 848 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `inline_currency` — Inline currency/number formatting | 390, 392, 393 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#434343` | 14 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 21, 112, 479 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#B8BBC5` | 21 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EEDFB9` | 75, 897, 940, 943 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F4F4F6` | 77, 122 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6F7480` | 78, 122, 630, 733, 766 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#2E2E2E` | 91 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8D8F98` | 91 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#5960B8` | 96 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 107, 743, 944, 950 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#ECECF0` | 122 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E6E1D8` | 335 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 339, 372, 380, 402 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#111111` | 389 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#374151` | 459, 460 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#999` | 473 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#888` | 551 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#373737` | 725, 806, 880 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D4A025` | 872 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF8` | 940 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ProductGrid.jsx`

Shared/module dependencies: `../../../components/ui/display/ResponsiveGrid`, `../../../utils/ecommerce`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/products/components/ProductListingLayout.jsx`

Shared/module dependencies: `../../../components/ui/Seo`.

Source signals (line numbers): brand_literal: 43.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 43 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/modules/products/components/ProductPriceBlock.jsx`

Shared/module dependencies: `../../../utils/common`, `../../../utils/ecommerce`.

Source signals (line numbers): literal_hex: 22;30;40;51;61.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 22 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#212121` | 30 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#878787` | 40, 61 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FDECEC` | 51 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D32F2F` | 51 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ProductResultsLayout.jsx`

Shared/module dependencies: `../../../components/ui/ApiState`, `../../../components/ui/ActiveFilterChips`, `../../../components/ui/overlay/Drawer`, `../../../components/ui/Loader`.

Source signals (line numbers): raw_button: 180 | literal_hex: 188.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 180 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#3E4093` | 188 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/products/components/ProductReviewsSection.jsx`

Shared/module dependencies: `../../orders/utils/orderItems`, `../../../utils/ecommerce`, `../../../utils/showMore`, `../../../components/ui/feedback/EmptyState`, `../../../components/ui/display/StarRating`.

Source signals (line numbers): raw_button: 148;199;367;655;686;721;729 | raw_input: 324 | raw_select: 290 | raw_textarea: 339 | raw_img: 155 | literal_hex: 37;38;106;120;125;132;139;153;176;177;180;189;192;205;206;211;279;281;287;295;310;321;331;336;348;350;377;396;397;398;399;400;618;619;620;635;643;668;671;677;689;704;708;713;724;732;757;765;800;804 | inline_date: 64.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 148, 199, 367, 655, 686, 721, 729 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 324 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_select` — Native selects | 290 | Compare `components/ui/inputs/SelectInput.jsx` and `components/ui/SelectField.jsx`; adopt one native-select contract for label/options/error/registration. Preserve value normalization, placeholder, disabled state and any no-options text fallback. Do not replace a native select with a custom dropdown solely for reuse. |
| `raw_textarea` — Native textareas | 339 | Add a shared `TextareaField` using the existing input label/error conventions, or extend a field with an explicit textarea mode. Preserve multiline values, limits, resize, registration and errors; chat composers may need different Enter behavior. |
| `raw_img` — Native images | 155 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_date` — Inline date formatting | 64 | Reuse a shared date formatter based on existing `utils/orderHelpers.js`, `modules/orders/utils/orderItems.js` or support formatters. Keep explicit locale/timezone and date-only vs datetime vs relative-time options, with invalid/missing fallback. Consolidate matching behavior rather than assuming these helpers are interchangeable. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 37, 125, 139, 176, 205, 206, 211, 295, 331, 348, 377, 396, 397, 689, 713, 804 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#D1D5DB` | 38 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 106, 153, 206, 279, 295, 331, 348, 671, 708, 765, 800 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1F2430` | 120, 189 | Existing token: `var(--customer-ink)`. Use in the same CSS property; retain modifiers/opacity. |
| `#4E4E4E` | 132 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF6EE` | 176, 206, 671, 708, 757 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |
| `#A96F14` | 177, 377, 689, 708, 713 | Existing token: `var(--customer-gold-dark)`. Use in the same CSS property; retain modifiers/opacity. |
| `#6F7480` | 180, 206, 287, 310, 321, 336, 635, 643, 677 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#737373` | 192, 350 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 205, 206, 281, 704, 724, 732 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#EAB308` | 398 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F97316` | 399 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EF4444` | 400 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E5E7EB` | 618, 619 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#111827` | 620 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 668 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#15115D` | 724 | Existing token: `var(--customer-navy-dark)`. Use in the same CSS property; retain modifiers/opacity. |
| `#F4F4FA` | 732 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ProductSection.jsx`

Shared/module dependencies: `../../common/components/SectionHeader`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/products/components/ProductServiceBadges.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 32;33;34;35;45;46;47;48;57;58;59;60;70;71;72;73;81;82;83;84;135;143;166;169 | inline_currency: 15.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `inline_currency` — Inline currency/number formatting | 15 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F3F2FC` | 32 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DCD9F2` | 33 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#302A87` | 34 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#211B70` | 35, 48, 60, 84 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF8EC` | 45, 57, 81 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F0DDBB` | 46, 58, 82 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DDA51D` | 47, 59, 83 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFF8F1` | 70 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D3E9D8` | 71 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#25804B` | 72 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#185C36` | 73 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D8D5E3` | 135 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#73758A` | 143 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8E8C6` | 166 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#875900` | 169 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ProductStockStatus.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): literal_hex: 33;35 | inline_currency: 21.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `inline_currency` — Inline currency/number formatting | 21 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#008425` | 33, 35 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/Rating.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../utils/common`.

Source signals (line numbers): literal_hex: 25;34.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#388E3C` | 25 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 25 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#2E2E2E` | 34 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ReviewImageUploader.jsx`

Shared/module dependencies: `../../../utils/notify`.

Source signals (line numbers): raw_button: 175;188 | raw_input: 212 | raw_img: 165 | literal_hex: 153;154;163;177;190;207.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 175, 188 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 212 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. Explicit file input(s) near lines 212: keep native file selection and its ref/reset behavior; share upload validation/preview lifecycle separately from endpoint-specific upload policy. |
| `raw_img` — Native images | 165 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#2E2E2E` | 153 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#777890` | 154, 207 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D7D7E0` | 163 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7F7FA` | 163 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 177, 190 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 190 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#CE9F2D0D` | 190 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D1A` | 190 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/ReviewMediaLightbox.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 117;131;152;167;194;244;256 | raw_img: 143;178 | literal_hex: 113;120;134;155;165;174;175;209;217;225;232;234;249;253 | inline_date: 84 | overlay_or_scroll_lock: 101.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 117, 131, 152, 167, 194, 244, 256 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 143, 178 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_date` — Inline date formatting | 84 | Reuse a shared date formatter based on existing `utils/orderHelpers.js`, `modules/orders/utils/orderItems.js` or support formatters. Keep explicit locale/timezone and date-only vs datetime vs relative-time options, with invalid/missing fallback. Consolidate matching behavior rather than assuming these helpers are interchangeable. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 101 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FFFDF8` | 113 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF4E8` | 113, 165 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7EED8` | 113 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAD9B6` | 113, 120, 134, 155, 175 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 120, 134, 155 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#E8DAAF` | 165 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 174, 209, 249, 253 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#22A447` | 209 | Existing token: `var(--customer-success)`. Use in the same CSS property; retain modifiers/opacity. |
| `#282C3F` | 217, 234 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E4E4E` | 225 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#737373` | 232 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/SizeChartSidebar.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`.

Source signals (line numbers): raw_button: 33 | literal_hex: 29;66;67;79;108 | overlay_or_scroll_lock: 9;11;14;21;24.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 33 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 9, 11, 14, 21, 24 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F5F8FB` | 29 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E4E4E` | 66, 67, 79, 108 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/VariantSelector.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../utils/pages/productUtils`, `../../../components/ui/HorizontalScrollControls`.

Source signals (line numbers): raw_button: 63;143;216 | raw_img: 168 | literal_hex: 155;238;240;242;255;265;273.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 63, 143, 216 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 168 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D9D1C4` | 155, 238 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F3F2FB` | 240 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F4F4F5` | 242 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#806461` | 242, 255 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#85858A` | 265, 273 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/components/socialMediaShare.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 23 | literal_hex: 26.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 23 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#FDF5E3` | 26 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B8860B` | 26 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/controllers/getFilterSections.jsx`

Shared/module dependencies: `../components/ProductFilterSidebar`, `../../../utils/filterUtils`, `../../../utils/stringUtils`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/products/controllers/useProductsPageController.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../../utils/filterUtils`, `../../../utils/stringUtils`, `../utils/productFilterToken`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/products/pages/ProductDetailPage.jsx`

Shared/module dependencies: `../controllers`, `../controllers/actions`, `../components/ProductServiceBadges`, `../../../utils/ecommerce`, `../components/ProductPriceBlock`, `../../../utils/showMore`, `../../../components/ui/skeleton/layouts`, `../../cart/components/QuantitySelector`, `../components/ImageGallery`, `../components/DeliveryChecker`, `../components/VariantSelector`, `../components/ImageVariantPicker`, `../components/ProductActionButtons`, `../../../components/ui/display/StarRating`, `../../../utils/stringUtils`, `../../../components/ui/AppErrorBoundary`, `../../../components/ui/ApiState`, `../../../components/ui/Seo`, `../../common/components/Breadcrumbs`, `../../../components/ui/layout`.

Source signals (line numbers): literal_hex: 250;255;267;268;275;293;294;295;343.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 250, 255, 275 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D60` | 267, 268, 293 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#9CA3AF` | 294 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E8F5E9` | 295 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#16833B` | 295 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6F7480` | 343 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/products/pages/ProductsPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../components/ProductListingLayout`, `../components`, `../controllers`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/products/sections/ProductInfoSection.jsx`

Shared/module dependencies: `../../../utils/common`, `../../../utils/ecommerce`, `../../../utils/stringUtils`, `../components/ImageGallery`, `../../../components/ui/HorizontalScrollControls`.

Source signals (line numbers): raw_button: 70;177;219;411 | raw_img: 394 | literal_hex: 31;40;41;73;335;336;340;374;375;376;377 | inline_date: 364 | overlay_or_scroll_lock: 409;410.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 70, 177, 219, 411 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 394 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_date` — Inline date formatting | 364 | Reuse a shared date formatter based on existing `utils/orderHelpers.js`, `modules/orders/utils/orderItems.js` or support formatters. Keep explicit locale/timezone and date-only vs datetime vs relative-time options, with invalid/missing fallback. Consolidate matching behavior rather than assuming these helpers are interchangeable. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 409, 410 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#160` | 31, 40, 41 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 73 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#E7D9B8` | 335 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAD8B3` | 336 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E9E1D3` | 340, 374 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAFCFA` | 374 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#16833B` | 375, 376 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#C8C8C8` | 377 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/products/sections/ProductRecommendationSection.jsx`

Shared/module dependencies: `../../../modules/products/components/ProductCard`, `../../../utils/ecommerce`, `../../../components/ui/SectionContainer`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/modules/returns/components/ReturnItemCard.jsx`

Shared/module dependencies: `../../../components/ui`, `../../../utils/ecommerce`, `../../../utils/showMore`, `../../../utils/stringUtils`, `../../../utils/notify`.

Source signals (line numbers): raw_button: 77;226 | literal_hex: 22;25;28;30;69;72;73;74;75;76;81;91;92;94;136;149;153;164;169;170;177;183;185;186;187;191;197;202;203;204;208;214;215;219;225;229 | brand_literal: 38.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 77, 226 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `brand_literal` — Brand-name literals | 38 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E6F4EA` | 22 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#0D652D` | 22, 204, 208 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CEEAD6` | 22 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FCE8E6` | 25 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#C5221F` | 25 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAD2CF` | 25 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E8F0FE` | 28 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1967D2` | 28 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D2E3FC` | 28 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF8E7` | 30 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9A6D00` | 30 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FCE8B3` | 30 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 69 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFCF6` | 69 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFE5D2` | 72, 185, 202, 225 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFDF9` | 72, 183 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E4E4E` | 73 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 74, 76, 136, 191, 219 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#6E6E6E` | 75, 91, 169, 186, 203, 214 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF3E0` | 81 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#7A7365` | 81 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 81, 92, 136, 149, 153, 164, 187, 197, 215, 229 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#2E2E2E` | 94, 170, 177 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F3F4F6` | 170 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E4CA8E` | 183 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/returns/components/ReturnTrackingCard.jsx`

Shared/module dependencies: `../../../utils/showMore`.

Source signals (line numbers): literal_hex: 18;19;20;21;42;48;64;65;72;77;82;89.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EAEFF5` | 18 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAFBFD` | 18 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 19, 21, 72 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#3E4093` | 20, 82 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#E0E0E0` | 42 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#26A541` | 48 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D7D7D7` | 64 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5F5F5` | 64 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B0B0B0` | 65 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6E6E6E` | 77 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#6F7480` | 89 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/returns/pages/ReturnsPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/buttons/Button`, `../../../components/ui/CustomDropdown`, `../../../utils/showMore`, `../controllers/useReturnRequest`, `../../../utils/pages/returnUtils`, `../../../utils/routeTokens`.

Source signals (line numbers): raw_button: 154 | raw_input: 111;112;279 | raw_textarea: 339 | raw_img: 168 | literal_hex: 61;63;66;67;69;74;78;81;85;96;97;101;116;161;163;164;174;177;183;191;196;200;213;234;235;275;289;291;297;335;344;355;357;360;364;371;381;390;411;415;421;436 | inline_currency: 197;365;366;400;401 | brand_literal: 57.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 154 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 111, 112, 279 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. Explicit hidden input(s) near lines 111, 112: keep native hidden form wiring; do not add a visible field. |
| `raw_textarea` — Native textareas | 339 | Add a shared `TextareaField` using the existing input label/error conventions, or extend a field with an explicit textarea mode. Preserve multiline values, limits, resize, registration and errors; chat composers may need different Enter behavior. |
| `raw_img` — Native images | 168 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_currency` — Inline currency/number formatting | 197, 365, 366, 400, 401 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |
| `brand_literal` — Brand-name literals | 57 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#5E6472` | 61, 78, 81, 96, 101, 200, 291, 411 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 61, 74, 116, 183, 275, 335, 364, 390 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 63, 69, 85, 97, 161, 164, 177, 191, 234, 289, 344, 436 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#E7D9B8` | 66, 69, 101, 164, 289, 297, 344, 355, 360, 415 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFE5D2` | 67, 174, 177, 371 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF8E7` | 69, 177, 297, 360 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFCF6` | 101 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E5E5E5` | 163 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 196, 289, 344, 381 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#10B981` | 213 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D6B45B` | 235 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#855B14` | 297, 360, 415 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFBF0` | 355 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9A7A27` | 357, 421 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8F1E2` | 415 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B68A22` | 436 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/returns/pages/ReturnsRefundsPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../common/components/Breadcrumbs`, `../../../components/ui/ApiState`, `../../../components/ui/FilterDropdown`, `../../../utils/notify`, `../../../components/ui/icons`, `../components/ReturnItemCard`, `../components/ReturnTrackingCard`, `../../../components/ui/skeleton/layouts`, `../../../components/ui/AppErrorBoundary`, `../../../utils/ecommerce`, `../controllers/useReturnsRefunds`, `../../../components/ui/layout`, `../../../components/ui/feedback/EmptyState`.

Source signals (line numbers): raw_button: 416;424;441;559 | raw_textarea: 391;403 | literal_hex: 288;356;420;451;528;532;562;565 | inline_currency: 113;127;387 | inline_date: 159;168;302 | brand_literal: 295;510.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 416, 424, 441, 559 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_textarea` — Native textareas | 391, 403 | Add a shared `TextareaField` using the existing input label/error conventions, or extend a field with an explicit textarea mode. Preserve multiline values, limits, resize, registration and errors; chat composers may need different Enter behavior. |
| `inline_currency` — Inline currency/number formatting | 113, 127, 387 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |
| `inline_date` — Inline date formatting | 159, 168, 302 | Reuse a shared date formatter based on existing `utils/orderHelpers.js`, `modules/orders/utils/orderItems.js` or support formatters. Keep explicit locale/timezone and date-only vs datetime vs relative-time options, with invalid/missing fallback. Consolidate matching behavior rather than assuming these helpers are interchangeable. |
| `brand_literal` — Brand-name literals | 295, 510 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E4CA8E` | 288 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFCF6` | 288 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#454545` | 356, 532 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 420, 451, 562 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#1B1D60` | 528 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 562, 565 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFEFC8` | 562 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/support/components/AiSupportChatWidget.jsx`

Shared/module dependencies: `../controllers/useSupportController`.

Source signals (line numbers): raw_button: 302;360;453;507;547 | raw_input: 528 | literal_hex: 42;307;329;336;374;404;429;460;515;527;557.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 302, 360, 453, 507, 547 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 528 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#3E4093` | 42, 329 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#1B1D60` | 42, 307, 329, 336, 404, 429, 460, 515, 527, 557 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#252877` | 307, 460, 557 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7F8FC` | 374 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/support/components/NeedHelpPanel.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 140;148 | literal_hex: 31;41;48;61;62;76;77;78;81;93;108;122;129.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 140, 148 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F0E6D2` | 31 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FCFAF2` | 41 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 48, 108 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFE5D2` | 61, 62 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D6099` | 76 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F3F3F7` | 77 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#25247B` | 78, 81, 122, 129 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 93 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/modules/support/components/RaiseTicketModal.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`, `../../../components/ui/overlay/BaseModal`, `../../../components/ui/CustomDropdown`, `../controllers/useSupportController`.

Source signals (line numbers): raw_button: 155 | raw_input: 129 | raw_textarea: 143 | literal_hex: 95;108;133;134;149;158.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 155 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 129 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_textarea` — Native textareas | 143 | Add a shared `TextareaField` using the existing input label/error conventions, or extend a field with an explicit textarea mode. Preserve multiline values, limits, resize, registration and errors; chat composers may need different Enter behavior. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 95 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 108, 134, 149, 158 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1234` | 133 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B88B22` | 158 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/support/components/SupportTicketSidebar.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 49 | literal_hex: 17;45;46;52;54;61;64;69;70;79;85;86;89;93;94;97;102;103;106;111;112;115;125;126;129;137;138;145;153;157 | overlay_or_scroll_lock: 23;25;28;38.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 49 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `overlay_or_scroll_lock` — Overlay/scroll lifecycle | 23, 25, 28, 38 | Reuse or extend `components/ui/overlay/BaseModal.jsx`, `ConfirmModal.jsx` or `Drawer.jsx`, plus `hooks/useAnimatedPresence.js`. Share nested scroll-lock/focus/Escape lifecycle before migrating. Preserve backdrop/close rules, pending actions, scroll restoration, z-index and animation. Drawer currently has `lg:hidden`; desktop sidebars need an extension. Fullscreen loading blockers are feedback, not dialogs. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E7D9B8` | 17, 45, 115 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF9EA` | 17, 52 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8A640D` | 17 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 46 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 54 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#666666` | 61, 70, 79, 86, 94, 103, 112, 126, 138, 153 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 64, 89, 97, 106 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFE5D2` | 69, 85, 93, 102, 111, 125, 137, 145 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E4E4E` | 115, 129, 157 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7EED8` | 115 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/support/components/TicketSuccessModal.jsx`

Shared/module dependencies: `../../../hooks/useAnimatedPresence`, `../../../components/ui/overlay/BaseModal`, `../controllers/useSupportController`.

Source signals (line numbers): raw_button: 32 | literal_hex: 15;19;23;26;35.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 32 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E8F8F5` | 15 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#117A65` | 15 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1B1D60` | 19 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#4E4E4E` | 23 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 26 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 35 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#C9961F` | 35 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/support/pages/SupportHelpCenter.jsx`

Shared/module dependencies: `../../../components/ui/CustomDropdown`, `../../../components/ui/Seo`, `../../../components/ui/PageIntroBanner`, `../../../components/ui/ApiState`, `../../common/components/Breadcrumbs`, `../components/NeedHelpPanel`, `../../../components/ui/layout/StickySidebarLayout`, `../controllers/useSupportController`, `../../../components/ui/skeleton/layouts`, `../../../components/ui/AppErrorBoundary`, `../../../components/ui/skeleton`, `../../../hooks/useCmsRecord`, `../../../components/faq/FAQContentSection`, `../utils/supportUtils`.

Source signals (line numbers): raw_img: 214;264 | literal_hex: 198;201;211;213;223;228;234;249;250;251;263;274;285;286;287;315;316;317;323;368;369;370;376;387;411;419;436;440 | brand_literal: 166;189.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 214, 264 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 166, 189 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 198, 223, 376, 436 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#666666` | 201, 228, 323, 419, 440 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E5E8F0` | 211 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D4A12F` | 211, 234 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFFAEF` | 211 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF5DF` | 213 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8A8FA3` | 234 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 249, 285, 315, 368 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7EED8` | 250, 286, 316, 369 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E2E2E` | 251, 274, 287, 317, 370 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5C72E` | 263 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 376 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFF9EA` | 376 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFE5D2` | 387 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CB4335` | 411 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/support/pages/SupportTicketDetailsPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../common/components/Breadcrumbs`, `../../../components/ui/AppErrorBoundary`, `../../../components/ui/buttons/Button`, `../utils/supportUtils`, `../../../hooks/useProfileImage`.

Source signals (line numbers): raw_button: 400;443 | raw_input: 435 | raw_img: 93 | literal_hex: 57;59;60;68;77;81;97;100;331;339;340;341;347;378;379;380;411;432;434;441;448;449;459;460;463;466;487;500;501;507;511;525 | brand_literal: 321;322;387;420.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 400, 443 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_input` — Native inputs | 435 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `raw_img` — Native images | 93 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 321, 322, 387, 420 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 57, 77, 100, 331, 340, 379, 463, 507 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#2B2E85` | 57 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E7D9B8` | 59, 339 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF9EA` | 59 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#4E4E4E` | 59 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E5DEC9` | 60 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2D3142` | 60 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F3E6C8` | 68 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FDF8EB` | 68 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#C49216` | 68 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#717684` | 77, 511 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9AA0AF` | 81 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 97, 331, 347, 434, 448 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#666666` | 341, 466, 525 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B88200` | 347, 448 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E3DCCE` | 378, 432, 459, 460, 500 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#111538` | 379 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#252875` | 379 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5C451` | 380 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F8F7F4` | 411 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DDD8C9` | 434 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5F4F0` | 434 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#1E2338` | 441 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8A8F9C` | 441 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#DCDAD2` | 449 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF6ED` | 460 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F3EAD7` | 460 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7EED8` | 487 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFBF3` | 500 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F9F7F1` | 501 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E3142` | 507 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/wallet/pages/PaymentsPage.jsx`

Shared/module dependencies: `../../common/components/Breadcrumbs`, `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../../utils/ecommerce`, `../../../components/ui/layout`.

Source signals (line numbers): literal_hex: 49;50;51;57;72;74;75;100;103;108;112;120;132;139 | inline_date: 84 | brand_literal: 30.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `inline_date` — Inline date formatting | 84 | Reuse a shared date formatter based on existing `utils/orderHelpers.js`, `modules/orders/utils/orderItems.js` or support formatters. Keep explicit locale/timezone and date-only vs datetime vs relative-time options, with invalid/missing fallback. Consolidate matching behavior rather than assuming these helpers are interchangeable. |
| `brand_literal` — Brand-name literals | 30 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#E7D9B8` | 49, 75, 103 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFE5D2` | 50, 57, 132 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFCF6` | 50, 100 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#855B14` | 51, 75, 112 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E8F5E9` | 72 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#2E7D32` | 72 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#A5D6A7` | 72 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFEBEE` | 74 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#C62828` | 74 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EF9A9A` | 74 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF8E7` | 75, 103 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#CE9F2D` | 103 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D60` | 108, 139 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#F8F1E2` | 112 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#5E6472` | 120 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/wallet/pages/WalletPage.jsx`

Shared/module dependencies: `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../../utils/ecommerce`, `../../../components/ui/skeleton/layouts`, `../../../modules/common/components/Breadcrumbs`, `../../../components/ui/layout`.

Source signals (line numbers): literal_hex: 52;53;56;57;61;66;67;77;78 | brand_literal: 34.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 34 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 52, 56, 57, 66, 77 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#FFFDF8` | 52 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF9E6` | 52 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF1C9` | 52 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFC82E` | 53, 66 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8C620D` | 61, 66, 67, 77, 78 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D6A323` | 77 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/modules/wishlist/components/WatchlistItemCard.jsx`

Shared/module dependencies: `../../../utils/ecommerce`, `../../products/components/ProductCard`, `../../../components/ui/button/static`.

Source signals (line numbers): raw_button: 199;221 | raw_img: 141 | literal_hex: 160;228;251.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 199, 221 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 141 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#1B1D60` | 160, 228 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#CE9F2D` | 251 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#BD9025` | 251 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/modules/wishlist/components/WishlistButton.jsx`

Shared/module dependencies: `../../../utils/common`.

Source signals (line numbers): raw_button: 11.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 11 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

## `customer/src/modules/wishlist/pages/WatchListPage.jsx`

Shared/module dependencies: `../../../components/ui`, `../components/WatchlistItemCard`, `../../products/controllers/actions`, `../../../hooks/useWatchlistProducts`, `../../common/components/Breadcrumbs`, `../../../utils/ecommerce`, `../../../components/ui/button/static`, `../../../components/ui/skeleton`.

Source signals (line numbers): literal_hex: 144;154 | brand_literal: 73.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 73 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 144 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#18156D` | 154 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#3E4093` | 154 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |

## `customer/src/pages/NotFoundPage.jsx`

Shared/module dependencies: `../components/ui/Seo`.

Source signals (line numbers): brand_literal: 9.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 9 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/pages/about/AboutPage.jsx`

Shared/module dependencies: `../../hooks/useCmsRecord`, `../../components/ui/Seo`, `./components/AboutBanner`, `./components/InfoSection`, `./components/OurStory`, `./components/ValuesSection`, `./components/WhyChooseSection`.

Source signals (line numbers): brand_literal: 70;71.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 70, 71 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/pages/about/components/AboutBanner.jsx`

Shared/module dependencies: `../../../components/ui/FallbackImage`, `../../../components/ui/button/static`.

Source signals (line numbers): literal_hex: 11 | brand_literal: 16.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 16 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EAE0D5` | 11 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/pages/about/components/BrandSection.jsx`

Shared/module dependencies: `../../../components/ui/skeleton`, `../../../hooks/useDelayedLoading`, `../../../components/swiper/InfiniteLoopSwiper`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/pages/about/components/InfoSection.jsx`

Shared/module dependencies: `../../../components/ui/FallbackImage`.

Source signals (line numbers): literal_hex: 23.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D9B15A` | 23 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/pages/about/components/OurStory.jsx`

Shared/module dependencies: `../../../components/ui/skeleton`, `../../../hooks/useDelayedLoading`, `../../../components/ui/FallbackImage`.

Source signals (line numbers): raw_button: 9 | brand_literal: 32.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 9 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `brand_literal` — Brand-name literals | 32 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/pages/about/components/ValueCard.jsx`

Shared/module dependencies: `../../../components/ui/FallbackImage`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/pages/about/components/ValuesSection.jsx`

Shared/module dependencies: `../../../components/ui/skeleton`, `../../../hooks/useDelayedLoading`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/pages/about/components/WhyChooseCard.jsx`

Shared/module dependencies: `../../../components/ui/FallbackImage`.

Source signals (line numbers): literal_hex: 17.

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D9B15A` | 17 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/pages/about/components/WhyChooseSection.jsx`

Shared/module dependencies: `../../../hooks/useDelayedLoading`, `../../../components/ui/skeleton`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/pages/cms/CmsPage.jsx`

Shared/module dependencies: `../../components/ui/Seo`, `../../components/ui/PageIntroBanner`, `../../components/ui/ApiState`, `../../components/ui/AppErrorBoundary`, `../../components/ui/layout/PageContainer`, `../../components/policy/PolicySection`, `../../utils/apiErrors`.

Source signals (line numbers): brand_literal: 180.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 180 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/pages/contact/ContactUs.jsx`

Shared/module dependencies: `../../components/ui/Seo`, `../../components/ui/PageIntroBanner`, `../../components/ui/CustomDropdown`, `../../components/ui/overlay/BaseModal`, `../../components/ui/layout/PageContainer`, `../../components/ui/Loader`, `../../components/ui/inputs`, `../../hooks/useCmsRecord`.

Source signals (line numbers): raw_button: 262;307;418 | raw_textarea: 393 | literal_hex: 58;180;182;185;186;199;204;213;217;227;230;231;234;237;244;246;249;250;269;270;276;277;300;303;310;368;381;389;399;407;408;409;412;421 | brand_literal: 102;165;235.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 262, 307, 418 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_textarea` — Native textareas | 393 | Add a shared `TextareaField` using the existing input label/error conventions, or extend a field with an explicit textarea mode. Preserve multiline values, limits, resize, registration and errors; chat composers may need different Enter behavior. |
| `brand_literal` — Brand-name literals | 102, 165, 235 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#D8DCE8` | 58, 381, 399 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#171B3F` | 58, 204, 270, 368, 381, 389, 399 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9298AA` | 58, 399 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B9A36B` | 58, 381, 399 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D4A12F` | 58, 185, 199, 249, 269, 270, 310, 381, 399, 421 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#E5E8F0` | 180, 227, 244 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#171B65` | 182, 231, 237, 246, 269, 277, 300, 409 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#626982` | 186, 213, 234, 250, 303, 408 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FBF5E9` | 199 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B98212` | 199, 276, 310, 421 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#858BA0` | 217, 412 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E9D9B5` | 230 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFFAEF` | 230, 270 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FFF7E7` | 269 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E0E4EE` | 270 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5F6FA` | 277 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EEF0F5` | 407 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/pages/downloadApp/DownloadApp.jsx`

Shared/module dependencies: `../../components/ui/Seo`, `../../hooks/useCmsRecord`.

Source signals (line numbers): raw_img: 276;355;383 | literal_hex: 270 | brand_literal: 264;265;281;388.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_img` — Native images | 276, 355, 383 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 264, 265, 281, 388 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#111653` | 270 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/pages/faq/FAQPage.jsx`

Shared/module dependencies: `../../components/ui/Seo`, `../../components/ui/PageIntroBanner`, `../../components/ui/Loader`, `../../components/faq/FAQContentSection`, `../../modules/common/components/Breadcrumbs`, `../../components/ui/layout/PageContainer`, `../../hooks/useCmsRecord`.

Source signals (line numbers): literal_hex: 95 | brand_literal: 67;81.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 67, 81 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#201B78` | 95 | Existing token: `var(--customer-navy)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/pages/policiesPage/PoliciesPages.jsx`

Shared/module dependencies: `../../components/ui/Seo`, `../../components/ui/PageIntroBanner`, `../../components/ui/ApiState`, `../../components/ui/skeleton/skeletonPresets`, `../../components/policy/PolicySection`, `../../hooks/useCmsRecord`, `../../components/ui/layout/PageContainer`.

Source signals (line numbers): brand_literal: 132;133;152;153.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 132, 133, 152, 153 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/pages/reviewAndRating/ReviewDetailsPage.jsx`

Shared/module dependencies: `../../components/ui/CustomDropdown`, `../../modules/products/components/ReviewMediaLightbox`, `../../components/ui/Seo`, `../../components/ui/AppErrorBoundary`, `../../utils/showMore`, `../../components/ui/display/StarRating`, `../../utils/ecommerce`, `../../utils/pages/reviewUtils`.

Source signals (line numbers): raw_button: 178;315;343;459;472 | raw_img: 101;321 | literal_hex: 90;219;292;306 | inline_currency: 166 | inline_date: 267 | brand_literal: 633;634.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 178, 315, 343, 459, 472 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 101, 321 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `inline_currency` — Inline currency/number formatting | 166 | Use `utils/ecommerce/money.js`: `formatMoney` for monetary values and `formatAmount` for plain numeric amounts. Inspect the value first: count/rating formatting is not currency. Preserve locale, fraction digits, zero/missing values, negative refunds and abbreviations; keep backend totals authoritative. |
| `inline_date` — Inline date formatting | 267 | Reuse a shared date formatter based on existing `utils/orderHelpers.js`, `modules/orders/utils/orderItems.js` or support formatters. Keep explicit locale/timezone and date-only vs datetime vs relative-time options, with invalid/missing fallback. Consolidate matching behavior rather than assuming these helpers are interchangeable. |
| `brand_literal` — Brand-name literals | 633, 634 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#CE9F2D` | 90, 219, 292, 306 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#1B1D60` | 90, 219 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#FFF9EA` | 219 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EAD9B6` | 219 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/pages/seller/becomeASeller/becomeASeller.jsx`

Shared/module dependencies: `../../../components/swiper/CustomSwiper`, `../../../components/ui/banner/PageHeroBanner`, `../../../components/ui/Seo`, `../../../components/ui/Loader`, `../../../components/ui/FallbackImage`, `../../../components/ui/buttons/Button`, `../../../hooks/useCmsRecord`, `../../../config/seller`, `../../../components/ui/button/static`.

Source signals (line numbers): raw_button: 354;361 | raw_img: 117 | literal_hex: 77;85;94;114;127;137;142;147;150;156;273;281;311;326;334;339;341;345;356;363;439;442;447;461;463;469;492;509;511;521 | brand_literal: 250;253;348;448;497.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 354, 361 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |
| `raw_img` — Native images | 117 | Reuse `components/ui/FallbackImage.jsx` for ordinary images needing a fallback. Consolidate with `display/ImageWithFallback.jsx` if skeleton loading is required. Preserve alt text, dimensions, loading priority, object-fit and source-change behavior. Keep gallery/zoom/video and uploaded-preview behavior specialized. |
| `brand_literal` — Brand-name literals | 250, 253, 348, 448, 497 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#F1C65F` | 77 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5EDDB` | 77 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#9C6A0A` | 77 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#201B78` | 85, 127, 339, 356, 363 | Existing token: `var(--customer-navy)`. Use in the same CSS property; retain modifiers/opacity. |
| `#6F7480` | 94, 345 | Existing token: `var(--customer-subtle)`. Use in the same CSS property; retain modifiers/opacity. |
| `#E8E5DF` | 114 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#181928` | 137 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#3E4093` | 142 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#EEE9DF` | 147 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#50545E` | 150 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7F2E7` | 156 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8D610D` | 156 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#EFC75F` | 273, 281, 311 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF6EE` | 326 | Existing token: `var(--customer-cream)`. Use in the same CSS property; retain modifiers/opacity. |
| `#F1E5C9` | 334 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#8D5D08` | 334 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B17D15` | 341 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D9D1C3` | 356, 363 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#999` | 356, 363 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FAF8F3` | 439 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5E9C6` | 442 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B88400` | 442 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#18156D` | 447, 463, 469 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#E8E1D4` | 461 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D4A52A` | 461 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#17145F` | 492, 511 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#D6A323` | 509, 511, 521 | Existing token: `var(--customer-gold)`. Use in the same CSS property; retain modifiers/opacity. |

## `customer/src/pages/seller/sellerPolicy/sellerPolicy.jsx`

Shared/module dependencies: `../../../components/ui/button/static`, `../../../components/ui/banner/PageHeroBanner`, `../../../components/ui/Seo`, `../../../components/ui/ApiState`, `../../../components/ui/FallbackImage`, `../../../components/ui/skeleton/skeletonPresets`, `../../../hooks/useCmsRecord`.

Source signals (line numbers): literal_hex: 225;247;257;261;269;289;291;297;324;332;352;354;360;382;386;394;414;416 | brand_literal: 206;207.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 206, 207 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#EFC75F` | 225 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#18156D` | 247, 269, 291, 297, 324, 332, 354, 360, 394, 414 | Palette decision: consider `var(--customer-navy)` for the brand-navy role. Different shade; visually review first. |
| `#FAF8F3` | 257 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F5E9C6` | 261, 386 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#B88400` | 261, 386 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#E8E1D4` | 289 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#D4A52A` | 289, 352 | Palette decision: consider `var(--customer-gold)` for the brand-gold role. Different shade; visually review first. |
| `#ECE7DD` | 352 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#FCFBF8` | 352 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F7F5EF` | 382 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#211D78` | 414 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
| `#F2D37A` | 416 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |

## `customer/src/pages/subscription/SubscriptionPage.jsx`

Shared/module dependencies: `../../components/ui/Seo`, `../../components/ui/ApiState`, `../../components/ui/buttons/Button`, `../../hooks/useToastThunk`, `../../utils/ecommerce`, `../../hooks/useFetchThunk`.

Source signals (line numbers): brand_literal: 27.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `brand_literal` — Brand-name literals | 27 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/pages/warranty/WarrantyPage.jsx`

Shared/module dependencies: `../../components/ui/Seo`, `../../components/ui/ApiState`, `../../components/ui/buttons/Button`, `../../hooks/useToastThunk`, `../../utils/routeTokens`.

Source signals (line numbers): raw_input: 68;210;215;220 | inline_date: 123 | brand_literal: 48.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_input` — Native inputs | 68, 210, 215, 220 | Reuse `components/ui/inputs/TextInput.jsx` or the existing `FormField.jsx` for editable text; use `CheckboxInput.jsx`/`RadioInput.jsx` for selections. Preserve controlled value or registration, validation, autofill and disabled/read-only state. `FormField` has field-name-driven sanitization, so verify it before migration. |
| `inline_date` — Inline date formatting | 123 | Reuse a shared date formatter based on existing `utils/orderHelpers.js`, `modules/orders/utils/orderItems.js` or support formatters. Keep explicit locale/timezone and date-only vs datetime vs relative-time options, with invalid/missing fallback. Consolidate matching behavior rather than assuming these helpers are interchangeable. |
| `brand_literal` — Brand-name literals | 48 | Use `config/site.js` (`SITE_CONFIG.name`, title template/defaults) and `components/ui/Seo.jsx` for shared site identity. Keep CMS/editorial copy, historical documents and legal entity names content-owned; do not replace every textual mention mechanically. Preserve descriptive page titles. |

## `customer/src/routing/AppRoutes.jsx`

Shared/module dependencies: `../components/ui/Loader`.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/routing/RouteGuards.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): none of the scanned patterns.

## `customer/src/utils/showMore.jsx`

Shared/module dependencies: none matched.

Source signals (line numbers): raw_button: 346 | literal_hex: 309.

Reuse suggestions:

| Signal | Source lines (audit snapshot) | Suggested action and cases to preserve |
|---|---|---|
| `raw_button` — Native buttons | 346 | Reuse `components/ui/buttons/Button.jsx` for actions and `IconButton.jsx` for icon-only actions. Preserve type, loading/disabled state, accessible label, event propagation and form submission. Keep specialized toggle/tab/accordion/gallery interaction in its domain component; share button styling only where its API fits. |

Color suggestions:

| Current color | Source lines | Suggestion |
|---|---|---|
| `#0B63F6` | 309 | Review custom color: keep if intentional artwork/campaign styling; otherwise use an appropriate semantic token or define a shared one for this recurring role. No exact CSS-token match. |
