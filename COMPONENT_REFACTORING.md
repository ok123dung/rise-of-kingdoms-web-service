# Component Refactoring Guide

## Overview

This document outlines the component refactoring approach to split large components into smaller, more focused and maintainable pieces.

## Refactoring Principles

### 1. Single Responsibility Principle
Each component should have one clear purpose and responsibility.

### 2. Composition Over Inheritance
Build complex UIs by composing smaller components rather than creating monolithic components.

### 3. Separation of Concerns
- **Presentational Components**: Focus on UI rendering
- **Container Components**: Handle business logic and state
- **Utility Hooks**: Extract reusable logic

## Example: PerformanceMonitor Refactoring

### Before (315 lines in one file)
```
PerformanceMonitor.tsx
├── Web Vitals monitoring
├── Page load tracking
├── Connection monitoring
├── Device detection
├── Scroll tracking
└── Performance optimizations
```

### After (Split into 7 focused files)
```
performance/
├── PerformanceMonitor.tsx (87 lines) - Main orchestrator
├── WebVitalsMonitor.tsx (95 lines) - Core Web Vitals
├── PageLoadMonitor.tsx (66 lines) - Page load metrics
├── ConnectionMonitor.tsx (60 lines) - Network monitoring
├── DeviceMonitor.tsx (65 lines) - Device capabilities
├── ScrollDepthMonitor.tsx (58 lines) - Engagement tracking
├── usePerformanceOptimization.ts (56 lines) - Optimization hook
└── performanceBudget.ts (40 lines) - Budget monitoring
```

## Benefits of Refactoring

### 1. Improved Maintainability
- Easier to locate and fix bugs
- Clear file boundaries
- Reduced cognitive load

### 2. Better Testing
- Unit tests for individual components
- Mocked dependencies
- Isolated functionality

### 3. Enhanced Reusability
- Components can be used independently
- Shared across different pages
- Easy to extend

### 4. Performance
- Smaller bundle sizes with code splitting
- Lazy loading opportunities
- Better tree shaking

## Refactoring Strategy

### Step 1: Identify Responsibilities
```typescript
// Before: Mixed responsibilities
function LargeComponent() {
  // Data fetching
  // Form handling
  // UI rendering
  // State management
  // Event handling
}

// After: Separated concerns
function DataProvider() { /* Data fetching */ }
function FormHandler() { /* Form logic */ }
function UIComponent() { /* Pure UI */ }
```

### Step 2: Extract Reusable Logic
```typescript
// Custom hooks for shared logic
function useDataFetching() { /* ... */ }
function useFormValidation() { /* ... */ }
function useEventHandlers() { /* ... */ }
```

### Step 3: Create Focused Components
```typescript
// Small, focused components
function Header() { /* ... */ }
function Content() { /* ... */ }
function Footer() { /* ... */ }

// Compose them
function Page() {
  return (
    <>
      <Header />
      <Content />
      <Footer />
    </>
  )
}
```

## Components to Refactor

### High Priority (>300 lines)
1. **src/app/services/strategy/page.tsx** (716 lines)
   - Extract: PricingSection, TestimonialsSection, FAQSection
   
2. **src/app/services/page.tsx** (599 lines)
   - Extract: ServiceCard, ServiceGrid, ComparisonTable

3. **src/app/admin/dashboard/page.tsx** (423 lines)
   - Extract: StatsCards, RevenueChart, ActivityFeed

### Medium Priority (200-300 lines)
1. **BookingModal** (268 lines)
   - Extract: ServiceSelector, DateTimePicker, CustomerForm

2. **CustomerStats** (339 lines)
   - Extract: StatCard, ProgressBar, ActivityTimeline

3. **ActiveBookings** (307 lines)
   - Extract: BookingCard, StatusFilter, ActionButtons

## Best Practices

### 1. Component Structure
```
components/
├── feature/
│   ├── FeatureComponent.tsx
│   ├── FeatureComponent.types.ts
│   ├── FeatureComponent.test.tsx
│   └── index.ts
```

### 2. Props Interface
```typescript
// Define clear prop interfaces
interface ComponentProps {
  required: string
  optional?: number
  callback?: () => void
  children?: React.ReactNode
}
```

### 3. Export Strategy
```typescript
// Named exports for tree shaking
export { Component } from './Component'
export type { ComponentProps } from './Component.types'
```

### 4. Composition Pattern
```typescript
// Parent provides data and handlers
function Parent() {
  const data = useData()
  const handlers = useHandlers()
  
  return (
    <Child 
      data={data} 
      onAction={handlers.action}
    />
  )
}

// Child focuses on presentation
function Child({ data, onAction }: ChildProps) {
  return <div onClick={onAction}>{data}</div>
}
```

## Migration Checklist

- [ ] Identify component responsibilities
- [ ] Extract custom hooks for logic
- [ ] Create focused child components
- [ ] Define clear prop interfaces
- [ ] Add proper TypeScript types
- [ ] Write unit tests for new components
- [ ] Update imports in parent components
- [ ] Test integration thoroughly
- [ ] Document component APIs

## Monitoring Success

### Metrics to Track
1. **File Size**: Target <200 lines per component
2. **Complexity**: Cyclomatic complexity <10
3. **Dependencies**: Minimize cross-component deps
4. **Test Coverage**: Aim for >80% coverage

### Tools
- ESLint for complexity checks
- Bundle analyzer for size monitoring
- Jest for test coverage
- React DevTools for performance profiling