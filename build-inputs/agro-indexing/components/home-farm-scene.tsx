'use client';

import {useState} from 'react';
import FarmMasterplanWebGL from './farm-masterplan-webgl';
import {createFarmShowcase} from '@/lib/farm-showcase';

const noop=()=>{};
/** Lazy visual-only entry: no workspace, persistence, dossier or record-list imports. */
export default function HomeFarmScene({paused,onReady,onUnavailable}:{paused:boolean;onReady:()=>void;onUnavailable:()=>void}) {
 const [model]=useState(createFarmShowcase);
 return <FarmMasterplanWebGL propertyOutline={model.boundary.points} areas={model.illustrated.areas} animals={model.illustrated.animals} farmName={model.farm.payload.name} physicalAreaSqM={model.farm.payload.areaSqM} surveyBased={model.boundary.basis==='survey'} onSelect={noop} onReturn={noop} onUnavailable={onUnavailable} autoTour readOnly preview onPreviewReady={onReady} tourPaused={paused} interactionBlocked={paused}/>;
}
