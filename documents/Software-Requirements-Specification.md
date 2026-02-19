# Software Requirements Specification: Archival

## Requirements Introduction

### Project Description
Archival is a specialized curation platform designed for intentional collectors who wish to move beyond simple inventory tracking toward a deep, analytical understanding of their personal belongings. By treating furniture, fashion, and literature as interconnected data points, the system allows users to document the "aesthetic DNA" of their environment, linking physical objects to historical design movements—such as Bauhaus or Mid-Century Modern—that define them. 

The application utilizes an Angular-based "Museum View" to visualize the chronological density of a collection, leveraging a Supabase-managed PostgreSQL database to identify hidden common threads across disparate items. Through this sophisticated logic engine, users can analyze the historical evolution of their lifestyle and curate their surroundings with the rigor of a professional archivist.

![UML Diagram](diagrams/UML-Diagram.png)

The remainder of this document is structured as follows. The Functional Requirements section presents features as User Stories to define project value. The Performance Requirements section details interface responsiveness metrics. Finally, the Environment Requirements section specifies the resources required for development and execution.

---

## Functional Requirements
### Epic 1: Acquisitions
* **FR 1** As a design enthusiast, I want to enter the name of a book or album and see suggested covers, so that I can populate my archive with high-quality visuals without manual searching.
* **FR 2** As a meticulous collector, I want the entry form to show only relevant fields (e.g., "Fabric" for fashion vs. "Author" for books), so that I don't get distracted by irrelevant metadata.
* **FR 3** As a curator, I want the system to suggest a "Design Movement" based on the item I type, so that I can maintain a consistent historical record without being a design expert.
* **FR 4** As a user with unique items, I want to upload my own high-resolution photograph, so that I can document pieces that are not available in public databases.
* **FR 5** As a meticulous curator, I want to edit the details of an existing acquisition, so that I can correct errors or update information as I learn more about a piece's history.

### Epic 2: The Vault
* **FR 6** As a museum-minded user, I want to view my items in a clean, high-contrast grid, so that I can appreciate the aesthetic value of my collection at a glance in "The Vault."
* **FR 7** As a user with a growing collection, I want to filter my archive by design movement and year, so that I can quickly find items belonging to a specific era like "Bauhaus."
* **FR 8** As a curator, I want to search for items by creator or brand, so that I can see the breadth of my holdings from a specific designer.

### Epic 3: Chronology
* **FR 9** As a design historian, I want to see my items plotted on a horizontal timeline in "Chronology," so that I can visualize the historical density and evolution of my belongings.
* **FR 10** As an interactive user, I want to click on a node in the timeline to see the full item details, so that I can transition seamlessly between historical context and specific data.

### Epic 4: Analytics Dashboard
* **FR 11** As an intentional collector, I want to see a chart showing "Style Correlations," so that I can understand the dominant design movements that define my personal taste.
* **FR 12** As a data enthusiast, I want a "Temporal Intensity" bar graph on my Dashboard, so that I can see which decades are most represented in my home.

### Epic 5: Collections & Curation
* **FR 13** As a home curator, I want to create named "Collections," so that I can group items by room, theme, or personal exhibition.
* **FR 14** As a sophisticated user, I want to see "Related Items" when viewing an artifact, so that the system helps me discover connections between my furniture, books, and records.

---

## Performance Requirements
* **PR 1** As a private collector, I want my archive to be accessible only to me via secure login, so that my personal possessions and data are kept secure and private.
* **PR 2** As a mobile user, I want the interface to respond instantly when I apply filters or navigate views, so that the experience feels fluid and professional regardless of my device.
* **PR 3** As a user in a low-connectivity area, I want to be notified if the system cannot reach external APIs (Discogs, Google Books, etc.), so that I understand why certain "Auto-Curation" features are temporarily unavailable.
* **PR 4** As a user viewing many images, I want the gallery to load assets efficiently, so that I don't experience lag while scrolling through "The Vault."

---

## Enviornment Requirements
* **ER 1** As a multi-device user, I want the application to be hosted in the cloud, so that I can accession new items from my phone while viewing my full dashboard on a desktop.
* **ER 2** As a user who values aesthetics, I want the application to render correctly on screens with at least 1024x768 resolution, so that the specialized museum-grade typography and layouts are displayed as intended.
* **ER 3** As a long-term collector, I want my data stored in a managed relational database, so that my archive remains persisted and safe from data loss over several years.
