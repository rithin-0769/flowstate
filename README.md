# ⚡ FlowState

FlowState is a premium, modern Kanban-style task management dashboard built with React and Tailwind CSS. It is designed to emulate the sleek, dynamic aesthetics of high-end enterprise productivity tools, complete with micro-animations, a command palette, and a stunning dark mode interface.

## 🌟 Features

- **Premium Aesthetic:** A highly refined dark theme featuring glassmorphism (backdrop blurs), subtle glowing gradients, and carefully crafted micro-animations that make the UI feel alive.
- **Animated Login Flow:** A breathtaking entry point with floating background orbs, dynamic inputs, and an animated "Enter Workspace" transition.
- **Kanban Dashboard:** An intuitive drag-and-drop-style (simulated via quick actions) board for organizing issues across Backlog, Todo, In Progress, and Done columns.
- **Command Palette (Ctrl + K / Cmd + K):** A fully functional keyboard-driven menu to quickly create issues, focus search, or delete tasks without touching the mouse.
- **Slide-over Detail View:** A frosted-glass detail pane that slides in smoothly when a task is selected, allowing for quick inline edits of title, description, priority, and status.
- **Responsive Design:** Elements dynamically scale and adjust, featuring custom scrollbars and hover states that enrich the desktop experience.

## 🚀 Tech Stack

- **Framework:** React 18+ (Vite)
- **Styling:** Tailwind CSS (v4+)
- **Icons:** Lucide React
- **Custom CSS:** Native CSS animations (`App.css`) for complex floating effects and glows.

## 🛠️ Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/flowstate.git
   ```
2. Navigate to the project directory:
   ```bash
   cd flowstate
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

To start the app locally, run:

```bash
npm run dev
```

Then, open `http://localhost:5173` in your browser.

## ⌨️ Keyboard Shortcuts

| Shortcut               | Action                                     |
| :--------------------- | :----------------------------------------- |
| `Ctrl + K` / `Cmd + K` | Open Command Palette                       |
| `Escape`               | Close Command Palette / Close Task Details |
| `C`                    | Create New Issue (when outside inputs)     |
| `F`                    | Focus Search Bar (when outside inputs)     |
| `↑` / `↓`              | Navigate Command Palette                   |
| `Enter`                | Execute Selected Command                   |
