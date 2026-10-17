import type {illustratedPlan} from './illustrated-plan-adapter';
import type {Point} from './illustrated-geometry';

export type FarmScenePresentation=ReturnType<typeof illustratedPlan>&{boundary:ReadonlyArray<Point>};

/** Compare only derived visual data, never persisted records. Deep-cloned local
 * snapshots and new history entries must not destroy the active camera/scene.
 * Any visible label, count, species, position, structure or boundary change wins. */
export function retainFarmScene(previous:FarmScenePresentation,next:FarmScenePresentation):FarmScenePresentation{
 if(previous===next)return previous;
 const retain=<T>(before:T,after:T):T=>before===after||JSON.stringify(before)===JSON.stringify(after)?before:after;
 const boundary=retain(previous.boundary,next.boundary),areas=retain(previous.areas,next.areas),animals=retain(previous.animals,next.animals);
 return boundary===previous.boundary&&areas===previous.areas&&animals===previous.animals?previous:{boundary,areas,animals};
}
