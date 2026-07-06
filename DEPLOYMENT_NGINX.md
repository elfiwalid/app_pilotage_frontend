# Staff2Staff Frontend - Local Nginx Deployment

This guide deploys the React/Vite frontend locally on Windows with Nginx.

## Current frontend API configuration

The frontend API client uses:

```ts
VITE_API_BASE_URL || '/api'
```

For a production-like Nginx deployment, keep the default `/api` and let Nginx proxy `/api/` to the Spring Boot backend on `http://localhost:8080`.

## Build the frontend

From the frontend directory:

```powershell
cd "C:\Users\ieljalili\OneDrive - Axway Software\Desktop\staff2staff-pfe\app_pilotage_frontend"
npm run build
```

The generated production files are in:

```text
C:\Users\ieljalili\OneDrive - Axway Software\Desktop\staff2staff-pfe\app_pilotage_frontend\dist
```

## Option A - Point Nginx directly to dist

Copy `nginx.staff2staff.conf` into your Nginx `conf` folder, or include it from `nginx.conf`.

Example include in `C:\nginx\conf\nginx.conf` inside the `http { ... }` block:

```nginx
include C:/Users/ieljalili/OneDrive - Axway Software/Desktop/staff2staff-pfe/app_pilotage_frontend/nginx.staff2staff.conf;
```

The provided config serves:

```text
http://localhost:8081
```

## Option B - Copy dist into C:\nginx\html

This option avoids spaces in the Nginx root path.

```powershell
New-Item -ItemType Directory -Force "C:\nginx\html\staff2staff"
Copy-Item -Recurse -Force ".\dist\*" "C:\nginx\html\staff2staff\"
```

Then use this root in the Nginx server block:

```nginx
root C:/nginx/html/staff2staff;
```

## Nginx server block

Use this server block on port `8081`:

```nginx
server {
    listen 8081;
    server_name localhost;

    root "C:/Users/ieljalili/OneDrive - Axway Software/Desktop/staff2staff-pfe/app_pilotage_frontend/dist";
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Start, stop, reload Nginx on Windows

From the Nginx install directory, usually `C:\nginx`:

```powershell
cd C:\nginx
.\nginx.exe
```

Reload after config changes:

```powershell
cd C:\nginx
.\nginx.exe -s reload
```

Stop:

```powershell
cd C:\nginx
.\nginx.exe -s stop
```

Fast quit:

```powershell
cd C:\nginx
.\nginx.exe -s quit
```

Validate config syntax:

```powershell
cd C:\nginx
.\nginx.exe -t
```

## Final checks

1. Start the backend on `http://localhost:8080`.
2. Build the frontend with `npm run build`.
3. Start or reload Nginx.
4. Open:

```text
http://localhost:8081
```

5. Login and verify API calls go through `/api` to the backend.
