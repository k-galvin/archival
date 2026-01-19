## 5. Software Requirements Specification: ARCHIVAL

### 5.1 Requirements Introduction
**Archival** is a specialized web-based registry and design memory system curated for historians and collectors of 20th-century material culture. The system functions as a formal digital archive for tracking design artifacts across categories such as Decor, Fashion, and Books, organizing them by historical design movements. Utilizing a sharp, architectural interface, the application provides visual analytics through temporal intensity mapping and structured categorical vaulting to help users understand the "aesthetic DNA" of their collection.



#### High-Level System Components
The system architecture follows the **Angular Enterprise Pattern**:

* **Component Architecture (Angular):** Orchestrates state transitions and view logic for the analytical dashboard, catalog grid, and registration portal using standalone components.
* **Reactive State Layer (RxJS/Signals):** Manages a stream of artifact metadata, ensuring type-safe handling of unique identifiers, titles, and temporal data.
* **UI Component Layer (Tailwind CSS):** Implements a sharp-edged, high-contrast visual design inspired by modern museum archives, integrated via Angular's specialized style encapsulation.
* **Filtering Engine:** A dedicated Angular Pipe or Service layer that handles real-time categorical sorting and chronological ordering of registry items.

The remainder of this document is structured as follows. Section 5.2 contains Functional Requirements detailing the specific operations of the system. Section 5.3 contains Performance Requirements regarding response times and UI stability. Section 5.4 details the Environment Requirements for both development and execution.

---

### 5.2 Functional Requirements
The functional requirements describe the specific services and features provided by the Archival system, organized by their primary user-facing perspectives.

#### 5.2.1 Navigation and Global Interface
The system provides a consistent frame for accessing the various archival views via **Angular Router**.
* **5.2.1.1** The system shall provide a fixed navigation masthead at the top of the browser window.
    * The masthead will contain `routerLink` directives for the Dashboard, Catalog, Timeline, and Archive views.
    * Navigation links will be styled in lowercase to maintain the boutique aesthetic.
* **5.2.1.2** The system shall utilize a custom monogram logo (composed of geometric bars) as a return link to the Dashboard.
* **5.2.1.3** The system shall indicate the currently active view using `routerLinkActive` with a primary accent underline in the masthead.
    * The underline will use the **'Steel Blue'** primary accent color.

#### 5.2.2 Dashboard Analytics
The dashboard provides a high-level summary of the repository's current status.
* **5.2.2.1** The system shall display the heading **"collected / forms."** as the primary interface title.
* **5.2.2.2** The system shall visualize "Temporal Intensity" using a sharp-edged bar graph.
    * The graph shall represent the frequency of items across a historical timeline from 1920 to 2026.
    * Bars in the graph will alternate colors between the defined 'Navy', 'Steel Blue', and 'Sage' palette.
* **5.2.2.3** The system shall display a large-scale numerical counter of the total objects currently archived using an async pipe.

#### 5.2.3 Artifact Catalog and Filtering
The catalog allows for detailed scanning and sorting of individual registry entries.
* **5.2.3.1** The system shall provide a responsive grid layout of all registered artifacts using `*ngFor` or the `@for` control flow.
* **5.2.3.2** Each artifact entry shall display a unique ID, category tag, title, creator, and year.
* **5.2.3.3** The system shall provide category filters for **"All"**, **"Decor"**, **"Fashion"**, and **"Books"**.
    * Clicking a filter will update the observable stream in real-time.
    * The active filter will be highlighted with an inverted color scheme (black background).

#### 5.2.4 Chronological Timeline
The timeline provides a path-based visualization of the collection's history.
* **5.2.4.1** The system shall provide a "Journey" view that automatically sorts artifacts by year in ascending order.
* **5.2.4.2** The timeline shall utilize a central vertical anchor line to connect historical entries.
* **5.2.4.3** The system shall display the year in oversized, high-contrast typography for each timeline node.

#### 5.2.5 Taxonomic Archive (Vault)
The vault view provides grouping based on design movements.
* **5.2.5.1** The system shall group artifacts into sections based on their assigned "Design Movement."
* **5.2.5.2** Each movement section shall display the total count of entries associated with that taxonomy.

#### 5.2.6 Artifact Registration
The portal allows users to add new data to the system.
* **5.2.6.1** The system shall provide an "Add Artifact" form using **Angular Reactive Forms**.
* **5.2.6.2** The form shall include validated text inputs for Title, Year, Brand, and Movement with built-in `Validators`.
* **5.2.6.3** The system shall provide a dedicated visual documentation upload area with a sharp-edged boundary.

---

### 5.3 Performance Requirements

| ID | Requirement | Target Metric |
| :--- | :--- | :--- |
| **5.3.1.1** | Routing Transition | < 200ms using Angular's optimized router |
| **5.3.1.2** | Filter Refresh Rate | < 100ms via OnPush change detection |
| **5.3.1.3** | Interaction Fluidity | Constant 60fps during hovers |
| **5.3.2.1** | Data Capacity | Support 500+ artifacts with Virtual Scroll if necessary |

---

### 5.4 Environment Requirements

#### 5.4.1 Development Environment Requirements
* **Framework:** Angular CLI (latest stable version).
* **Language:** TypeScript 5.x for strict type checking.
* **Version Control:** Git for source management and collaborative tracking.
* **Styling:** Tailwind CSS integrated via PostCSS.
* **Typography:** Access to Google Fonts for the **'Schibsted Grotesk'** family.

#### 5.4.2 Execution Environment Requirements
* **Hardware:** A modern computing device (minimum resolution of 1024x768).
* **Software:** An evergreen web browser (Chrome 90+, Safari 14+, or Firefox 88+).
* **Runtime:** Node.js environment (for SSR/Universal if required).
