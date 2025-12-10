# CookBook - Your Virtual Kitchen Assistant 

**CookBook** is a full-featured recipe application built with **React + Vite**, offering a complete modern cooking experience. It behaves like a real full-stack app by combining a **JSON Server backend** for user-created recipes and authentication with the **TheMealDB API** for public recipe data. Users can create, edit, delete, and browse recipes, save their favorites, manage their profile, and explore MealDB recipes all within a clean, intuitive, fully responsive UI.

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![JSON Server](https://img.shields.io/badge/JSON_Server-000000?style=for-the-badge&logo=json&logoColor=white)
![TheMealDB](https://img.shields.io/badge/TheMealDB-FF4757?style=for-the-badge&logo=foodpanda&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Live Demo**: [CookBook](https://cook-93n7yq5jp-kanchanyadav0916-gmailcoms-projects.vercel.app/)

### Video Walkthrough & Code Explanation

Watch the project explanation + live demo here: 

[Watch Full Video → [Demo Video](https://drive.google.com/file/d/1nfgj2CfvSg8vuYLflhmvNsKMXQJqf958/view?usp=sharing)     /
                    [Code Walkthrough](https://drive.google.com/file/d/1NKXN4SYluBV5jCOG1R5wQqWdFFiEiHQm/view?usp=sharing)

---

### Demo Login (Instant Access)

```text
Email: demo@cookbook.app
Password: demo123
```
You may also register a new account.
All user data, saved recipes, and user-created recipes are stored in JSON Server (db.json).

## Features

### Authentication
- Login & Register forms
- Protected routes (redirects to /login if not authenticated)
- Persistent session using JSON Server user records
- Logout functionality

### Recipe Management (CRUD)
- Add new recipes (stored in JSON Server)
- Edit and delete your own recipes
- View detailed recipe pages
- Track all user-created recipes under My Recipes

### Saved (Favorites)
- Save/unsave recipes per user
- Stored in JSON Server under savedRecipes
- Dedicated Saved Recipes page

### Smart Filtering & Search
- Search by recipe title
- Filter by:
   - Category (Breakfast, Dinner, Dessert…)
   - Difficulty (Easy, Medium, Hard)
- Combine search + filters
- Includes MealDB API recipes + user-created recipes

### UI/UX
- Clean and modern Tailwind CSS UI
- Fully responsive (mobile-first design)
- Smooth toast notifications using React Hot Toast
- Intuitive navigation and polished layout
  
## Tech Stack

| Technology      | Purpose                                     |
| --------------- | ------------------------------------------- |
| React + Vite    | Frontend framework & fast development setup |
| React Router v6 | Client-side routing                         |
| Context API     | Global state (auth + recipe data)           |
| Tailwind CSS    | Styling & responsive design                 |
| JSON Server     | Fake backend (users, recipes, saved items)  |
| TheMealDB API   | Public recipe data (read-only)              |
| React Hot Toast | Toast notifications                         |


### Project Structure

```
Cookbook/
├── public/              # Images, icons, static assets
├── src/
│   ├── assets/          # SVGs, images
│   ├── components/      # Reusable UI components
│   ├── context/         # Auth & Recipe context providers
│   ├── pages/           # All app pages (Home, Login, Recipes, etc.)
│   ├── styles/          # Custom CSS files
│   ├── utils/           # API helpers
│   ├── App.jsx          # Main app component
│   └── main.jsx         # React entry point
├── db.json              # Fake API / local database
├── package.json         # Project dependencies
├── tailwind.config.js   # Tailwind CSS config
├── vite.config.js       # Vite config
└── README.md            # Documentation

```
## Installation & Run

```bash
git clone https://github.com/yourusername/cookbook.git
cd cookbook
npm install
npm run server
npm run dev

```
- Open http://localhost:5173
 
### Protected Routes (Require Authentication)

These pages are only accessible when logged in.  
Unauthenticated users are automatically redirected to `/login`.

| Route         | Description                                  |
|--------------|-----------------------------------------------|
| `/add`        | Add a new recipe (stored in JSON Server)      |
| `/edit/:id`   | Edit an existing recipe                       |
| `/my-recipes` | View recipes created by the logged-in user    |
| `/saved`      | View recipes saved by the user                |
| `/profile`    | View and edit your profile                    |

### Public Routes (No Login Needed)

- `/` → Intro / Landing page  
- `/home` → Home page  
- `/recipes` → All recipes (MealDB + user recipes)  
- `/recipes/:id` → Recipe detail  
- `/login`  
- `/register`

---

### JSON Server Backend (Fake API)

All user-generated data is stored in **db.json** using JSON Server.  
This acts as the project's backend, replacing LocalStorage.

#### Data stored in JSON Server:

```text
users          → Registered users (email, password, profile info)
recipes        → User-created recipes (full CRUD)
savedRecipes   → Saved/favorited recipe IDs per user
profiles       → Optional profile data (name, photo, etc.)
```
### External API: TheMealDB

Public recipe data is fetched from:
```blash
https://www.themealdb.com/api/json/v1/1/
```
### Screenshots

| Intro Page | Home Page |
|------------|-----------|
| <img width="450" src="https://github.com/user-attachments/assets/6b098936-3cce-4dea-b361-816198513a70" /> | <img width="450" src="https://github.com/user-attachments/assets/70ee9d3e-c438-45ec-8dec-0cf5edf6e86a" /> |

| All Recipes | Saved Recipes |
|-------------|---------------|
| <img width="450" src="https://github.com/user-attachments/assets/14fe15de-c31d-4ae7-ac62-f04b3a6d39fe" /> | <img width="450" src="https://github.com/user-attachments/assets/7ab95d76-68f4-4bb9-951c-aa1494b9d42a" /> |

| Edit Recipe | Add Recipe |
|-------------|-------------|
| <img width="450" src="https://github.com/user-attachments/assets/01103dc5-a750-4f3e-800b-af90b2ac1754" /> | <img width="450" src="https://github.com/user-attachments/assets/fd5913a8-2fa8-45d2-b602-7fe2e38d09f6" /> |

| Login | Register |
|-------|----------|
| <img width="450" src="https://github.com/user-attachments/assets/2ed25057-5de1-4302-a427-59093a109d5e" /> | <img width="450" src="https://github.com/user-attachments/assets/f93792be-6836-42de-ada4-a0f0ed8cce62" /> |

## Future Enhancements

- Real backend with **Node.js / Express + MongoDB** (or Firebase)
- **Image upload** for recipes (Cloudinary or Firebase Storage)
- Recipe **ratings & comments** system
- User reviews and discussions
- **Dark mode** toggle
- Shopping list generator from ingredients
- **Print recipe** functionality
- Progressive Web App (**PWA**) support
- Ingredient **unit converter** (grams ↔ cups ↔ tablespoons)

---

## Contributing

Contributions are very welcome!  
Feel free to:

- Open issues for bugs or feature requests  
- Submit pull requests with improvements  
- Suggest new features or recipe ideas  

---

## License

This project is open-source and licensed under the **MIT License**.

© 2025

---

**Happy Cooking!**  
Made with passion 



