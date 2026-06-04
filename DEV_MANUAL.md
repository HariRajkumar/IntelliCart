# IntelliCart — Developer Manual

This document describes the backend and frontend architecture, explains each major functionality, lists important files with links, and describes frontend flows and edge cases.

## **Overview**
- **Purpose:** Full-stack e-commerce sample (IntelliCart) with FastAPI backend and React + Vite frontend.
- **Backend base URL:** `http://localhost:8000/api/v1`
- **Frontend dev URL:** `http://localhost:5173` (Vite default)

## **Backend — Structure & Key Files**
- **Entrypoint:** [backend/app/main.py](backend/app/main.py) — FastAPI app, CORS, mounts `/uploads`, registers routers.
- **Config:** [backend/app/core/config.py](backend/app/core/config.py) — settings via `.env` (`MONGO_URL`, `DATABASE_NAME`, `JWT_SECRET`).
- **Security helpers:** [backend/app/core/security.py](backend/app/core/security.py) — password hashing, JWT create/verify, expiry.
- **Enums:** [backend/app/core/roles.py](backend/app/core/roles.py), [backend/app/core/order_status.py](backend/app/core/order_status.py).
- **DB connection:** [backend/app/db/database.py](backend/app/db/database.py) — Motor + Beanie, registers document models.
- **Models (documents):** [backend/app/models](backend/app/models) — `User`, `Product`, `Category`, `Cart`, `Order` definitions.
- **Schemas (Pydantic):** [backend/app/schemas](backend/app/schemas) — request/response validation models.
- **Repositories:** [backend/app/repositories](backend/app/repositories) — DB access helpers per domain.
- **Services:** [backend/app/services](backend/app/services) — business logic and error mapping.
- **Routes / API layer:** [backend/app/api](backend/app/api) — HTTP endpoints mapped to services and dependencies.
- **File upload:** [backend/app/utils/file_upload.py](backend/app/utils/file_upload.py) — image validation and saving; uploads served from `/uploads`.

## **Backend — Functionalities & Flows**

Authentication & Authorization
- Register: `POST /auth/register` — validates payload, prevents duplicate emails, hashes password, creates `User`.
- Login: `POST /auth/login` — OAuth2 form, verifies password, returns JWT (`access_token`) with 60-minute expiry. See [backend/app/services/auth_service.py](backend/app/services/auth_service.py) and [backend/app/api/auth_routes.py](backend/app/api/auth_routes.py).
- Token validation: `backend/app/dependencies/auth_dependencies.py` decodes JWT and loads `User`. Admin checks use `admin_required`.

Products
- CRUD and search endpoints under `/products` (see [backend/app/api/product_routes.py](backend/app/api/product_routes.py)).
- Listing supports pagination and price/category filters (server-side). Product images saved via upload endpoint and accessible from `http://localhost:8000` + image path.
- Delete is soft: `is_active` flag toggled.

Categories
- Admin can create categories; listing available to all. See [backend/app/services/category_service.py](backend/app/services/category_service.py).

Cart
- Add item: validates product active + stock, creates cart if absent, increments existing item or appends new `CartItem`, recomputes `total_price` (see [backend/app/services/cart_service.py](backend/app/services/cart_service.py)).
- Update quantity: `quantity <= 0` removes item; verify stock.
- Remove / Clear cart endpoints delete or empty cart.

Orders
- Checkout: validates cart non-empty, checks product existence and stock, reduces product stock, creates `Order` with `status: pending`, clears cart. See [backend/app/services/order_service.py](backend/app/services/order_service.py).
- Admin can list all orders and update order status. When status transitions to `cancelled`, items' stock is restored.

Uploads
- Images validated for MIME type and size and saved into `uploads/products/`. Served statically by FastAPI at `/uploads`.

Error handling
- Services raise `HTTPException` for client errors (400/401/403/404). Security decode returns None for invalid tokens; dependencies convert to 401.

## **Frontend — Structure & Key Files**
- **Axios instance:** [frontend/src/api/axios.js](frontend/src/api/axios.js) — baseURL `http://localhost:8000/api/v1`, attaches `Authorization` header from `localStorage.token`.
- **Auth context:** [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx) — provides `login(token)`, `logout()`, and `isAuthenticated` state.
- **Pages:** [frontend/src/pages](frontend/src/pages) — `Home`, `Products`, `ProductDetail`, `Cart`, `Orders`, `Login`, `Register`.
- **Components:** [frontend/src/components](frontend/src/components) — `ProductCard`, `Navbar`, `ProtectedRoute`.
- **Services (frontend API wrappers):** [frontend/src/services](frontend/src/services) — `authService.js`, `productService.js`, `cartService.js`, `orderService.js`.

## **Frontend — Flows and Edge Cases (detailed)**

Auth lifecycle
- On load, `AuthContext` reads `localStorage.token`. Axios includes token in requests automatically.
- Token expiry (60 min) is not handled globally; expired tokens will cause 401 responses from the backend. Current UI shows alerts for failures, but does not auto-logout.

Product browsing
- Products page calls `getProducts()` → displays cards. Each card links to `ProductDetail`.
- Product detail calls `getProductById()`. If product missing or inactive backend returns 404 — page shows "Product not found".
- Adding to cart calls `POST /cart/add`. Possible failures:
  - 401 Unauthorized (not logged in / expired token).
  - 404 Product not found (deleted meanwhile).
  - 400 Insufficient stock.

Cart & Checkout
- `Cart` page calls `GET /cart`. Empty cart returns `{items:[], total_price:0}`.
- Checkout posts to `/orders/checkout`. Possible failures:
  - 400 "Cart is empty" if user has no items.
  - 400/404 if any product is out-of-stock or removed between viewing cart and checkout.
  - 401 Unauthorized for missing/expired token.
- On success the frontend alerts and navigates to `/orders`.

Orders
- `GET /orders/my-orders` lists a user's orders. If empty, UI shows "No orders found." Admin-only endpoints are not surfaced in UI.

Navigation & protection
- `ProtectedRoute` redirects unauthenticated users to `/login`. However some API calls may still be performed by unauthenticated pages; backend enforces auth anyway.

UX & developer notes
- Errors are surfaced as `alert()` in several places. Consider replacing with a consistent toast or inline error component.
- Add a global Axios response interceptor to handle `401` by calling `logout()` and redirecting to `/login`.

## **Run & dev notes**
- Backend env file (create `.env`) must include:
  - `MONGO_URL` — MongoDB connection string
  - `DATABASE_NAME` — database name
  - `JWT_SECRET` — secret for signing tokens
- Run backend (recommended):

```powershell
# from repo root
cd backend
# create venv, install, then run uvicorn
# example (adjust to your environment):
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Run frontend (recommended):

```bash
cd frontend
npm install
npm run dev
```

## **Important files quick links**
- App entry: [backend/app/main.py](backend/app/main.py)
- Auth service & routes: [backend/app/services/auth_service.py](backend/app/services/auth_service.py), [backend/app/api/auth_routes.py](backend/app/api/auth_routes.py)
- Product service & routes: [backend/app/services/product_service.py](backend/app/services/product_service.py), [backend/app/api/product_routes.py](backend/app/api/product_routes.py)
- Cart service & routes: [backend/app/services/cart_service.py](backend/app/services/cart_service.py), [backend/app/api/cart_routes.py](backend/app/api/cart_routes.py)
- Order service & routes: [backend/app/services/order_service.py](backend/app/services/order_service.py), [backend/app/api/order_routes.py](backend/app/api/order_routes.py)
- DB & models: [backend/app/db/database.py](backend/app/db/database.py), [backend/app/models](backend/app/models)
- Upload util: [backend/app/utils/file_upload.py](backend/app/utils/file_upload.py)
- Frontend Axios: [frontend/src/api/axios.js](frontend/src/api/axios.js)
- Frontend Auth context: [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)
- Frontend main pages: [frontend/src/pages](frontend/src/pages)

## **Recommended improvements**
- Add global Axios response interceptor to handle `401` and auto-logout.
- Improve frontend error handling (replace alerts with a toast system).
- Add admin UI for product/category/order management to match backend capabilities.
- Sanitize and validate file upload/output paths and ensure upload directory exists at startup.

---
If you'd like, I can add the global Axios `401` handler patch now and run quick local checks. Which next step do you want?
