(() => {
'use strict';
const en={};
document.querySelectorAll('[data-tq]').forEach(node=>{if(!en[node.dataset.tq])en[node.dataset.tq]=node.textContent.trim()});
Object.assign(en,{
name:'Appliance',watts:'Rated watts (W)',qty:'Quantity',dailyHours:'Active hours / day',
essential:'Keep powered during an outage',appliance:'Appliance',remove:'Remove',
empty:'No appliances yet. Add one above.',
daily:'Daily electricity',connected:'Total connected rated load',energy:'Daily energy',parameter:'Parameter',setting:'Assumption',yes:'Yes',no:'No',
draftTitle:'Household energy planning draft',reportStatus:'Illustrative estimates based on values entered by the user. Not checked against equipment labels or site conditions.',
appliancesHeading:'Appliance breakdown',assumptionsHeading:'Inputs and assumptions',reportLimit:'Solar estimate uses daily Wh ÷ (peak-sun-hours × performance factor). Battery estimates use nominal Wh × usable fraction × conversion efficiency, with selected essential wattages assumed continuously on. Starting currents, intermittent cycles, depth-dependent behavior, temperature, aging, autonomy, equipment selection and protections are not assessed.',
invalid:'Some values are missing or outside the allowed ranges. Check each appliance and planning input.',
noLoads:'Add appliances to begin planning.',
noEssentials:'No appliances are marked essential. Select at least one in Step 01 for battery estimates.',
shortfall:'At the selected continuous essential load, the modeled battery energy does not cover your target outage. This is an arithmetic warning, not a system design.',
backupCaution:'Modeled battery energy covers the target duration under these assumptions. Real runtime may differ substantially. Starting surges, battery controls, temperature, aging and inverter limits are not modeled.',
exported:'Draft downloaded. Keep it somewhere safe.',
imported:'Draft imported. Review appliance ratings and assumptions.',
badFile:'This is not a valid TaqaWise draft.',
tooLarge:'The imported file exceeds 180 KB.',
limit:'Maximum 40 appliances per plan.',
confirmReset:'Reset your entries to the example appliances? Current unsaved changes will be lost.',
resetDone:'Example plan restored.'
});
Object.assign(en,{"breakdownTitle":"Where does your daily electricity go?","breakdownNote":"A visual breakdown based on the operating hours and wattages you entered.","compareTitle":"Why prioritizing essentials matters","allRuntime":"All entered loads, continuously","priorityRuntime":"Only your selected essentials","compareNote":"Compares continuous rated loads, not real appliance duty cycles or equipment limits.","externalTitle":"For location-specific solar analysis","externalText":"For a more detailed grid-connected PV model, explore NLR PVWatts. It cannot replace local design, particularly for off-grid backup.","externalLink":"Explore PVWatts ↗"});
window.TQ_LOCALES={en};
})();