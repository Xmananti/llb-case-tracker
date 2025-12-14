# 🎨 Quick Theme Implementation Guide

## Current Theme

Your app currently uses **Classic Legal Blue** (Option 1):

- Primary: `#1e3a8a` (Deep Blue)
- Accent: `#d97706` (Amber/Gold)

## Quick Palette Switcher

### To Switch to Option 2: Royal Navy & Gold

Update `app/globals.css`:

```css
:root {
  --background: #f1f5f9;
  --foreground: #0f172a;
  --primary: #0f172a; /* Navy Blue */
  --primary-dark: #1e40af; /* Royal Blue */
  --primary-light: #3b82f6;
  --accent: #d97706; /* Rich Gold */
  --accent-light: #f59e0b;
  --success: #059669;
  --error: #dc2626;
  --warning: #d97706;
  --info: #0284c7;
}

.legal-primary {
  background-color: #0f172a; /* Navy */
}

.legal-primary:hover {
  background-color: #1e40af; /* Royal Blue */
}

.legal-accent {
  background-color: #d97706; /* Rich Gold */
}

.legal-accent:hover {
  background-color: #f59e0b;
}

.legal-card {
  border-left: 4px solid #0f172a; /* Navy */
}
```

---

### To Switch to Option 3: Deep Maroon & Cream (Traditional Indian)

Update `app/globals.css`:

```css
:root {
  --background: #fffbeb; /* Cream */
  --foreground: #1f2937;
  --primary: #7c2d12; /* Deep Maroon */
  --primary-dark: #991b1b;
  --primary-light: #dc2626; /* Rich Red */
  --accent: #fbbf24; /* Gold */
  --accent-light: #fcd34d;
  --success: #059669;
  --error: #dc2626;
  --warning: #f59e0b;
  --info: #0284c7;
}

.legal-primary {
  background-color: #7c2d12; /* Deep Maroon */
}

.legal-primary:hover {
  background-color: #991b1b;
}

.legal-accent {
  background-color: #fbbf24; /* Gold */
}

.legal-accent:hover {
  background-color: #fcd34d;
}

.legal-card {
  border-left: 4px solid #7c2d12; /* Deep Maroon */
}
```

---

### To Switch to Option 5: Charcoal & Saffron (Modern Indian)

Update `app/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #111827;
  --primary: #1f2937; /* Charcoal */
  --primary-dark: #111827;
  --primary-light: #374151;
  --accent: #f97316; /* Saffron/Orange */
  --accent-light: #fb923c;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #0284c7;
}

.legal-primary {
  background-color: #1f2937; /* Charcoal */
}

.legal-primary:hover {
  background-color: #111827;
}

.legal-accent {
  background-color: #f97316; /* Saffron */
}

.legal-accent:hover {
  background-color: #fb923c;
}

.legal-card {
  border-left: 4px solid #1f2937; /* Charcoal */
}
```

---

### To Switch to Option 6: Indigo & Turmeric (Wisdom Theme)

Update `app/globals.css`:

```css
:root {
  --background: #f9fafb;
  --foreground: #111827;
  --primary: #312e81; /* Deep Indigo */
  --primary-dark: #1e1b4b;
  --primary-light: #6366f1; /* Indigo */
  --accent: #fbbf24; /* Turmeric Gold */
  --accent-light: #fcd34d;
  --success: #059669;
  --error: #dc2626;
  --warning: #f59e0b;
  --info: #0284c7;
}

.legal-primary {
  background-color: #312e81; /* Deep Indigo */
}

.legal-primary:hover {
  background-color: #1e1b4b;
}

.legal-accent {
  background-color: #fbbf24; /* Turmeric */
}

.legal-accent:hover {
  background-color: #fcd34d;
}

.legal-card {
  border-left: 4px solid #312e81; /* Deep Indigo */
}
```

---

## Common Tailwind Class Updates

After changing CSS variables, you may also want to update common Tailwind classes:

### Primary Buttons

```tsx
// Current
className = "bg-slate-900";

// Option 2 (Navy)
className = "bg-slate-900"; // Same

// Option 3 (Maroon)
className = "bg-red-900";

// Option 5 (Charcoal)
className = "bg-gray-800";

// Option 6 (Indigo)
className = "bg-indigo-900";
```

### Accent Buttons

```tsx
// Current
className = "bg-amber-600";

// Option 2 (Gold)
className = "bg-amber-600"; // Same

// Option 3 (Gold)
className = "bg-yellow-400";

// Option 5 (Saffron)
className = "bg-orange-500";

// Option 6 (Turmeric)
className = "bg-yellow-400";
```

---

## Recommended for Indian Law Firms

### For Traditional Practices

- **Option 3** (Deep Maroon & Cream) - Respectful, traditional
- **Option 6** (Indigo & Turmeric) - Wisdom, knowledge

### For Corporate/Modern Firms

- **Option 1** (Current - Classic Legal Blue) - Professional, trustworthy
- **Option 5** (Charcoal & Saffron) - Modern, Indian heritage

### For All-Round Professional

- **Option 2** (Royal Navy & Gold) - Elegant, prestigious

---

## Testing Your New Theme

1. Update `app/globals.css` with your chosen palette
2. Restart dev server: `npm run dev`
3. Check these components:

   - Navigation bar
   - Buttons (primary, accent)
   - Cards
   - Status badges
   - Links
   - Forms

4. Test on different screen sizes
5. Verify contrast for accessibility

---

## Quick Preview Script

Create a simple test page to preview all palettes:

```tsx
// app/test-theme/page.tsx
export default function TestTheme() {
  return (
    <div className="p-8 space-y-8">
      <div className="legal-primary p-4 rounded">Primary Button</div>
      <div className="legal-accent p-4 rounded">Accent Button</div>
      <div className="legal-card p-4">Card Example</div>
    </div>
  );
}
```
