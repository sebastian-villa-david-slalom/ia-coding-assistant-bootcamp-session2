# UI Guidelines

This document defines the core user interface guidelines for the TODO application. The goal is to keep the interface consistent, clear, and accessible while supporting the functional requirements of the app.

## Design Principles

1. The interface must prioritize clarity over decoration so users can understand task status and available actions at a glance.
2. The UI must feel lightweight and efficient for frequent task management, with common actions visible without extra navigation.
3. The design must be responsive and usable on desktop, tablet, and mobile screen sizes.

## Component Guidelines

1. The application should use Material UI components for core interface elements such as buttons, text fields, dialogs, date pickers, cards, and form controls.
2. Custom styling may be applied, but components should preserve consistent spacing, alignment, and interaction behavior.
3. Primary actions such as adding or saving a task must use the primary button style.
4. Secondary actions such as canceling or closing a form must use a less prominent button style.
5. Destructive actions such as deleting a task must use a visually distinct danger treatment.
6. Form validation messages must appear near the related field and explain the problem in plain language.

## Layout Guidelines

1. The main screen must present the task list as the primary focus of the page.
2. The task creation form must be easy to find without forcing the user into a separate page.
3. Filters for all, active, and completed tasks must be grouped together and placed near the task list.
4. Each task row or card must present the title, completion state, due date, and available actions in a clear and scannable layout.
5. Editing a task should happen either inline or in a modal dialog, but the interaction must be consistent throughout the app.

## Visual Style

1. The color palette must use a clean, calm base with high contrast between text and background.
2. The primary color should be a clear blue tone for main actions and active states.
3. Success states, such as completed tasks, should use green accents.
4. Warning or overdue states should use amber or red accents to draw attention without overwhelming the screen.
5. Neutral colors should be used for borders, secondary text, and inactive controls.
6. Completed tasks should be visually distinct, for example through a check indicator, muted text color, and optional strikethrough styling.
7. Overdue tasks should be visually distinct from both normal and completed tasks.

## Typography And Spacing

1. The UI should use a modern, readable sans-serif typeface.
2. Text hierarchy must be obvious through consistent font size, weight, and spacing.
3. Interactive elements must have enough padding to support mouse and touch interaction.
4. Spacing must follow a consistent scale so forms, lists, and controls feel visually aligned.

## Accessibility Requirements

1. All text and interactive elements must meet WCAG AA contrast expectations.
2. Every interactive control must be keyboard accessible.
3. The visible focus state must be clear and consistent across buttons, inputs, links, and filter controls.
4. Form fields must have accessible labels.
5. Validation errors must be announced clearly to assistive technologies.
6. Status changes, such as marking a task complete or showing an error, should be communicated in an accessible way.
7. The UI must not rely on color alone to communicate completion, overdue status, or errors.

## Interaction Expectations

1. User actions should provide immediate visual feedback.
2. Loading and empty states must be intentional and informative rather than blank.
3. If no tasks exist, the empty state should explain what to do next.
4. If task data is being saved or loaded, the interface should indicate that work is in progress.
5. Confirmations should be used sparingly, but destructive actions such as delete should prevent accidental activation.