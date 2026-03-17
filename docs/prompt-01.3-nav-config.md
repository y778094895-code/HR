# Navigation Configuration

## 1. Discovery
- **Previous State**: Navigation was partially centralized but had non-standard property names (`title`, `href`, `roles`).
- **Objective**: Standardize the configuration object and abstract the filtering logic.

## 2. Solution (`_nav.ts`)

We implemented a strict schema for navigation items and a reusable filtering helper.

### Location
`client/src/components/layout/_nav.ts`

### Schema
```typescript
interface NavItem {
    id: string;          // Unique identifier
    label_ar: string;    // Display text (Arabic)
    path: string;        // Route path
    icon: LucideIcon;    // Icon component
    rolesAllowed?: string[]; // Optional role-based access control
}
```

### Example Element
```typescript
{
    id: 'users',
    label_ar: 'إدارة المستخدمين',
    path: '/dashboard/users',
    icon: Shield,
    rolesAllowed: ['admin', 'super_admin'],
}
```

### Filtering Logic
The `filterNavByRole` helper ensures that if `rolesAllowed` is present, the user must possess one of the listed roles to see the item.

```typescript
export const filterNavByRole = (items: NavItem[], userRole?: string): NavItem[] => {
    return items.filter((item) => {
        if (!item.rolesAllowed) return true;
        return userRole && item.rolesAllowed.includes(userRole);
    });
};
```

## 3. How to Verify

1.  **Check Config**: Open `client/src/components/layout/_nav.ts` and verify the structure matches the schema above.
2.  **Check UI**:
    - Build/Run the app.
    - Verify sidebar links appear correctly with Arabic labels.
    - Verify the icons match the previous design.
    - **Role Test**: If you are an 'admin', you should see 'إدارة المستخدمين'. If regular user, it should be hidden.
