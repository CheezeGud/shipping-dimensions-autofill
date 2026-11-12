// content.js
// Chrome runs this file inside the EIZ page (set up in manifest.json under "content_scripts").
// It can read and change the page's DOM, but it can't see the page's own JavaScript (Angular).

// 1. Proof the script loaded. Look for this line in the EIZ tab's Console.
console.log('[Dimensions Autofill] content script loaded');

// 2. CSS selectors for the four boxes.
//    ".package-form" limits the search to the Package Info form, in case another
//    part of the page also has a box called "weight".
//    formcontrolname is Angular's name for each box. It stayed the same across
//    reloads, unlike the numbered "ng-tns-..." classes.
//    join(', ') turns the list into one selector meaning "any of these four".
const DIMENSION_FIELDS = [
  '.package-form input[formcontrolname="weight"]',
  '.package-form input[formcontrolname="length"]',
  '.package-form input[formcontrolname="width"]',
  '.package-form input[formcontrolname="height"]',
].join(', ');

// 3. One listener on the whole page.
//    "focusin" fires whenever anything gets focus (by click or Tab), and it bubbles
//    up to document. So this one listener hears about every box, including ones
//    that were hidden when the page loaded.
document.addEventListener('focusin', (event) => {
  const box = event.target; // the element that just got focus

  // 4. Is it one of our four boxes? If not, stop here.
  if (!box.matches(DIMENSION_FIELDS)) return;

  // 5. It is: draw a gold outline so we can see it was detected.
  box.style.backgroundColor = '#FFF3C4';
  console.log('[Dimensions Autofill] detected:', box.getAttribute('formcontrolname'));
});