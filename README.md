# Hall of Fame 🏃‍♂️

Self-hosted achievement tracker for runners and trail athletes. Keep your personal record of races, rankings, and memorable performances.

## Features

- **Achievement Tracking**
  - Category: Trail or Run
  - Distance (kilometers)
  - Event name and date
  - Links to photos, videos, and official event websites
  - Scratch ranking (overall position)
  - Category ranking with gender (Poussin M/F, Benjamin M/F, Minime M/F, Cadet M/F, Junior M/F, Espoir M/F, Senior M/F, Master 0-10 M/F)

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

### Authentication

Set environment variables for edit access:

```bash
# .env.local
ADMIN_PASSWORD=your-secure-password
```

### Data Storage

Achievements are stored in `/data/achievements.json`. The file is automatically created on first run.

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

- Poussin M/F (U10)
- Benjamin M/F (U12)
- Minime M/F (U14)
- Cadet M/F (U16)
- Junior M/F (U18)
- Espoir M/F (U20)
- Senior M/F (20-34)
- Master 0 M/F (35-39)
- Master 1 M/F (40-44)
- Master 2 M/F (45-49)
- Master 3 M/F (50-54)
- Master 4 M/F (55-59)
- Master 5 M/F (60-64)
- Master 6 M/F (65-69)
- Master 7 M/F (70-74)
- Master 8 M/F (75-79)
- Master 9 M/F (80-84)
- Master 10 M/F (85+)

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
