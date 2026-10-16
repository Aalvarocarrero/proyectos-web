import { s as exactPlanLayout } from "./farm-plan-catalog-7z5TuNyx.js";
import { p as propertyOutlinePoints, t as illustratedPlan, u as planViewport } from "./illustrated-plan-adapter-v5jMuBYX.js";
import { t as farm_demo_fixture_default } from "./farm-demo-fixture-BJD6KUFv.js";
//#region lib/farm-showcase.ts
/** The published fixture is the sole input. Every caller gets its own in-memory copy. */
function createFarmShowcase() {
	const source = structuredClone(farm_demo_fixture_default);
	const farm = source.farms[0];
	const records = source.records.filter((record) => record.payload.farmId === farm.id);
	const areaRecords = records.filter((record) => record.payload.recordType === "area");
	const animalRecords = records.filter((record) => record.payload.recordType === "animal");
	const cropAreas = areaRecords.filter((record) => record.payload.category === "Cultivo" && record.payload.data.crop);
	const boundary = propertyOutlinePoints(farm.payload.surveyPlan?.vertices ?? [], farm.payload.propertySketch);
	const viewport = planViewport(boundary.points);
	const layouts = areaRecords.map((area) => {
		const layout = exactPlanLayout(area.payload.data);
		if (!layout) throw new Error(`La finca modelo necesita una distribución explícita: ${area.id}`);
		return {
			area,
			layout
		};
	});
	const illustrated = illustratedPlan(layouts, viewport, records, true);
	return {
		templateVersion: source.metadata.version,
		asOf: source.metadata.asOf,
		farm,
		records,
		listings: source.listings,
		areaRecords,
		animalRecords,
		cropAreas,
		boundary,
		viewport,
		layouts,
		illustrated
	};
}
//#endregion
export { createFarmShowcase as t };
