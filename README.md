# SIRAI

**Sudan Initiative for Resilience & Inclusive Action**

*Built with communities.*

An independent, volunteer-led community initiative in development, rooted in Sudan. SIRAI makes practical planning and learning resources accessible while working toward community-led action.

## Live website

https://itshams7.github.io/sirai-website/

## Public resources

### WaterShare (Resource 001)

A free community water-planning tool with daily volume estimates, collection windows, automatically generated anonymous household groups, CSV exports, and practical safeguards. It is an educational resource, not a water-safety or engineering assessment.

https://itshams7.github.io/sirai-website/water-toolkit.html

### ProjectStarter (Resource 002)

A guided workspace to turn a community idea into a realistic draft proposal.

Features:
- Problem definition, intended participants, community voice, success criteria
- Budget line items, contingency, confirmed funding, and funding-gap strategy
- Team responsibilities, milestones, risk planning, and a readiness review
- Printable proposal, editable JSON draft, and optional on-device saving
- English, Arabic (RTL), French and German

Project entries are processed in the user's browser. The tool does not submit project details to SIRAI. Saving a draft is optional and uses the browser's own local storage. Users should avoid entering personally identifying or sensitive operational details.

https://itshams7.github.io/sirai-website/projectstarter.html

### TaqaWise (Resource 003)

A free multilingual household electricity planning tool.

- Appliance-by-appliance rated wattage, count, and daily effective operating hours
- Live daily energy and connected-load totals, with per-appliance contribution bars
- Optional prioritization of essential loads during outages
- Illustrative battery runtime and nominal energy capacity for a chosen outage duration
- Simplified solar PV power estimates using equivalent peak sun hours and a user-adjustable performance factor
- Printable summary, appliance CSV export, and editable JSON draft import/export
- English, Arabic (RTL), French and German

All entries are processed in the browser. TaqaWise does not submit the household plan to SIRAI or save it persistently. Its calculations exclude startup currents, system protection, seasonal weather, battery aging and professional design constraints. It is not suitable for determining critical medical backup power or specifying equipment for installation.

https://itshams7.github.io/sirai-website/taqawise.html

## Structure

- `index.html`: main SIRAI website
- `water-toolkit.html`: WaterShare
- `projectstarter.html`: ProjectStarter
- `taqawise.html`: TaqaWise
- `assets/`: design, functionality, languages, and founder photo

## Status and accuracy

SIRAI is an initiative in development, not a registered NGO. Its resources are educational drafts and have not been validated as substitutes for local expert advice, participant consent, safeguarding or operational review. Earlier community activities completed personally by the founder predate SIRAI and must not be represented as SIRAI field projects.

ProjectStarter exports are user-created drafts, not evidence of SIRAI funding or endorsement.
