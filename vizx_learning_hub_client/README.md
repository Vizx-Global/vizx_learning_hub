# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install or npm install --legacy-peer-deps
   
   
2. Start the development server:

   npm run dev

   ## Project Flow and overview
   '''
   vizx_learning_hub_client is a frontend application for vixens/ vixz employees to manage their learning journey.
   '''
   It has a three tier user interface:
   1. System Administrator
   2. Departmental Managers
   3. Empployees

   The application has a RBAC architecture: 
   When the user is signed up, the user is automatically assigned the role of an employee and upon login the user is redirected to the employee dashboard.

   To access the system administrator dashboard, the user must be assigned the role of a system administrator and upon login the user is redirected to the system administrator dashboard.

   To access the departmental manager dashboard, the user must be assigned the role of a departmental manager and upon login the user is redirected to the departmental manager dashboard.
   