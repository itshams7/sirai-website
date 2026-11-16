(() => {
'use strict';
const en={};
document.querySelectorAll('[data-ps]').forEach(el=>{if(!en[el.dataset.ps])en[el.dataset.ps]=el.textContent.trim()});
Object.assign(en,{
itemN:'Cost item',roleN:'Role',milestoneN:'Milestone',riskN:'Risk',
remove:'Remove',emptyRows:'No entries yet. Add one above to begin.',
costDescription:'What is needed?',quantity:'Quantity',unitCost:'Unit cost',lineTotal:'Line total',
roleName:'Role / team',roleDuty:'Responsibility',milestoneName:'Action or milestone',milestoneWhen:'Target date or timeframe',milestoneOwner:'Responsible role',
riskName:'What could go wrong?',riskLevel:'Concern level',riskResponse:'How will you respond?',riskLow:'Low',riskMedium:'Medium',riskHigh:'High',
checkProblem:'Explain the problem and who it affects',
checkAction:'Describe the action and an observable result',
checkVoice:'Explain community participation and inclusion',
checkCosts:'Add at least one valid cost estimate',
checkRoles:'Assign a responsibility and a way to hear concerns',
checkMilestones:'Add a milestone with a timeframe',
checkRisks:'Record a risk and a practical response',
checkFunding:'Explain confirmed funding or an outstanding funding need',
unspecified:'Not yet specified',untitled:'Untitled community project',draft:'DRAFT · NOT VERIFIED',
proposalDisclaimer:'Prepared with SIRAI ProjectStarter. This is an unverified, community-created draft, not evidence of SIRAI sponsorship, funding, approval or implementation.',
previous:'← Previous',next:'Next step →',
saveFailed:'Could not save on this device. Use Download editable draft instead.',
saved:'Saved in this browser on this device. Clearing browser data may erase it.',
imported:'Draft loaded successfully. Please review the information.',
badFile:'This is not a valid ProjectStarter draft.',tooLarge:'File is too large. Maximum 300 KB.',
rowLimit:'Maximum 30 rows per section.',
downloaded:'Editable draft downloaded. Keep it somewhere safe.',
copied:'Summary copied.',copyFailed:'Copy is unavailable. Try printing or downloading.',
confirmClear:'Clear this project? Unsaved changes will be lost.',
cleared:'Project cleared. Start a new plan when you are ready.',
load:'Load saved draft',loaded:'Saved draft loaded. Check the details before sharing.',
noSaved:'No draft has been saved on this device.',
confirmLoad:'Replace the current entries with the draft saved on this device?',
budgetInvalid:'Check all cost, quantity and funding inputs.'
});
Object.assign(en,{"fundingNotesLabel":"How might you cover the remaining costs?","fundingNotesHelp":"Separate secured funding from ideas that are still uncertain."});
Object.assign(en,{tab1:'The idea',tab2:'What it needs',tab3:'The plan',summaryHeading:'Your idea, in plain language',summaryTemplate:'This draft proposes {name} for {people}. It responds to {problem}. The planned activity is {action}. The estimated budget is {budget}. It currently lists {risks} risks and {milestones} milestones. Review the details with local participants before making commitments.',suggestProblem:'Briefly describe the need and who is affected.',suggestAction:'Explain what you will do and what useful progress would look like.',suggestVoice:'Add a simple way for people to shape the plan and raise concerns.',suggestCosts:'Add at least one cost with a locally checked estimate.',suggestRoles:'Name a role responsible for the work and a way to hear concerns.',suggestMilestones:'Add one practical first step and a realistic timeframe.',suggestRisks:'Think of one thing that could go wrong and how you would respond.',suggestFunding:'State what is confirmed and how you might address any remaining gap.'});
window.PS_LOCALES={en};
})();