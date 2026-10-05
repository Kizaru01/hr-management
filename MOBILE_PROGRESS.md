# Employee mobile milestone progress

## Status — September 23, 2026
Implementation is complete. Native device acceptance remains unverified because no Android SDK, adb, emulator, or connected device is available in this environment. No usage limit was reported. The interrupted dependency installation has been repaired.

The user explicitly deferred emulator setup and device testing. A subsequent code review added bottom safe-area protection to screens outside the tab navigator, allowed loading labels to wrap at large text sizes, and cleared the in-memory token immediately during session revalidation. Saved SecureStore credentials still survive network failures. Native acceptance remains deferred, not passed.

## Completed work
- Inspected Expo/Router, Nest authentication and employee readers, shared validation/domain/constants, and existing web workflows/tokens before implementation. Read SDK 57 documentation as required by apps/mobile/AGENTS.md.
- Added native login with shared validation, per-field errors, password visibility, pending state, and separate rejected-credentials/network errors.
- Added protected authentication and employee Router groups with Home and Profile tabs.
- Added a focused direct Nest client with timeout/cancellation, explicit consumed response types, runtime parsing, and HTTP/network errors.
- Added serialized SecureStore token storage, current-user validation on launch/foreground, role gating, authenticated 401 clearing, local sign-out, and retry for network/storage failure. No credential logs or insecure storage fallback.
- Home fetches profile, attendance, visible announcements, and unread count independently; renders loading, empty and section error/retry states. Attendance remains read-only and calculated by Nest.
- Profile displays only basic work information; other returned employee fields are discarded and no employee data is persisted.
- Added native semantic light/dark tokens, safe areas, keyboard handling, scrolling and accessible action targets.
- Aligned existing dependencies within SDK 57 and corrected stale Metro peers. No backend contracts or authorization changed. Existing unrelated API/web changes preserved.

## API contracts and limitations
- POST /auth/login: success envelope containing flat accessToken/id/email/role/lastLoginAt. Shared loginSchema validates input.
- GET /auth/me: bearer current user id/email/role, validated by Nest against active account state.
- Tokens expire in 15 minutes; no refresh-token or Nest logout endpoint exists. Local sign-out cannot revoke an issued JWT. Expiry is handled on the next request or foreground validation.
- Employee and manager are supported because existing personal attendance routes and web employee layout authorize both. Managers receive personal information only; no team management is implemented. HR/admin are rejected by the mobile experience.
- GET /employees/me: returns a broad employee record. Mobile retains only identity, employee number, work email, hire date, department, position, branch, and employment fields in memory.
- GET /attendance/me/status: holiday/name, rest_day, scheduled, absent, on_leave/leave, or attendance record with status/timestamps/minutes. Manila timestamps and calendar date-only conventions are preserved.
- Assigned shift details are unavailable through an employee-authorized reader. /shift is restricted to admin/hr/manager; the app does not call it or change permissions.
- GET /announcements: audience/publication/expiry restrictions and descending publication order enforced by Nest. Endpoint is unpaginated; display the first three. No invented pagination/filter.
- GET /notifications/unread-count: existing aggregate count. No notification destination is exposed because that screen is outside this milestone.
- GET /leave/me inspected but not fetched solely to count personal leave records. Unread notification count supplies the supported optional summary.
- Shared domain UserRole omits manager and Employee uses Date objects; mobile uses endpoint wire types plus compatible shared USER_ROLES and loginSchema.

## Changed files
Paths below are relative to the repository root.
- apps/mobile/package.json — SecureStore, shared constants, SDK 57 patch alignment and Metro peers.
- apps/mobile/app.json — SecureStore and Expo-recommended native config plugins.
- pnpm-lock.yaml — dependency resolution; pre-existing API/web changes retained.
- apps/mobile/.env.example — public device API URL example.
- apps/mobile/README.md — exact emulator/phone setup, contracts, privacy and manual acceptance steps.
- apps/mobile/src/app/_layout.tsx — session boundary and protected navigation.
- apps/mobile/src/app/(auth)/_layout.tsx and login.tsx — authentication stack and login.
- apps/mobile/src/app/(app)/_layout.tsx, index.tsx and profile.tsx — tabs, Home and Profile.
- apps/mobile/src/components/mobile-ui.tsx — native screen/card/text/action/loading/error components.
- apps/mobile/src/constants/mobile-theme.ts — native light/dark semantic colors.
- apps/mobile/src/features/auth/auth-provider.tsx and token-storage.ts — session lifecycle and SecureStore.
- apps/mobile/src/features/employee/use-resource.ts — cancellable screen-focused data loading.
- apps/mobile/src/lib/api/client.ts and contracts.ts — API client and consumed endpoint parsers.
- apps/mobile/src/lib/format.ts — Manila and date-only formatting.
- Removed starter routes apps/mobile/src/app/index.tsx and explore.tsx, and old components/app-tabs.tsx and app-tabs.web.tsx.
- MOBILE_PROGRESS.md — this checkpoint.
No spec, test, fixture, mock, or snapshot files were created.

## Verification
- pnpm --filter mobile typecheck: passed after final dependency alignment.
- pnpm --filter mobile lint: passed, no errors/warnings.
- Expo install --check: dependencies up to date.
- Expo Doctor: 21/21 passed after fixing stale Metro peer versions.
- Android Expo export with Hermes bytecode: passed, 1,384 modules, output in ignored apps/mobile/dist/android.
- iOS Expo export with Hermes bytecode: passed, 1,252 modules, output in ignored apps/mobile/dist/ios.
- git diff --check: passed; final documentation included in verification.
- Reviewed changed mobile source and dependency diff; preserved unrelated work.
- Initial sandbox Android export failed to launch Hermes (spawn EPERM); rerun with process permission passed. An attempted combined export flag was unsupported; platform-specific exports used instead.
- Device login, launch restoration, expired-session redirect, Home loading, sign-out, light/dark appearance, keyboard, large text and Android back behavior remain unverified. Bundle export is not a device acceptance test.

## Exact next steps
1. Follow apps/mobile/README.md local setup. From the repository root install dependencies, build constants then validation, start the existing Nest API, copy apps/mobile/.env.example to apps/mobile/.env.local, and configure the public API URL.
2. Android emulator URL: http://10.0.2.2:4000. Physical phone: http://<computer-LAN-IPv4>:4000 on the same reachable network. localhost on a phone refers to that phone. Do not copy backend secrets; release builds require HTTPS.
3. Start pnpm --filter mobile start --clear; use SDK 57-compatible Expo Go or a development build. Launch the Android emulator with `a`, or scan Metro's QR code on a physical phone.
4. With an existing activated employee account, verify invalid login, valid login, Home/Profile, force-close/relaunch restoration, offline/retry without losing credentials, expiry after 15 minutes, sign-out/relaunch, and manager personal access versus HR/admin rejection.
5. Verify both themes, keyboard, large text, section errors/empty states and Android back behavior. iOS requires a physical device or macOS simulator.
6. Record device results here. Do not overwrite unrelated API/web work or create prohibited test artifacts.
