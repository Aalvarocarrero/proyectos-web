import type {GeographicReference} from "@/lib/farm-geography";
import type { SurveyPlan } from "@/lib/farm-geometry";
import type { NormalizedSketchPolygon } from "@/lib/polygon-geometry";

export type FarmPayload = {
  name: string;
  location: string;
  areaSqM: number;
  boundaryShape?: "Irregular / polígono" | "Rectángulo" | "Triángulo" | "Óvalo";
  boundaryMeasurements?: Record<string, number>;
  surveyPlan?: SurveyPlan;
  /** Dimensionless drawing, independent from survey coordinates and areaSqM. */
  propertySketch?: NormalizedSketchPolygon|null;
  geographicReference?: GeographicReference|null;
  objective: string;
};

export type FarmRecordPayload = {
  farmId: string;
  recordType:
    | "animal"
    | "weight"
    | "area"
    | "crop"
    | "inventory"
    | "task"
    | "production-cycle"
    | "finance"
    | "health"
    | "plan"
    | "document";
  category: string;
  title: string;
  data: Record<string, unknown> & { typedAreaOutline?: NormalizedSketchPolygon };
};

export type ListingPayload = {
  imageKey?:string|null;
  imageUrl?:string|null;
  imageDataUrl?:string;
  title: string;
  category: string;
  status?: string;
  location?: string;
};
