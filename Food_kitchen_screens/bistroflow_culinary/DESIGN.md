# Design System Strategy: The Culinary Atelier

## 1. Overview & Creative North Star
This design system is anchored by a Creative North Star we call **"The Culinary Atelier."** 

In a high-end kitchen, every movement is intentional, and every tool has its place. We are moving away from the cluttered, "dashboard-heavy" aesthetic of traditional SaaS. Instead, we treat the interface as a professional workspace—spacious, tactile, and editorial. By leveraging intentional asymmetry, oversized typography, and deep tonal layering, we create an environment that feels less like a database and more like a premium service experience. This system balances the "Zesty Orange" energy of a fast-paced kitchen with the "Fresh Green" calm of a farm-to-table garden.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is built on Material Design logic but applied with an editorial lens.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or containers. Hard lines create visual noise and "trap" the user's eye. Instead, boundaries must be defined solely through background color shifts.
*   **The Transition:** A `surface-container-low` sidebar should sit directly against a `surface` background. The change in hex code is the divider.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
*   **Base Layer:** `surface` (#f5f6f7) or `surface-bright`.
*   **Content Areas:** Use `surface-container-low` (#eff1f2) for large grouping areas.
*   **Interactive Cards:** Use `surface-container-lowest` (#ffffff) to make elements "pop" forward naturally.
*   **Nesting:** When placing a card inside a container, ensure the card is always a lighter tier than its parent to simulate light hitting the top layer.

### The "Glass & Gradient" Rule
To escape the "flat SaaS" look:
*   **Gradients:** Use a subtle linear gradient on primary CTAs—from `primary` (#a63300) to `primary-container` (#ff7949). This adds a "soul" to the button, making it feel pressurized and tactile.
*   **Glassmorphism:** For floating elements like POS "Quick-Add" menus or notifications, use `surface-container-lowest` at 80% opacity with a `24px` backdrop-blur. This keeps the user grounded in their current context.

---

## 3. Typography: Editorial Authority
We utilize a dual-font approach to balance personality with extreme legibility.

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Brand Moments." Use `display-lg` and `headline-md` with tighter letter-spacing (-0.02em) to create an authoritative, premium feel. Use these for table headers, page titles, and large order numbers.
*   **Body & Labels (Public Sans):** This is our "Workhorse." Public Sans provides the neutral clarity required for fast-paced environments. 
    *   Use `body-lg` for order details.
    *   Use `label-md` (uppercase with 0.05em tracking) for status indicators to ensure they are glanceable under kitchen heat.

---

## 4. Elevation & Depth: Tonal Layering
Traditional "drop shadows" are often a crutch for poor layout. In this system, depth is achieved through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container` background. The difference in luminance provides all the separation needed.
*   **Ambient Shadows:** If an element must float (e.g., a dragged order item), use a "Kitchen Ambient" shadow:
    *   `Box-shadow: 0px 20px 40px rgba(44, 47, 48, 0.06);`
    *   The shadow color is derived from `on-surface` (#2c2f30) at very low opacity to mimic natural light.
*   **The Ghost Border Fallback:** If accessibility requirements demand a border (e.g., in high-glare environments), use a "Ghost Border": `outline-variant` (#abadae) at 15% opacity. Never use 100% opaque lines.

---

## 5. Components: Tactile & High-Contrast

### Buttons (POS-Optimized)
*   **Primary:** High-gloss gradients using `primary` tokens. Use `rounded-full` or `rounded-xl` (1rem+) for a friendly, touch-safe target. 
*   **Secondary:** No background; use a `primary` text color with a `surface-container-high` background on hover.
*   **Sizing:** Minimum height of `56px` for all POS actions to accommodate gloved or moving hands.

### Status Badges (The "Freshness" System)
Instead of standard pill shapes, use "Soft Rectangles" (`rounded-sm`).
*   **Pending:** `surface-container-highest` background / `on-surface-variant` text.
*   **Preparing:** `tertiary-container` / `on-tertiary-container` (Blue).
*   **Ready:** `primary-fixed` / `on-primary-fixed-variant` (Yellow/Orange).
*   **Delivered:** `secondary-container` / `on-secondary-container` (Green).

### High-Contrast Tables (Admin)
*   **Rules:** Forbid 1px horizontal dividers. 
*   **The Alternative:** Use vertical whitespace (Spacing Scale: 1rem between rows). On hover, transition the entire row background to `surface-container-low`. 
*   **Headers:** Use `label-md` in `on-surface-variant` to keep the focus on the data, not the metadata.

### Input Fields
*   **Style:** Filled inputs using `surface-container-highest`.
*   **Indicator:** A `2px` bottom-only highlight in `primary` that appears only on focus. This maintains the "No-Line" rule while providing clear feedback.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align the main navigation to the left but allow the dashboard cards to have varying widths to create a dynamic, editorial layout.
*   **Use Generous Radii:** Apply `rounded-xl` (1rem) to almost everything. It feels safer and more modern than sharp corners.
*   **Prioritize Breathing Room:** If you think there is enough padding, add 8px more. White space is a luxury signal.

### Don't:
*   **No Grid-Prison:** Avoid boxing every element in a 1px border. It makes the SaaS look like a 2010 Excel sheet.
*   **No Pure Black:** Never use #000000. Use `on-background` (#2c2f30) for text to maintain a soft, high-end look.
*   **No "Small" Buttons:** In a restaurant context, precision is the enemy of speed. Small buttons are a failure of the system.