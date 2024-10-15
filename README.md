# Inventory Mate

![Inventory Mate Logo](frontend/public/inventorymate_logo_horizontal_bg.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Deployment](#deployment)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Accessing the Application](#accessing-the-application)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [Inventory Management](#inventory-management)
    - [Navigating the Hierarchical Tree](#navigating-the-hierarchical-tree)
    - [Search Functionality](#search-functionality)
- [Deployment Link](#deployment-link)
- [Demonstration Video](#demonstration-video)



## Overview

**Inventory Mate** is a comprehensive warehouse management application designed to streamline inventory tracking, management, and analysis. It offers an intuitive user interface with robust features such as user authentication, hierarchical data visualization, real-time search and filtering, drag-and-drop functionality, and detailed statistical insights.

## Features

- **User Authentication**
  - Secure login and signup with token-based authentication.
  - Logout functionality to ensure account security.

- **Hierarchical Inventory Management**
  - Interactive tree structure with open and close animations.
  - Recursive implementation of godowns, subgodowns, and items for easy navigation.

- **Item Details**
  - Animated items page displaying comprehensive details of each inventory item.
  - Dynamic updates and smooth transitions for enhanced user experience.

- **Search and Filter**
  - **Advanced Search:**
    - Real-time search with debounced input for optimized performance.
    - Highlights matching terms within the search results.
    - Automatically expands parent nodes to reveal matched items or subgodowns.
    - If a godown matches the search query, all its subgodowns and items are displayed.
    - If item matches then its parents are also shown for better context
    - The search functionality is optimized with debounced input to prevent performance issues during rapid typing.
  - **Advanced Filtering:**
    - Filter items by category, brand, status, price, and quantity.
    - The Dropdown options get updated in real time to adjust its values based on the other filter dropdowns

- **Drag and Drop**
  - Intuitive drag-and-drop functionality to reorganize items within the hierarchy.
  - Displays warning message when dropping to top level godowns which already has subgodowns.Suggests to drop to a subgodown instead.
  - Parent componenents *auto expand* when holding an item over it for more than a second

- **Statistics Dashboard**
  - View detailed statistics of overall inventory or specific godowns, subgodowns, brands and categories.
  - Visual representations to aid in data-driven decision-making.
 
-**Design**
  -Every component contains smooth animations
  -A custom sleek and curved scrollbar has been implemented instead of the browser default.
  -Every page has been optimized for all screen sizes

## Technologies Used

- **Frontend:**
  - React.js
  - TypeScript
  - Tailwind CSS
  - Framer Motion for animations

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB

- **DevOps:**
  - Docker & Docker Compose
 
## Deployment

The project has been deployed on a DigitalOcean droplet via Nginx

View it here:
  [InventoryAssist](http://157.245.101.236)


## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Docker:** Install Docker from [Docker's official website](https://www.docker.com/get-started).
- **Docker Compose:** Included with Docker Desktop, verify installation with:
  ```bash
  docker-compose --version
  ```
- **Git:** Required for cloning the repository. Download it from [Git's official website](https://git-scm.com/downloads).

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Anta18/inventory-mate.git
   ```


## Environment Variables

Inventory Mate uses environment variables to manage configurations for both frontend and backend services. Ensure you have the necessary `.env` files in the appropriate directories.


### 1. Backend `.env` File

Navigate to the `/backend` directory and create a `.env` file:

```bash
cd backend
mkdir config
cd config
touch .env
```

Populate it with backend-specific variables:

```env
# Backend .env
Details sent via email
```

### 2. Frontend `.env` File

Navigate to the `/frontend` directory and create a `.env` file:

```bash
cd ../frontend
touch .env
```

Populate it with frontend-specific variables:

```env
# Frontend .env
VITE_BACKEND_URL=http://localhost:3000
```


## Running the Application

Inventory Assist utilizes Docker to containerize both frontend and backend services. Follow the steps below to build and run the containers.

1. **Navigate to the Root Directory**

   Ensure you're in the root directory of the project where the main `docker-compose.yml` file is located.

   ```bash
   cd ..
   ```

2. **Build and Start the Containers**

   Use Docker Compose to build the images and start the containers:

   ```bash
   docker-compose up --build
   ```


3. **Verify Containers are Running**

   Check the running containers with:

   ```bash
   docker-compose ps
   ```

## Accessing the Application

Once the containers are up and running, access Inventory Mate through your web browser:

- [http://localhost:80](http://localhost:80)


## Usage

### Authentication

- **Signup:** Create a new account by providing necessary details.
- **Login:** Access your account using the credentials:
     ```bash
  email id: antarikshinteriit@gmail.com
  password: InterIIT
   ```
- **Logout:** Securely exit your session.

### Inventory Management

#### Navigating the Hierarchical Tree

- **Interactive Tree Structure:** Explore godowns, subgodowns, and items using an expandable and collapsible tree view.
- **Animations:** Smooth open and close animations enhance the navigation experience.
- **Recursive Hierarchy:** Easily navigate through multiple levels of hierarchy without performance issues.

#### Search Functionality

Inventory Assist offers an advanced search feature that significantly enhances the user experience by providing the following capabilities:

- **Real-Time Search with Highlighting:**
  - As you type in the search bar, matching terms within the inventory are highlighted in real-time.
  - This immediate feedback helps users quickly identify relevant items or godowns.

- **Automatic Expansion of Parent Nodes:**
  - When a search query matches an item deep within the hierarchy, all parent godowns and subgodowns leading to that item are automatically expanded.
  - This ensures that matched items are visible without manual navigation through the tree.

- **Comprehensive Display for Godown Matches:**
  - If a godown matches the search query, the application automatically displays all its subgodowns and child items.
  - This provides a complete view of the matched godown's inventory, facilitating easier management and review.

- **Efficient Performance:**
  - The search functionality is optimized with debounced input to prevent performance issues during rapid typing.
  - Recursive search algorithms ensure that the application remains responsive, even with large and deeply nested inventories.

- **User-Friendly Interface:**
  - The combination of highlighting and automatic expansion makes it intuitive for users to locate and interact with specific items or godowns.
  - Enhanced visual cues reduce the time and effort required to find and manage inventory entries.

## Deployment Link

  [InventoryAssist](http://157.245.101.236)


## Demonstration Video

[Demonstration Video](https://youtu.be/8MjUWXHNz-8)
