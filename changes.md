File Modifications:

*   `docker-compose.yml`:
    *   Added volume mounts for `MediaSphere_backend` and `MediaSphere_frontend` to enable live-reloading.
    *   Removed the `command` for `backend` and `frontend` services, as they are now handled by `docker-compose.dev.yml`.
*   `LOCAL_SETUP_GUIDE.md`:
    *   Removed `01_schema_setup.sql` and `03_simple_data.sql` from the database setup instructions.
*   `MediaSphere_frontend/Dockerfile`:
    *   Simplified the Dockerfile to only set up the Node.js environment and install `pnpm`.
    *   Removed multi-stage build steps for production.
    *   Added `COPY package.json pnpm-lock.yaml ./` and `RUN pnpm install`.
    *   Set `CMD ["pnpm", "dev"]`.
*   `MediaSphere_frontend/next.config.mjs`:
    *   Moved `skipMiddlewareUrlNormalize` out of `experimental` to the top level.

New Files Created:

*   `docker-compose.dev.yml`:
    *   Created a new Docker Compose file specifically for development.
    *   Configured `backend` service to use `Dockerfile.dev` and mount `MediaSphere_backend` volume.
    *   Set `backend` command to `mvn spring-boot:run`.
    *   Configured `frontend` service to use `Dockerfile` and mount `MediaSphere_frontend` volume.
    *   Set `frontend` command to `bash -c "npm install && npm run dev"`.
    *   Removed the `healthcheck` for the frontend service.
*   `MediaSphere_backend/Dockerfile.dev`:
    *   Created a new Dockerfile for the backend development environment.
    *   Installed `bash`.
    *   Set `CMD ["mvn", "spring-boot:run"]`.