# Coding Guidelines

This project favors code that is clear, consistent, and easy to maintain over code that is overly clever or unnecessarily abstract. The goal is to keep both the React frontend and the Node.js backend readable for contributors who need to understand, extend, and test the application quickly.

Formatting should stay consistent across the repository. Use the existing project style for indentation, spacing, line breaks, and naming rather than introducing a different local convention in a single file. Keep functions and components focused on one responsibility, prefer descriptive names over short or ambiguous ones, and avoid deeply nested control flow when a simpler structure will do. Small, well-named helper functions are preferred when they make intent clearer.

Imports should be organized in a predictable order. Group external dependencies first, then internal modules, then relative imports that are local to the feature. Within each group, keep ordering stable and avoid unused imports. If a file only needs a small portion of another module, import just what is required instead of bringing in unnecessary surface area.

Linting should be treated as part of normal development rather than a final cleanup step. Run the project linter regularly and address warnings and errors while implementing changes. Do not silence linter rules unless there is a clear technical reason, and if a rule must be bypassed, the code should make that decision easy to justify during review.

Code should follow standard maintainability principles. Prefer DRY solutions when duplication is real and repeated, but do not force abstraction too early. Shared behavior should be extracted only when it improves clarity and reduces maintenance cost. Keep modules cohesive, avoid mixing unrelated concerns in the same file, and make data flow explicit so future changes are low risk.

Frontend code should emphasize predictable component behavior, accessible markup, and readable state management. Components should receive clear inputs, derive as much as possible from props and state, and avoid hidden side effects. Backend code should emphasize straightforward request handling, clear separation between routing and business logic, consistent error handling, and configuration through environment variables with sensible defaults.

Comments should be used sparingly and only when they add context that the code itself cannot express well. Good names and clear structure are preferred over explanatory comments for obvious behavior. When comments are necessary, keep them short, factual, and tied to the reasoning behind a decision rather than restating what the code already says.

Quality should be enforced through both reviewability and testing. New code should be easy to understand in a diff, aligned with the project documentation, and accompanied by appropriate tests when behavior changes. The expected standard is code that another engineer can read, trust, and modify without having to reverse engineer hidden assumptions.