# 6. Software Design Description: Archival

## 6.1 Introduction
This document presents the architecture and detailed design for the **Archival** project. The project performs high-fidelity tracking of personal material culture, utilizing a relational SQL structure to link items across disparate categories (Decor, Fashion, Books, Records) to their shared historical and aesthetic "DNA."

### 6.1.1 System Objectives
The objective of ARCHIVAL is to provide a "Museum View" of personal possessions. By mapping SQL query results to a chronological timeline, the system moves beyond inventory tracking to provide users with a cross-disciplinary analysis of their collection’s design movements and era-specific density.

### 6.1.2 Hardware, Software, and Human Interfaces

* **6.1.2.1 Hardware Interface:** The system is a web-based application designed for modern workstations. It requires a standard display (minimum 1024x768), keyboard, and mouse/trackpad for data entry and interactive timeline navigation.
* **6.1.2.2 Software Interface:** * **Frontend:** Angular 17+ with TypeScript.
    * **Backend:** Node.js with a RESTful Express API.
    * **Database:** PostgreSQL 15+ for relational metadata persistence.
* **6.1.2.3 Third-Party Libraries:** * **Tailwind CSS:** For architectural UI styling.
    * **D3.js / Chart.js:** For rendering the historical "Density Map" and "Style Correlation" logic.
* **6.1.2.4 Human Interface (GUI):** A "Responsive Gallery" interface that mimics a professional digital museum experience. Key interactions include the "Add Artifact" polymorphic form and the interactive "Journey" timeline.

---

## 6.2 Architectural Design
The system utilizes a **Three-Tier Architecture** consisting of an Angular client, a Node.js middleware, and a PostgreSQL database. This partitioning ensures that the complex relational logic of design movements is decoupled from the UI rendering.



### 6.2.1 Major Software Components
* **Polymorphic Entry Component (Frontend):** A dynamic Angular form that adjusts validation and input fields based on the selected item type (e.g., Book vs. Furniture).
* **Correlation Engine (Backend):** A Node.js service that executes SQL aggregations to calculate the percentage overlap of design movements within a user's collection.
* **Visualization Module:** A component that transforms SQL result sets into SVG/Canvas elements for the temporal intensity bar graph.
* **REST API Layer:** Manages the communication between the Angular frontend and the PostgreSQL database.

### 6.2.2 Major Software Interactions
The Angular frontend makes asynchronous HTTP requests to the Node.js backend. The backend queries the PostgreSQL database using **SQL Joins** to retrieve items based on movements or eras. For example, when a user clicks "Bauhaus," the system queries the database for all linked records across all categories and returns a unified JSON payload to the UI.

### 6.2.3 Architectural Design Diagrams


---

## 6.3 CSC and CSU Descriptions
The **ARCHIVAL CSCI** is divided into the following Computer Software Components:

### 6.3.1 Detailed Class Descriptions
The following sections provide the details of all classes used in the ARCHIVAL application.

#### 6.3.1.1 Polymorphic Item Entity (CSU)
* **Purpose:** Represents the unified data structure for all archived items.
* **Fields:**
    * `uuid`: Primary Key.
    * `category`: Enum (Decor, Fashion, Books, Records).
    * `movement_id`: Foreign Key linking to the Movements table.
    * `metadata`: JSONB column for category-specific attributes (e.g., ISBN, Fabric).
    * `year_produced`: Integer (1920-2026).

#### 6.3.1.2 ArchiveService (Angular CSU)
* **Purpose:** Interfaces with the Node.js API to provide data to the UI components.
* **Methods:**
    * `fetchTimelineData()`: Retrieves counts of items per decade.
    * `registerItem(payload)`: Posts new item data to the backend.

### 6.3.2 Detailed Interface Descriptions
* **API Interface:** Defines the contract between the Frontend and Backend using TypeScript interfaces to ensure type safety for all JSON payloads.
* **Database Interface:** The Node.js layer uses an ORM or Query Builder to interface with PostgreSQL, ensuring sanitized and optimized data retrieval.

### 6.3.3 Detailed Data Structure Descriptions
* **Correlation Map:** A key-value object returned by the backend (e.g., `{ "Mid-Century Modern": 45, "Bauhaus": 25 }`) used by Chart.js to render style overlaps.

### 6.3.4 Detailed Design Diagrams


---

## 6.4 Database Design and Description

### 6.4.1 Database Design ER Diagram
The relational schema centers on a polymorphic `items` table. A `movements` table stores the historical context, allowing for a **One-to-Many** relationship where one design movement can be attributed to many items of different types.



### 6.4.2 Database Access
Database access is handled via the Node.js layer. To support the "Era Analysis" feature, the system uses SQL `GROUP BY` and `COUNT` operations on the `year_produced` column to generate timeline data points.

### 6.4.3 Database Security
* **Constraint Validation:** PostgreSQL-level checks ensure that no item is entered with a year outside the valid range.
* **Data Sanitization:** The Node.js API uses parameterized queries to prevent SQL injection during the registration of new artifacts.
