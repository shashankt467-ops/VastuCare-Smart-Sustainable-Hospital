# VastuCare — Smart Sustainable Hospital

> **Track 9: Sustainable Hospital Design Inspired by Vastu and Environmental Engineering**
> An interactive full-stack AI + IoT digital twin prototype integrating traditional architectural principles with modern environmental engineering.

---

## Executive Summary & Problem Statement

Modern healthcare facilities consume significant energy, generate heavy bio-hazardous waste, and require continuous environmental monitoring for patient safety. **VastuCare** demonstrates how traditional Vastu-inspired spatial planning (sunlight orientation, courtyard micro-ventilation, zone isolation) can be harmoniously paired with modern environmental engineering (rooftop solar microgrids, rainwater harvesting, smart waste segregation, and rule-based AI optimization) to achieve up to **31% water savings**, **68% waste diversion**, and a **dynamic sustainability rating of 87/100**.

> **Architectural Inspiration Disclaimer:**
> Vastu principles are used strictly as an architectural inspiration for spatial organization, natural lighting orientation, and natural stack ventilation flow. Hospital clinical safety, emergency accessibility, infection control, and modern environmental engineering standards take primary precedence.

---

## Key System Features

1. **Interactive 3D Hospital Twin (Three.js / React Three Fiber):**
   - Procedural WebGL 3D architectural model covering Ground Floor, 1st Floor, 2nd Floor, and Exterior Grounds.
   - Interactive Floor Selector (*All Floors, Ground, 1st Floor, 2nd Floor*).
   - Sustainability Layer Overlays (*Solar Generation Rays, Water Pipe Harvesting, Smart Waste Hub, Air Quality Heatmap*).
   - Click-to-inspect room popup displaying live temperature, humidity, CO₂, energy draw, occupancy %, and zone recommendations.
   - Dynamic Day/Night lighting transitions affecting solar output and window light emissions.

2. **Real-time Server-Side IoT Telemetry Ticker:**
   - Single in-memory server state updated continuously on an automated background ticker.
   - Dynamic threshold evaluation categorizing telemetry into **NORMAL**, **WARNING**, and **CRITICAL** status flags.
   - Parabolic daylight solar generation curve (peaking midday, 0 kW at night).
   - Automated water leakage detection flagging abnormal zone draw rates.

3. **Multi-Dimensional Sustainability Scoring Engine:**
   - Dynamic score out of 100 calculated across 6 weighted environmental dimensions:
     1. Energy Efficiency & Renewables (25 pts)
     2. Water Conservation & Harvesting (20 pts)
     3. Smart Waste Segregation & Diversion (20 pts)
     4. Indoor Environmental Quality & Air (15 pts)
     5. Daylight & Natural Orientation (10 pts)
     6. Courtyard Greenery & Vastu Layout (10 pts)
   - Visual Before vs After comparison comparing Conventional Hospital vs VastuCare Design.

4. **Smart Waste Management & One-Click Evacuation:**
   - Live bin capacity gauges for Biomedical, Recyclable, General, and Organic waste.
   - Interactive **"Collect Waste"** button that animates, resets fill percentage to 0%, updates collection history, and dynamically improves the hospital's Sustainability Score.

5. **AI Optimization Advisor & Centralized Alert Operations:**
   - Priority-ranked suggestions (*Critical, High, Medium, Low*) analyzing live sensor telemetry.
   - Dedicated Alert Operations page with category/severity filtering and interactive **"Mark as Resolved"** actions.

6. **Historical Analytics & Settings Control:**
   - Recharts graphs for Solar vs Grid Power, CO₂ curves, and weekly score history with Daily/Weekly/Monthly filters.
   - Simulation speed slider (1x, 2x, 5x speed), Day/Night toggle, and 1-click **Reset Simulation Baseline**.

7. **Scripted Hackathon Demo Mode:**
   - Automated 6-step presentation story runner: *Baseline Operating -> OPD Occupancy Surge -> Biomedical Waste Exceeded -> AI Recommendation -> Automated Remediation -> Sustainability Restored*.

---

## Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Three.js, `@react-three/fiber`, `@react-three/drei`, Recharts, Lucide React icons.
- **Backend:** Express (Node.js + TypeScript / ES Modules), REST API architecture.
- **State & Simulation:** Server-side in-memory singleton ticker (`SimulationEngine`) updating live telemetry.
- **Offline First:** 100% local execution without external paid API keys or external database dependencies.

---

## System Architecture Diagram

```
                 +-----------------------------------+
                 |     VastuCare Frontend UI         |
                 | React + R3F 3D Twin + Recharts    |
                 +-----------------+-----------------+
                                   |
                       REST API    |  Polling (1.5s)
                       Commands    |  Telemetry
                                   v
                 +-----------------------------------+
                 |    Express Node Backend REST      |
                 |     http://localhost:5000/api     |
                 +-----------------+-----------------+
                                   |
                         Internal  |  Ticker Loop
                         State     |  (Every 2s)
                                   v
                 +-----------------------------------+
                 |    In-Memory Simulation Engine    |
                 |  Zones | Sensors | Solar | Waste  |
                 |  Alerts | Score Calculation Engine|
                 +-----------------------------------+
```

---

## Installation & Running Locally

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### Step 1: Clone & Install Dependencies
Open a terminal in the project directory and run:

```bash
# Install dependencies for both backend and frontend
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Start Backend Server
In the backend directory or from the root:

```bash
# Start backend server on http://localhost:5000
npm run dev:backend
```

### Step 3: Start Frontend Dev Server
In a second terminal window:

```bash
# Start Vite frontend dev server on http://localhost:3000
npm run dev:frontend
```

Now open your browser at **`http://localhost:3000`** to view the application!

---

## Production Build & Verification

To verify full TypeScript compilation and production bundle creation:

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Or build both
npm run build
```

---

## How to Demonstrate during Hackathon Judging

1. Open the application on `http://localhost:3000`.
2. **Overview Page:** Point out the dynamic KPI cards (Sustainability Score 87/100, Energy saved %, Water saved %, CO₂ avoided).
3. **3D Hospital:** Click **"Explore 3D Hospital"** in the top header or sidebar.
   - Rotate, zoom, and pan the WebGL hospital.
   - Click the floor buttons (*Ground, 1st Floor, 2nd Floor, All*) to demonstrate floor isolation.
   - Click room boxes (*ICU, OT, OPD, Patient Ward*) to open the live Zone Inspector Modal.
   - Toggle Sustainability Layers (*Solar Rays, Water Harvesting Pipes, Waste Hub, Air Quality Heatmap*).
4. **Demo Mode:** Click the gradient **`[Demo Mode]`** button in the top header.
   - Watch step-by-step presentation scenario execute.
   - Observe live narration captions at the top of the screen as OPD CO₂ spikes to 1350 ppm and Bio waste reaches 94%.
5. **Waste Evacuation & Dynamic Score Update:**
   - Go to **"Waste & AI Advisor"**.
   - Click **"Collect Waste"** on the Biomedical Waste Hub.
   - Observe the fill percentage reset to 0% and the Sustainability Score jump up dynamically!
6. **Vastu Principles & Disclaimer:**
   - Navigate to **"Sustainability & Vastu"** and highlight the 6-dimension breakdown, Before vs After visual, and explicit architectural disclaimer.
