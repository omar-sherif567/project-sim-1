## Description
Refactored the application into a clean, modular MVC architecture, resolving database pricing bugs, and completed full backend lifecycle validation for both cart management and customer checkout processing.

## Built APIs
- **Cart Endpoints:**
  - `POST /api/cart/items` - Add/increment items with cumulative stock verification
  - `GET /api/cart` - View fully populated shopping cart contents
  - `PATCH /api/cart/items/:productId` - Update specific line-item quantities
  - `DELETE /api/cart/items/:productId` - Remove a single item from the cart
  - `DELETE /api/cart` - Reset and completely clear the cart
- **Order Endpoints:**
  - `POST /api/orders/checkout` - Secure order creation featuring historical price/name snapshots and database inventory deductions
  - `GET /api/orders` - Retrieve list of all processed orders
  - `GET /api/orders/:id` - Fetch singular order details using object ID reference
  - `PATCH /api/orders/:id/status` - Update fulfillment statuses (Pending, Shipped, etc.)
