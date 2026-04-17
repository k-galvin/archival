# Status Report: Archival Project

## April 22, 2026

### Work Completed

- **Submitted poster for printing:** Completed last bit of work by emailing poster to Masao for printing so it can be presented at the Engineering Design Showcase.

### Next Steps

- **Present poster:** Present poster and finished project at Engineering Design Showcase.

## April 8, 2026

### Work Completed

- **Fixed issues with mobile responsiveness:**
    - gallery searchbar cut off
    - year next to item name on item details page cut off
    - EST. XXXX text on the magazine spine not being centered on mobile
    - blueprint map and room list unable to be hovered on mobile to view room contents
    - automatic zoom in on login
    - right side of page getting cut off
    - album/book photos not getting full whitespace border
    - footer taking up too much space
- **Added more cities:** Added more cities to the list of choices for place of origin.
- **Improved comments:** Added docustrings to functions and more comments explaining functionality.
- **Made preliminary poster:** Created first draft of presentation poster for review.
- **Created ABCDR slides and filmed presentation:** Made presentation slides and videos and uploaded them.
- **Improved Documentation:** Added the comprehensive user manual and updated READMEs appropriately.

### Challenges & Observations

- **Testing across devices:** Behavior differed between mobile and desktop, even when using Chrome DevTools to simulate a mobile view on desktop. It required manually testing across devices to fix visual inconsistencies.

### Next Steps

- **Get Poster Approved:** Get poster approved or make necessary edits and then email to Masao for printing.

## March 25, 2026

### Work Completed

- **Added to Filtering:** Added movements as a filter on the gallery page.
- **Partial Saves:** Added partial saving functionality to acquisitions
- **Offline Flow:** Added the ability to navigate between pages when offline while also notifying the user of the status when they attempt to make additions or edits.
- **Duplicate Items Warning:** Added a notification to users when they are adding a duplicate item.
- **Gallery Search:** Added a searchbar for items on the gallery page.
- **Restricting Room Feature:** Restricted room assignment to decor items.
- **Add Last Edited:** Added a last edited timestamp to item details page.
- **Scrollable Map Lists:** Made map items lists with >10 items scrollable.
- **Limit to Photo Size:** Limited photo uploads to 5MB.
- **Limit to API response:** Limited API response to 1s, then suggests user manually inputs data for acquisitions.

### Challenges & Observations

- **Determining Performance Limits:** It required manual testing to determine the right limits for the API responses.

### Next Steps

- **Ensure Full Test Coverage:** Review tests to ensure that all functionality is fully covered.
- **Improve Commenting:** Add docustrings to functions along with other appropriate commenting.

## March 11, 2026

### Work Completed

- **Logging Items:** Added new items to the tests accounts to better observe functionality of app.
- **Related Items Implementation:** Added a related items feature to the items details page to show items with the same creator or movement.
- **Enhanced Test Coverage:** Added additional unit tests for new features.

### Challenges & Observations

- **Writing Tests:** Ensuring tests are comprehensive can be difficult with the level of complexity in the app. Will improve by manually testing functionality and observing behavior that needs to be enforced.

### Next Steps

- **Search Implementation:** Add text-based search to the Gallery component.
- **Improved Blueprints:** Make the blueprints UI more visual and meaningful to enhance spatial awareness.

## February 19, 2026

### Work Completed

- **Data Visualization Enhancement:** Added new interactive data visualizations to the **Insights** dashboard using ApexCharts and custom SVG implementations.
- **Item Detail Implementation:** Added a dedicated **Item Details** page to allow for deep-dive inspection of archival records.
- **Mobile Responsiveness:** Conducted a comprehensive UI audit to ensure a fluid and professional experience across all device sizes.
- **Login Experience:** Improved the authentication flow and UI, providing a more seamless entry point for curators.
- **API Integration:** Successfully integrated external metadata sources, including Google Books and Discogs (via Supabase Edge Functions).
- **Documentation Alignment:** Updated the **Software Design Description (SDD)** to accurately reflect the consolidated `ArchiveService`, the current tech stack (ApexCharts/Leaflet), and actual feature capabilities.

### Challenges & Observations

- **Mobile Responsiveness:** Ensuring consistent behavior and visual integrity of complex visualizations on smaller screens.
- **CSS Cohesiveness:** Maintaining a unified "Museum Minimalist" aesthetic across diverse components and third-party library styles.

### Next Steps

- **Search Implementation:** Add text-based search to the Gallery component.
- **Enhanced Curation:** Add the "Related Items" logic.
- **Test Alignment:** Add additional unit tests to ensure comprehensive coverage.
- **Improved Blueprints:** Make the blueprints UI more visual and meaningful to enhance spatial awareness.
