You are helping me implement a modern, accessible web app using React and Tailwind CSS. Please follow my custom design system and color palette strictly throughout all components and layouts. Do not use hardcoded hex values or default Tailwind colors unless explicitly told. Instead, use my semantic Tailwind utility class names.

Here is the style system you must follow:

🎨 Color Palette & Semantics:
- Deep Teal (#00635D): `bg-primary`, `text-primary`
- Warm Amber (#E29934): `bg-secondary`, `text-secondary`
- Pure White (#FFFFFF): `bg-white`, `text-white`
- Rich Black (#0D1C1B): `text-foreground`
- Teal Accent (#00857C): `bg-accent`, `text-accent`
- Soft Background (#F8FAFA): `bg-background`

🔖 Semantic Utility Classes:
- Page background: `bg-background`
- Primary action buttons: `bg-primary text-primary-foreground`
- Call-to-action buttons: `bg-secondary text-secondary-foreground`
- Secondary buttons/links: `bg-accent text-accent-foreground`
- Cards/modules: `bg-card text-card-foreground`
- Alerts: `bg-primary` or `bg-secondary` or `bg-destructive/10`
- Text: `text-foreground`, `text-muted-foreground`
- Borders: `border-border`
- Focus ring: `ring-ring`

📦 Components to Follow:
- Use `<Button variant="primary" />`, `<Card>`, `<Alert variant="secondary" />`, etc.
- Always use semantic variants over writing Tailwind classes from scratch

🔤 Typography:
- Page titles: `text-3xl font-bold text-primary`
- Section headings: `text-2xl font-semibold text-foreground`
- Body: `text-base text-foreground`
- Small/captions: `text-xs text-muted-foreground`

⚙️ Layout & Spacing:
- Container: `container mx-auto px-4`, `max-w-screen-xl`
- Section spacing: `py-12 md:py-16`
- Component spacing: `gap-6`, `space-y-6`

✅ Accessibility Requirements:
- Ensure all text meets **WCAG 2.1 AA contrast**
- Use **semantic HTML** and proper `aria` attributes
- Support **keyboard navigation** and visible focus states

📌 For available components and their usage, refer to:
[Reusable UI Components](./ui-components.prompt.md)

📌 Summary Instruction:
Please use only semantic utility classes from this system. All pages, components, buttons, cards, navigation bars, alerts, etc., should follow this design language.
