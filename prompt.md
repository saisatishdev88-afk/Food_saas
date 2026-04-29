The UI design files are located in the folder: "Food_kitchen_screens"

These folders contain screen-wise UI designs for the application.

Use these files as the primary UI reference for building the application.





You are a senior software architect and full-stack engineer.

You are working inside an already running Next.js (React) application.

Your task is to transform this existing project into a complete production-ready Restaurant SaaS web application using the provided UI design files.

---

IMPORTANT CONTEXT:

* The project is already set up and running locally
* The provided files are screen-wise UI designs (not structured code)
* You must NOT create a new project
* You must NOT break existing functionality
* You must integrate everything into the existing codebase

---

CRITICAL INSTRUCTION (VERY IMPORTANT):

Before generating any code:

1. Analyze all provided screens

2. Clearly explain:

   * Role mapping (which screen belongs to which role)
   * Route structure
   * Module structure
   * Layout structure
   * Reusable component plan

3. Then proceed to implementation step-by-step

Do NOT generate full code immediately without planning.

---

DESIGN FILE UNDERSTANDING:

* The uploaded folder contains UI screens grouped by screens (not modules)
* You must reorganize them into a proper scalable application
* Do NOT treat each folder as a separate project
* Combine everything into one unified SaaS application
---

APPLICATION TYPE:

Restaurant SaaS platform for local vendors with:

* POS (offline order system)
* Online ordering (no login for customers)
* Kitchen (KOT)
* Delivery management
* Admin dashboard
* Super Admin (SaaS owner)

---

TECH STACK:

* Frontend: Next.js (React)
* Styling: Tailwind CSS
* State Management:

  * Redux Toolkit (client/global state)
  * React Query (server/API state)
* Backend APIs: Laravel (REST APIs)

---

ROLE-BASED SYSTEM (STRICT)

Roles:

1. Super Admin → /saas/*
2. Restaurant Admin → /admin/*
3. Cashier (POS) → /pos
4. Kitchen Staff → /kitchen
5. Delivery Staff → /delivery/*
6. Customer → public routes (/menu, /cart, /checkout)

---

ROUTING RULES:

* Implement protected routes based on roles
* Unauthorized users must be redirected
* Do not allow cross-role access

---

FOLDER STRUCTURE:

src/
├── app/ or pages/
├── components/
├── modules/
│    ├── auth/
│    ├── menu/
│    ├── cart/
│    ├── orders/
│    ├── pos/
│    ├── kitchen/
│    ├── delivery/
│    ├── admin/
│    ├── saas/
├── store/ (redux)
├── api/
├── hooks/
├── layouts/
└── utils/

---

LAYOUT RULES (STRICT):

* Admin routes MUST use AdminLayout (sidebar + navbar)
* POS MUST use full-screen layout (no sidebar)
* Kitchen MUST use card/grid layout
* Delivery MUST use simple list layout
* Customer MUST use public layout

Do NOT mix layouts across roles.

---

STATE MANAGEMENT RULES:

Use Redux Toolkit ONLY for:

* Auth (user, role, token)
* Cart (POS + customer)
* UI state (modals, sidebar)

DO NOT use Redux for API data

Use React Query for:

* Menu
* Orders
* API requests

---

REDUX STRUCTURE:

store/
├── index.js
├── slices/
│    ├── authSlice.js
│    ├── cartSlice.js
│    ├── uiSlice.js

---

CORE FUNCTIONALITY:

1. AUTH SYSTEM

* Login page
* Store user in Redux
* Role-based redirect after login

---

2. POS SYSTEM (/pos)

* Fetch menu (React Query)

* Add to cart (Redux)

* Update/remove items (Redux)

* Show total

* Place Order:

  * order_type = offline
  * Send to API

* Payment:

  * Show QR code
  * Poll API for payment status
  * Update UI when paid

---

3. CUSTOMER FLOW

* /menu → fetch menu
* /cart → Redux cart
* /checkout → place order (online)
* /track-order/:id → track status

---

4. ADMIN PANEL

* /admin/dashboard
* /admin/orders
* /admin/order/:id
* /admin/menu
* /admin/staff

Features:

* View & filter orders
* Update order status:
  Pending → Preparing → Ready → Delivered
* Assign delivery staff

---

5. KITCHEN (/kitchen)

* Show orders (card layout)
* Actions:

  * Accept
  * Preparing
  * Ready
* Auto-refresh using React Query

---

6. DELIVERY MODULE

* /delivery/orders
* /delivery/order/:id

Actions:

* Picked
* Delivered

---

7. SUPER ADMIN (/saas)

* Manage restaurants
* Manage subscriptions

---

API RULES:

Use React Query for:

* GET /menu
* GET /orders
* POST /orders
* PUT /orders/{id}/status
* POST /orders/{id}/assign-delivery
* PUT /orders/{id}/delivery-status
* POST /payments/create

If APIs are not available:

* Create a mock API layer
* Do NOT hardcode data in components

---

UI RULES:

* Use provided design as reference

* Convert static UI into dynamic components

* Replace hardcoded values with props

* Extract reusable components:

  * Button
  * Card
  * Table
  * Modal
  * Badge

* Avoid duplicate UI code

* Every API must include:

  * Loading state
  * Error state
  * Empty state

---

ASSET HANDLING:

* Move images to public/assets
* Fix all paths
* Use optimized image handling
* Avoid duplicate assets

---

BUSINESS LOGIC:

Order Type:

* Online (customer)
* Offline (POS)

Payment:

* Pending → Paid

Order Flow:

* Pending → Preparing → Ready → Delivered

---

IMPLEMENTATION APPROACH (STRICT):

Build in phases:

1. Setup routing + folder structure
2. Build shared components
3. Implement POS module
4. Implement Admin module
5. Implement Kitchen module
6. Implement Delivery module
7. Implement Customer flow

Do NOT build everything at once.

---

DELIVERABLE:

* Fully working Next.js application
* Clean architecture
* Role-based routing
* Redux + React Query properly used
* API-ready structure

---

GOAL:

Transform the provided UI design screens into a fully functional, scalable, role-based Restaurant SaaS frontend integrated into the existing Next.js project.















Final Status:
Backend: Laravel 10 (MySQL 3307)
Frontend: Next.js 16 (App Router + Redux + React Query)
Credentials:
Dashboard URL: http://localhost:3000/dashboard
Test Admin: root@bistroflow.io / admin123
The platform is now fully operational and scalable. Is there anything else you would like to refine?