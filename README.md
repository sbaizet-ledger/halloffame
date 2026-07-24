# Hall of Fame 🏃‍♂️

Self-hosted achievement tracker for runners and trail athletes. Keep your personal record of races, rankings, and memorable performances.

## Features

- **Achievement Tracking**
  - Category: Trail or Run
  - Distance (kilometers)
  - Event name and date
  - Links to photos, videos, and official event websites
  - Scratch ranking (overall position)
  - Category ranking with gender (Poussin H/F, Benjamin H/F, Minime H/F, Cadet H/F, Junior H/F, Espoir H/F, Senior H/F, Master 0-10 H/F)

- **Management**
  - Add new achievements
  - Edit existing achievements
  - Password-protected edit functionality
  - Sort and filter by date, distance, category, or type

- **Simple & Lightweight**
  - JSON-based storage (no database required)
  - Docker support for Raspberry Pi deployment
  - Self-hosted on your local network

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Storage**: JSON file system
- **Deployment**: Docker (ARM64 for Raspberry Pi)

## Installation

### Prerequisites

- Node.js 18+ (for local development)
- Docker (for production deployment on Raspberry Pi)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/halloffame.git
cd halloffame/app

# Install dependencies
npm install

# Set up environment
echo "ADMIN_PASSWORD=changeme123" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment (Raspberry Pi)

```bash
# Build the Docker image (from project root)
cd halloffame
docker build -t halloffame:latest .

# Run the container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e ADMIN_PASSWORD=your-secure-password \
  --restart unless-stopped \
  --name halloffame \
  halloffame:latest
```

Access the app at `http://your-raspberry-pi-ip:3000`

## Configuration

### Environment Variables

The application uses the following environment variables:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_SECRET` | NextAuth.js session encryption secret | Generate with: `npx auth secret` |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | From Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | From Google Cloud Console |
| `NEXTAUTH_URL` | Public URL of the application | `https://hall-of-fame.lepetitmontagnard.org` |

#### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `AUTH_TRUST_HOST` | Trust configuration for reverse proxies | `false` | `true` or `host1.com,host2.com` |
| `ADMIN_PASSWORD` | Legacy password (migration only) | - | `changeme123` |
| `JWT_SECRET` | Legacy JWT secret (migration only) | - | Auto-generated |

#### AUTH_TRUST_HOST Configuration

This variable is **REQUIRED** when deploying behind a reverse proxy (Cloudflare Tunnel, nginx, Traefik, etc.).

**Options:**
- **Not set or `false`**: Strict host checking (default, recommended for development)
- **`true`**: Trust all hosts (use for reverse proxies like Cloudflare Tunnel)
- **`host1.com,host2.com`**: Trust specific comma-separated hosts

**Example for Cloudflare Tunnel:**
```env
AUTH_TRUST_HOST=true
```

**Example for specific hosts:**
```env
AUTH_TRUST_HOST=halloffame.lepetitmontagnard.org,hall-of-fame.lepetitmontagnard.org
```

**Why this is needed:**
- Reverse proxies change the `Host` header when forwarding requests
- NextAuth v5 requires explicit trust configuration to accept proxied requests
- Without this, you'll get `UntrustedHost` errors in production

### Example Configuration Files

#### Development (`.env.local`)

```env
# NextAuth.js
AUTH_SECRET=<generated-by-npx-auth-secret>
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
NEXTAUTH_URL=http://localhost:3000

# Trust Host (optional in development)
# AUTH_TRUST_HOST=false

# Legacy (for migration only)
ADMIN_PASSWORD=changeme123
JWT_SECRET=<generated>
```

#### Production (Docker / Portainer)

```env
# NextAuth.js
AUTH_SECRET=<your-production-secret>
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
NEXTAUTH_URL=https://hall-of-fame.lepetitmontagnard.org

# REQUIRED for Cloudflare Tunnel / reverse proxy
AUTH_TRUST_HOST=true
```

### Data Storage

Achievements are stored in `/data/users/{userId}/achievements.json` (per-user storage for multi-user support). Files are automatically created on first use.

**Example JSON structure:**

```json
{
  "achievements": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2026-07-20",
      "category": "Trail",
      "distance": 42.195,
      "name": "Ultra Trail du Mont Blanc",
      "photoLinks": [
        "https://example.com/photo1.jpg",
        "https://example.com/photo2.jpg"
      ],
      "videoLinks": [
        "https://youtube.com/watch?v=example"
      ],
      "eventWebsite": "https://utmb.world",
      "rankingScratch": 156,
      "rankingCategory": "Master 1 H",
      "rankingCategoryPosition": 12
    }
  ]
}
```

## Usage

1. **View Achievements**: Browse your hall of fame on the homepage
2. **Add Achievement**: Click "Add Achievement" (requires authentication)
3. **Edit Achievement**: Click the edit icon on any achievement card (requires authentication)
4. **Sort/Filter**: Use the toolbar to filter by category or sort by date/distance

## Category Reference

Available age/gender categories:

- Poussin H/F (U10)
- Benjamin H/F (U12)
- Minime H/F (U14)
- Cadet H/F (U16)
- Junior H/F (U18)
- Espoir H/F (U20)
- Senior H/F (20-34)
- Master 0 H/F (35-39)
- Master 1 H/F (40-44)
- Master 2 H/F (45-49)
- Master 3 H/F (50-54)
- Master 4 H/F (55-59)
- Master 5 H/F (60-64)
- Master 6 H/F (65-69)
- Master 7 H/F (70-74)
- Master 8 H/F (75-79)
- Master 9 H/F (80-84)
- Master 10 H/F (85+)

## Project Structure

```
halloffame/
├── app/                     # Next.js application
│   ├── app/                # App router pages
│   │   ├── api/           # API routes for CRUD operations
│   │   │   └── achievements/
│   │   └── page.tsx       # Homepage
│   ├── components/        # React components
│   │   ├── achievement-card.tsx
│   │   ├── achievement-form.tsx
│   │   ├── auth-dialog.tsx
│   │   └── filter-toolbar.tsx
│   ├── lib/              # Business logic
│   │   ├── achievements.ts
│   │   ├── auth.ts
│   │   └── types.ts
│   ├── data/             # JSON data storage
│   │   └── achievements.json
│   └── package.json
├── Dockerfile            # Docker configuration
├── PLAN.md              # Build plan
└── README.md
```

## Development Status

- [x] Core achievement CRUD functionality
- [x] Authentication for edit operations
- [x] Sort and filter UI
- [x] Docker deployment setup
- [x] Data validation
- [x] Error handling
- [x] Responsive design

**Future Enhancements:**
- [ ] Photo upload capability (store locally instead of links)
- [ ] Export to PDF/CSV
- [ ] Statistics dashboard (total distance, race count, averages)

## License

MIT

## Author

Built with Next.js and shadcn/ui for personal achievement tracking.
