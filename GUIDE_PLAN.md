# Interactive Marxism Guide Implementation Plan

## Overview
Create an interactive educational page at `/guide/what-is-marxism` with step-by-step journey navigation, progress tracking, and integration with existing video/book library.

**User Requirements:**
- Step-by-step timeline/journey with navigation controls
- Introductory overview (5-8 sections)
- Link to related videos/books from library

## Content Structure (7 Sections)

1. **What is Marxism?** - Definition, origins, analytical framework distinction
2. **Historical Materialism** - Material conditions shape society, base/superstructure
3. **Class Struggle** - Bourgeoisie vs proletariat, inherent conflict
4. **Surplus Value** - Labor theory of value, structural exploitation
5. **Capitalism's Contradictions** - Crises, profit tendency, wealth concentration
6. **Socialism vs Communism** - Transitional stages, workers' control, classless society
7. **Marxism Today** - Contemporary relevance, wealth inequality, climate crisis

Each section includes:
- Eyebrow label ("Step X of 7")
- Title
- 2-3 paragraphs (~200-300 words)
- Key takeaway
- Related videos/books from library

## File Structure

### New Files to Create:

**1. `src/pages/guide/what-is-marxism.astro`**
- Main page with SSR data fetching
- Prisma queries for related videos (tags: "marx", "intro", "historical materialism", "surplus value")
- Prisma queries for related books (authors: "Karl Marx", "Friedrich Engels")
- Layout with Navigation + Breadcrumb
- Hydrate InteractiveGuide React component with `client:load`

**2. `src/components/InteractiveGuide.tsx`**
- React component managing navigation state
- State: `currentStep`, `completedSteps`, `showRelatedContent`
- Progress timeline/stepper UI
- Section content renderer with smooth transitions
- Previous/Next navigation buttons
- Related content display (VideoCard/BookCard integration)

**3. `src/lib/guide-content.ts`**
- Content definitions for all 7 sections
- Type: `GuideSection` with id, title, eyebrow, content, relatedResources
- Resource mapping logic (section → video tags/book keywords)

## Implementation Details

### Data Fetching (Astro Page)
```typescript
// Query related videos
const relatedVideos = await prisma.video.findMany({
  where: {
    isPublished: true,
    OR: [
      { tags: { hasSome: ["marx", "marxism", "historical materialism", "surplus value", "intro"] } },
      { category: { in: ["Theory", "Introduction", "Political Economy"] } }
    ]
  },
  take: 8,
  orderBy: { createdAt: "desc" }
});

// Query foundational books
const relatedBooks = await prisma.book.findMany({
  where: {
    isPublished: true,
    OR: [
      { authors: { hasSome: ["Karl Marx", "Friedrich Engels"] } },
      { tags: { hasSome: ["marxism", "theory", "introduction"] } }
    ]
  },
  take: 6
});
```

### Component Architecture
```tsx
interface GuideSection {
  id: string;
  title: string;
  eyebrow: string;
  content: {
    intro: string;
    paragraphs: string[];
    keyTakeaway: string;
  };
  relatedResources?: {
    videos: Video[];
    books: Book[];
  };
}
```

### Progress Indicator
- Horizontal timeline (scrollable on mobile)
- Active step highlighted with `var(--accent-color)`
- Completed steps marked with checkmark
- Clickable to jump to any section

### Navigation Controls
- Previous button (disabled on step 1)
- Next button (changes to "View Related Resources" on step 7)
- Keyboard support: Arrow keys
- Smooth transitions: 0.4s fade + slide animation

### Styling Approach

**Design Tokens (from global.css):**
- `--ink-color`: #241a16 (main text)
- `--accent-color`: #9c5c2e (highlights, active states)
- `--paper-color`: #f7f2ea (panel backgrounds)
- `--border-color`: #d7c6b5 (borders)
- `--muted-color`: #5f5149 (secondary text)

**Typography:**
- Section titles: Crimson Pro, clamp(24px, 3vw, 32px)
- Body text: Work Sans, 16px, line-height 1.6
- Eyebrow labels: 12px uppercase, accent color

**Transitions:**
```css
@keyframes fadeInSlide {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Related Content Integration
- Reuse existing `VideoCard` and `BookCard` components
- Display 2-3 videos + 2-3 books per section
- 2-column grid on desktop, 1-column on mobile
- Link to full video/book pages

## Implementation Sequence

1. **Create content definitions** (`guide-content.ts`)
2. **Create Astro page** with Prisma queries
3. **Build React component shell** with navigation state
4. **Add progress indicator** with timeline UI
5. **Apply styling** using design tokens
6. **Integrate VideoCard/BookCard** for related content
7. **Test and refine** responsive behavior

## Verification & Testing

### Functionality Testing
- [ ] Navigate forward/backward through all 7 sections
- [ ] Previous button disabled on step 1
- [ ] Next button updates on final step
- [ ] Progress indicator syncs with current step
- [ ] Keyboard navigation works (arrow keys)
- [ ] All section content renders correctly
- [ ] Related videos/books display properly

### Responsive Testing
- [ ] Desktop (>900px): Full-width layout
- [ ] Tablet (600-900px): Single column
- [ ] Mobile (<600px): Scrollable timeline, stacked content
- [ ] Touch gestures work on mobile

### Accessibility
- [ ] Proper heading hierarchy (h1 → h2)
- [ ] Aria-labels on progress steps
- [ ] Keyboard navigation fully functional
- [ ] Color contrast meets WCAG AA

### Performance
- [ ] Initial page load < 2s
- [ ] Section transitions smooth (no jank)
- [ ] No console errors

### Edge Cases
- [ ] No related content → "Coming soon" message
- [ ] Long titles → Proper wrapping/ellipsis
- [ ] Rapid clicks → Smooth handling

## Critical Files

1. **src/pages/guide/what-is-marxism.astro** - Main page with data fetching
2. **src/components/InteractiveGuide.tsx** - Interactive journey component
3. **src/lib/guide-content.ts** - Content definitions
4. **src/styles/global.css** - Design system reference
5. **src/components/VideoCard.tsx** - Reuse for related videos
6. **src/components/BookCard.tsx** - Reuse for related books

## Design Consistency

**Existing Patterns to Follow:**
- Use `.page` wrapper (max-width 1100px)
- Use `.hero` class for header section
- Use `.panel` class for content cards
- Include Breadcrumb navigation
- Match earth-toned academic aesthetic
- Serif headlines + sans-serif body
- Smooth hover effects (0.15-0.2s transitions)

**Components to Reuse:**
- Layout.astro (with Navigation)
- Breadcrumb.astro
- VideoCard.tsx
- BookCard.tsx
- Button component (from ui/)

This approach ensures the new guide integrates seamlessly with the existing MLCompanion design system while providing an engaging, educational user experience.
