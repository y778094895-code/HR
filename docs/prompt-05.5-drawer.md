# SideDrawer Component Documentation

## Overview
The `SideDrawer` component is a wrapper around the `Sheet` primitive, providing a consistent interface for slide-over panels used for details, forms, or navigation.

## Features
-   **Slot-Based Layout**: Standard header, content area (scrollable), and footer.
-   **Trigger Support**: Can wrap a button to handle open state automatically.
-   **Positioning**: Supports Top/Right/Bottom/Left placement.

## Usage Example

```tsx
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { Button } from '@/components/ui/buttons/button';

export function UserDetails({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SideDrawer
      title="User Details"
      description={`Viewing details for ${user.name}`}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={<Button>View Details</Button>}
      footer={<Button onClick={() => setIsOpen(false)}>Close</Button>}
    >
      <div className="space-y-4">
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>
    </SideDrawer>
  );
}
```

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `open` | `boolean` | Controlled open state. |
| `onOpenChange` | `(open) => void` | Open state change handler. |
| `title` | `string` | Header title. |
| `description` | `string` | Header description. |
| `children` | `ReactNode` | Main scrollable content. |
| `footer` | `ReactNode` | Fixed footer area. |
| `trigger` | `ReactNode` | Element that opens the drawer on click. |
| `side` | `'top' \| 'right' \| ...` | Direction. Default 'right'. |
