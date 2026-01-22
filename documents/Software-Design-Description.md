# Software Design Description (SDD): Archival

## 6.1 Introduction
This document presents the architecture and detailed design for the software for the Archival project. The project performs high-fidelity design curation by allowing users to store their items in a museum-like environment. This environment leverages external APIs for metadata enrichment and provides advanced visualizations through a digital gallery ("The Vault"), a historical timeline ("Chronology"), and an analytics dashboard.

### 6.1.1 System Objectives Section
The objective of this application is to provide a sophisticated interface for personal collection management that mimics the experience of a digital museum. 
* The system aims to automate the "Aquisition" input process by retrieving metadata and high-resolution imagery from Google Books, Discogs, and Unsplash.
* The application provides a "Chronology" view to visualize the historical weight and evolution of a collection over time.
* The "Analytics Dashboard" provides users with data-driven insights into their aesthetic preferences, identifying correlations between their items and specific historical design movements.
* The system is designed to be polymorphic, supporting diverse item categories—Books, Records, Furniture, and Fashion—within a unified, high-performance interface.

### 6.1.2 Hardware, Software, and Human Interfaces Section

#### 6.1.2.1 Hardware Interfaces
The application is a web-based platform designed to be accessed via standard workstations (macOS, Windows, or Linux).
* **Workstation:** Minimum 8GB RAM to support modern browser rendering of D3.js/Chart.js visualizations.
* **Input:** Standard QWERTY keyboard and mouse/trackpad for data entry and timeline navigation.
* **Display:** A minimum resolution of 1024x768 is required to prevent visual clipping of the data-dense dashboard and chronology views.

#### 6.1.2.2 Software Interfaces
The application utilizes a "Backend-as-a-Service" (BaaS) model via Supabase.
* **Supabase Client (v2.x):** Interfaces with the PostgreSQL database using PostgREST. It manages all CRUD operations and handles Row Level Security (RLS).
* **Google Books API:** A RESTful interface used to retrieve book covers and publication years. Communication is via HTTPS/JSON.
* **Discogs API:** Used for music record artwork and metadata. It requires a Developer Token for authenticated requests.
* **Unsplash API:** Used for stylistic placeholders for Decor and Fashion categories.
* **Chart.js / D3.js:** Third-party JavaScript libraries used for rendering SVG-based timelines and canvas-based analytics.

#### 6.1.2.3 Human Interfaces
The Graphical User Interface (GUI) follows a "Museum Minimalist" design language. 
* **Design Tokens:** High-contrast monochrome palette, 'Schibsted Grotesk' geometric typography, and a rigid grid system.
* **Components:** The GUI consists of a polymorphic "Acquisitions" form, a "Vault" grid for browsing, and a "Chronology" interactive timeline.

---

## 6.2 Architectural Design Section
The architectural design for Archival is based on a Two-Tier BaaS pattern, connecting a rich Angular frontend directly to a managed Supabase backend.

### 6.2.1 Major Software Components Section
* **Acquisitions CSC:** Relates to FR 1-4 and FR 14-18. Handles item intake, API discovery logic, and draft management.
* **Vault CSC:** Relates to FR 5-7. Manages the searchable grid, filtering logic, and item retrieval.
* **Chronology CSC:** Relates to FR 8-9. Processes temporal data and manages the interactive timeline state.
* **Analytics CSC:** Relates to FR 10-11. Performs data aggregation and movement correlation logic.
* **Curation CSC:** Relates to FR 12-13. Manages the many-to-many relationships for Collections.

### 6.2.2 Major Software Interactions Section
The Angular frontend communicates with Supabase via an initialized `supabase-js` client. All data requests are sent as HTTPS REST calls. External APIs (Google, Discogs, Unsplash) are called directly from the frontend services using Angular's `HttpClient`. Authentication is performed first; the resulting JWT is passed in the header of all database requests to trigger PostgreSQL RLS policies.

### 6.2.3 Architectural Design Diagrams Section
1. **Use Case Diagram:** Defines the interactions between the "Curator" (User) and the Acquisition, Vault, and Analytics subsystems.
2. **Component Diagram:** Illustrates the Angular frontend's dependency on the Supabase Client and the three external REST APIs.
3. **Deployment Diagram:** Shows the frontend hosted on a CDN (Vercel) communicating with the Supabase Cloud infrastructure and Object Storage.

---

## 6.3 CSC and CSU Descriptions Section

### 6.3.1 Detailed Class Descriptions

#### 6.3.1.1 ItemService (CSU)
* **Purpose:** The primary CSU for managing artifact data persistence.
* **Fields:** `currentItems`: Subject tracking the state of loaded items.
* **Methods:**
    * `createItem(payload)`: Saves a new artifact to the `items` table.
    * `updateCondition(id, status)`: Updates the physical condition metadata.
    * `fetchVault()`: Retrieves filtered data for the gallery view.

#### 6.3.1.2 DiscoveryService (CSU)
* **Purpose:** Manages external API calls for auto-curation.
* **Methods:**
    * `getGoogleBooks(title)`: Fetches book covers and authors.
    * `getDiscogs(album)`: Fetches record sleeve art and pressing info.
    * `getUnsplash(query)`: Fetches stylistic placeholder images.

#### 6.3.1.3 TimelineController (CSU)
* **Purpose:** Orchestrates the D3.js rendering logic.
* **Methods:**
    * `generateScale(items)`: Creates a linear time scale based on item years.
    * `plotNodes()`: Renders interactive SVG circles for each artifact.

### 6.3.2 Detailed Interface Descriptions
* **IArtifact:** Defines the core data structure (id, name, year, movement_id, image_url, condition).
* **IMetadata:** A flexible interface for category-specific JSON data (e.g., author for books, material for decor).

### 6.3.3 Detailed Data Structure Descriptions
* **Polymorphic Metadata (JSONB):** A non-relational column in the `items` table that stores key-value pairs specific to the item category.
* **Accession Drafts:** A local storage structure used to persist form progress before a database commit is made.

### 6.3.4 Detailed Design Diagrams Section
Detailed UML Sequence Diagrams included in this section illustrate the "Auto-Suggest" workflow: User types -> Debounce -> API Call -> UI Preview -> User Select -> Database Commit.

---

## 6.4 Database Design and Description

### 6.4.1 Database Design ER Diagram
The relational schema follows a "Star Schema" approach:
* **`items` (Fact Table):** Contains core data and a JSONB column for polymorphic metadata.
* **`movements` (Dimension Table):** Contains historical data about design eras.
* **`collections` (Dimension Table):** Stores user-defined groupings.
* **`collection_items` (Join Table):** Manages the many-to-many link between Items and Collections.

### 6.4.2 Database Access
Database access is restricted through the Supabase PostgREST API. All queries are client-side but are validated server-side by PostgreSQL against the authenticated user's ID.

### 6.4.3 Database Security
* **Row Level Security (RLS):** Policies are implemented to ensure `auth.uid() = items.user_id`.
* **Storage Policies:** Access to the `item-images` bucket is restricted to the owner's specific folder path (`/artifacts/{appId}/users/{userId}/`).
