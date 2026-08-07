## Why validation is shared

I placed validation in a shared package because the same business rules
are used by the web app, mobile app, and API. This prevents duplicated
validation logic and allows TypeScript types to be inferred from Zod
schemas.