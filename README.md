# Supra Tbilisi — Georgian Restaurant Web Application

## Project Overview
**Supra Tbilisi** is a responsive, interactive web application for an authentic Georgian restaurant located in Tbilisi. Built on top of the midterm and endterm foundation (HTML5, CSS3, Bootstrap 5, JavaScript, jQuery, and custom form validation), this final version upgrades the site into a modular, stateful client-side web application featuring Object-Oriented Programming (OOP), external API integration, `localStorage` persistence, multi-criteria menu filtering, and a full CRUD reservation manager.

---

## Team Members & Contributions
* **Member 1 (Omar Zhakiya):**
  * Designed the Object-Oriented architecture (`DishItem`, `SupraCart`, and `StorageManager` classes in `js/models.js` and `js/storage.js`).
  * Implemented safe JSON `localStorage` persistence with error handling and fallback protection.
  * Built the interactive Supra Feast shopping cart modal with jQuery event delegation and live badge/total updates.
* **Member 2 (Imangali kabiyev):**
  * Integrated the public **TheMealDB API** (`ChefSpecialsAPI` in `js/api-service.js`) using `async/await` and `fetch`.
  * Implemented all four API UI states: `loading` (spinner), `success` (dynamic card rendering), `empty-data`, and `error` (with retry trigger).
  * Built real-time keyword search, category filtering, favorites toggling, and price/alphabetical sorting in `js/menu-filter.js`.
* **Member 3 (Aldiyar Alimkhanov):**
  * Implemented the full **CRUD Table Reservation Manager** (`ReservationCRUD` in `js/crud-reservations.js`) supporting creating, reading, updating, and deleting bookings in `localStorage`.
  * Integrated all new UI sections and script modules into `menu.html` and `contact.html` while preserving all legacy jQuery, dark-mode, and form-validation features.
  * Conducted cross-device responsive QA, console error checks, documentation, and live deployment.

---

## Implemented Final-Stage Features
1. **Object-Oriented Programming (OOP):** Encapsulated domain logic into reusable ES6 classes (`StorageManager`, `DishItem`, `SupraCart`, `ChefSpecialsAPI`, and `ReservationCRUD`) with constructors, properties, and instance/static methods.
2. **External Public API Integration:** Fetches live seasonal chef specials from TheMealDB (`https://www.themealdb.com/api/json/v1/1/search.php`) without exposing any secret API keys, complete with loading, empty, success, and error handling.
3. **Persistent Browser Storage (`localStorage`):** Automatically saves and restores the user's cart items, favorited dishes, and table reservations in JSON format across page reloads, with safe `try/catch` parsing for corrupted or missing data.
4. **Interactive Search, Filtering & Sorting:** Instant search by dish name or description, filtering by category or favorites-only status, and sorting by price (ascending/descending) or name (A–Z).
5. **Full CRUD Reservation Management:** Users can book tables, view active reservations, edit booking details (guest name, party size, date, dining hall, notes), and cancel bookings directly on the Contact page.

---

## Project Structure
```text
endWEB/
├── index.html                 # Home page
├── about.html                 # Restaurant story & heritage
├── menu.html                  # Interactive menu, filters, live API specials & cart modal
├── gallery.html               # Photo gallery
├── contact.html               # Validated booking form & CRUD reservation manager
├── README.md                  # Project documentation
├── css/
│   └── style.css              # Custom styling & dark mode theme
├── images/                    # Restaurant & dish photography assets
└── js/
    ├── main.js                # Navigation, theme toggle & core UI behavior
    ├── menu.js                # Legacy menu table & search functionality
    ├── validation.js          # Custom form validation
    ├── jquery-features.js     # Legacy jQuery interactive effects
    ├── storage.js             # Safe localStorage JSON wrapper (Member 1)
    ├── models.js              # DishItem & SupraCart OOP classes (Member 1)
    ├── api-service.js         # TheMealDB API service with 4 UI states (Member 2)
    ├── menu-filter.js         # Search, filter, sort & favorites logic (Member 2)
    └── crud-reservations.js   # Full CRUD table booking system (Member 3)