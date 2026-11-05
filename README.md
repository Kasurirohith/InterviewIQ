# InterviewIQ

AI-powered interview preparation platform built with React, FastAPI, and SQLite.

## Subscription demo

The subscription checkout is a college-project simulation. It does not connect to a bank, card processor, or UPI provider and never charges money. Demo checkout records are stored as active demo subscriptions in the backend database.

The admin dashboard is available at `/admin`. Configure a private `ADMIN_PASSWORD` environment variable for the Render service before using it. Do not put this value in the repository or frontend. The admin password is sent to the backend over HTTPS and is kept only in the page's memory while the dashboard is open.

Demo records use the service's SQLite database. On Render's free service, local files may be cleared when the service restarts or is redeployed. Use a persistent database for long-term subscription records.
