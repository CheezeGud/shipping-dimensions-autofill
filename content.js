// content.js
// Content script for EIZ's Package Info form: fills a package row's weight and
// dimensions from a saved product.

const LOG_PREFIX = '[Dimensions Autofill]';

console.log(`${LOG_PREFIX} content script loaded`);

// Placeholder until products can be saved in the extension. Units: kg, cm.
// Keys must match the boxes' formcontrolname values.
const TEST_PRODUCT = {
  id: 'test-1',
  name: 'Rolling Basket',
  weight: 0.3,
  length: 33,
  width: 10,
  height: 10,
};

// TODO: replace with the product picked from the dropdown.
const product = TEST_PRODUCT

// formcontrolname is set in EIZ's source and stays stable across reloads,
// unlike the generated ng-tns-* classes.
const DIMENSION_FIELDS = [
  '.package-form input[formcontrolname="weight"]',
  '.package-form input[formcontrolname="length"]',
  '.package-form input[formcontrolname="width"]',
  '.package-form input[formcontrolname="height"]',
].join(', ');

const ROW_SELECTOR = '.package-item';
const QTY_SELECTOR = '.package-form input[formcontrolname="qty"]';


// ---------- Reporting problems ----------

// Logs for debugging and shows an on-page notice for the person using the page.
function reportError(message, element) {
  console.error(`${LOG_PREFIX} ${message}`, element ?? '');
  showNotice(message);
}

// textContent, not innerHTML, so messages are never interpreted as HTML.
let noticeEl = null;
let noticeTimer = null;

function showNotice(message) {
  if (!noticeEl) {
    noticeEl = document.createElement('div');
    noticeEl.style.cssText =
      'position:fixed; right:16px; bottom:16px; z-index:2147483647; max-width:320px;' +
      'padding:10px 14px; border-radius:8px; background:#0B0B0B; color:#E8AA1C;' +
      'font:13px/1.4 sans-serif; box-shadow:0 2px 8px rgba(0,0,0,.3);';
    document.body.appendChild(noticeEl);
  }
  noticeEl.textContent = `Dimensions Autofill: ${message}`;
  noticeEl.style.display = 'block';
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { noticeEl.style.display = 'none'; }, 8000);
}


// ---------- Main ----------

// focusin bubbles, so one listener on document also covers boxes rendered after page load.
document.addEventListener('focusin', (event) => {
  const box = event.target;
  if (!box.matches(DIMENSION_FIELDS)) return;

  const row = box.closest(ROW_SELECTOR);
  if (!row) {
    reportError(`Couldn't find this package's row (${ROW_SELECTOR}). EIZ may have changed their page; fill it in by hand.`, box);
    return;
  }

  // A partial fill would produce a wrong label, so stop unless all four boxes are found.
  const row_fields = row.querySelectorAll(DIMENSION_FIELDS);
  if (row_fields.length !== 4) {
    reportError(`Found ${row_fields.length} of the 4 weight/size boxes. EIZ may have changed their page; fill them in by hand.`, row);
    return;
  }

  // Qty is required, and new rows from "Add Package" start with it empty.
  const qty = row.querySelector(QTY_SELECTOR);
  if (qty) qty.value = 1

  // KNOWN ISSUES:
  // - Angular only accepts a value when its box gets focus and then loses it, so these
  //   values show on screen but the form still treats the boxes as empty (Save stays disabled).
  // - This runs on every focus, so it overwrites dimensions that were already correct.
  for (const f of row_fields) { f.value = product[f.getAttribute('formcontrolname')] }

  console.log(`${LOG_PREFIX} filled row with`, product.name, product);
});