# Software Design Description (SDD): Archival

## 6.1 Introduction
This document presents the architecture and detailed design for the software for the Archival project. The project performs high-fidelity design curation by allowing users to store their items in a museum-like environment. This environment leverages external APIs for metadata enrichment and provides advanced visualizations through a digital gallery ("The Vault"), a historical timeline ("Chronology"), an analytics dashboard ("Insights"), and a spatial map ("Blueprint").

### 6.1.1 System Objectives Section
The objective of this application is to provide a sophisticated interface for personal collection management that mimics the experience of a digital museum. 
* The system aims to automate the "Acquisition" input process by retrieving metadata and high-resolution imagery from Google Books and Discogs.
* The application provides a "Gallery" view (The Vault) to browse and filter curated items in a high-contrast grid.
* The "Chronology" view allows users to visualize the historical weight and evolution of a collection over time.
* The "Insights" dashboard provides data-driven analytics into aesthetic preferences, identifying correlations between items and historical design movements using interactive charts and provenance maps.
* The "Blueprint" feature enables users to map their items to specific rooms, providing a spatial dimension to their collection using a virtual floor plan.
* The system is designed to be polymorphic, supporting diverse item categories—Books, Records, Decor, and Fashion—within a unified interface.

### 6.1.2 Hardware, Software, and Human Interfaces Section

#### 6.1.2.1 Hardware Interfaces
The application is a web-based platform designed to be accessed via standard workstations and mobile devices.
* **Workstation/Mobile:** Modern devices capable of running Evergreen browsers (Chrome, Firefox, Safari).
* **Input:** Keyboard and mouse/trackpad for data entry; touch support for mobile navigation.
* **Display:** A minimum resolution of 1024x768 is recommended for the best experience with the data-dense dashboard and chronology views.

#### 6.1.2.2 Software Interfaces
The application utilizes a "Backend-as-a-Service" (BaaS) model via Supabase.
* **Supabase Client (v2.x):** Interfaces with the PostgreSQL database. It manages all CRUD operations and handles Row Level Security (RLS).
* **Google Books API:** A RESTful interface used to retrieve book metadata and covers directly from the client.
* **Discogs API:** Used for music record artwork and metadata, accessed via a Supabase Edge Function to protect API credentials and handle server-side requests.
* **ApexCharts:** A third-party library used for rendering the origin distribution (Pie Chart) in the Insights dashboard.
* **Leaflet:** A mapping library used in the Insights view to visualize the global provenance of items on an interactive world map.

#### 6.1.2.3 Human Interfaces
The Graphical User Interface (GUI) follows a "Museum Minimalist" design language. 
* **Design Tokens:** High-contrast monochrome palette with specialized accent colors for categories, geometric typography, and a rigid grid system.
* **Components:** The GUI consists of an "Acquisitions" form, a "Gallery" grid, a "Chronology" timeline, an "Insights" dashboard, and a "Blueprint" floor plan.

---

## 6.2 Architectural Design Section
The architectural design for Archival is based on a Two-Tier BaaS pattern, connecting a rich Angular frontend directly to a managed Supabase backend.

### 6.2.1 Major Software Components Section
* **Acquisitions CSC:** Relates to FR 1-5. Handles item intake, API discovery logic for Books and Music, and image uploads to Supabase Storage.
* **Vault/Gallery CSC:** Relates to FR 6-7. Manages the archival grid, filtering logic by category and era, and item retrieval.
* **Chronology CSC:** Relates to FR 9-10. Processes temporal data and manages the interactive timeline state.
* **Insights CSC:** Relates to FR 11-12. Performs data aggregation for origin distribution (ApexCharts) and provenance mapping (Leaflet), alongside custom temporal intensity visualizations.
* **Curation/Collections CSC:** Relates to FR 13-14. Manages user-defined collections and item relationships.
* **Blueprint CSC:** Manages the spatial mapping of items to rooms using a custom CSS grid-based virtual floor plan.

### 6.2.2 Major Software Interactions Section
The Angular frontend communicates with Supabase via the `supabase-js` client. All data requests are sent as HTTPS REST calls. External APIs (Google Books) are called directly from the frontend, while Discogs is accessed via a Supabase Edge Function. Authentication is handled by Supabase Auth, and the user's session is synchronized using Angular Signals. Database security is enforced via PostgreSQL Row Level Security (RLS) policies.

### 6.2.3 Architectural Design Diagrams Section
1. **Use Case Diagram:** Defines the interactions between the "Curator" (User) and the Acquisition, Gallery, and Insights subsystems.
2. **Component Diagram:** Illustrates the Angular frontend's dependency on the Supabase Client and external REST APIs.
3. **Deployment Diagram:** Shows the frontend hosted on Vercel communicating with Supabase infrastructure (Database, Storage, Auth, Functions).

---

## 6.3 CSC and CSU Descriptions Section

### 6.3.1 Detailed Class Descriptions

#### 6.3.1.1 ArchiveService (CSU)
* **Purpose:** The central service for managing application state, authentication, and database interactions using Supabase and Angular Signals.
* **Fields:**
    * `collection`: Signal holding the current list of archival items.
    * `rooms`: Signal holding the user's defined rooms.
    * `userCollections`: Signal holding user-defined groupings of items.
    * `movements`: Signal holding design movement metadata.
    * `cities`: Signal holding geographical coordinates for provenance mapping.
    * `user`: Signal tracking the currently authenticated Supabase user.
* **Methods:**
    * `signIn(email, password)` / `signUp(email, password, name)`: Handles user authentication.
    * `addItem(item)` / `updateItem(id, updates)` / `deleteItem(id)`: CRUD operations for archival items.
    * `addRoom(name)` / `deleteRoom(id)`: Manages room metadata for the Blueprint view.
    * `searchBooks(query)`: Interfaces with Google Books API.
    * `searchDiscogs(query)`: Interfaces with Discogs via Supabase Functions.
    * `uploadImage(file)`: Uploads archival photographs to Supabase Storage.

#### 6.3.1.2 AcquisitionComponent (CSU)
* **Purpose:** Manages the multi-step form for entering new items, including category-specific fields and API-driven auto-suggestion.
* **Methods:**
    * `onSearch()`: Triggers external API calls based on user input.
    * `onSelectSuggestion(item)`: Populates the form with metadata from a search result.
    * `handleSubmit()`: Saves the item via `ArchiveService`, including local file uploads.

#### 6.3.1.3 GalleryComponent (CSU)
* **Purpose:** Renders "The Vault" grid, allowing users to browse and filter their collection.
* **Methods:**
    * `filteredItems`: Computed signal that applies category, origin, and era filters.
    * `setFilter(tray, value)`: Updates the active filter state.

#### 6.3.1.4 InsightsComponent (CSU)
* **Purpose:** Orchestrates data analytics including origin distribution (ApexCharts), provenance mapping (Leaflet), and temporal density.
* **Methods:**
    * `originCounts`: Computed data for the ApexCharts pie chart.
    * `initMap()`: Initializes the Leaflet world map with GeoJSON and item markers.
    * `temporalData`: Computes SVG path data for the category-specific timeline visualization.

#### 6.3.1.5 BlueprintComponent (CSU)
* **Purpose:** Manages a spatial floor plan visualization using a CSS grid layout to map items to rooms.
* **Methods:**
    * `gridSize`: Computed signal defining the dimensions of the virtual floor plan.
    * `addRoom()` / `deleteRoom()`: Interface methods for managing spatial volumes.

### 6.3.2 Detailed Interface Descriptions
* **CollectionItem:** Defines the core data structure for an archival item (id, name, designer, year, origin, category, image_url, note, movement_id, room_id).
* **Movement:** Represents a design era or movement (Bauhaus, Mid-Century Modern) with its description.
* **Room:** Defines a spatial location with x/y grid coordinates and a name.
* **City:** Stores geographical coordinates (lat/lng) for cities used in provenance mapping.
* **UserCollection:** Represents a named grouping of items (many-to-many relationship).

### 6.3.3 Detailed Data Structure Descriptions
* **CategoryType:** A union type ('decor' | 'music' | 'books' | 'fashion') ensuring type safety across the application.
* **Signal-based State:** Use of Angular Signals for reactive synchronization of collection data and authentication state.

### 6.3.4 Detailed Design Diagrams Section
Detailed UML diagrams in this section illustrate the Angular Signal-based state management: User Action -> Service Method -> Supabase Update -> Signal Update -> UI Re-render.

---

## 6.4 Database Design and Description

### 6.4.1 Database Design ER Diagram
The relational schema follows a normalized approach with clear relationships:
* **`items` (Table):** The central entity storing item details, linked to users, rooms, and movements.
* **`movements` (Table):** A lookup table for design movements and historical eras.
* **`rooms` (Table):** Stores user-defined spatial locations (grid coordinates) for the Blueprint view.
* **`collections` (Table):** Stores named groupings of items defined by users.
* **`collection_items` (Join Table):** Manages the many-to-many relationship between `items` and `collections`.
* **`cities` (Table):** Stores geographical data (latitude and longitude) for provenance mapping.

### 6.4.2 Database Access
Database access is managed via the Supabase PostgREST API. The `ArchiveService` uses the `supabase-js` client to perform authenticated queries. All queries are scoped to the `user_id` of the currently logged-in user, ensuring data isolation.

### 6.4.3 Database Security
* **Row Level Security (RLS):** Enabled on all tables. Policies ensure that users can only view, create, update, or delete records where the `user_id` matches their own authenticated ID (`auth.uid()`).
* **Storage Policies:** The `item-photos` bucket is protected by RLS policies that restrict file uploads and public URL access to folders matching the user's ID.
* **Edge Functions:** Secure access to the Discogs API is handled via a server-side Supabase Edge Function (`discogs-search`), preventing the exposure of API secrets in the frontend.
