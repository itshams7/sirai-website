# SIRAI pre-launch compliance and safeguarding review
Reviewed: 8 November 2026
Scope: public static website and available repository code, not an opinion on legal compliance in any particular jurisdiction.

| # | Check | Status and current treatment |
|---|---|---|
| 1 | Privacy policy | **Implemented, review required:** /privacy.html describes local storage, voluntary forms, remote services, child data and deletion requests. Check actual processing and governing laws before launch. |
| 2 | Terms of service | **Implemented:** /terms.html describes educational estimates, limitations, use and safety. Professional legal review still recommended. |
| 3 | Refund policy | **Not applicable today:** no payments, sales, subscriptions or donations. Add one before a paid transaction is ever offered. |
| 4 | Cookie policy | **Disclosed:** /privacy.html#cookies describes browser storage and third parties. Verify actual cookies on production browsers periodically. |
| 5 | Cookie consent banner | **Conditional:** no first-party marketing or visitor-analytics tracking identified. Do not add a deceptive banner without a genuine consent choice. Reassess before any non-essential tracking/SDK deployment or jurisdictional expansion. |
| 6 | Form consent | **Implemented:** required disclosure consent plus adult confirmation on the feedback and idea forms; no prechecked boxes. Verify live Formspree handling. |
| 7 | Minimize data | **Implemented with limits:** no account, no mandatory email, form length limits, avoid sensitive locations/identities, no collection of exact birth date. User-supplied free text can still contain sensitive information. |
| 8 | Third-party SDKs | **Inventory:** GitHub Pages hosting, Formspree submissions, Google Fonts, Unsplash photographs, Wikimedia-hosted video, links to public data publishers. Inspect network traffic and provider contracts at launch. |
| 9 | Dark patterns | **No intentional dark patterns identified:** optional contact, no marketing upsell or forced purchase, explicit form actions. Usability validation remains pending. |
| 10 | Hidden fees | **None offered:** current tools are free. |
| 11 | Fake reviews | **No fabricated testimonials should be presented.** Avoid publishing unverified ratings, beneficiary figures or endorsements. |
| 12 | Unsupported claims | **Disclosures in place:** planning tools remain educational and unvalidated in the field, photos illustrate rather than document SIRAI work, source-linked published humanitarian context, no false institutional partnerships. Audit data dates and numerical accuracy continuously. |
| 13 | Image alt text | **Static image-tag audit:** alt attributes are present in inspected pages. Decorative images may use alt="". Review contextual usefulness with assistive technology. |
| 14 | Contrast | **Theme improvements made; audit outstanding:** ice-grey/obsidian/accessible burgundy combinations generally high contrast. Automated and manual WCAG AA checks still required on all states, especially charts and interactive controls. |
| 15 | Keyboard navigation | **Support present:** skip link, form labels, button focus rings, responsive menu; additional browser and screen-reader checks pending. |
| 16 | Operator/contact | **Implemented honestly:** independent initiative under development, not a registered NGO; privacy requests may be sent directly to shaamsuni@gmail.com via mailto; feedback via Formspree. No fictitious registration number or physical address. |
| 17 | Children's data | **Safeguard added:** feedback and idea forms intended for adults 18+, with required confirmation. Do not solicit or submit personal data about children. No age or ID document collection. |
| 18 | Marketing unsubscribe | **Not applicable today:** SIRAI currently has no marketing mailing list or promotional email campaign. Implement compliant subscription and unsubscribe if that changes. |
| 19 | Font/image licences | **Public media inventory:** /footage-credits.html covers archival video, external illustrative photographs and Google Fonts. Unsplash photo licence does not automatically cover separate model, logo, or brand rights. Complete per-photo rights/release verification before formal launch. |
| 20 | Data deletion | **Implemented request channel:** /privacy.html#rights provides direct email and realistic request instructions; fulfilling requests needs manual SIRAI/Formspree account action and is not guaranteed solely by a website link. |

## Release blockers requiring manual owner verification

1. Confirm Formspree `mnpplgae` is active, correctly configured, stores only intended fields, and that test submissions reach the authorized SIRAI inbox.
2. Test access/deletion handling on Formspree submissions, including data backups and a defensible retention period.
3. Review actual third-party requests and cookies on fresh browsers, including Google Fonts, Unsplash and Wikimedia.
4. Verify original image assets, photographer attribution where suitable, identifiable-person and third-party rights; ensure footage credit details and licensing apply to each actual clip.
5. Test keyboard, contrast, Arabic RTL, iOS Safari and low-end Android Chrome with screen-reader users and real connection interruptions.
6. Validate statistical source dates, links and all public-impact statements. Update historical records only when supported by verifiable evidence.
7. Obtain qualified jurisdiction-specific legal advice where SIRAI operates or serves users; this checklist is not a compliance certificate.

No automated test can prove legal compliance or third-party inbox configuration. Keep documentation updated as functionality changes.
