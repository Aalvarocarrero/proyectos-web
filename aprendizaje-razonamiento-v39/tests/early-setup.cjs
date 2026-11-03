// Native details must be opened before operating its controls in browser QA.
async function openEarlySetup(page){const panel=page.locator('.early-setup');if(!await panel.evaluate(e=>e.open))await panel.locator('summary').first().click();}
module.exports={openEarlySetup};
