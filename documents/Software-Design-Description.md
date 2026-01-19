# 6. Software Design Description: ARCHIVAL

## 6.1 Introduction
This document presents the architecture and detailed design for the software of the **ARCHIVAL** project. The project performs the digital cataloging and historical analysis of material culture artifacts, allowing users to register items, visualize collection density across a 20th-century timeline, and categorize objects within specific design movements.

### 6.1.1 System Objectives
The objective of this application is to provide a high-end, architecturally inspired interface for historians and collectors to manage "aesthetic DNA." The system aims to move beyond simple spreadsheets by providing a visual "Temporal Intensity" map and a "Taxonomic Vault." Key goals include real-time filtering of diverse media (Decor, Fashion, Books) and a seamless "Journey" view that chronologically orders artifacts to reveal design evolution over time.

### 6.1.2 Hardware, Software, and Human Interfaces

* **6.1.2.1 Hardware Interface:** The system interfaces with standard user input devices including a keyboard for data entry and a mouse/trackpad for navigating the timeline and grid. It requires a display with a minimum resolution of 1024x768 to render the analytical dashboard correctly.
* **6.1.2.2 Software Interface (Angular Framework):** The application utilizes the Angular 17+ framework. It interfaces with the **Angular Router** for Single Page Application (SPA) state management and **RxJS** for asynchronous data streaming and reactive state handling.
* **6.1.2.3 Third-Party Libraries:** 1. **Tailwind CSS (v3.x):** Used for the UI Component Layer, integrated via PostCSS to provide the sharp-edged, high-contrast museum aesthetic.
    2. **Heroicons:** Used for consistent, geometric iconography within the navigation and action buttons.
* **6.1.2.4 Human Interface (GUI):** The user interacts with a "Fixed Masthead" navigation system and a "Responsive Grid." A primary interaction point is the "Add Artifact" reactive form, which includes built-in browser-level validation and custom Angular validators.

---

## 6.2 Architectural Design
The ARCHIVAL system follows a modular architectural pattern. By partitioning the system into logical sets of class definitions, we ensure high **cohesion** (each part does one thing well) and low **coupling** (parts are not overly dependent on each other).

### 6.2.1 Major Software Components
* **Dashboard Component (Section 5.2.2):** Logic for calculating "Temporal Intensity" and rendering the analytics suite.
* **Catalog Component (Section 5.2.3):** The primary view for the artifact grid and real-time filtering logic.
* **Timeline Component (Section 5.2.4):** A specialized view that transforms the artifact array into a chronologically sorted "Journey."
* **Archive Service:** The "Single Source of Truth" that manages the state of the collection using RxJS `BehaviorSubjects`.

### 6.2.2 Major Software Interactions
Components interact through a **Service-Oriented Communication** pattern. The `ArchiveService` acts as the mediator. When a `RegistrationComponent` saves a new artifact, it calls a method on the `ArchiveService`, which pushes the new data to a stream. The `Catalog` and `Dashboard` components are "observers" of this stream and automatically update their views when the data changes.

### 6.2.3 Architectural Design Diagrams


---

## 6.3 CSC and CSU Descriptions
The ARCHIVAL system is a Computer Software Configuration Item (CSCI) composed of three primary Computer Software Components (CSC).

### 6.3.1 Detailed Class Descriptions
The following sections provide the details of all classes used in the ARCHIVAL application.

#### 6.3.1.1 Artifact Model (CSU)
* **Purpose:** Defines the blueprint for all objects within the registry.
* **Fields:**
    * `id: string` - UUID for the object.
    * `title: string` - The name of the piece.
    * `year: number` - Creation year.
    * `movement: string` - The design style (e.g., "Bauhaus").
    * `category: string` - Type (Decor, Fashion, or Books).

#### 6.3.1.2 ArchiveService (CSU)
* **Purpose:** The central data controller.
* **Methods:**
    * `getArtifacts()`: Returns an Observable of the collection.
    * `addArtifact(data: Artifact)`: Adds an item and updates the state.
    * `filterByCategory(cat: string)`: Logic to sort the current view.

### 6.3.2 Detailed Interface Descriptions
Interfacing between software subsystems is handled via **TypeScript Interfaces** and **Dependency Injection**. Components "interface" with the data layer by injecting the `ArchiveService` into their constructors.

### 6.3.3 Detailed Data Structure Descriptions
The "Temporal Intensity" logic utilizes a **Map Structure** where the key is a `Year` and the value is the `Count` of items. This allows the bar graph to render at $O(n)$ complexity by iterating through the collection once to bin the items.

### 6.3.4 Detailed Design Diagrams


---

## 6.4 Database Design and Description

### 6.4.1 Database Design ER Diagram
The system utilizes a relational structure. Each `Artifact` belongs to one `DesignMovement`. 



### 6.4.2 Database Access
Access is abstracted through the `ArchiveService`. While current data is stored in-memory for the session, the architecture supports `HttpClient` integration to persist data to a NoSQL or SQL backend in the next phase.

### 6.4.3 Database Security
To ensure data integrity, the system implements **Type Safety** via TypeScript to prevent malformed data. Furthermore, all inputs are sanitized using Angular's `ReactiveForms` module to prevent XSS (Cross-Site Scripting) during the documentation upload and naming process.
