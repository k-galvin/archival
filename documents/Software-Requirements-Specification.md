# Software Requirements Specification: Archival

## Requirements Introduction

### Project Description
Archival is a specialized curation platform designed for intentional collectors who wish to move beyond simple inventory tracking toward a deep, analytical understanding of their personal belongings. By treating furniture, fashion, and literature as interconnected data points, the system allows users to document the "aesthetic DNA" of their environment, linking physical objects to historical design movements—such as Bauhaus or Mid-Century Modern—that define them. 

The application utilizes an Angular-based "Museum View" to visualize the chronological density of a collection, leveraging a Supabase-managed PostgreSQL database to identify hidden common threads across disparate items. Through this sophisticated logic engine, users can analyze the historical evolution of their lifestyle and curate their surroundings with the rigor of a professional archivist.

![UML Diagram](UML-Diagram.png)

The remainder of this document is structured as follows. The **Functional Requirements** section presents features as User Stories to define project value. The **Performance Requirements** section details interface responsiveness metrics. Finally, the **Environment Requirements** section specifies the resources required for development and execution.

---

## Functional Requirements

The following requirements describe the features of the Archival system from the perspective of the user. These stories focus on delivering business value and enabling a "museum-quality" curation experience.

### Epic: Intelligent Curation & Entry
* **FR-1** As a **Design Enthusiast**, I want to **input a title for a book or record and have metadata automatically populate**, so that **I can maintain a historically accurate archive without manual data entry.**
* **FR-2** As a **Collector**, I want to **upload personal photographs or use stylistic placeholders**, so that **I can maintain a visual record of my unique pieces even if I haven't photographed them yet.**
* **FR-3** As an **Archivist**, I want the **system to suggest a design movement based on the item I enter**, so that **I can learn more about the historical lineage of my belongings.**
* **FR-4** As a **User**, I want to **add category-specific metadata (e.g., Author for books, Brand for fashion)**, so that **my archive contains the necessary detail for professional-grade analysis.**

### Epic: The "Museum View" Visualization
* **FR-5** As a **User**, I want to **view my items on an interactive chronological timeline**, so that **I can see the "Temporal Intensity" and historical clusters of my collection.**
* **FR-6** As a **Curator**, I want to **group items into themed "Collections" (e.g., "The Radical Design Era")**, so that **I can visualize how specific aesthetics manifest across different types of objects.**
* **FR-7** As a **User**, I want to **search and filter "The Vault" by movement or year**, so that **I can quickly locate specific artifacts within a large personal archive.**

### Epic: Style Correlation Engine
* **FR-8** As an **Intentional Collector**, I want to **see a "Style Correlation" percentage on my dashboard**, so that **I can understand which design movements most influence my personal environment.**
* **FR-9** As a **User**, I want the **system to identify "hidden threads" across my categories**, so that **I can discover unexpected aesthetic links between my literature and my furniture.**

---

## Performance Requirements

These requirements ensure that the high-fidelity visual interface remains responsive and the archive feels like a premium digital experience.

* **PR-1** The application shall **complete view transitions within 200ms**, ensuring that movement between the Dashboard and The Vault feels instantaneous.
* **PR-2** The system shall **update filtered results in "The Vault" within 100ms**, allowing for lag-free exploration of design movements.
* **PR-3** The application shall **maintain a consistent 60fps during all animations**, preventing "stuttering" in the Chronology and Dashboard visualizations.
* **PR-4** The system shall **maintain these performance standards for collections up to 1,000 unique artifacts**, ensuring scalability for serious collectors.

---

## Environment Requirements

### Development Environment Requirements
* **Workstation:** Minimum 8GB RAM (macOS, Windows, or Linux) to support the Angular development server.
* **IDE:** Visual Studio Code with Angular Language Service and Tailwind CSS extensions.
* **Runtime:** Node.js (Version 18.x or higher - LTS).
* **Version Control:** Git 2.x for source management and GitHub for collaboration.

### Execution Environment Requirements

| Category | Requirement | Justification |
| :--- | :--- | :--- |
| **Hosting** | Vercel or Netlify | Supports modern CI/CD pipelines for Angular applications. |
| **BaaS** | Supabase | Managed PostgreSQL, Row Level Security, and Object Storage for photos. |
| **External APIs** | Google Books, Discogs, Unsplash | Essential for the Automated Asset Discovery stories (**FR-1**, **FR-2**). |
| **Client** | Evergreen Web Browser | Must support HTML5 Canvas and SVG for D3.js/Chart.js visualizations. |
| **Network** | Persistent Connection | Required for real-time metadata fetching from external design databases. |
* **Network Connectivity:** A persistent internet connection. This is a functional necessity as the app relies on real-time fetching from external APIs to provide the "Auto-Curation" features.
* **Resource Acquisition:** All software tools are open-source. Supabase, Vercel, and the three external APIs offer free-tier plans that accommodate the scope of this project. No additional financial resources are required.
