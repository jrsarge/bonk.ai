# Training Plan Display Components

This directory contains comprehensive UI components for displaying and interacting with training plans in bonk.ai.

## Components Overview

### 🏗️ PlanDisplayLayout.tsx
The main layout component that orchestrates the entire plan viewing experience.

**Features:**
- Three-tier navigation: Overview → Week → Day
- Real-time progress tracking with visual indicators
- Responsive breadcrumb navigation
- Integrated export functionality
- Dynamic progress bar with completion percentage

**Usage:**
```tsx
import PlanDisplayLayout from '@/components/plans/PlanDisplayLayout';

<PlanDisplayLayout plan={trainingPlan} className="custom-styles" />
```

### 📅 WeekView.tsx
Detailed week-level view showing all workouts for a specific training week.

**Features:**
- Week progress tracking and completion stats
- Interactive workout cards with click-to-navigate
- Week-level statistics (easy runs, tempo, intervals, long runs)
- Date range display and key workout highlighting
- Responsive grid layout for workout cards

### 📋 DayView.tsx
Comprehensive single-workout view with detailed information and interaction.

**Features:**
- Detailed workout metrics and descriptions
- Interactive completion toggling
- Personal notes functionality (expandable textarea)
- Coach notes display with special styling
- Day-to-day navigation controls
- Effort level visualization with dots

### 💳 WorkoutCard.tsx (Enhanced)
Redesigned workout cards with improved visual design and mobile responsiveness.

**Enhancements:**
- Completion status overlay with visual indicators
- Improved responsive layout with proper truncation
- Icons for distance and duration metrics
- Enhanced hover states and interactions
- Rest day special layout with heart icon
- Notes preview with lightbulb icon

### 📤 PlanExport.tsx (Enhanced)
Extended export functionality with additional formats and options.

**New Features:**
- PDF export via print dialog (HTML-to-PDF)
- Enhanced format selection UI
- Improved options configuration
- Better success/error messaging
- Comprehensive format descriptions

### 📊 PlanOverview.tsx (Existing)
The existing plan overview component, now integrated with the new navigation system.

## Export Functionality

### Enhanced PlanExporter Class (`lib/export/planExport.ts`)

**New Export Formats:**
- **PDF**: Print-ready HTML document with professional styling
- **Text**: Human-readable plan summary
- **CSV**: Spreadsheet-compatible workout data
- **iCal**: Calendar import format
- **JSON**: Complete plan data backup

**PDF Export Features:**
- Professional styling with proper typography
- Print-optimized layout with page breaks
- Color-coded workout types
- Effort level visualization
- Complete plan metadata and statistics

## Styling and UX Enhancements

### Custom CSS Animations (`app/globals.css`)
Added smooth transitions and animations:
- `animate-fadeIn`: Smooth content transitions
- `animate-slideUp`: Content entry animations
- `animate-scaleIn`: Interactive element scaling
- Enhanced focus styles for accessibility
- Gradient utility classes for status indicators

### Responsive Design
- Mobile-first approach with breakpoint-specific layouts
- Proper text truncation and overflow handling
- Touch-friendly interaction targets
- Optimized spacing and typography for all screen sizes

### Accessibility Features
- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- High contrast color schemes
- Screen reader friendly content structure

## Key Features Implemented

✅ **Intuitive Navigation**
- Three-level hierarchy: Overview → Week → Day
- Breadcrumb navigation with clickable elements
- Smooth transitions between views

✅ **Progress Tracking**
- Real-time completion percentage
- Visual progress indicators
- Per-week completion stats
- Completed workout highlighting

✅ **Export Functionality**
- 5 export formats including PDF
- Customizable export options
- Share functionality with URL generation
- Clipboard copy functionality

✅ **Responsive Mobile Design**
- Mobile-optimized layouts
- Touch-friendly interactions
- Proper text scaling and spacing
- Collapsible elements for space efficiency

✅ **Enhanced User Experience**
- Smooth animations and transitions
- Interactive elements with visual feedback
- Contextual information display
- Consistent design language

## Integration Example

```tsx
import PlanDisplayLayout from '@/components/plans/PlanDisplayLayout';
import { TrainingPlan } from '@/types';

export default function PlanViewPage({ plan }: { plan: TrainingPlan }) {
  return (
    <div className="container mx-auto py-8">
      <PlanDisplayLayout 
        plan={plan} 
        className="max-w-6xl mx-auto"
      />
    </div>
  );
}
```

## Dependencies

- React 18+ with hooks
- Tailwind CSS for styling
- TypeScript for type safety
- Local storage integration for persistence
- Print dialog for PDF generation

## Browser Compatibility

- Modern browsers with ES2020+ support
- Print functionality for PDF export
- Clipboard API for copy operations
- Local Storage API for data persistence

---

*Components implemented as part of UI-001 and UI-002 improvements for enhanced training plan display and user experience.*