# Project Proposal: Archival

## Part 1: Verbal Description

### High-Level Overview
**Archival** is a sophisticated personal curation platform designed to document and analyze the historical "DNA" of an individual’s most meaningful possessions. Moving beyond simple inventory tracking, **Archival** allows users to catalog pieces from their **interior design collection, wardrobe, and personal library**, linking each item to specific design movements and chronological eras. The application’s primary objective is to provide a "Museum View" of one's own home, using advanced data visualization to reveal the aesthetic threads that connect a 1950s chair to a modern fashion piece or a classic work of literature.

### Competitive Analysis
Existing applications generally fall into two categories: utilitarian home inventory (e.g., **Sortly**) or niche hobbyist trackers (e.g., **Goodreads** or **Stylebook**). These apps are siloed, meaning a user cannot see the relationship between their books and their furniture. **Archival** is unique because it is **cross-disciplinary**. It treats a book, a dress, and a lamp as equal data points in a user’s "Aesthetic Profile." By implementing a relational SQL structure, **Archival** offers a level of historical context and visual analytics that consumer-grade apps currently do not provide.

### Most Important Features
* **The Unified Archive:** A polymorphic entry system for different item types (Books, Clothes, Decor, Records) within a single interface.
* **Historical Mapping:** A database-driven tagging system that aligns items with design movements like Bauhaus, Mid-Century Modern, or Minimalism.
* **Era Analysis (Data Viz):** An interactive timeline that visualizes the "density" of a collection across different decades.
* **Style Correlations:** A logic engine that identifies overlaps in the user’s collection (e.g., "70% of your archive aligns with Scandinavian Design").
* **Responsive Gallery:** An Angular interface that mimics a professional digital gallery experience.

### Hardware and Software Requirements
* **Hardware:** Development will be conducted on a standard workstation; the end product is a web application accessible via any modern desktop or mobile browser.
* **Software Stack:**
    * **Frontend:** Angular 17+, TypeScript (Logic), Tailwind CSS (Styling).
    * **Data Visualization:** D3.js or Chart.js for rendering historical data.
    * **Backend:** Node.js with a RESTful API.
    * **Database:** PostgreSQL (SQL) for managing complex relational item metadata.

### End User & Maintenance
The end user is the **"Aesthetic Archivist"**—collectors, design students, or enthusiasts who want to curate their lifestyle with intentionality. Maintenance is streamlined through the use of a relational database, making it easy to update "Design Movement" libraries as new trends or historical research emerge.

---

## Part 2: Justification

### Applies and Demonstrates Prior Learning
**Archival** will utilize my experience with Angular, TypeScript, and web-app development. Additionally, I will get to use my knowledge of gallery web design that I developed during an internship I completed at a gallery during my semester in London where I was tasked with identifying web design trends present on competing galleries and museum's sites.

### Opportunity to Extend Learning
This project pushes me into the realm of **Data Science and Visualization**. Learning to map SQL query results into a **Chronological Timeline** will allow me to expand my familiarity with SQL and data visualization libraries.

### Technical Difficulty
While a basic inventory is simple, creating a **polymorphic database schema** (where different categories share common traits but have unique metadata) and an **interactive visualization suite** provides the necessary rigor. It challenges me to manage complex state across different data types while maintaining an effective UI.

### Reasonable Development Time
One semester is an ideal timeframe. The first half of the semester will focus on the SQL schema and item inputting functionality, while the second half will be dedicated to the integration of the data visualization components and UI polishing.

### Tools and Skills
My existing knowledge of TypeScript, Angular, and Node as well as my experience creating web-apps will allow me to complete the project efficiently.

### Interest and Engagement
The intersection of **interior design, fashion, and technology** is a personal passion. I am excited about the aesthetics of this project and I am especially looking forward to designing the UI. The visual nature of the proposed Archival dashboard should make it an engaging project for other students to try out at the end of the semester.
