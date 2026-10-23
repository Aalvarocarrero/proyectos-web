// Regression suites deliberately use the optional full catalog.
exports.openCatalog=async page=>{const catalog=page.locator('#all-proposals');if(await catalog.count()&&!await catalog.evaluate(e=>e.open))await page.locator('#all-proposals > summary').click();};
