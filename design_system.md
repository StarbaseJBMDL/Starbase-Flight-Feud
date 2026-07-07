# STARBASE Mission Control Design System

## App Purpose
STARBASE Mission Control is a polished mission command dashboard for classroom STEM training. It presents an operations center for instructors and 5th grade students to access active missions, launch learning games, and manage mission crew activities.

## Target Users
- **STARBASE instructors**: mission commanders who launch games and monitor student participation.
- **5th grade students**: mission crew members who access student-facing mission consoles and complete interactive challenges.

## Visual Style
- Inspired by Space Force and NASA operations centers.
- Dark, futuristic HUD aesthetic with layered glass panels.
- Neon blue highlights and gold accents for priority actions.
- Green status lights for online/ready signals.
- Dense starfield and subtle grid textures to support a space operations feel.

## Color Palette
- `#020613` — Deep Space Black
- `#09152f` — Midnight Command Blue
- `#0c2a60` — Navy HUD Base
- `#5bc7ff` — Neon Mission Blue
- `#67c4ff` — Sky Signal Blue
- `#ffd54f` — Gold Accent
- `#7cff8a` — Status Green
- `#f5f7ff` — Soft White
- `#b8d2ff` — Light HUD Glow
- `#0f1832` — Panel Background

## Typography Recommendations
- Primary: **Inter** or a modern geometric sans-serif for clarity and approachability.
- Secondary: **Arial / Helvetica** as fallback.
- Headings: strong, all-caps or heavy weight with generous letter spacing.
- Body text: comfortable readability for 5th graders, 16px+ base size.
- UI labels: clear, uppercase small caps for status and nav items.

## Button Styles
- **Primary action**: large gold gradient button, dark text, strong shadow, hover lift effect.
- **Secondary action**: neon blue gradient button, white text, subtle glow.
- **Tertiary text buttons**: transparent glass with border, blue accent on hover.
- **Disabled state**: muted panel color, low opacity, no glow.
- Use rounded corners for a modern command interface.

## Card / Panel Styles
- Panels use dark translucent backgrounds with soft borders.
- Add neon blue and gold glow shadows for active HUD panels.
- Cards should have internal spacing, rounded corners, and layered depth.
- Use small accent lines or brackets to mimic console overlays.
- Cards should support badges or status dots (online, ready, locked).

## Sidebar Navigation Layout
- Vertical left sidebar with brand lockup at top.
- Include quick links: Mission Overview, Launch Missions, Flight Feud, Mission Crew Access.
- Status module near the top for systems online and active command conditions.
- Footer can show current operation or mission environment.
- Keep the sidebar narrow but readable, with enough padding for projector display.

## Home Dashboard Layout
- Hero area with large title: `STARBASE MISSION CONTROL`.
- Welcome message for Mission Commander and quick launch buttons.
- Local time/date panel and command status cards.
- Mission launch bay card grid with all available modules.
- Responsive layout: two-column on laptop/projector, single-column on iPad/mobile.

## Mission Card Layout
- Card title, short description, and action button.
- Optionally include status chip (Ready, Live, Review).
- Use glowing blue border or shadow for important missions.
- Wide cards for special modules like Space Bingo or Review Roulette.
- Keep card actions large and accessible.

## Teacher Console Layout
- Instructor dashboard should surface control tools and mission metrics.
- Panels for active mission, team status, time sync, and launch controls.
- Clear access to `Flight Feud` and other modules.
- Include teacher-specific actions like `Start mission`, `Reset`, and `View team roster`.
- Use stronger gold accents for command-level actions.

## Student Console Layout
- Student-facing view should feel like mission crew access.
- Large entry button for `Mission Crew Console` and quick mission summary.
- Friendly onboarding text and easy-to-read mission labels.
- Use green status indicators for readiness and progress.
- Keep navigation simplified with 1-2 core actions.

## Animation Ideas
- Soft pulsing glow on active panels and mission cards.
- Subtle starfield drift in the background.
- Button hover lift and shadow expansion.
- Loading shimmer on status modules.
- Mission cards fade and slide into view on dashboard load.

## Sound Effect Ideas
- Soft launch pulse when mission buttons are pressed.
- Electronic click/confirmation tone for navigation taps.
- Ambient whoosh when dashboards open.
- Low hum or subtle beeping for active system status.
- Reward chime when a mission is selected or completed.

## Accessibility Notes for 5th Graders
- Maintain strong contrast between text and background.
- Use large buttons and clear tap targets for younger users.
- Prefer simple, direct language with short labels.
- Avoid excessive motion; keep animations subtle and optional.
- Ensure keyboard / focus states are visible for navigation.

## Responsive Design Notes
- **Projector**: high-contrast, large hero text, wide layout, spaced panels.
- **Laptop**: two-column dashboard, full sidebar, clear mission grid.
- **iPad**: stacked sections, accessible touch targets, sidebar can move below or collapse.
- Use fluid spacing and card widths to resize for each viewport.
- Keep buttons full-width on smaller screens for easier tapping.

## Future Modules
- **Flight Feud**: instructor-facing competitive piloting challenge.
- **Energy Match**: power routing puzzle centered on resource balancing.
- **GPS Adventure**: navigation and waypoint tracking mission.
- **Metric Master**: data-driven challenges around measurements and optimization.
- **Engineering Challenge**: system repair and fault resolution simulation.
- **Escape Challenge**: rapid problem-solving escape scenarios.
- **Space Bingo**: gameboard-style mission objectives.
- **Review Roulette**: quick review rounds for classroom reinforcement.

---

This document supports a consistent STARBASE Mission Control experience across instructor and student workflows while emphasizing a polished, professional space operations theme.