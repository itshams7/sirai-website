(() => {
const english = {};
document.querySelectorAll('[data-ws]').forEach(el => {
  if (el.dataset.ws) english[el.dataset.ws] = el.textContent.trim();
});
Object.assign(english, {
  invalid: 'Check this input',
  invalidTime: 'Enter a valid start time',
  tooManyWindows: 'The number of windows cannot exceed participating households.',
  overlap: 'Window starts must be spaced at least one full window apart.',
  pastMidnight: 'The final window must finish before midnight.',
  notEntered: 'Not entered',
  tankWarning: 'The proposed daily volume is larger than one full tank. Refilling or additional storage would be needed; this tool cannot verify either.',
  supplyWarning: 'Planned demand exceeds the daily supply you entered by',
  unknownWarning: 'Daily supply or tank volume is unknown. Confirm actual availability before making a schedule.',
  verifyWarning: 'These comparisons do not establish that the water will be available or safe.',
  csvWindow: 'Window',
  csvTime: 'Time',
  csvHousehold: 'Household ID',
  csvLitres: 'Planned litres',
  csvCollected: 'Collected litres',
  csvNotes: 'Notes',
  summaryDraft: 'DRAFT PLANNING SUMMARY',
  summaryCaution: 'Draft estimate only. Confirm supply, safety, access and fairness locally.',
  window: 'Window',
  downloaded: 'Schedule downloaded. Review it with participants.',
  copied: 'Summary copied.',
  copyFailed: 'Copy not available in this browser. Try the CSV download or print option.',
  csvConfirm: 'This CSV includes collection times. Store it privately and only share with participants when safe. Continue?',
  // New summary strings
  summaryTitle: 'What this means',
  summaryIntro: 'With these numbers, the community is planning to collect {total} in total.',
  summaryEqualGroups: 'Spreading this across equal groups of {count} households means each window collects about {volume} L.',
  summaryMixedGroups: 'Spreading this across {windows} windows means each group collects about {volume} L on average.',
  summaryTankOver: 'This would need more than one full tank ({pct}% of capacity). Extra storage or refilling would be required.',
  summaryTankTight: 'This would use about {pct}% of the tank — quite full. Check refill timing carefully.',
  summaryTankOk: 'This would use about {pct}% of the tank capacity.',
  summarySupplyOver: 'Planned demand is higher than the daily supply you entered ({pct}%). The source may not be able to provide this much.',
  summarySupplyTight: 'Planned demand is about {pct}% of the estimated daily supply — quite tight.',
  summarySupplyOk: 'Planned demand is about {pct}% of the estimated daily supply.',
  summaryAdvice: 'These are only arithmetic estimates. Always verify the real supply, access and fairness with the community before using any schedule.',
  tankBarLabel: 'Tank fill: {pct}% of capacity',
  // What-if
  whatifLower: 'Lower daily target by 20%',
  whatifWindow: 'Add one more collection window',
  whatifDays: 'Spread over more days',
  spreadDaysMsg: 'Daily target halved to spread collection over more days. Adjust further if needed.',
  // Fairness
  fairTitle: 'Do most households have a similar number of people?',
  fairYes: 'Yes – keep equal split',
  fairNo: 'No',
  fairNote: 'You may want to discuss whether larger households should collect a bit more. This tool cannot decide fairness for you.',
  // Checklist
  check1: 'Who was consulted? (including people with limited mobility and those living farther away)',
  check2: 'Is the water source reliable this season?',
  check3: 'Who will monitor the queue and keep order?',
  check4: 'How will problems or complaints be raised?',
  check5: 'When will we review this plan again?',
  check6: 'Have we verified the actual daily supply and tank refill times?',
  offlineNote: 'This tool works offline after the first visit. Feedback and some images still need a connection.'
});
window.WS_LOCALES = { en: english };
})();
