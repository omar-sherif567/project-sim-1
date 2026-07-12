# E-Commerce REST API Engine

A robust, production-ready E-Commerce backend built using the MVC architecture. This engine fully handles product cataloging, category categorization, multi-item shopping carts with live inventory stock control, and a checkout pipeline that generates structured historical order snapshots.

## Key Features
- **MVC Architecture:** Strict separation of data formatting models, operational routing rules, and controller business logic.
- **Advanced Inventory Stock Check:** Automated database locks comparing cumulative cart requests against real-time warehouse totals.
- **Static Checkout Snapshots:** Orders capture immutable price and name data snapshots, decoupling historic accounting logs from future product variations.
- **Graceful Error Framework:** Unified operational error catch pipelines powered by custom exception utilities.

## Tech Stack
- **Runtime Environment:** Node.js
- **Backend framework:** Express.js
- **Database Server:** MongoDB
- **Object Data Modeling:** Mongoose ORM
- **Testing Engine:** Postman

---

## Prerequisites & Installation

### Prerequisites
Before setting up, ensure you have the following runtimes installed on your local operating machine:
- **Node.js** (v16.x or higher)
- **MongoDB** (Local Community Server or Atlas Cluster)
- **npm** (Node Package Manager)

### Installation Steps
Follow these step-by-step commands inside your terminal to run the engine:

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/omar-sherif567/project-sim-1.git](https://github.com/omar-sherif567/project-sim-1.git)