# Software Requirements Specification: Archival

## Requirements Introduction

### Project Description

Archival is a specialized curation platform designed for intentional collectors who wish to move beyond simple inventory tracking toward a deeper understanding of their personal belongings. By treating furniture, fashion, and literature as interconnected data points, the system allows users to document the "aesthetic DNA" of their environment, linking physical objects to historical design movements—such as Bauhaus or Mid-Century Modern—that define them.

The application utilizes an Angular-based gallery display to visualize the chronological density of a collection, leveraging a Supabase-managed PostgreSQL database to identify hidden common threads across disparate items. Through this highly visual system, users can analyze the historical evolution of their belongings and curate their surroundings with the intentionality of a professional archivist.

### Glossary

- **Gallery View:** The primary architectural layout characterized by high-contrast monochrome aesthetics, wide grid spacing, and museum-grade typography.
- **Chronology:** An interactive temporal visualization that plots archival items on a linear timeline based on their year of release or acquisition.
- **Design Movement:** A specific historical era or stylistic trend (e.g., Bauhaus, Brutalism) used to categorize the aesthetic lineage of an item.
- **The Gallery:** The secure, high-fidelity gallery grid where curated items are displayed and filtered.
- **Insights:** Data visualizations of item locations, movements, creators, and temporal distribution.

### Assumptions

- **Single-User Access:** The system is designed for individual curators; collections are private and not shared between users by default.
- **Connectivity:** Users are assumed to have a stable internet connection for real-time synchronization with Supabase and external APIs (Google Books, Discogs).
- **Data Sovereignty:** Users own the metadata and images they upload; the system provides a platform for curation but does not claim ownership of user-contributed content.

### Constraints

- **External API Quotas:** Discovery features are bound by the rate limits of the Google Books and Discogs APIs.
- **Image Size Limits:** To maintain performance, individual item photo uploads are limited to 5MB per file.
- **Browser Compatibility:** The application is optimized for Evergreen browsers (Chrome, Firefox, Safari, Edge) and may not support legacy browsers like Internet Explorer.

### Context

The system operates as a client-centric application where the Angular frontend (hosted on Vercel) orchestrates data flow between several key entities:

1. **Curator (User):** Interacts with the GUI for data entry and visualization.
2. **Supabase (Backend):** Provides PostgreSQL for relational data storage, GoTrue for JWT-based authentication, and Storage for archival photos.
3. **External Sources:** RESTful interfaces (Google Books, Discogs) provide metadata enrichment via JSON over HTTPS.
4. **Supabase Edge Functions:** Securely proxy Discogs API requests to protect sensitive developer credentials.

![UML Diagram](diagrams/UML-Diagram.png)

The remainder of this document is structured as follows. The Functional Requirements section presents features as User Stories to define project value. The Performance Requirements section details interface responsiveness metrics. Finally, the Environment Requirements section specifies the resources required for development and execution.

---

## Functional Requirements

### Epic 1: Acquisitions (Acquisition CSC)

- **FR 1 (Automated Metadata Discovery):** The system shall allow a user to enter the name of a book or album and retrieve suggested covers and metadata from the Google Books and Discogs APIs.
  - **Acceptance Criteria:** Metadata including title, creator, year, and high-resolution cover art will be populated automatically.
  - **Manual Override:** The user will be able to manually edit any auto-populated field or choose an alternative suggestion.
  - **Edge Case:** If the external API is unreachable, the system will notify the user and allow for manual data entry.
- **FR 2 (Polymorphic Entry Form):** The system shall display category-specific fields (e.g., "Author" for books, "Designer" for decor) based on the item's selected category.
  - **Acceptance Criteria:** Irrelevant fields will be hidden to prevent metadata pollution.
  - **Acceptance Criteria:** Movement suggestions will be derived from the application's internal movement database.
- **FR 3 (Archival Photograph Upload):** The system shall allow the user to upload high-resolution images of unique items that are not present in public databases.
  - **Acceptance Criteria:** Uploads are limited to 5MB and must be stored in the user-specific Supabase Storage bucket.
  - **Edge Case:** The system will reject files larger than 5MB and notify the user of the failure.
- **FR 4 (Curated Metadata Refinement):** The system shall allow a user to edit or delete any existing item in their archive.
  - **Acceptance Criteria:** Changes must be persisted immediately to the database, and deleted items must be removed from the gallery view.
  - **Audit Trail:** The system will track the `last_updated_at` timestamp for every item.

### Epic 2: The Gallery (Gallery CSC)

- **FR 5 (Gallery Visualization):** The system shall display archival items in a high-contrast grid characterized by significant whitespace and museum-grade typography.
- **FR 6 (Multi-Dimensional Filtering):** The system shall allow a user to filter the collection by **Design Movement**, **Category**, and **Year/Era**.
  - **Acceptance Criteria:** The filter tray must update dynamically based on the current collection's metadata.
- **FR 7 (Internal Search):** The system shall allow a user to search for items by name, creator, or brand.
  - **Acceptance Criteria:** Search results must update in real-time as the user types (debounced).
  - **Edge Case:** If no items match the search query, the system shall display a clear "No results found" message.

### Epic 3: Chronology (Chronology CSC)

- **FR 8 (Timeline Structure):** The system shall plot items on a vertical timeline based on their archival year.
- **FR 9 (Timeline Item Photos):** The system shall display the images of all items next to their year in the timeline.

### Epic 4: Insights (Insights CSC)

- **FR 10 (Style Correlation Analysis):** The system shall generate interactive charts showing movements and genres in different item categories.
- **FR 11 (Temporal Intensity):** The system shall display a "Temporal Distribution" graph identifying the decades most represented in the collection.
- **FR 12 (Global Provenance Mapping):** The system shall visualize the geographical origins of items on an interactive world map using coordinates derived from the 'City' metadata.

### Epic 5: Collections & Curation (Curation CSC)

- **FR 13 (Spatial & Thematic Collections):** The system shall allow a user to create named collections (e.g., "Living Room Exhibition") and link items to them in a many-to-many relationship.
- **FR 14 (Relational Discovery):** The system shall identify and suggest "Related Items" based on shared design movements or creators.
  - **Edge Case:** If an item has no shared metadata with others, the system shall not suggest any related items.

### Epic 6: Spatial Mapping (Blueprint CSC)

- **FR 15 (Blueprint Visualization):** The system shall provide a virtual floor plan view ("Blueprint") that allows users to visualize their collection within a spatial 2D grid.
- **FR 16 (Room Management):** The system shall allow users to create, name, and delete virtual 'Rooms' to define the topographical structure of their archive.

### Epic 7: Identity & Security

- **FR 17 (Secure Authentication):** The system shall provide a secure gateway for users to sign up, sign in, and maintain an active session.
  - **Data Isolation:** All archival data must be programmatically restricted to the authenticated owner's ID.

### Authorization Roles

- **Curator (Owner):** The primary user who has full read/write/delete access to their own archive.
- **System (Supabase Auth):** Manages identity verification and JWT issuance to secure API requests.
- **External API (Google/Discogs):** Read-only data providers for metadata enrichment.

### Error Handling & Offline Flow

- **Offline Attempts:** The system shall inform the user when they are offline and prevent data-mutating operations until a connection is restored.
- **Duplicate Items:** The system shall warn a user if they attempt to add an item with a name and creator that already exists in their archive.
- **Partial Saves:** The system shall utilize client-side state management to prevent data loss in the event of a page refresh during the acquisition process.

---

## Performance Requirements

- **PR 1 (Data Privacy & Security):** The system shall ensure data isolation using Supabase RLS policies; an authenticated user shall only be able to access their own collection records.
- **PR 2 (Interface Responsiveness):** The initial load of the **Gallery** view shall not exceed **2.0 seconds** at the p95 level on broadband connections (>=10Mbps download) and **4.0 seconds** on 3G connections.
- **PR 3 (Data Processing Latency):** Local filtering and searching operations shall refresh the interface within **300ms** at p95. Server-side operations requiring a round-trip to Supabase (e.g., adding an item) shall complete within **700ms** at p95.
- **PR 4 (Temporal Visualization Rendering):** The **Chronology** timeline shall render up to 2,000 archival items within **1.0 second**.
- **PR 5 (Network Error Resilience):** If external APIs (Google, Discogs) fail to respond within **1.0 seconds**, the system shall implement a fallback logic that notifies the user and allows manual input without blocking the main thread.
- **PR 6 (Image Loading Optimization):** The system shall utilize lazy-loading for all gallery images, ensuring a **Largest Contentful Paint (LCP)** of under **2.5 seconds**.

---

## Environment Requirements

### Development Environment

- **Operating Systems:** macOS, Windows, or Linux.
- **Version Control:** Git (managed via GitHub).
- **Runtime:** Node.js (>= v20.0.0) with NPM (>= v10.0.0).
- **Frameworks & Build Tools:** Angular CLI (>= v19.x), Supabase CLI (for local development and Edge Function management).
- **IDE:** Visual Studio Code (recommended) with Angular Language Service and ESLint extensions.
- **QA & Testing:** Jasmine and Karma for unit testing; ESLint and Prettier for linting and code formatting.

### Execution (Production) Environment

- **Cloud Hosting (Frontend):** Vercel (CD/CI integration with GitHub main branch).
- **Database & BaaS (Backend):** Supabase (managed PostgreSQL, GoTrue Auth, Edge Functions, and Object Storage).
- **External APIs:** Google Books (REST over HTTPS), Discogs (REST over HTTPS).
- **Client Requirements:** Evergreen browsers (Chrome >= 90, Firefox >= 90, Safari >= 15) with a recommended minimum resolution of 1024x768.
