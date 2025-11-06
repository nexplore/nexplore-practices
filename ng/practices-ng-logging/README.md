# @nexplore/practices-ng-logging

This library provides lightweight yet flexible logging utilities for web based applications, allowing for controlled console logging with topic-based filtering.

## Purpose

The library addresses the need for controlled logging in web applications, especially during development and troubleshooting. It provides a way to enable logging for specific topics or components without flooding the console with unnecessary information.

## Features

-   **Topic-based Logging** - Organize log messages by specific topics or components
-   **Configurable Logging Levels** - Support for regular logs and more detailed trace logs
-   **Runtime Configuration** - Enable/disable logging for specific topics at runtime
-   **URL-based Configuration** - Enable logging via URL parameters for debugging in production
-   **Local Storage Persistence** - Save logging preferences across browser sessions
-   **Visual Differentiation** - Color-coded console output for better readability
-   **Browser Console API** - Global methods to control logging from the browser console

## Installation

```bash
npm install @nexplore/practices-ng-logging
```

## Features and Usage Examples

### Topic-based Logging - [`log`](./src/lib/logging/logging.util.ts) & [`trace`](./src/lib/logging/logging.util.ts)

The library provides two main logging functions that organize log messages by specific topics or components:

```typescript
import { log, trace } from '@nexplore/practices-ng-logging';

// Regular log - only appears if the topic is enabled
log('MyComponent', 'Message to log', { additional: 'data' });

// More detailed trace log - requires explicit trace enabling
trace('MyComponent', 'Detailed debugging info', { verbose: 'data' });

// With context information
log('MyComponent', 'methodName', 'Operation completed', { result: 'success' });
```

### Runtime Configuration - [`enableLogTopic`](./src/lib/logging/logging.util.ts)

Enable or disable logging for specific topics at runtime:

```typescript
import { enableLogTopic } from '@nexplore/practices-ng-logging';

// Enable logging for a specific topic
enableLogTopic('MyComponent');

// Enable all logging
enableLogTopic('*');

// Enable all logging including trace
enableLogTopic('trace');

// Disable logging for a specific topic
enableLogTopic('MyComponent', false);
```

### URL-based Configuration - [`configureDebugLogging`](./src/lib/logging/logging.util.ts)

Enable logging via URL parameters for debugging in production environments:

```typescript
import { configureDebugLogging } from '@nexplore/practices-ng-logging';

// Call this during app initialization
configureDebugLogging();

// Now you can use URL parameters to enable logging:
// https://your-app.com?log=MyComponent,ApiService,AuthService

// To enable all logging:
// https://your-app.com?log=*
// Or simply:
// https://your-app.com?log
```

### Browser Console API

After calling `configureDebugLogging()`, a global method is available in the browser console for easy debugging:

```javascript
// Enable all logging
window.enableLog();

// Enable all logging including trace
window.enableLog('trace');

// Enable logging for a specific topic
window.enableLog('MyComponent');

// Disable logging for a specific topic
window.enableLog('MyComponent', false);

// Disable all logging
window.enableLog(false);
```

The settings will be persisted in localStorage for convenience across browser refreshes.

## Running unit tests

Run `nx test practices-ng-logging` to execute the unit tests.
