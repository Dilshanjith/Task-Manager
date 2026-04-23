# Task Manager Application

A full-stack task management application built with **React (Frontend)**, **ASP.NET Core (Backend)**, **MySQL (Database)**, and **Firebase (Authentication)**.

## Project Structure
- `/Frontend`: React + Vite application.
- `/Backend`: ASP.NET Core Web API.

---

## Prerequisites
Before you begin, ensure you have the following installed:
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or later)
- [MySQL Server](https://dev.mysql.com/downloads/installer/)
- [Firebase Account](https://console.firebase.google.com/)

---

## Backend Setup (ASP.NET Core)

### 1. Database Configuration
1. Open your MySQL terminal or a tool like MySQL Workbench.
2. Create a new database named `task_management`:
   ```sql
   CREATE DATABASE task_management;
   ```
3. Update the connection string in `Backend/appsettings.json` if your MySQL credentials differ:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "server=localhost;database=task_management;user=root;password=your_password"
   }
   ```

### 2. Apply Migrations
Navigate to the `Backend` directory and run:
```bash
dotnet ef database update
```
*Note: If you don't have `dotnet-ef` installed, run `dotnet tool install --global dotnet-ef`.*

### 3. Run the Backend
```bash
dotnet run
```
The API will be available at `http://localhost:5162` (or the port specified in your `launchSettings.json`).

---

## Frontend Setup (React + Vite)

### 1. Install Dependencies
Navigate to the `Frontend` directory and run:
```bash
npm install
```

### 2. Firebase Configuration
The application uses Firebase for authentication. The configuration is located in `Frontend/src/services/firebase.ts`. 

To use your own Firebase project:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Email/Password** authentication in the "Authentication" section.
4. Add a "Web App" to your Firebase project and copy the `firebaseConfig` object.
5. Replace the `firebaseConfig` in `Frontend/src/services/firebase.ts`.
6. Update the `ProjectId` in `Backend/appsettings.json` to match your Firebase Project ID.

### 3. Run the Frontend
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## Key Features
- **Authentication**: Secure sign-up and login via Firebase.
- **Task Management**: Create, update, delete, and toggle task completion status.
- **Filtering**: View tasks by status (All, Pending, Completed).
- **Responsive Design**: Minimalist and clean UI.

## Technologies Used
- **Frontend**: React, TypeScript, Vite, CSS3.
- **Backend**: ASP.NET Core 8.0, Entity Framework Core.
- **Database**: MySQL.
- **Auth**: Firebase Authentication.
