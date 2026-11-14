## Mandatory Development Rules

1. **Understand before changing:** Inspect the existing architecture, components, dependencies and functionality before modifying code.

2. **Identify root causes:** Investigate the actual cause of an issue. Do not apply temporary CSS fixes, workarounds or superficial changes.

3. **Minimal changes:** Modify only the files and components necessary for the requested task. Avoid unrelated refactoring, redesigns and dependencies.

4. **Preserve existing functionality:** Never break authentication, navigation, exam selection, question generation, timers, test submission, results, subscriptions, notifications or existing APIs.

5. **No unrequested changes:** Do not introduce new UI designs, animations, popups, features or behavior unless explicitly requested.

6. **Test every implementation:** Run relevant automated tests, production builds and actual functional tests on Android. Test iOS when the changes affect iOS.

7. **Mandatory regression testing:** Verify the affected feature and related existing functionality, including navigation, buttons, touch interactions, scrolling, API calls and data persistence.

8. **No build-only validation:** A successful build does not mean the implementation works. Verify actual runtime behavior.

9. **Fix before proceeding:** If tests fail, investigate, fix and repeat the tests before considering the task complete.

10. **Protect existing configurations:** Do not modify environment variables, database schemas, authentication settings, signing configurations or production data without explicit approval.

11. **APK generation:** Generate a new signed Android APK only after relevant functional and regression tests pass.

12. **Honest reporting:** Clearly distinguish tests actually executed from code reviews or tests that were blocked. Never claim successful device testing without performing it.
13. **Website and mobile compatibility:** Any shared-code change must be checked for impact on the website, Android and iOS.

14. **Platform-specific changes:** Clearly identify whether a change applies to Web, Android, iOS or all platforms. Never unintentionally break another platform.
## Testing and Build Requirements Based on Change Scope

Apply testing and build requirements according to the actual scope of each task.

1. **Documentation-only changes:** Verify the file changes. No application build is required.
2. **Website-only changes:** Run relevant tests and the Vite production build. Do not generate an APK unnecessarily.
3. **Shared React component changes:** Verify the website and all affected mobile platforms.
4. **Android-specific changes:** Run Android-specific tests, Capacitor sync where applicable, and Android build verification.
5. **iOS-specific changes:** Verify the iOS implementation and build where the environment permits.
6. **Mobile UI changes:** Use an Android/iOS emulator or physical device whenever available. Browser preview alone is not sufficient.
7. **Regression testing:** Test the changed feature and related existing functionality before declaring the task complete.
8. **APK generation:** Generate a new APK when explicitly requested or required for mobile verification, only after relevant tests pass.

Never run unnecessary release builds for unrelated changes. Never claim that a platform was tested if it was not.

A successful compilation or browser preview does not prove that the actual mobile application works.

## Required Completion Report

For every task, provide:
- Root cause or implementation approach.
- Files changed.
- Functionality implemented.
- Automated test results.
- Android/iOS testing results, as applicable.
- Regression testing results.
- Remaining issues or blocked tests.
- APK output path, if an APK was requested.

## Final Instruction

These rules apply to ALL future MockTest development tasks, not just the current request.

Do not weaken, ignore or bypass these rules to complete a task faster.
