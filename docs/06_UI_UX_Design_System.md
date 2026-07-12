Good. Now fill **`06_UI_UX_Design_System.md`**.

Open:

```text
docs/06_UI_UX_Design_System.md
```

Delete anything inside and paste this **complete frozen Mission UI version**:

````markdown
# Mission UI Design System

## Daily Development Tracker

**Version:** 1.0  
**Status:** FROZEN  
**Document Type:** UI/UX Design System Specification  
**Design Language:** Mission UI  
**Product Stage:** MVP / Version 1

---

# 1. Design Objective

Mission UI is the official design language for Daily Development Tracker.

The frontend is a major product priority.

The application must feel:

- Premium
- Modern
- Colorful
- Motivating
- Calm
- Elegant
- Smooth
- Intentional
- Memorable

Daily Development Tracker must not look like:

- A generic student project
- A basic to-do application
- A default admin dashboard
- An untouched shadcn/ui template
- A collection of disconnected cards
- A UI generated without visual hierarchy

The experience should feel like a premium personal growth operating system.

The user should feel encouraged to return every day.

---

# 2. Design Philosophy

Mission UI follows the principle:

> Progress should feel visible, rewarding, and calm.

The interface should help the user understand:

1. What must I do today?
2. What should I do next?
3. How much have I completed?
4. What did I miss?
5. Am I becoming more consistent?

Every primary screen must support one or more of these questions.

Visual design must support product clarity.

Decoration must not compete with the user's daily goals.

---

# 3. Experience Personality

Mission UI has five personality traits.

## Focused

The next important action should be obvious.

## Motivating

Progress should feel meaningful.

## Premium

Spacing, typography, motion, and interaction details must feel intentional.

## Human

The application should communicate using natural and constructive language.

## Energetic

Color and motion may create energy without making the application visually exhausting.

---

# 4. Product Visual Direction

The product should visually combine the clarity and polish associated with modern premium software products while maintaining its own identity.

Reference qualities may include:

- Linear-style precision
- Vercel-style clarity
- Stripe-style polish
- Notion-style usability
- Modern wellness application warmth
- Premium fitness application progress visualization

These are quality references only.

Mission UI must not directly copy another product's interface.

---

# 5. Core Visual Concept

The primary visual concept is:

> Personal Momentum

The application should visually represent progress as momentum.

Examples:

- Progress rings filling smoothly
- Streak indicators gaining energy
- XP bars moving forward
- Task completion creating subtle positive feedback
- Daily summaries showing movement over time
- Analytics emphasizing consistency trends

The interface should make progress feel alive.

---

# 6. Color Philosophy

Mission UI uses a colorful but controlled visual system.

The interface must not use random colors for every component.

Color has meaning.

Primary color roles:

- Brand
- Accent
- Success
- Warning
- Danger
- Information
- Motivation
- Surface
- Text

Colors must use design tokens.

Do not hardcode arbitrary color values throughout feature components.

---

# 7. Brand Color Direction

The primary brand direction uses an energetic violet-to-indigo family.

Conceptual brand palette:

```text
Mission Violet
Mission Indigo
Electric Purple
Soft Lavender
````

The primary brand color should communicate:

* Growth
* Ambition
* Creativity
* Momentum

The exact production color values must be implemented as design tokens.

The frontend implementation may refine exact accessible values while preserving the frozen visual direction.

---

# 8. Accent Color Direction

Mission UI may use controlled supporting accents.

Recommended accent families:

```text
Cyan
Emerald
Amber
Rose
Sky
```

Accent colors should support meaning.

Example:

```text
Study       → Violet
Coding      → Cyan
Fitness     → Emerald
Health      → Rose
Reading     → Amber
Personal    → Sky
```

User-created categories may select from an approved token palette.

Do not allow uncontrolled arbitrary colors that break accessibility or visual consistency in Version 1.

---

# 9. Semantic Colors

Semantic color roles must remain consistent.

## Success

Used for:

* Completed activities
* Successful actions
* Positive progress
* Achievement success

Recommended family:

```text
Emerald / Green
```

## Warning

Used for:

* Upcoming attention
* Reminder warnings
* Potentially missed routines

Recommended family:

```text
Amber
```

## Danger

Used for:

* Destructive actions
* Critical errors
* Irreversible confirmation states

Recommended family:

```text
Red / Rose
```

## Information

Used for:

* Informational messages
* Neutral system feedback

Recommended family:

```text
Blue / Sky
```

Semantic colors must not be used purely as decoration.

---

# 10. Completion and Not-Done Colors

Daily completion must be visually positive.

Recommended visual role:

```text
Completed → Success / Momentum Color
```

Not-done progress must remain clear without creating shame.

Recommended visual role:

```text
Not Done → Muted Amber or Controlled Warm Accent
```

Do not use aggressive danger red as the primary representation of ordinary unfinished daily work.

Red should remain reserved for errors and destructive states.

---

# 11. Background System

Mission UI uses layered surfaces.

The interface should not rely on one flat background with random cards.

Recommended conceptual layers:

```text
Application Background
        │
        ▼
Primary Surface
        │
        ▼
Elevated Surface
        │
        ▼
Interactive Surface
```

Light mode should feel:

* Bright
* Clean
* Soft
* Spacious

Dark mode should feel:

* Deep
* Premium
* Calm
* High contrast without pure-black overload

Large gradient backgrounds should be used carefully.

Avoid excessive gradient noise.

---

# 12. Theme Support

Version 1 supports:

```text
LIGHT
DARK
SYSTEM
```

System theme follows the device preference.

Theme selection is stored in UserSettings.

Mission UI components must support both light and dark themes.

Dark mode must not be implemented as a simple inversion of light mode.

Both themes require intentional surface and contrast decisions.

---

# 13. Design Tokens

Mission UI must use centralized design tokens.

Token categories include:

```text
Colors
Typography
Spacing
Radius
Shadows
Motion
Z-index
Container Width
```

Conceptual CSS token strategy:

```text
--background
--foreground

--surface
--surface-elevated

--primary
--primary-foreground

--secondary
--secondary-foreground

--muted
--muted-foreground

--success
--warning
--danger
--info

--border
--ring
```

Mission-specific tokens may be added where justified.

Feature components should consume tokens rather than duplicate raw visual values.

---

# 14. Typography

Typography must feel modern, clean, and premium.

Preferred font direction:

```text
Inter
```

or another approved modern sans-serif with similar readability.

The production implementation should prefer a performant font loading strategy.

Typography hierarchy:

```text
Display
Heading 1
Heading 2
Heading 3
Title
Body
Body Small
Label
Caption
```

Typography must communicate hierarchy before color or decoration.

---

# 15. Typography Rules

Use larger display typography only for important moments.

Examples:

* Welcome experience
* Daily completion summary
* Achievement milestone

Do not use oversized text on every dashboard card.

Body text must remain readable.

Avoid excessive font weights.

Recommended weight usage:

```text
Regular
Medium
Semibold
Bold
```

Avoid using ultra-bold text everywhere.

---

# 16. 8-Point Spacing System

Mission UI uses an 8-point spacing philosophy.

Primary spacing rhythm:

```text
4px
8px
12px
16px
24px
32px
40px
48px
64px
```

Small optical adjustments may be used when required.

Major layouts should preserve consistent spacing rhythm.

Avoid random spacing values throughout the application.

---

# 17. Border Radius System

Mission UI uses soft, modern geometry.

Conceptual radius tokens:

```text
Small       → 8px
Medium      → 12px
Large       → 16px
XL          → 20px
2XL         → 24px
Full        → Pill / Circle
```

Cards generally use:

```text
16px to 24px
```

Inputs and controls generally use:

```text
10px to 14px
```

Do not make every component excessively rounded.

Radius should communicate component type and hierarchy.

---

# 18. Shadow System

Shadows should feel soft and controlled.

Shadow levels:

```text
Shadow 1 → Subtle separation
Shadow 2 → Elevated interactive card
Shadow 3 → Floating surface
Shadow 4 → Dialog or major overlay
```

Dark, heavy shadows should be avoided.

Hover shadows must not create large layout or visual jumps.

Dark mode requires theme-aware elevation treatment.

---

# 19. Border System

Borders should remain subtle.

Use borders to:

* Separate surfaces
* Define inputs
* Support cards
* Clarify interactive areas

Avoid strong borders around every component.

A combination of:

```text
Surface Contrast
Subtle Border
Soft Shadow
```

should define hierarchy.

---

# 20. Icon System

Use one consistent icon library.

Approved direction:

```text
Lucide Icons
```

Icons must:

* Support meaning
* Use consistent stroke weight
* Align visually with text
* Include accessible labels where required

Do not mix multiple unrelated icon styles.

Emoji must not replace core interface icons.

Emoji may be used selectively in motivational content or mood experiences.

---

# 21. Button System

Mission UI uses clear button hierarchy.

Button variants:

```text
Primary
Secondary
Ghost
Outline
Destructive
Success
Icon
```

## Primary Button

Used for the most important action.

Examples:

```text
Add Activity
Save Journal
Continue
```

Only one visually dominant primary action should normally exist in a focused area.

## Secondary Button

Used for supporting actions.

## Ghost Button

Used for low-emphasis actions.

## Destructive Button

Used only for destructive operations.

## Success Button

May be used for completion-oriented interactions where appropriate.

---

# 22. Button Interaction States

Every interactive button must support:

```text
Default
Hover
Active
Focus
Disabled
Loading
```

Hover should feel responsive.

Recommended motion:

```text
Small lift
Subtle scale
Surface shift
Icon movement
```

Do not combine every effect on one button.

Button movement must remain controlled.

Loading buttons should preserve width where practical.

---

# 23. Input System

Input variants include:

```text
Text Input
Email Input
Password Input
Time Input
Textarea
Select
Checkbox
Switch
```

Inputs must include:

* Label
* Input state
* Focus state
* Error state
* Disabled state

Placeholders must not replace labels.

Error messages should explain the problem clearly.

---

# 24. Focus States

Keyboard focus must always remain visible.

Mission UI should use a consistent focus ring.

Focus indicators must:

* Be visible in light mode
* Be visible in dark mode
* Meet accessibility expectations
* Not depend only on color where inappropriate

Do not remove browser focus behavior without providing an accessible replacement.

---

# 25. Card System

Cards are important but must not dominate every layout.

Card variants:

```text
Base Card
Metric Card
Interactive Card
Feature Card
Celebration Card
Insight Card
```

Cards may use:

* Subtle borders
* Layered surfaces
* Controlled shadows
* Small gradient accents
* Meaningful icons

Avoid putting every text block inside a card.

Layouts should use whitespace and grouping.

---

# 26. Metric Cards

Metric cards display high-value numbers.

Examples:

```text
80% Completed
7 Day Streak
540 XP
2 Not Done
```

Metric cards should include:

* Clear value
* Short label
* Optional contextual trend
* Optional supporting icon

The number should be visually dominant.

Do not overload metric cards with paragraphs.

---

# 27. Progress Ring

The Progress Ring is a signature Mission UI component.

Primary use:

```text
Daily Completion Percentage
```

The Progress Ring should support:

* Animated progress
* Center value
* Accessible text equivalent
* Light and dark themes
* Reduced-motion behavior

Example:

```text
     80%
   Complete
```

The ring animation should run once when meaningful data loads or changes.

Do not continuously animate the ring.

---

# 28. Daily Progress Visualization

Daily progress should visually show:

```text
Completion Percentage
Not-Done Percentage
```

Recommended structure:

```text
Primary Progress Ring
+
Supporting Not-Done Metric
```

Do not split visual attention equally between positive progress and unfinished work.

Completion remains the primary visual focus.

Not-done remains visible and clear.

---

# 29. Navigation Architecture

Desktop navigation may use a premium sidebar.

Primary navigation:

```text
Dashboard
Planner
Journal
Mood
Analytics
Achievements
Settings
```

The sidebar may include:

* Product mark
* Navigation
* Current streak summary
* Compact XP status
* User profile area

The sidebar must not become visually overcrowded.

---

# 30. Mobile Navigation

Mobile navigation must prioritize the most frequent actions.

Recommended approach:

```text
Bottom Navigation
```

Primary mobile items may include:

```text
Home
Planner
Journal
Analytics
Profile / More
```

The exact mobile navigation may be refined during frontend implementation.

The planner must remain reachable with one clear navigation action.

---

# 31. Application Shell

The application shell includes:

```text
Navigation
Main Content
Global Feedback
Theme Context
Responsive Layout
```

Desktop concept:

```text
┌──────────────┬───────────────────────────────┐
│              │                               │
│   Sidebar    │         Main Content          │
│              │                               │
└──────────────┴───────────────────────────────┘
```

Mobile concept:

```text
┌───────────────────────────────┐
│           Header              │
├───────────────────────────────┤
│                               │
│         Main Content          │
│                               │
├───────────────────────────────┤
│       Bottom Navigation       │
└───────────────────────────────┘
```

---

# 32. Dashboard Experience

The dashboard must answer:

> How is my day going?

Recommended dashboard hierarchy:

```text
Greeting / Date
        │
        ▼
Daily Momentum Hero
        │
        ▼
Today's Progress
        │
        ▼
Next Activity
        │
        ▼
Planner Preview
        │
        ▼
Streak + XP
        │
        ▼
Mood / Insights
```

The exact responsive arrangement may change according to screen size.

The dashboard must not become a grid of ten equal cards.

Visual hierarchy is mandatory.

---

# 33. Daily Momentum Hero

The dashboard should include a high-impact daily momentum area.

It may include:

* Greeting
* Motivational message
* Daily completion
* Progress ring
* Current streak
* Contextual encouragement

Example tone:

> Good morning, Varun. You have completed 4 of 7 activities. Keep the momentum going.

The hero must feel premium without occupying the entire screen.

---

# 34. Motivational Quotes

Motivational content is part of the product.

Quotes should appear selectively.

Recommended locations:

* Dashboard
* Empty states
* End-of-day summary
* Achievement moments

Do not place a different motivational quote on every card.

Quotes must not interrupt task completion.

The frontend must not fabricate quote attribution.

If attribution is uncertain, use original product microcopy without a named author.

---

# 35. Planner Experience

The Daily Planner is the primary product workflow.

The planner must prioritize speed.

The core row concept is:

```text
Activity
Time
Completion
```

Desktop conceptual structure:

```text
┌────────────────────────────────────────────────────┐
│ Activity                  Time           Complete   │
├────────────────────────────────────────────────────┤
│ Brush Teeth               07:30 AM       [   ]      │
│ Workout                   08:00 AM       [ ✓ ]      │
│ Coding                    10:00 AM       [   ]      │
│ Read Book                 08:00 PM       [   ]      │
└────────────────────────────────────────────────────┘
```

The user must be able to type activities manually.

Simple task creation must not require opening a large complex modal.

---

# 36. Quick Add Activity

The planner should include a fast activity entry experience.

Conceptually:

```text
[ What do you want to do? ] [ Time ] [ + Add ]
```

The user should be able to:

1. Type an activity.
2. Select a time.
3. Add it.

Advanced options may be available through progressive disclosure.

Examples:

* Category
* Priority
* Reminder override

Do not force advanced options into the primary quick-add flow.

---

# 37. Task Row

A Task Row may display:

* Completion control
* Activity title
* Scheduled time
* Category
* Priority indicator
* Reminder status
* More actions

The title and completion action are primary.

Secondary metadata must remain visually quieter.

A Task Row should not look like a large dashboard card.

---

# 38. Completion Control

The completion control is a critical interaction.

It must be:

* Easy to tap
* Easy to click
* Keyboard accessible
* Visually clear

When completed:

1. The control updates.
2. The task receives a completed visual state.
3. A subtle completion animation may run.
4. Progress updates.
5. XP feedback may appear where appropriate.

Do not use an excessive full-screen celebration for every completed activity.

---

# 39. Task Completion Animation

Recommended completion feedback:

```text
Checkbox Motion
      +
Subtle Task Surface Change
      +
Progress Ring Update
      +
Small XP Feedback
```

Example:

```text
+10 XP
```

XP feedback may float or fade near the relevant progress area.

Animation duration should remain short.

The user should be able to complete several tasks quickly.

---

# 40. Drag and Reorder

Desktop task ordering may support drag-and-drop.

Mobile task ordering must remain touch-friendly.

Drag handles should be visually discoverable.

Do not make the entire task row draggable if that creates accidental interaction conflicts.

Reordering should use optimistic feedback where safely supported.

---

# 41. Time Selection

Time selection must be fast.

The application should respect the user's:

```text
12-hour
or
24-hour
```

time format preference.

The displayed time must use user settings.

The backend remains responsible for timezone-safe scheduling.

---

# 42. Upcoming Activity Experience

The next scheduled activity should be visually easy to identify.

Example:

```text
NEXT UP

Workout
Starts at 6:00 PM

43 minutes remaining
```

Countdown-style information may be displayed when calculated reliably.

Avoid continuous high-frequency re-rendering solely for decorative countdown effects.

---

# 43. Journal Experience

The Journal must feel calm and focused.

Recommended structure:

```text
Date
Title
Main Reflection
Gratitude
Lessons Learned
Tomorrow's Plan
```

The journal interface should use:

* Comfortable line height
* Generous spacing
* Minimal distraction
* Clear save feedback

Do not use excessive gamification inside the writing surface.

---

# 44. Mood Experience

Mood tracking should feel fast and human.

Recommended interaction:

```text
How are you feeling today?
```

Options:

```text
Amazing
Happy
Normal
Sad
Tired
```

Mood options may use expressive icons or emoji-style visual treatment.

The selected mood must also have a text label.

Color alone must not communicate mood state.

The user may optionally add a short note.

---

# 45. Analytics Experience

Analytics must help users understand consistency.

Analytics should prioritize:

* Completion trend
* Consistency
* Category progress
* Mood trends
* XP history
* Streak progress

Charts must be understandable.

Every chart must include:

* Clear title
* Clear labels
* Appropriate tooltip where useful
* Accessible supporting text where practical

Do not add charts solely to make the dashboard look advanced.

---

# 46. Chart Visual Direction

Charts should follow Mission UI tokens.

Recommended visual characteristics:

* Soft grid lines
* Controlled brand accents
* Rounded visual treatment where supported
* Clear active tooltip
* Minimal chart clutter

Avoid:

* Rainbow chart palettes
* 3D charts
* Excessive legends
* Tiny unreadable labels

---

# 47. Streak Experience

Streaks represent consistency.

The streak experience may use:

```text
Flame
Energy
Momentum
```

visual concepts.

Example:

```text
🔥 7 Day Streak
```

The visual treatment should feel rewarding.

Do not threaten the user aggressively about losing a streak.

Recommended tone:

> Keep your 7-day momentum going.

Avoid:

> Complete now or lose everything!

---

# 48. XP Experience

XP represents visible personal progress.

XP feedback may appear through:

* XP progress bar
* Small completion reward
* Daily summary
* Achievement unlock

Example:

```text
540 XP
```

or:

```text
540 / 700 XP
```

If levels are introduced, level rules must be defined before implementation.

Do not invent an undocumented level system in the UI.

---

# 49. Achievement Experience

Achievements should feel special.

Achievement unlock may use:

* Animated badge reveal
* Controlled glow
* Confetti-like particles used sparingly
* Short motivational message

Example:

```text
Achievement Unlocked

FIRST STEP

You completed your first activity.
```

Achievement celebrations must respect reduced-motion preferences.

Do not trigger large celebration effects repeatedly.

---

# 50. End-of-Day Summary

The end-of-day summary is a signature product moment.

Recommended structure:

```text
Today's Momentum
        │
        ├── Completion %
        ├── Not Done %
        ├── Activities Completed
        ├── XP Earned
        ├── Streak Status
        ├── Mood
        └── Motivational Feedback
```

Example:

> You completed 8 of 10 activities today. That's 80% of your plan. Two activities remain unfinished. Tomorrow is another opportunity to build momentum.

The tone must be constructive.

The interface must not shame the user.

---

# 51. Notification UX

Notification permission must not be requested immediately without context.

Recommended flow:

```text
User Creates Scheduled Activity
        │
        ▼
Application Explains Reminder Benefit
        │
        ▼
User Enables Reminders
        │
        ▼
Browser Permission Request
```

Example product message:

> Get a reminder 3 minutes before your activity starts.

Then show:

```text
Enable Reminders
```

Do not trigger the browser permission prompt on first page load without explanation.

---

# 52. Push Notification Content

Notification content should be short and actionable.

Example:

```text
Workout starts in 3 minutes.
```

Supported actions where platform capabilities allow:

```text
Mark Complete
Snooze
```

Dismiss behavior may use the platform's standard notification behavior.

Do not overload notifications with motivational paragraphs.

---

# 53. Toast System

Toasts provide lightweight feedback.

Use toasts for:

* Saved successfully
* Activity created
* Settings updated
* Recoverable error
* Network retry feedback

Do not use toasts for every checkbox interaction if the visual state already communicates success.

Toast variants:

```text
Success
Error
Warning
Information
```

Toasts must not block primary interactions.

---

# 54. Dialog System

Dialogs are used for focused decisions.

Appropriate uses:

* Delete confirmation
* Important destructive action
* Achievement detail
* Complex settings where justified

Do not open a dialog for simple task creation.

Dialogs must support:

* Keyboard focus management
* Escape behavior where appropriate
* Accessible title
* Clear action hierarchy

---

# 55. Empty States

Every primary feature requires a designed empty state.

## Planner

Example:

> Your day is open. Add your first activity and start building momentum.

Primary action:

```text
Add Activity
```

## Journal

Example:

> Take a moment to reflect on your day.

Primary action:

```text
Write Today's Journal
```

## Analytics

Example:

> Your progress story starts with your first completed activity.

## Achievements

Example:

> Complete meaningful milestones to unlock achievements.

Empty states must guide the next action.

---

# 56. Loading States

Primary data-driven surfaces must use loading states.

Prefer:

```text
Skeleton Loaders
```

for:

* Dashboard
* Planner
* Analytics
* Achievement grid

Skeletons should approximate final layout.

Avoid generic full-screen spinners for every data request.

Button-level actions may use compact loading indicators.

---

# 57. Error States

Errors must be understandable.

Example:

> We couldn't load today's planner.

Supporting action:

```text
Try Again
```

Do not display:

```text
PrismaClientKnownRequestError
```

or:

```text
500 ECONNREFUSED
```

to users.

Error surfaces should provide recovery where possible.

---

# 58. Offline and Network Feedback

Version 1 is not a complete offline-first product.

However, the PWA must communicate network problems clearly.

Example:

> You're offline. Some updates may be unavailable until your connection returns.

Do not pretend a server action succeeded if it has not been confirmed.

Future offline synchronization must remain architecturally possible.

---

# 59. Motion Philosophy

Motion is a major Mission UI quality layer.

Motion must:

* Explain state changes
* Reinforce progress
* Improve spatial understanding
* Add premium polish

Motion must not:

* Delay common actions
* Constantly distract the user
* Animate every element simultaneously
* Cause motion discomfort

The product should feel alive, not chaotic.

---

# 60. Motion Categories

Mission UI uses four motion categories.

## Micro Interaction

Examples:

* Button press
* Checkbox completion
* Hover state

Recommended duration:

```text
100ms to 220ms
```

## Component Transition

Examples:

* Card state change
* Progress update
* Expand or collapse

Recommended duration:

```text
180ms to 350ms
```

## Page Transition

Examples:

* Route content entrance

Recommended duration:

```text
200ms to 450ms
```

## Celebration Motion

Examples:

* Achievement unlock
* Major streak milestone

Recommended duration:

```text
500ms to 1200ms
```

Durations are guidelines.

Motion must be tested for usability.

---

# 61. Framer Motion Usage

Framer Motion is the approved application animation library.

Use it for:

* Page transitions
* Progress transitions
* Completion feedback
* Achievement moments
* Controlled layout animation

Do not wrap every HTML element in a motion component.

CSS transitions should handle simple hover and focus effects.

Use Framer Motion where stateful animation provides real value.

---

# 62. Hover Effects

Desktop hover interactions may include:

* Small elevation
* Border emphasis
* Surface shift
* Icon translation
* Controlled glow

Avoid extreme scale effects.

Recommended scale changes should remain subtle.

Example:

```text
1.00 → 1.01
```

or:

```text
1.00 → 1.02
```

Do not make dashboard cards jump aggressively on hover.

Touch devices must not depend on hover.

---

# 63. Reduced Motion

Mission UI must respect:

```text
prefers-reduced-motion
```

When reduced motion is enabled:

* Disable decorative motion
* Reduce large transitions
* Avoid particle effects
* Preserve state clarity

The product must remain fully understandable without animation.

---

# 64. Responsive Strategy

Mission UI uses mobile-first responsive design.

Supported device classes:

```text
Mobile
Tablet
Laptop
Desktop
```

The application must not be designed only at desktop width and later compressed for mobile.

Primary workflows must be tested on narrow screens.

---

# 65. Mobile Requirements

On mobile:

* Task completion targets must be easy to tap.
* Planner rows must remain readable.
* Navigation must remain reachable.
* Quick Add must remain fast.
* Time selection must remain usable.
* Journal writing must remain comfortable.
* Analytics must avoid horizontal overflow.

Important actions should remain reachable without precision tapping.

---

# 66. Touch Target Requirements

Interactive controls should target an accessible touch size.

Recommended minimum target direction:

```text
44px × 44px
```

Small visual icons may exist inside larger interactive hit areas.

Do not make the completion checkbox difficult to tap.

---

# 67. Desktop Requirements

Desktop layouts may use:

* Sidebar navigation
* Multi-column dashboard composition
* Wider planner rows
* Side insights
* Richer analytics layouts

Desktop space must improve clarity.

Do not stretch every card to fill available width without purpose.

Use controlled content widths.

---

# 68. Accessibility

Accessibility is part of Mission UI.

Requirements include:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Accessible labels
* Color contrast
* Reduced motion support
* Text alternatives where required
* Logical heading hierarchy

Interactive icons must have accessible names.

Color must not be the only state indicator.

---

# 69. Keyboard Navigation

Core workflows must support keyboard usage.

Examples:

* Navigate buttons
* Add activity
* Complete activity
* Use dialogs
* Save journal
* Navigate forms

Focus order must remain logical.

Keyboard traps are prohibited.

---

# 70. Screen Reader Considerations

Important dynamic changes should be communicated appropriately.

Examples:

* Task completed
* Validation error
* Save success
* Dialog opened

Do not announce every decorative animation.

Progress visualizations require accessible text equivalents.

Example:

```text
Daily completion: 80 percent.
```

---

# 71. Performance UX

Premium UI must remain performant.

Do not sacrifice application responsiveness for visual effects.

Requirements:

* Avoid excessive animation layers
* Avoid unnecessary re-renders
* Optimize images
* Lazy-load appropriate routes
* Avoid layout shifts
* Keep interactions immediate

A beautiful interface that feels slow does not meet Mission UI standards.

---

# 72. Image and Illustration Usage

Illustrations may be used for:

* Empty states
* Onboarding
* Major motivational moments

Illustrations must follow a consistent visual direction.

Do not mix:

* Random 3D illustrations
* Cartoon characters
* Corporate stock vectors
* Photorealistic images

inside the same product without a defined visual strategy.

Version 1 should prefer interface-driven visual storytelling over excessive illustration assets.

---

# 73. Content Tone

Mission UI uses constructive, motivating language.

Preferred:

> You completed 6 activities today. Keep building your momentum.

Avoid:

> You failed to complete 4 tasks.

Preferred:

> 4 activities remain unfinished.

Avoid:

> Your productivity is bad.

The product must remain truthful.

Motivation must not hide actual progress data.

---

# 74. Microcopy Rules

Microcopy should be:

* Short
* Clear
* Human
* Actionable

Button labels should describe actions.

Preferred:

```text
Add Activity
Save Journal
Enable Reminders
Try Again
```

Avoid vague labels such as:

```text
Submit
Proceed
Okay
```

when a more specific action is available.

---

# 75. Design Quality Gate

A frontend feature is not complete only because it works.

Before completion, review:

1. Visual hierarchy
2. Spacing consistency
3. Typography
4. Responsive behavior
5. Loading state
6. Empty state
7. Error state
8. Hover state
9. Focus state
10. Motion
11. Reduced motion
12. Accessibility
13. Dark mode
14. Performance

A feature failing these checks is not Mission UI complete.

---

# 76. shadcn/ui Usage Policy

shadcn/ui is an implementation foundation.

It is not the final visual identity.

Allowed:

* Use accessible primitive foundations.
* Customize components.
* Apply Mission UI tokens.
* Extend interaction behavior.

Not allowed:

* Ship untouched default styling.
* Copy the default dashboard appearance.
* Use components without visual system consistency.

Mission UI remains the source of truth.

---

# 77. Frontend AI Rules

Claude, Antigravity, or another AI implementation tool must:

* Read this document before major frontend work.
* Follow Mission UI.
* Preserve design tokens.
* Reuse approved primitives.
* Avoid random colors.
* Avoid inconsistent radius values.
* Avoid unnecessary animation.
* Implement responsive behavior.
* Implement accessibility states.
* Include loading, empty, and error states.

AI tools must not independently replace Mission UI with another design direction.

---

# 78. Foundation Milestone 01 UI Scope

Foundation Milestone 01 may implement:

* Tailwind CSS foundation
* Mission UI base tokens
* Theme foundation
* shadcn/ui installation foundation
* React application shell foundation
* Base responsive layout
* PWA visual metadata

Milestone 01 must not implement:

* Final dashboard
* Final planner
* Final journal
* Final mood experience
* Final analytics
* Final achievement screens

Premium feature UI belongs to approved frontend milestones.

---

# 79. Version 1 Signature Experiences

Mission UI identifies five signature product experiences:

```text
Daily Momentum Hero
Daily Progress Ring
Fast Planner Quick Add
Task Completion Feedback
End-of-Day Momentum Summary
```

Additional signature moments include:

```text
Achievement Unlock
Streak Milestone
XP Progress
```

The frontend should invest additional design and interaction quality in these experiences.

---

# 80. Final Design Decision

Daily Development Tracker uses:

```text
Mission UI
     │
     ├── Premium Visual Hierarchy
     ├── Personal Momentum Concept
     ├── Controlled Color System
     ├── Layered Surfaces
     ├── 8-Point Spacing
     ├── Modern Typography
     ├── Purposeful Motion
     ├── Progress Visualization
     ├── Responsive Design
     ├── Accessibility
     └── Constructive Motivation
```

Mission UI prioritizes:

* Clarity
* Momentum
* Motivation
* Beauty
* Accessibility
* Performance
* Consistency

The interface must feel premium because of disciplined design decisions, not because every element has a gradient, glow, or animation.

---

# DOCUMENT STATUS

**Version:** 1.0

**Status:** FROZEN

**Design Language:** Mission UI

**Change Policy:** Major design-system changes require explicit UI/UX review.

This document is the source of truth for Daily Development Tracker Version 1 UI and UX design.

````


