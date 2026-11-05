# SIRAI release and verification register

**Version:** 0.4.0-prelaunch, 5 November 2026  
**Status:** Software development / voluntary testing. Not a completed humanitarian intervention.

## Release scope
- Low-data preference on every page. When enabled, the site displays cached local illustrations instead of contacting external photo hosting; the selection persists in the browser.
- Improved Arabic typography and right-to-left presentation for navigation and result bars.
- Preserved prior releases: water/project/energy calculators, example workflows, local calculation plots, printable guides and bilingual CSV worksheets.
- Added automated structural checks of language selectors, low-data markup, and cache-version agreement.

## Verification levels
**Automated check:** JavaScript syntax, expected page and asset wiring, model arithmetic test cases, local offline package integrity.

**Not yet verified by automation:** iPhone Safari and low-end Android interactions, colour and reading-level comprehension, complete translation quality, file-sharing destinations, physical water or electricity assumptions, third-party feedback delivery, actual offline behaviour on individual devices.

**Field validation:** Not performed. No actual community benefit or impact is claimed.

## QA procedure (before public launch)
1. In a private browsing session, load the homepage, Resources, Start Here and all three tools.
2. Switch English -> Arabic -> French -> German on each page. Confirm Arabic RTL, numeric units and control labels remain legible at 200% text zoom.
3. In the footer, activate Low-data mode, refresh, navigate to a different page and confirm photographs are replaced by local graphics. Deactivate and verify photos become available online. Observe network requests if possible.
4. On a mobile device, check that the menu and language selector do not collide. Test portrait and landscape.
5. Open all tools while online; activate Airplane Mode and revisit every cached page and a local worksheet. Submit no feedback offline. Confirm no sensitive plans are transmitted.
6. For WaterShare: test 1 household, 24/3 and 25/3 scheduling, invalid numbers, overlapping slots, supply deficits and CSV export. Do not publish real water pickup times.
7. For ProjectStarter: test a zero budget, 10% contingency, insufficient funding, a fictional example, save/load and exports. Confirm names, dates and funding are fictional.
8. For TaqaWise: test zero loads, essential/nonessential loads, changes in DoD and battery efficiency, inverter/runtime assumptions, file imports and exported reports. Results are screening estimates, not installation instructions.
9. Test the feedback form only with non-identifying example data and confirm the receipt before describing the form as functional.
10. Record consent-based usability observations without identifiable details. Do not claim volunteer counts until they actually exist.

## Privacy and threat review
- Static GitHub Pages frontend; planning calculations execute in the browser.
- The feedback form transmits user-supplied content to the configured external provider. Never send precise locations, identities of others, fuel purchases tied to households, or collection schedules.
- Optional persistent browser settings: language, low-data preference, and tool-specific saved drafts where those features explicitly exist. Users can clear them through browser site data.
- External photographic hosting is contacted when photos are enabled. Low-data mode suppresses that request by replacing photo sources before scripts opt in.
- Cache only public static files. Never cache submitted feedback, user drafts, or private exported plans.
- Exported CSV/JSON/PDF files become user-managed copies; avoid sharing them in unsafe channels.
- Do not describe the website as an NGO, donation system, emergency service, or validated engineering tool.

## Release discipline
- Keep source in GitHub; do not force-push main.
- Require GitHub checks to pass for each release commit.
- Document changes and update the service-worker cache version when cached assets change.
- Confirm final Pages deployment **success** after the latest commit.
- Separate functional usability tests from humanitarian efficacy evaluations.
