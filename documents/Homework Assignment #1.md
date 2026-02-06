# Homework Assignment #1

### Problem 1.1, Stephens page 13

- What are the basic tasks that all software engineering projects must handle?
  - Requirements Gathering
  - High Level Design
  - Low Level Design
  - Development
  - Testing
  - Deployment
  - Maintenance

### Problem 1.2, Stephens page 13

- Give a one-sentence description of each of the tasks listed in Exercise 1.
  - Requirements Gathering: Defining the customers wants and needs, and then turning them into requirements documents that tell the customers what they will be getting and the project members what they will build.
  - High Level Design: Design that includes decisions such as what platform, what data design, and what interfaces to use. Also includes information about the project architecture and breaks the project down into chunks.
  - Low Level Design: Includes information on how pieces of the project should work, giving guidance to developers who will implement those pieces.
  - Development: Programmers transfer the designs to code, testing it as they write in order to prevent bugs.
  - Testing: Programmers create tests for their code, catching bugs and fixing them as you go.
  - Deployment: Software is rolled out, dealing with issues as they come.
  - Maintenance: After deployment, users will find bugs and programmers will need to address them as well as provide improvements and new features.

### Problem 2.4, Stephens page 27

- How are Google Docs and GitHub different?
  - Github requires you to commit and push, while Google Docs has no manual save, it just automatically saves. Github's branches allows for more complex processes and for merging, while Docs is linear and doesn't allow you to create different branches. 
- How are Google Docs and GitHub the same?
  - Both Github and Google Docs keep a history of changes and let you revert to previous states. They also let you see which editor is responsible for a change.

### Problem 2.5, Stephens page 27

- What does JBGE stand for and what does it mean?
  - JBGE stands for "Just Barely Good Enough". It is applied to code documentation/comments and it means you should write the bare minimum so that you save time when you inevitably have to update the documentation further down the road.

### Problem 4.2, Stephens page 78

- Use critical path methods to find the total expected time from the project's start for each task's completion.
  - Earliest Finish Values: A-5, B-9, C-4, D-12, E-19, F-7, G-6, H-3, I-6, J-6, K-17, L-12, M-28, N-26, O-11, P-17, Q-32, R-30 
  - G (6) --> D (6) --> E (7) --> M (9) --> Q (4) = 32 Days
- Find the critical path. What are the tasks on the critical path?
  - G --> D --> E --> M --> Q
  - Rendering engine, character animator, character animator, character library, and character testing.
- What is the total expected duration of the project in working days?
  - 32 Days

### Problem 4.4, Stephens page 78

[Homework-1-Gantt-Chart.jpg]

### Problem 4.6, Stephens page 79

- How can you handle completely unpredictable problems in projects?
  - Expand each task's time estimate by some amount.
  - Add specific tasks to the project to represent lost time.
  - Use risk management to try and proactively determine issues.

### Problem 4.8, Stephens page 79

- According to the textbook, what are the two biggest mistakes you can make while tracking tasks?
  - Ignoring problems with tasks going off schedule and hoping you can make it up later.
  - Putting extra developers on a task in the hope that it will reduce the amount of time needed to finish it.

### Problem 5.1, Stephens page 114

- List five characteristics of good requirements.
  - Clear
  - Unambigiuous
  - Consistent
  - Prioritized
  - Verifiable

### Problem 5.3, Stephens page 114

- For each requirement, list its audience-oriented category.
  - a. Business
  - b. User, Functional
  - c. User, Functional
  - d. User, Functional
  - e. Nonfunctional
  - f. Nonfunctional
  - g. Nonfunctional
  - h. Nonfunctional
  - i. Nonfunctional
  - j. Functional
  - k. Functional
  - l. User, Functional
  - m. User, Functional
  - n. User, Functional
  - o. User, Functional
  - p. User, Functional
- Are there requirements in every category? If not, state why not.
  - No. There are none in implementation because they don't specify any temporary features that will later be discarded. 

### Problem 5.9, Stephens page 115

- Brainstorm ways to change the application.
  - **M**ust have:
    - A more modern input that makes use of the user's keyboard rather than one that is built into the site.
  - **S**hould have:
    - Thematic colors that fit the spooky skeleton look.
  - **C**ould have:
    - Sound effects for guessing correctly/incorrectly.
  - **W**on't have:
    - Hard to read colors.
    - Insufficient space for the mystery word display.
