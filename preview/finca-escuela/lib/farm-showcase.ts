import template from './farm-demo-fixture.json';
import { exactPlanLayout } from './farm-plan-catalog';
import { propertyOutlinePoints } from './farm-outline-view';
import { planViewport } from './farm-plan-presentation';
import { illustratedPlan } from './illustrated-plan-adapter';
import type { FarmPayload, FarmRecordPayload, ListingPayload } from './farm-types';

export type ShowcaseRecord = { id: string; payload: FarmRecordPayload };
type ShowcaseTemplate = {
  metadata: { version: number; asOf: string };
  farms: Array<{ id: string; payload: FarmPayload }>;
  records: ShowcaseRecord[];
  listings: Array<{ id: string; payload: ListingPayload }>;
};

/** The published fixture is the sole input. Every caller gets its own in-memory copy. */
export function createFarmShowcase() {
  const source = structuredClone(template) as unknown as ShowcaseTemplate;
  const farm = source.farms[0];
  const records = source.records.filter(record => record.payload.farmId === farm.id);
  const areaRecords = records.filter(record => record.payload.recordType === 'area');
  const animalRecords = records.filter(record => record.payload.recordType === 'animal');
  const cropAreas = areaRecords.filter(record => record.payload.category === 'Cultivo' && record.payload.data.crop);
  const boundary = propertyOutlinePoints(farm.payload.surveyPlan?.vertices ?? [], farm.payload.propertySketch);
  const viewport = planViewport(boundary.points);
  // This is readLayout's exact v2 branch. Importing the editable map component
  // would unnecessarily bring the workspace and its persistence into this view.
  const layouts = areaRecords.map(area => {
    const layout = exactPlanLayout(area.payload.data);
    if (!layout) throw new Error(`La finca modelo necesita una distribución explícita: ${area.id}`);
    return { area, layout };
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
    illustrated,
  };
}
