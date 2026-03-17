# KPICard Component Documentation

## Overview
The `KPICard` component facilitates the display of key performance indicators, typically found on dashboards. It supports values, trends, icons, and contextual color coding.

## Features
-   **Loading State**: Built-in skeleton loader.
-   **Trend Analysis**: Automatically indicates up/down trends based on `change` percentage or explicit prop.
-   **Semantic Colors**: Supports `success`, `danger`, `warning` variants to color-code the trend (e.g., Attrition Up = Danger, Revenue Up = Success).

## Usage Example

```tsx
import { KPICard } from '@/components/ui/data-display/KPICard';
import { Users, TrendingUp } from 'lucide-react';

// Standard positive metric
<KPICard 
    title="Total Employees"
    value="1,240"
    icon={Users}
    change={5.2}
    trend="up"
    footer="from last month"
/>

// Negative metric (e.g. Attrition) - Use variant='danger'
<KPICard 
    title="Attrition Rate"
    value="12%"
    change={2.1}
    trend="up"
    variant="danger"
    footer="unfavorable increase"
/>

// Loading state
<KPICard loading title="Loading..." value={0} />
```

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Metric name. |
| `value` | `string \| number` | Displayed value. |
| `icon` | `LucideIcon` | Optional top-right icon. |
| `change` | `number` | Percentage change (absolute value shown). |
| `trend` | `'up' \| 'down' \| 'neutral'` | Explicit trend direction. |
| `variant` | `'success' \| 'danger' \| ...` | Colors the trend indicator. |
| `footer` | `string` | Helper text next to trend (e.g., "vs last month"). |
