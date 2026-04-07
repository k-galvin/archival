# Archival: User's Guide & System Manual

Welcome to **Archival**, your sophisticated digital gallery for personal collection management. Whether you are a bibliophile, a music lover, or a design curator, Archival provides a high-fidelity interface to store, visualize, and analyze your most cherished items.

---

## 1. Getting Started

### 1.1 Accessing the Registry

Archival is a web-based platform that requires no local installation. You can access your curation engine directly from any modern web browser at:

**[https://accessarchival.vercel.app](https://accessarchival.vercel.app)**

### 1.2 System Requirements

To ensure a high-fidelity experience, we recommend using the latest version of Chrome, Firefox, or Safari. While the application is mobile-responsive, the user interface is optimized for desktop resolutions (1024x768 or higher).

### 1.3 Connectivity

Archival utilizes a real-time database (Supabase) to synchronize your collection. An active internet connection is required to authenticate, add new items, or update existing records.

---

## 2. Feature Guide

### 2.1 Access Protocol (Authentication)

Before you can begin curating, you must identify yourself to the system.

- **Registration**: Click "Request new access" to create an account. You will need an email and a secure passcode, and you must verify your email address before logging in.
- **Login**: Enter your credentials and click "Authenticate" to enter the registry.
- **Sign Out**: You can exit the system at any time by clicking the logout icon in the navigation bar.

### 2.2 The Vault (Gallery)

The **Gallery** is your primary viewing area. It displays all your registered records in a high-contrast grid.

- **Searching**: Use the search bar at the top right to find specific items by name or designer.
- **Filtering**: Click the "Filter" button to open a drawer where you can narrow down your view by Category (e.g., Books, Music), Origin, Era, or Movement.
- **Viewing Details**: Click on any record's image to open the **Item Detail** view for a closer look.

### 2.3 Acquisition (Adding Items)

Adding new records is a "polymorphic" process—the system adapts based on what you are adding.

1.  **Select Category**: Choose from Books, Music, Decor, or Fashion.
2.  **Nomenclature (Search)**: If adding a book or music album, when you type a title, Archival will automatically fetch metadata and cover art from **Google Books** or **Discogs**. Otherwise you must manually input the details.
3.  **Refine Details**: The fields can then be refined to ensure information is accurate.
4.  **Upload Documentation**: Click the large preview box to upload your own photograph of the item (up to 5MB).
5.  **Register**: Click "Register Record" to save the item to your archive.

### 2.4 Blueprint (Spatial Mapping)

Archival allows you to map your items to physical locations using a virtual floor plan.

- **Create Rooms**: Type a room name (e.g., "Library") in the input field and click the "+" icon.
- **Assign Items**: When adding an item in the "Decor" category, you can assign it to one of your created rooms.
- **Explore**: Hover over a room in the blueprint to see a list of items currently "located" there.

### 2.5 Insights (Analytics)

The **Insights** dashboard provides a comprehensive analytical view of your collection through several key visualizations:

- **Global Provenance Map**: An interactive Leaflet map that plots your items' origins. Click on markers to see a list of records associated with that specific geographic location.
- **Distribution Density**: A pie chart showing the breakdown of your collection by geographic origin, helping you identify regional clusters in your curation.
- **Frequent Favorites**: A leaderboard highlighting the most represented designers, authors, or artists in your archive, excluding unknown entries.
- **Temporal Flow**: An interactive categorical distribution graph showing how your archive spans across different decades (e.g., 1920s through 2020s).
- **Movements Distribution**: A specialized grid that breaks down the top 5 stylistic movements for each category (Decor, Music, Books, Fashion). Hovering over a movement provides a detailed historical description.

### 2.6 Chronology (Timeline)

The **Chronology** view organizes your collection vertically by year. This helps you visualize the historical "weight" of your archive and see gaps in your temporal curation.

### 2.7 Collections (Thematic Grouping)

Create custom "exhibitions" by grouping related items together.

- **Create**: Enter a title and click "Create."
- **Manage**: Add items to these collections from their individual detail pages to keep thematic sets organized.

---

## 3. Troubleshooting

| Problem                         | Possible Cause                                     | Solution                                                                                           |
| :------------------------------ | :------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **"System is Offline" banner**  | No internet connection.                            | Check your Wi-Fi or Ethernet connection. Archival requires a connection to sync with the database. |
| **Images not loading**          | Slow connection or expired API link.               | Refresh the page. If it persists, check if the external service (Google/Discogs) is down.          |
| **"Duplicate Record Detected"** | You are trying to add an item that already exists. | You can choose to "Proceed" if you have a second copy, or "Cancel" to avoid redundancy.            |
| **Search returns no results**   | Specific API limits or spelling errors.            | Double-check the spelling of the item name. Some obscure items may require manual entry.           |

---

## 4. Contact & Support

If you encounter a persistent problem or have a feature request, please contact the development team:

- **Lead Developer**: Kate Galvin
- **Email**: katemgalvin@gmail.com

---

## Appendix A: Glossary & Acronyms

- **Archivist**: The user of the Archival system.
- **Curation**: The act of organizing and maintaining a collection.
- **Nomenclature**: The system of names used for your archival items.

---
