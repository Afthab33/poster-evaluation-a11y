# Use Predefined UI Components from components/ui

You must use the pre-built UI components located in the `components/ui` folder instead of recreating them from scratch.

---

## 🧰 Core Components (Pre-installed in components/ui)

| Component | Usage |
|----------|--------|
| `Button` | Use `<Button variant="primary" />`, supports `loading`, `icon`, `outline`, etc. |
| `Card` | Use `<Card>`, with `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` subcomponents |
| `Alert` | Use for warnings, errors, and feedback |
| `Tabs` | Use for toggling views (e.g., overview vs detail) |
| `Progress` | For upload/analysis progress |
| `Table` | Use for data like contrast analysis |
| `Avatar` | For color swatches or user icons |

---

## 🧭 Navigation Components

- `Breadcrumb`: Use for page navigation
- `Sheet`, `Dialog`: For modals or detailed inspection views
- `DropdownMenu`: For contextual actions

---

## 📂 Form Components

- `Form`: Use form wrapper and validation logic
- `FileInput`: Use drag-and-drop upload input

---

## 🧱 Layout Components

- `Separator`: Use between major sections
- `AspectRatio`: To control image display
- `ScrollArea`: For long results with keyboard scroll

---

## 🎯 Data Display Components

- `Badge`: For statuses like PASS/FAIL
- `Tooltip`: For info hints
- `Accordion`: For collapsible views
- `Skeleton`: For loading placeholders

---

## 🔔 Status & Utility

- `Toast`: For alerts and notifications
- `HoverCard`: For hover previews
- `ThemeProvider`: For dark/light mode handling
- `NavigationMenu`: For app-wide routing

---

## 🧑‍🏫 Usage Instructions

- **Import all components from** `@/components/ui/[componentName]`
- **Never re-create or restyle the same component**
- **Use semantic props/variants (like `variant="outline"` or `isLoading`)**
