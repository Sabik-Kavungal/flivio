# FLIVIO — Fashion E-Commerce Frontend (`flivio.store`)

Complete customer storefront and admin management dashboard built with React, TypeScript, Tailwind CSS, Zustand, React Hook Form + Zod, IndexedDB, and LocalStorage.

## Demo Access Credentials

### Admin Console (`/admin/login`)
- **Email:** `admin@flivio.store`
- **Password:** `FlivioAdmin2026`
- *Note: Frontend demonstration guard only; replace with real server-side authentication before production deployment.*

### Customer Demo Account (`/login`)
- **Email:** `arjun@flivio.store`
- **Password:** `Flivio@2026`

## Local Persistence Architecture
- **IndexedDB (`flivio_media_db`)**: Persistent storage for admin-uploaded product, variant, category, and banner images with automatic client-side compression.
- **LocalStorage (`flivio_*_v1`)**: Structured service layer (`productService`, `categoryService`, `cartService`, `wishlistService`, `orderService`, `customerService`, `settingsService`, `adminService`) ready for REST API replacement.
- **WhatsApp Checkout**: Generates `FLV-XXXXXX` orders, deducts child-variant inventory, and opens a properly encoded `https://wa.me/...` link using the configurable store WhatsApp number.
