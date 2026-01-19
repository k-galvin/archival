# 5. Software Requirements Specification: ARCHIVAL

## 5.1 Requirements Introduction
**Archival** is a sophisticated curation platform designed to document and analyze the historical "DNA" of a user’s possessions. Moving beyond simple inventory tracking, Archival treats Books, Fashion, and Decor as equal data points in a single "Aesthetic Profile." Utilizing an architectural interface, the application provides visual analytics through temporal intensity mapping and structured categorical vaulting to help users understand the design evolution within their own collection.



#### High-Level System Components
The system architecture follows a **Full-Stack Managed Pattern**:

* **Frontend Layer (Angular 17+):** A responsive gallery interface using standalone components and Signals for high-performance state management.
* **Styling Layer (Tailwind CSS):** Implements a sharp-edged, high-contrast visual design inspired by modern museum archives.
* **Visualization Engine (D3.js or Chart.js):** Transforms database results into interactive "Density Maps" and "Style Correlation" charts.
* **Backend API (Node.js):** A RESTful service layer managing polymorphic data routing, historical logic, and SQL query execution.
* **Persistence Layer (PostgreSQL):** A relational SQL database designed to manage complex metadata associations between different item categories.

---

## 5.2 Functional Requirements
The functional requirements describe the specific services and features provided by the Archival system, as outlined in the project proposal.

### 5.2.1 Unified Archive & Registration
* **5.2.1.1** The system shall provide a **Polymorphic Entry System** to register diverse item types including Decor, Fashion, Books, and Records.
* **5.2.1.2** Each entry type shall support unique metadata fields (e.g., ISBN/Publisher for Books, Material/Designer for Decor, Fabric/Brand for Fashion).
* **5.2.1.3** The system shall provide a dedicated visual documentation upload area with sharp-edged UI boundaries for high-fidelity item photography.

### 5.2.2 Historical Mapping & Taxonomy
* **5.2.2.1** The system shall implement a database-driven tagging system that aligns every item with a specific **Design Movement** (e.g., Bauhaus, Mid-Century Modern, Minimalism).
* **5.2.2.2** The system shall allow users to browse the "Vault" view, where artifacts are grouped by their design taxonomy rather than their object category.

### 5.2.3 Era Analysis & Data Visualization
* **5.2.3.1** The system shall visualize "Temporal Intensity" using an interactive bar graph or density map powered by D3.js or Chart.js.
* **5.2.3.2** The visualization shall represent the frequency of items across a historical timeline ranging from 1920 to 2026.
* **5.2.3.3** The system shall provide a **Chronological Journey** view, sorting the entire collection by year in ascending order to reveal aesthetic evolution.

### 5.2.4 Style Correlation Engine
* **5.2.4.1** The logic engine shall analyze the collection to identify percentage overlaps (e.g., "70% of your archive aligns with Scandinavian Design").
* **5.2.4.2** The system shall suggest correlations between disparate categories based on shared historical eras or movements.

---

## 5.3 Performance Requirements

| ID | Requirement | Target Metric |
| :--- | :--- | :--- |
| **5.3.1.1** | View Transitions | < 200 milliseconds using Angular Router |
| **5.3.1.2** | Query Performance | Complex SQL joins (PostgreSQL) must resolve in < 150ms |
| **5.3.1.3** | Visualization Render | Charts must be interactive and render at 60fps |
| **5.3.2.1** | Capacity | Support 1,000+ items with polymorphic metadata without DOM lag |

---

## 5.4 Environment Requirements

### 5.4.1 Development Environment Requirements
* **Frameworks:** Angular 17+ (Frontend), Express/Node.js (Backend).
* **Database:** PostgreSQL 15+ for relational data management.
* **Version Control:** Git for source management and collaborative tracking.
* **Visualization:** D3.js or Chart.js libraries for SVG/Canvas rendering.
* **Typography:** 'Schibsted Grotesk' via Google Fonts for a boutique museum aesthetic.

### 5.4.2 Execution Environment Requirements
* **Hardware:** Modern computing device (minimum resolution 1024x768).
* **Software:** Evergreen web browsers (Chrome 90+, Safari 14+, Firefox 88+).
* **Connectivity:** Active internet connection to interface with the Node.js API and fetch remote assets.

#### 5.4.2 Execution Environment Requirements
* **Hardware:** A modern computing device (minimum resolution of 1024x768).
* **Software:** An evergreen web browser (Chrome 90+, Safari 14+, or Firefox 88+).
* **Runtime:** Node.js environment (for SSR/Universal if required).
