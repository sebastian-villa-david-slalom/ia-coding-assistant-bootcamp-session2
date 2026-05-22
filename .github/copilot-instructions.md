# GitHub Copilot Instructions

> **Note**: This file is located at `.github/copilot-instructions.md` and is used by GitHub Copilot to understand project context.

This file contains high-level instructions for GitHub Copilot to follow when generating code for this project. For detailed guidance, refer to the documentation files in the `docs/` directory.

## Documentation Overview

The project documentation will be built during the bootcamp sessions.

- [Project Overview](../docs/project-overview.md) - Overview of the project
- [Functional Requirements](../docs/functional-requirements.md) - Core expected TODO app behavior and rules
- [UI Guidelines](../docs/ui-guidelines.md) - Core visual, interaction, and accessibility guidelines for the TODO app
- [Testing Guidelines](../docs/testing-guidelines.md) - Core testing principles, test structure, and quality expectations for the TODO app

## UI Implementation Expectations

When generating or updating frontend code for the TODO app, follow the UI guidelines in `docs/ui-guidelines.md`.

- Prefer Material UI components for core UI elements such as buttons, inputs, dialogs, cards, and form controls.
- Keep the task list as the primary focus of the main screen and keep task creation easy to access.
- Make task status, due dates, overdue states, and available actions easy to scan.
- Use a clear visual hierarchy with consistent spacing, readable typography, and distinct primary, secondary, and destructive actions.
- Ensure the UI is responsive across desktop, tablet, and mobile layouts.
- Preserve accessibility requirements including keyboard access, visible focus states, accessible labels, clear validation messaging, and WCAG AA contrast.
- Do not rely on color alone to communicate completion state, overdue state, or errors.
