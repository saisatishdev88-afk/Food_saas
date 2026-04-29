till now everything is working. so for further modules below is the requirement

ROLES & PERMISSIONS (STRICT)

Restaurant Owner / Admin
Full access
Manage menu, pricing, staff, orders
Manager
Manage menu
Manage orders
Cannot manage subscription
Kitchen Staff
View orders
Update order status (Preparing / Ready)
Delivery Partner
View assigned orders
Update delivery status
Floor Staff / Cashier
Create offline orders (POS)
Manage cart and billing

MODULE 1: MENU MANAGEMENT

Create full menu system with:

Categories (Main Menu)
Add category
Edit category
Enable/disable category
Subcategories (Optional)
Add subcategory under category
Menu Items
Add item
Edit item
Delete item
Assign to category/subcategory

Each item must include:

name
description
price
image upload
availability (in stock / out of stock)
veg / non-veg flag
preparation time (optional)
Pricing Features:
Base price
Dynamic price updates
Optional discount field
Image Handling:
Upload image
Store in public/assets or cloud
Display in menu UI

MODULE 2: ORDER MANAGEMENT

Order Types:
Offline (POS)
Online (Customer)
Order Flow:

Pending → Accepted → Preparing → Ready → Delivered

Features:
Create order (POS)
Add items to order
Modify quantities
Calculate total
Apply taxes (optional)
Order Details:
order_id
restaurant_id
order_type
items list
total_amount
payment_status
order_status

MODULE 3: PAYMENT HANDLING

Payment status:
Pending → Paid
Support:
QR Payment (for POS)
Online payment (future)
Show payment modal
Poll payment status API

MODULE 4: KITCHEN (KOT SYSTEM)

Show live orders
Card-based UI
Actions:
Accept
Preparing
Ready
Auto refresh orders using React Query

MODULE 5: DELIVERY MANAGEMENT

View assigned orders
Order details page

Actions:

Picked
Delivered

MODULE 6: POS SYSTEM (FLOOR STAFF)

Browse menu
Add items to cart
Update/remove items
Show total bill
Place offline order
Show QR for payment

STATE MANAGEMENT RULES

Use Redux Toolkit ONLY for:

Cart (POS + customer)
Auth (user, role)
UI states

Use React Query for:

Menu data
Orders
API calls




API STRUCTURE (Laravel)

GET /menu
POST /menu
PUT /menu/{id}
DELETE /menu/{id}
GET /orders
POST /orders
PUT /orders/{id}/status
POST /payments/create

UI REQUIREMENTS

Use existing design screens
Convert static UI into dynamic components

Create reusable components:

MenuCard
CategoryTabs
OrderCard
CartPanel
PaymentModal

Include:

Loading states
Error handling
Empty states



BUSINESS LOGIC

Each restaurant manages its own data
Orders must always be linked to restaurant_id
Menu visibility depends on item availability
Kitchen only sees active orders
Delivery only sees assigned orders




GOAL

Build a scalable, role-based Menu and Order Management system for a Restaurant SaaS application with proper separation of concerns, reusable components, and clean architecture.