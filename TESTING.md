## Priority checks before public launch (7 November 2026)

The repository now includes automated static checks in `tests/site-smoke.mjs`, run by `.github/workflows/sirai-smoke.yml`. They cover JavaScript syntax, the five main navigation pages, resource destinations, translation/disclosure markers, the offline cache manifest, and presence of the existing Formspree endpoint.

**These checks do not establish real-device reliability, field validation, or email delivery.** Run the following acceptance tests manually on actual browsers before treating the site as launch-ready:

- **Mobile and RTL:** iPhone Safari and low-end Android Chrome; all four languages, especially Arabic. Check header, state selection, calculator fields, exports, feedback form and orientation changes for overflow.
- **Offline:** Load all three tools online, then use airplane mode to navigate, calculate and export. Test both the root URL and returning online for a cache update. New illustrative hero photographs may require connectivity.
- **Calculators:** Verify independent benchmark values, invalid-input handling, clear warnings and downloadable output on at least two devices.
- **Idea form and feedback:** Use one clearly labelled consented test message through each form. In Formspree, verify the form `mnpplgae` is active, the submission appears in the dashboard, and a notification is actually received at the intended address (`shaamsuni@gmail.com`). Do not assume GitHub Pages sends mail itself.
- **User feedback:** With consent, ask Sudanese Arabic-first users to attempt a hypothetical planning task; record confusion, loading failures and changes made without collecting operational or identifying data.
- **Sources:** Review all public statistics and photographs, publication dates, licences and disclaimers. The UN SDG and AU Agenda 2063 references indicate thematic relevance, not formal partnership.

---

# SIRAI | Pre-launch testing checklist

**Status:** Software implementation in progress. These are educational planning aids and have **not** been field-tested or validated under active conflict conditions. The GitHub Pages URL is publicly reachable for testing; purchasing a domain does not itself establish reliability or community impact.

## 1. Offline functionality (real-device checks required)

1. On an HTTPS connection, visit the homepage and each of WaterShare, ProjectStarter and TaqaWise. Stay online until files finish loading.
2. Confirm the browser has a controlling service worker and the current `sirai-offline-v46-lean-home-sdg-20261107` cache is installed (where browser developer tools are available).
3. Switch the phone into airplane mode. Open each previously loaded page, change inputs, calculate results, move between steps and download/export local files.
4. Verify that all four language options function offline after the initial precache. Photographs from Unsplash may be unavailable. Feedback submissions require connectivity.
5. Verify the homepage root URL (ending in /sirai-website/) works in airplane mode, not just /index.html.\n6. On Android Chrome, test browser install / Add to Home Screen if offered. On iPhone Safari, test Share > Add to Home Screen. Do not claim automatic installation until observed.
7. Clear browser website data and confirm the offline package no longer works until downloaded again. Repeat on an older Android phone with limited storage.
8. After a subsequent website update, reconnect and check that an updated service worker installs and obsolete cache versions are deleted.

## 2. Sharing tests

- Generate a WaterShare allocation; use Share. Confirm no times, personal names, location or water-point identifiers are included by default.
- Export a detailed WaterShare CSV; verify the safety warning appears before downloading sensitive schedule times.
- Create a ProjectStarter draft and share. Confirm the editable review dialog opens with a text preview, edits are preserved, cancellation sends nothing, and location/team fields are excluded. **Review free-text fields manually** because people can write sensitive details there.
- Generate a TaqaWise plan; verify the shared summary contains energy calculations, not contact/location fields.
- Verify the editable review dialog works with Arabic text and both phone orientations. Try the native share sheet on Android and iOS. If unavailable, verify the clipboard fallback and paste into a draft WhatsApp/SMS message **without sending** during testing.
- Never include identifiable vulnerable persons, water-point coordinates, predictable travel times or unsafe resource inventories in shared examples.

## 3. Technical scenarios

### WaterShare
- 20 households at 40 L per household and 2 windows should calculate 800 L/day and evenly divided groups.
- Try insufficient tank volume, unknown daily supply, overlapping windows, and schedules that run past midnight.
- A schedule is not a safety recommendation: local participants must decide whether/when access is actually safe.

### ProjectStarter
- Test communal kitchen, shared water point and shared generator templates.
- Test the confirmation before replacing an existing draft.
- Test budgets with blank rows, missing item names, invalid quantities and contingency assumptions.
- Verify the draft can be saved, restored, exported, imported, printed and cleared. Local browser storage is **not secure storage**; test on shared devices.

### TaqaWise
- Enter a 12 V × 200 Ah nominal lead-acid battery: 2,400 Wh nominal, with example 50% usable fraction and 80% efficiency giving ~960 Wh usable energy.
- Verify other 24 V and lithium presets. Real usability depends on battery age, temperature, actual measured capacity, inverter and safety.
- Compare solar outcomes under lower performance factors. Results are educational estimates, never purchasing or installation instructions.
- Test empty loads, invalid watt-hours, and JSON import/export.

## 4. Field validation, outreach and safeguarding (NOT YET COMPLETE)

- Invite consenting adult Sudanese reviewers, including Arabic-first and low-end-Android users; avoid gathering sensitive contact information beyond what's necessary.
- Ask each reviewer to complete one useful, **hypothetical** task and report confusion, data costs and time required.
- Where safe and appropriate, seek feedback from trusted community organizers such as ERRs without claiming affiliation before an actual agreement.
- Do not collect operational water locations, shelter coordinates, volunteer identities or conflict-related travel patterns.
- Track anonymous, consensual, aggregate observations and change the interface based on documented findings.
- Do **not** claim adoption, tested effectiveness, formal humanitarian partnerships or real-world impact until demonstrated.

## 5. Before a full public/domain launch

- Fix any reported calculation and accessibility defects.
- Confirm offline operation and installation paths on representative Android and iOS devices.
- Arrange an informed local safety/usability review of the three tools.
- Review Arabic wording and on-screen readability with native speakers.
- Verify all real photos and external links load when connected; keep those assets optional offline.
- Set DNS and HTTPS on the purchased domain and test service-worker scope under that new origin. Cached files from the GitHub Pages domain do not transfer to a new domain.
- Publish an honest changelog and clear privacy/safety limitations.

**Limits:** This website cannot operate SMS/USSD, send messages without a connection, verify local equipment prices, prove safety, or arrange community partnerships automatically.
