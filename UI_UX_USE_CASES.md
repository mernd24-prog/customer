# Customer UI/UX use cases

This document is the visual acceptance checklist for customer-facing pages. It changes presentation standards only; existing features, routes, API calls, validation, permissions, and business behavior must remain unchanged.

## 1. Typography and text

- Shared type scale: `micro` (10px), `caption` (11px), `text-xs` (12px), `label` (13px), `text-sm` (14px), `body` (15px), `text-base` (16px), `title-sm` (17px), then the standard Tailwind heading sizes.
- Page titles use `PageHeader` and appear once as a visible `h1` with a short optional description.
- Section titles use `SectionHeader` and follow a consistent heading hierarchy (`h2` below the page `h1`, then `h3` inside cards).
- Body text is at least 14px, uses comfortable line height, and is never communicated by color alone.
- Labels, help text, error text, empty states, prices, and status text use the same semantic colors across pages.
- Long names, product titles, addresses, and identifiers wrap or truncate without breaking the layout.

## 2. Fonts

- DM Sans is the customer font across headings, controls, buttons, prices, and body text.
- Font weights are limited to regular (400), medium (500), semibold (600), bold (700), and extra-bold (800).
- Local font files remain the preferred source; the system fallback prevents layout shifts when the web font is unavailable.

## 3. Borders, radius, and elevation

- Standard cards use `customer-card` or `DetailSectionCard`.
- Default borders use `--customer-border`; selected/focused states use gold; destructive states use danger red.
- Controls use the small radius, cards use the standard radius, and modals/large panels use the large radius.
- Shadows communicate elevation only. Nested cards should use a border without stacking strong shadows.

## 4. Hover, active, focus, and disabled states

- Interactive cards lift by 2px and strengthen their border/shadow on pointer hover.
- Buttons and links always have hover, active, keyboard focus, loading, and disabled states.
- Keyboard focus is visible with a gold ring and is not removed by component styling.
- Hover effects run only as enhancement; touch and keyboard users receive equivalent active/focus feedback.
- Reduced-motion preferences disable decorative movement and smooth scrolling.

## 5. Margin, padding, and page rhythm

- Shared layout tokens are `--customer-card-padding`, `--customer-grid-gap`, `--customer-space-section`, and `--customer-space-page`.
- Pages use `PageContainer` and the shared `customer-container` width.
- Use a 4px spacing base: 4, 8, 12, 16, 20, 24, 32, 48, and 64px.
- Mobile page gutters are 16px, tablet gutters 24px, and desktop content is capped at 1533px.
- Page headers, sections, cards, form groups, and actions use shared spacing instead of arbitrary values.
- Avoid double padding when a section is already inside a page container.

## 6. Layouts and responsive behavior

- Sticky sidebars use `--customer-page-sticky-top`; never calculate a header offset inside an individual page.
- Routes with the fixed category bar include `--customer-category-bar-height` in that offset, while routes without it use only the measured header height and shared gap.
- List pages use `PageContainer`, `PageHeader`, filter/toolbar, result state, and responsive content grid in that order.
- Detail pages use a primary content column plus a sticky summary/sidebar only where space permits.
- Forms are one column on mobile and may become two columns only for related short fields.
- Tables preserve all data on small screens through horizontal scrolling or an equivalent card layout.
- Fixed and sticky elements must not cover content, dialogs, toasts, or the mobile keyboard.

## 7. Cards

- Product, order, return, notification, address, payment, and support cards share border, radius, surface, spacing, and focus behavior.
- Product cards use an image-first compact hierarchy: optional rating over the image, optional brand/category label, a reserved two-line title, a compact price row, and aligned actions.
- Missing optional metadata disappears without leaving a dedicated empty row. Missing required display values use restrained truthful fallbacks such as `Product details coming soon` and `Currently unavailable`; these labels never alter the underlying record or callbacks.
- The full card is clickable only when it performs one clear navigation action; nested actions remain separate buttons.
- Every card has a clear reading order: identity/title, supporting metadata, status, then actions.
- Card images use stable aspect ratios and fallbacks to prevent layout shift.
- Loading cards use matching skeleton dimensions; empty and error states use common feedback components.

## 8. Forms and controls

- Inputs use the common input components and have an associated label, optional hint, and reserved error area.
- Control height is at least 44px for touch use. Related checkboxes/radios have clickable labels.
- Validation messages explain how to correct the value and do not clear valid user input.
- Primary action placement is consistent and submission preserves existing loading/disabled behavior.

## 9. Navigation and actions

- Current navigation state is visible through color, weight, and an indicator where appropriate.
- One primary action is emphasized per region; secondary and destructive actions use their matching variants.
- Icon-only actions require an accessible name and a minimum practical touch target.
- Back navigation, breadcrumbs, pagination, and filters retain current routing and query behavior.

## 10. Feedback and accessibility

- Loading, empty, error, offline/service-unavailable, success, and confirmation states use shared components.
- Dialogs retain focus management, Escape behavior, close actions, and current functional callbacks.
- Text and interactive controls target WCAG AA contrast.
- Pages remain usable at 200% zoom and from 320px viewport width upward.
- Status updates and form errors remain available to assistive technology through existing ARIA/live-region behavior.

## Page acceptance checklist

For Home, catalog/search, product detail, cart, checkout/payment, account/address/security, orders, returns, wishlist, wallet, notifications/preferences, support, authentication, CMS/policy, FAQ/contact, and seller information pages:

1. Existing data and actions produce the same functional result as before the visual change.
2. A visible page title or hero establishes context.
3. Shared components are used before adding page-specific visual markup.
4. Spacing and alignment work at 320px, 768px, 1024px, and 1440px.
5. Hover, keyboard focus, active, loading, empty, error, and disabled cases are visually complete.
6. Long content and missing images do not overflow or collapse the layout.
