"use client";
import {placementFits,assertPlanDraftContext,type PlanPlacement} from "@/lib/farm-tap-placement";
import {propertyOutlinePoints} from "@/lib/farm-outline-view";
import {planViewport} from "@/lib/farm-plan-presentation";
import {AgroCategoryIcon} from "@/components/agro-category-icon";
import {VenezuelaAgroLogo} from "@/components/venezuelaagro-logo";
import { readFarmGeometry } from "@/lib/farm-form-geometry";
import { canonicalizeNormalizedSketchPolygon, type NormalizedSketchPolygon } from "@/lib/polygon-geometry";
import { PolygonSketchEditor } from "@/components/polygon-sketch-editor";
import { toast } from "sonner";
import { FarmRecordForm, FarmSaveButton, useFarmFormSaving } from "@/components/farm-record-form";
import { createSubmissionGate } from "@/lib/form-submission";
import { selectVerifiedDashboardOwner, localOwner } from "@/lib/offline-owner";
import {includeRecordedCategories} from "@/lib/record-categories";
import { SyncIssues } from "@/components/sync-issues";
import { OfflineReadiness } from "@/components/offline-readiness";
import {FarmFirstStart} from "@/components/farm-first-start";

import { FormEvent, useCallback, useEffect, useState, useRef } from "react";
import { SiteImage as Image } from "@/components/site-image";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  CircleGauge,
  Cloud,
  CloudOff,
  Database,
  Dna,
  LayoutDashboard,
  Loader2,
  Map,
  PackageOpen,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
  Settings2,
  Store,
  Trash2,
  Tractor,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  createLocalId,
  getCachedEntities,
  getLastSync,
  getPendingCount,
  hydrateFromServer,
  queueMutation,
  subscribeOfflineChanges,
  syncNow,
  getOperationStatus,
  splitDeviceLocalArea,
  assertAreaReadyForOnlineSplit,
  type CachedEntity,
} from "@/lib/offline-db";
import { animalNames, productionRubrics } from "@/lib/agro-catalog";
import { SecurityCenter } from "@/components/security-center";
import { FarmIntelligence } from "@/components/farm-intelligence";
import { FarmPlanFields } from "@/components/farm-plan-fields";
import { CROP_PRESETS, FarmMapEditor, LAND_FEATURE_PRESETS } from "@/components/farm-map-editor";
import type { FarmPayload, FarmRecordPayload, ListingPayload } from "@/lib/farm-types";

import {PrivateFarmLocator} from "@/components/private-farm-locator";
import {ListingPhotoRepair} from "@/components/listing-photo-repair";
import {hasListingPhoto,listingPhotoUrl} from "@/lib/listing-photo";
import {MarketplacePhoto} from "@/components/marketplace-photo";
import {demoLinkForView,learningExampleForView} from "@/lib/farm-demo-navigation";

type View =
  | "overview"
  | "animals"
  | "land"
  | "production"
  | "intelligence"
  | "inventory"
  | "marketplace"
  | "sync"
  | "security"
  | "settings";

const navigation: Array<{
  label: string;
  view: View;
  icon: typeof LayoutDashboard;
}> = [
  { label: "Resumen", view: "overview", icon: LayoutDashboard },
  { label: "Animales", view: "animals", icon: Dna },
  { label: "Plano y potreros", view: "land", icon: Map },
  { label: "Producción", view: "production", icon: Tractor },
  { label: "Planificación y costos", view: "intelligence", icon: CircleGauge },
  { label: "Inventario", view: "inventory", icon: Boxes },
  { label: "Mis publicaciones", view: "marketplace", icon: Store },
  { label: "Sincronización", view: "sync", icon: Database },
  { label: "Seguridad y privacidad", view: "security", icon: ShieldCheck },
  { label: "Configurar finca", view: "settings", icon: Settings2 },
];

const species = [...animalNames.map(name=>[name]), ["Otra especie"]];

export function FarmDashboard({
  user,
  localOnly: initialLocalOnly = false,
}: {
  user: { id: string; name: string; email: string };
  localOnly?: boolean;
}) {
  const [resolvedOwner,setResolvedOwner]=useState<string|null>(null);
  const [initialReady,setInitialReady]=useState(false);
  const [firstStartContinued,setFirstStartContinued]=useState(false);
  const localOnly=initialLocalOnly && (!resolvedOwner || resolvedOwner==="device-local");
  const reopenedAccount=initialLocalOnly && !!resolvedOwner && resolvedOwner!=="device-local";
  const [view, setView] = useState<View>("overview");
  const [farms, setFarms] = useState<Array<CachedEntity<FarmPayload>>>([]);
  const [records, setRecords] = useState<Array<CachedEntity<FarmRecordPayload>>>([]);
  const [listings, setListings] = useState<Array<CachedEntity<ListingPayload>>>([]);
  const [pending, setPending] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [animalDialog, setAnimalDialog] = useState(false);
  const [weightDialog, setWeightDialog] = useState(false);
  const [areaDialog, setAreaDialog] = useState(false);
  const [areaPlacement,setAreaPlacement]=useState<PlanPlacement|null>(null);
  const areaDialogContext=useRef<{owner:string;farmId:string}|null>(null);
  const [productionDialog, setProductionDialog] = useState(false);
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [animalSpecies, setAnimalSpecies] = useState("Bovino");
  const [animalSex, setAnimalSex] = useState("Hembra");
  const [animalPurpose, setAnimalPurpose] = useState("Reproducción");
  const [areaType, setAreaType] = useState("Potrero");
  const [cropType, setCropType] = useState("Cacao");
  const [farmAreaUnit, setFarmAreaUnit] = useState("ha");
  const [farmBoundaryShape, setFarmBoundaryShape] = useState<FarmPayload["boundaryShape"]>();
  const [selectedRecord, setSelectedRecord] = useState<CachedEntity<FarmRecordPayload> | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState("");
  const [message, setMessage] = useState("");

  const recordSubmissionGate=useRef(createSubmissionGate());

  const loadLocal = useCallback(async () => {
    const [farmRows, recordRows, listingRows, pendingCount, syncTime] = await Promise.all([
      getCachedEntities<FarmPayload>("farm"),
      getCachedEntities<FarmRecordPayload>("farm-record"),
      getCachedEntities<ListingPayload>("listing"),
      getPendingCount(),
      getLastSync(),
    ]);
    setFarms(farmRows);
    setRecords(recordRows);
    setListings(listingRows);
    setPending(pendingCount);
    setLastSync(syncTime);
  }, []);

  useEffect(() => {
    let active = true;
    async function start() {
      selectVerifiedDashboardOwner(user.id);
      const selectedOwner=await localOwner();
      if(active)setResolvedOwner(selectedOwner);
      setOnline(navigator.onLine);
      await loadLocal();
      if (navigator.onLine && !localOnly) {
        await synchronize();
      } else if (active) {
        await loadLocal();
      }
      if(active)setInitialReady(true);
    }

    const onOnline = () => {
      setOnline(true);
      if (!localOnly) void synchronize();
    };
    const onOffline = () => setOnline(false);
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "TRY_SYNC") void synchronize();
    };
    const unsubscribe = subscribeOfflineChanges(() => void loadLocal().catch(()=>setMessage("No se pudo leer el almacenamiento local. Conserva tus copias y comprueba el espacio disponible del navegador.")));
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    navigator.serviceWorker?.addEventListener("message", onWorkerMessage);
    navigator.serviceWorker?.register("/sw.js").catch(() => undefined);
    void start().catch(()=>{if(active)setMessage("No se pudo abrir el almacenamiento local. Comprueba el espacio del dispositivo y usa un navegador que permita guardar datos. No borres datos anteriores.");});

    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      navigator.serviceWorker?.removeEventListener("message", onWorkerMessage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadLocal, localOnly, user.id]);

  async function synchronize() {
    if (localOnly) {
      await loadLocal();
      return;
    }
    if (!navigator.onLine) {
      await loadLocal();
      return;
    }
    setSyncing(true);
    try {
      const result = await syncNow();
      if (result.reason === "account_changed") {
        setMessage("La cuenta cambió o no se pudo verificar. No se enviaron los pendientes; recarga con internet para abrir el espacio correcto.");
        return;
      }
      await hydrateFromServer();
      await loadLocal();
    } finally {
      setSyncing(false);
    }
  }

  const farm = farms[0];
  const animals = records.filter((record) => record.payload.recordType === "animal");
  const weights = records.filter((record) => record.payload.recordType === "weight");
  const areas = records.filter((record) => record.payload.recordType === "area" && record.payload.farmId === farm?.id);
  const inventory = records.filter((record) => record.payload.recordType === "inventory");
  const cycles = records.filter((record) => ["crop", "production-cycle"].includes(record.payload.recordType));
  const totalArea = farm?.payload.areaSqM ?? 0;
  const allocatedArea = areas.reduce(
    (total, area) => total + Number(area.payload.data.areaSqM ?? 0),
    0,
  );

  function notifyLocalSaved(text:string){setMessage(text);toast.success(text,{duration:6500});}
  async function refreshSavedRecord(){
    try{await loadLocal();if(navigator.onLine&&!localOnly)await synchronize();}
    catch{setMessage("El cambio ya se guardó en este dispositivo. No vuelvas a crearlo: recarga la vista para comprobarlo. El respaldo central aún no está confirmado.");}
  }

  async function addAnimal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!farm) throw new Error("Revisa: configura o abre tu finca antes de guardar.");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const tag = String(form.get("tag") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();
    const weight = Number(form.get("weight") || 0);
    const speciesValue = animalSpecies === "Otra especie"
      ? String(form.get("customSpecies") ?? "").trim()
      : animalSpecies;
    const purposeValue = animalPurpose === "Otro"
      ? String(form.get("customPurpose") ?? "").trim()
      : animalPurpose;
    if (!speciesValue) {
      throw new Error("Revisa: indica la especie para registrar el animal.");
    }
    const recordId = createLocalId("animal");
    await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm-record",
      entityId: recordId,
      action: "upsert",
      payload: {
        farmId: farm.id,
        recordType: "animal",
        category: speciesValue,
        title: name || tag || `${speciesValue} sin nombre`,
        data: {
          tag,
          name,
          species: speciesValue,
          sex: animalSex,
          birthDate: String(form.get("birthDate") ?? ""),
          weightKg: weight || null,
          breed: String(form.get("breed") ?? ""),
          purpose: purposeValue,
          status: "Activo",
        },
      },
    });
    formElement.reset();
    setAnimalDialog(false);
    notifyLocalSaved(navigator.onLine && !localOnly ? "Animal guardado en este dispositivo. Pendiente de comprobar sincronización." : "Animal guardado en este dispositivo. Sin respaldo central confirmado.");
    void refreshSavedRecord();
  }

  async function createFarm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const geometry = readFarmGeometry(form, farmAreaUnit, farmBoundaryShape ?? "Irregular / polígono");
    const areaSqM = geometry.areaSqM;
    if (!String(form.get("name") ?? "").trim() || areaSqM <= 0) {
      throw new Error("Revisa: indica el nombre y una superficie válida para comenzar.");
    }
    await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm",
      entityId: createLocalId("farm"),
      action: "upsert",
      payload: {
        name: String(form.get("name") ?? "").trim(),
        location: String(form.get("location") ?? "").trim(),
        areaSqM,
        boundaryShape: geometry.boundaryShape,
        boundaryMeasurements: geometry.boundaryMeasurements,
        surveyPlan: geometry.surveyPlan,
        propertySketch: geometry.propertySketch??null,
        geographicReference:geometry.geographicReference??null,
        objective: String(form.get("objective") ?? "").trim(),
      },
    });
    notifyLocalSaved(navigator.onLine && !localOnly ? "Finca creada y lista para sincronizar." : "Finca creada y guardada en este dispositivo.");
    void refreshSavedRecord();
  }

  async function addArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!farm) throw new Error("Revisa: configura o abre tu finca antes de guardar.");
    assertPlanDraftContext(areaDialogContext.current,{owner:resolvedOwner??user.id,farmId:farm.id});
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const shape = String(form.get("shape") ?? "Irregular");
    let typedAreaOutline:NormalizedSketchPolygon|undefined;
    if(shape==="Irregular"){
      try{typedAreaOutline=canonicalizeNormalizedSketchPolygon(JSON.parse(String(form.get("areaOutlineJson")||"null")));}
      catch(error){throw new Error("Revisa: "+(error instanceof Error?error.message:"dibuja el contorno del área con al menos tres puntos."));}
    }
    const lengthM = Number(form.get("lengthM") || 0);
    const widthM = Number(form.get("widthM") || 0);
    const diameterM = Number(form.get("diameterM") || 0);
    const areaEntryUnit = String(form.get("areaEntryUnit") ?? "m2");
    const entered = Number(form.get("areaSqM") || 0);
    const enteredArea = areaEntryUnit === "ha" ? entered * 10_000 : entered;
    const calculatedArea = shape === "Rectangular" && lengthM > 0 && widthM > 0
      ? lengthM * widthM
      : ["Circular", "Ovalada"].includes(shape) && diameterM > 0
        ? Math.PI * Math.pow(diameterM / 2, 2)
        : 0;
    const areaSqM = Math.round(enteredArea || calculatedArea);
    if (areaSqM <= 0 || allocatedArea + areaSqM > totalArea) {
      throw new Error("Revisa: el área debe ser mayor a cero y no puede superar el terreno disponible.");
    }
    const customUsage = String(form.get("customUsage") ?? "").trim();
    const usage = areaType === "Otro" && customUsage ? customUsage : areaType;
    const preset = LAND_FEATURE_PRESETS.find((item) => item.value === areaType) ?? LAND_FEATURE_PRESETS[9];
    const color = preset.color;
    const customCrop = String(form.get("customCrop") ?? "").trim();
    const crop = ["Cultivo","Invernadero","Vivero"].includes(areaType) ? (cropType === "Otro cultivo" ? customCrop : cropType) : "";
    const name = String(form.get("name") ?? "").trim() || `${usage} ${areas.length + 1}`;
    const relativeSize = totalArea > 0 ? Math.sqrt(areaSqM / totalArea) : .2;
    const mapWidth = areaPlacement?.width??Math.min(44, Math.max(9, relativeSize * 52));
    const mapHeight = areaPlacement?.height??Math.min(31, Math.max(6, mapWidth * (areaType === "Laguna / agua" ? .68 : .62)));
    const mapX = areaPlacement?.x??Math.min(88, 8 + (areas.length % 4) * 20);
    const mapY = areaPlacement?.y??Math.min(58, 8 + (Math.floor(areas.length / 4) % 3) * 18);
    if(areaPlacement){const property=propertyOutlinePoints(farm.payload.surveyPlan?.vertices??[],farm.payload.propertySketch,areaPlacement.preferSketch??false).points;if(!placementFits(areaPlacement,property,planViewport(property)))throw new Error("Revisa: el contorno cambió. Vuelve a elegir dónde colocar el área.");}
    await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm-record",
      entityId: createLocalId("area"),
      action: "upsert",
      payload: {
        farmId: farm.id,
        recordType: "area",
        category: usage,
        title: name,
        data: {
          name,
          usage,
          areaSqM,
          shape,
          ...(typedAreaOutline?{typedAreaOutline}:{}),
          lengthM: lengthM || null,
          widthM: widthM || null,
          diameterM: diameterM || null,
          color,
          crop,
          cropVariety: String(form.get("cropVariety") ?? "").trim(),
          mapX,
          mapY,
          mapWidth,
          mapHeight,
          notes: String(form.get("notes") ?? ""),
        },
      },
    });
    formElement.reset();
    setAreaDialog(false);
    notifyLocalSaved(navigator.onLine && !localOnly ? "Área creada y lista para sincronizar." : "Área guardada en este dispositivo.");
    void refreshSavedRecord();
  }

  async function addWeight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!farm || !selectedAnimalId) throw new Error("Revisa: selecciona una finca y un animal.");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const animal = animals.find((record) => record.id === selectedAnimalId);
    const weightKg = Number(form.get("weightKg") || 0);
    if (!animal || weightKg <= 0) {
      throw new Error("Revisa: selecciona un animal e indica un peso válido.");
    }
    await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm-record",
      entityId: createLocalId("weight"),
      action: "upsert",
      payload: {
        farmId: farm.id,
        recordType: "weight",
        category: animal.payload.category,
        title: `Pesaje · ${animal.payload.title}`,
        data: {
          animalId: animal.id,
          animalTitle: animal.payload.title,
          weightKg,
          measuredAt: String(form.get("measuredAt") ?? ""),
          notes: String(form.get("notes") ?? ""),
        },
      },
    });
    formElement.reset();
    setWeightDialog(false);
    setSelectedAnimalId("");
    notifyLocalSaved(navigator.onLine && !localOnly ? "Pesaje registrado." : "Pesaje guardado en este dispositivo.");
    void refreshSavedRecord();
  }

  async function addProductionCycle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!farm) throw new Error("Revisa: configura o abre tu finca antes de guardar.");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    if (!title || !category) throw new Error("Revisa: completa el nombre y la categoría.");
    await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm-record",
      entityId: createLocalId("cycle"),
      action: "upsert",
      payload: {
        farmId: farm.id,
        recordType: "production-cycle",
        category,
        title,
        data: {
          objective: String(form.get("objective") ?? ""),
          startDate: String(form.get("startDate") ?? ""),
          endDate: String(form.get("endDate") ?? ""),
          status: String(form.get("status") ?? "Planificado"),
          notes: String(form.get("notes") ?? ""),
        },
      },
    });
    formElement.reset();
    setProductionDialog(false);
    notifyLocalSaved(navigator.onLine && !localOnly ? "Ciclo productivo registrado." : "Ciclo guardado en este dispositivo.");
    void refreshSavedRecord();
  }

  async function addInventoryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!farm) throw new Error("Revisa: configura o abre tu finca antes de guardar.");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    if (!title || !category) throw new Error("Revisa: completa el nombre y la categoría.");
    await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm-record",
      entityId: createLocalId("inventory"),
      action: "upsert",
      payload: {
        farmId: farm.id,
        recordType: "inventory",
        category,
        title,
        data: {
          quantity: Number(form.get("quantity") || 0),
          unit: String(form.get("unit") ?? "unidad"),
          minimum: Number(form.get("minimum") || 0),
          location: String(form.get("location") ?? ""),
          notes: String(form.get("notes") ?? ""),
        },
      },
    });
    formElement.reset();
    setInventoryDialog(false);
    notifyLocalSaved(navigator.onLine && !localOnly ? "Artículo registrado en inventario." : "Artículo guardado en este dispositivo.");
    void refreshSavedRecord();
  }

  async function updateFarm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!farm) return;
    const form = new FormData(event.currentTarget);
    const geometry = readFarmGeometry(form, farmAreaUnit, farmBoundaryShape ?? farm.payload.boundaryShape ?? "Irregular / polígono", farm.payload);
    const areaSqM = geometry.areaSqM;
    if (!String(form.get("name") ?? "").trim() || areaSqM <= 0) {
      throw new Error("Revisa: indica el nombre y una superficie válida.");
    }
    if (areaSqM < allocatedArea) {
      throw new Error("Revisa: la superficie total no puede ser menor que las áreas registradas.");
    }
    const operation=await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm",
      entityId: farm.id,
      baseRevision:String(form.get("baseRevision"))==="__new__"?null:String(form.get("baseRevision")??""),
      action: "upsert",
      payload: {
        name: String(form.get("name") ?? "").trim(),
        location: String(form.get("location") ?? "").trim(),
        areaSqM,
        boundaryShape: geometry.boundaryShape,
        boundaryMeasurements: geometry.boundaryMeasurements,
        surveyPlan: geometry.surveyPlan,
        propertySketch: geometry.propertySketch??null,
        geographicReference:geometry.geographicReference??null,
        objective: String(form.get("objective") ?? "").trim(),
      },
    });
    setMessage(navigator.onLine && !localOnly ? "Configuración actualizada." : "Cambios guardados en este dispositivo.");
    await loadLocal();
    if (navigator.onLine) await synchronize();
    const status=await getOperationStatus(operation.id);
    return status.state==="confirmed"?status.serverRevision:undefined;
  }

  async function deleteRecord(record: CachedEntity<FarmRecordPayload>) {
    await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm-record",
      entityId: record.id,
      baseRevision:record.serverRevision??null,
      action: "delete",
      payload: record.payload,
    });
    setSelectedRecord(null);
    setMessage(`“${record.payload.title}” fue eliminado${navigator.onLine && !localOnly ? " y se sincronizará" : " de este dispositivo"}.`);
    await loadLocal();
    if (navigator.onLine) await synchronize();
  }

  function openAreaDialog(preset = "Potrero",placement?:PlanPlacement) {
    areaDialogContext.current=farm?{owner:resolvedOwner??user.id,farmId:farm.id}:null;
    setAreaPlacement(placement??null);
    setAreaType(preset);
    if (preset === "Cultivo") setCropType("Cacao");
    setAreaDialog(true);
  }

  async function updateAreaOutline(record:CachedEntity<FarmRecordPayload>,outline:NormalizedSketchPolygon){
    let checked:NormalizedSketchPolygon;try{checked=canonicalizeNormalizedSketchPolygon(outline);}catch(error){throw new Error("Revisa: "+(error instanceof Error?error.message:"el contorno."));}
    await queueMutation({expectedOwner:resolvedOwner??user.id,entityType:"farm-record",entityId:record.id,baseRevision:record.serverRevision??null,action:"upsert",payload:{...record.payload,data:{...record.payload.data,shape:"Irregular",typedAreaOutline:checked}}});
    notifyLocalSaved("Contorno guardado en este dispositivo. La superficie declarada no cambió.");void refreshSavedRecord();
  }

  async function updateAreaLayout(
    record: CachedEntity<FarmRecordPayload>,
    layout: { x: number; y: number; width: number; height: number },
  ) {
    await queueMutation({ expectedOwner:resolvedOwner??user.id,
      entityType: "farm-record",
      entityId: record.id,
      baseRevision:record.serverRevision??null,
      action: "upsert",
      payload: {
        ...record.payload,
        data: {
          ...record.payload.data,
          mapX: Number(layout.x.toFixed(2)),
          mapY: Number(layout.y.toFixed(2)),
          mapWidth: Number(layout.width.toFixed(2)),
          mapHeight: Number(layout.height.toFixed(2)),
        },
      },
    });
    notifyLocalSaved(`Ubicación de “${record.payload.title}” guardada en este dispositivo.`);
    void refreshSavedRecord();
  }

  const splitInFlight=useRef(false);
  async function splitArea(record:CachedEntity<FarmRecordPayload>) {
    if(splitInFlight.current)return;splitInFlight.current=true;
    try{
      const owner=await localOwner();
      if(owner==="device-local"){
        await splitDeviceLocalArea(record);await loadLocal();setMessage("Área dividida en este dispositivo. Ambas partes se guardaron juntas.");return;
      }
      if(!navigator.onLine){setMessage("Para dividir un área vinculada a tu cuenta, vuelve a conectarte y confirma primero sus cambios pendientes.");return;}
      if(owner!==(resolvedOwner??user.id))throw new Error("account_changed_reopen_form");
      if(!farm)throw new Error("area_changed_refresh");
      await assertAreaReadyForOnlineSplit(record,owner,farm);
      const operationId=createLocalId("split"),newAreaId=createLocalId("area");
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
      try{
        const response=await fetch("/api/farm/split",{method:"POST",headers:{"content-type":"application/json","x-local-owner":owner},body:JSON.stringify({sourceId:record.id,baseRevision:record.serverRevision,baseFarmRevision:farm.serverRevision,operationId,newAreaId}),signal:controller.signal});
        if(!response.ok){await hydrateFromServer();throw new Error(response.status===409?"area_changed_refresh":"split_not_confirmed");}
        const result=await response.json() as {ok?:boolean;records?:Array<{id?:string;revision?:string}>};
        const returnedRecords=result.records;
        if(result.ok!==true||!Array.isArray(returnedRecords)||returnedRecords.length!==2||![record.id,newAreaId].every(id=>returnedRecords.some((row:{id?:string;revision?:string})=>row.id===id&&typeof row.revision==="string")))throw new Error("split_not_confirmed");
        await hydrateFromServer();await loadLocal();setMessage("División confirmada: ambas áreas se guardaron juntas en tu cuenta.");
      }finally{clearTimeout(timer);}
    }catch(error){
      const code=error instanceof Error?error.message:"";
      setMessage(code==="area_has_linked_records"?"Revisa los vínculos de los registros antes de dividir. No se asignarán automáticamente a una mitad.":code==="area_pending_sync"?"Primero sincroniza los cambios del área; después vuelve a abrirla para dividir.":code==="area_changed_refresh"?"El área cambió. Revisa la versión actual antes de volver a dividir.":code==="area_too_small"?"El área debe tener al menos 2 m² para dividirse.":"No se confirmó la división. Tus datos se conservan; reconecta y actualiza antes de volver a intentarlo.");
      await loadLocal();
    }finally{splitInFlight.current=false;}
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
      className="min-w-0 overflow-x-clip bg-[#efe6d7]"
    >
      <Sidebar collapsible="icon" className="border-r-0 bg-[#211d1a] text-white">
        <SidebarHeader className="border-b border-white/10 bg-[#211d1a] p-4">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <Image src="/icon-192.png" alt="Venezuela Agro" width={42} height={42} className="hidden shrink-0 rounded-xl group-data-[collapsible=icon]:block"/>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden"><VenezuelaAgroLogo compact/></span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="bg-[#211d1a] px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[.68rem] tracking-[.14em] text-white/35">GESTIÓN DE FINCA</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <FarmSidebarButton
                      onClick={() => setView(item.view)}
                      isActive={view === item.view}
                      tooltip={item.label}
                      className="h-11 text-white/65 hover:bg-white/8 hover:text-white data-[active=true]:bg-[#f3ebdd] data-[active=true]:text-[#211d1a]"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </FarmSidebarButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/10 bg-[#211d1a] p-3">
          <a href="/finca-demo" className="mb-2 block rounded-xl border border-white/20 p-3 text-xs font-semibold text-white group-data-[collapsible=icon]:hidden">Explorar finca de demostración</a>
          <div className="rounded-xl bg-white/6 p-3 group-data-[collapsible=icon]:p-2">
            <p className="truncate text-xs font-semibold text-white">{reopenedAccount ? "Mi cuenta guardada en este dispositivo" : user.name}</p>
            <p className="mt-1 truncate text-[.66rem] text-white/40 group-data-[collapsible=icon]:hidden">{reopenedAccount ? "Se verifica la cuenta antes de sincronizar" : user.email}</p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 overflow-x-clip bg-[#efe6d7]">
        <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between border-b border-[#3e2a19]/10 bg-[#efe6d7]/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="h-10 w-10 rounded-full border border-[#3e2a19]/10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{farm?.payload.name ?? "Configura tu finca"}</p>
              <p className="truncate text-xs text-[#71685f]">{localOnly ? "Guardado únicamente en este dispositivo" : farm?.payload.location || "Espacio personalizable"}</p>
            </div>
          </div>
          <button
            onClick={() => void synchronize()}
            disabled={syncing || !online}
            className={`flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-bold sm:px-4 ${online ? "bg-white text-[#365026]" : "bg-[#dfd2bf] text-[#6b4a2f]"}`}
          >
            {localOnly ? <Database size={16} /> : syncing ? <Loader2 className="animate-spin" size={16} /> : online ? <Cloud size={16} /> : <CloudOff size={16} />}
            <span className="hidden sm:inline">{localOnly ? `${pending} guardado${pending === 1 ? "" : "s"} localmente` : syncing ? "Sincronizando" : online ? pending ? `${pending} pendiente${pending === 1 ? "" : "s"}` : "Todo guardado" : "Modo sin conexión"}</span>
          </button>
        </header>

        <div className="mx-auto min-w-0 w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#4c6b3a]/25 bg-[#e8efdf] p-4" aria-label="Ejemplos de esta área"><div className="min-w-0"><p className="font-bold">¿Quieres ver cómo se organiza esta área?</p><p className="mt-1 text-sm leading-6">Ejemplo guiado con datos ficticios. Tus registros reales se mantienen separados.</p><dl className="mt-3 grid min-w-0 gap-3 text-sm leading-6 sm:grid-cols-3"><div><dt className="font-bold">Qué introduces</dt><dd>{learningExampleForView(view).input}</dd></div><div><dt className="font-bold">Qué haces</dt><dd>{learningExampleForView(view).action}</dd></div><div><dt className="font-bold">Qué obtienes</dt><dd>{learningExampleForView(view).result}</dd></div></dl></div><a href={demoLinkForView(view)} className="button-dark">Ver ejemplos de esta área</a></section>
          {!initialLocalOnly && <SecurityCenter mode="gate" />}
          {reopenedAccount && <p className="mb-5 rounded-2xl border border-[#4c6b3a]/20 bg-[#edf3e7] p-4 text-sm leading-6 text-[#365026]">Espacio de cuenta abierto desde este dispositivo. Puedes seguir registrando sin señal. Al reconectar se verificará la misma cuenta antes de enviar cambios; comprueba los pendientes y el último respaldo en Sincronización.</p>}
          {localOnly && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#875d2c]/20 bg-[#fff7e8] p-4 text-sm leading-6 text-[#6b4a2f]" role="status">
              <WifiOff className="mt-0.5 shrink-0" size={18} />
              <p><strong>Modo local activo.</strong> Mi Finca ya puede abrir y guardar registros en este dispositivo. Para preparar el uso sin señal y recuperar una copia de registros anteriores, abre Sincronización. El respaldo central necesita conexión y una sesión válida.</p>
            </div>
          )}
          {message && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-[#4c6b3a]/20 bg-[#edf3e7] p-4 text-sm text-[#365026]" role="status">
              <span className="flex items-start gap-2"><Check className="mt-0.5 shrink-0" size={17} /> {message}</span>
              <button onClick={() => setMessage("")} className="text-xs font-bold">Cerrar</button>
            </div>
          )}

          {!farm && initialReady && resolvedOwner && !firstStartContinued && <FarmFirstStart key={resolvedOwner} owner={resolvedOwner} onContinue={()=>setFirstStartContinued(true)}/>}
          {!farm && <><OfflineReadiness /><SyncIssues /></>}
          {!farm ? (
            <FarmOnboarding
              areaUnit={farmAreaUnit}
              onAreaUnitChange={setFarmAreaUnit}
              boundaryShape={farmBoundaryShape ?? "Irregular / polígono"}
              onBoundaryShapeChange={(value) => setFarmBoundaryShape(value as FarmPayload["boundaryShape"])}
              onSubmit={event=>recordSubmissionGate.current.run(()=>createFarm(event))}
            />
          ) : (
            <>
              {view === "overview" && (<>
                <PrivateFarmLocator farmId={farm.id} workspaceOwner={resolvedOwner??user.id} reference={farm.payload.geographicReference} surveyPlan={farm.payload.surveyPlan} onConfigureReference={()=>setView("settings")}/><Overview
                  farm={farm}
                  animals={animals}
                  areas={areas}
                  cycles={cycles}
                  inventory={inventory}
                  pending={pending}
                  online={online}
                  onAddAnimal={() => setAnimalDialog(true)}
                  onAddArea={() => openAreaDialog("Potrero")}
                  onChangeView={setView}
                />
              </>)}
              {view === "animals" && (
                <Animals
                  records={animals}
                  weights={weights}
                  onAdd={() => setAnimalDialog(true)}
                  onWeigh={(animalId) => {
                    setSelectedAnimalId(animalId);
                    setWeightDialog(true);
                  }}
                />
              )}
              {view === "land" && (
                <FarmMapEditor
                  workspaceOwner={resolvedOwner??user.id}
                  farm={farm}
                  areas={areas}
                  records={records}
                  onLinkRecord={async(record,areaId)=>{if(!resolvedOwner)throw new Error("account_changed_reopen_form");await queueMutation({expectedOwner:resolvedOwner,expectedLocalUpdatedAt:record.updatedAt,entityType:"farm-record",entityId:record.id,action:"upsert",payload:{...record.payload,data:{...record.payload.data,areaId,...(record.payload.data.areaId!==areaId?{planPlacement:null}:{})}}});await loadLocal();}}
                  totalArea={totalArea}
                  allocatedArea={allocatedArea}
                  onAddPreset={openAreaDialog}
                  onRegisterAnimal={()=>setAnimalDialog(true)}
                  onPlaceAnimal={async(record,placement,area)=>{if(!resolvedOwner||record.payload.recordType!=="animal"||!records.some(r=>r.id===placement.areaId&&r.payload.recordType==="area"&&r.payload.farmId===record.payload.farmId))throw new Error("Revisa: el animal o el área ya no están disponibles.");await queueMutation({expectedOwner:resolvedOwner,expectedLocalUpdatedAt:record.updatedAt,expectedAreaUpdatedAt:area.updatedAt,entityType:"farm-record",entityId:record.id,action:"upsert",payload:{...record.payload,data:{...record.payload.data,areaId:placement.areaId,planPlacement:placement}}});notifyLocalSaved("Ubicación del croquis guardada en este dispositivo.");await loadLocal();}}
                  onMove={updateAreaLayout}
                  onOutlineChange={updateAreaOutline}
                  onSplit={splitArea}
                  onDelete={deleteRecord}
                  onOpen={setSelectedRecord}
                  onEditPlan={() => setView("settings")}
                />
              )}
              {view === "production" && <Production records={cycles} onAdd={() => setProductionDialog(true)} onOpen={setSelectedRecord} />}
              {view === "intelligence" && <FarmIntelligence farmId={farm.id} ownerId={resolvedOwner??user.id} />}
              {view === "inventory" && <Inventory records={inventory} onAdd={() => setInventoryDialog(true)} onOpen={setSelectedRecord} />}
              {view === "marketplace" && <MyListings listings={listings} owner={resolvedOwner??user.id} onMessage={setMessage} />}
              {view === "sync" && (
                <SyncCenter
                  localOnly={localOnly}
                  online={online}
                  syncing={syncing}
                  pending={pending}
                  lastSync={lastSync}
                  onSync={() => void synchronize()}
                />
              )}
              {view === "security" && (reopenedAccount ? <><ViewHeading kicker="CUENTA SIN CONEXIÓN" title="Verifica tu cuenta para gestionar su seguridad" description="Abrir el espacio guardado no inicia sesión. Puedes conservar tus registros sin señal; para consultar o cambiar la seguridad de la cuenta necesitas conexión y verificarla." /><button onClick={()=>window.location.assign("/app")} className="button-dark mt-6">Abrir cuenta con conexión</button></> : localOnly ? <LocalSecurity /> : <><ViewHeading kicker="CONFIANZA DIGITAL" title="Seguridad y privacidad" description="Protege tu sesión, reconoce tus dispositivos y decide qué información puede tratarse." /><div className="mt-8"><SecurityCenter /></div></>)}
              {view === "settings" && (
                <FarmSettings
                  farm={farm}
                  areaUnit={farmAreaUnit}
                  onAreaUnitChange={setFarmAreaUnit}
                  boundaryShape={farmBoundaryShape ?? farm.payload.boundaryShape ?? "Irregular / polígono"}
                  onBoundaryShapeChange={(value) => setFarmBoundaryShape(value as FarmPayload["boundaryShape"])}
                  allocatedArea={allocatedArea}
                  onSubmit={updateFarm}
                />
              )}
            </>
          )}
        </div>

        <AnimalDialog
          open={animalDialog}
          onOpenChange={open=>{if(!recordSubmissionGate.current.busy)setAnimalDialog(open);}}
          species={animalSpecies}
          onSpeciesChange={setAnimalSpecies}
          sex={animalSex}
          onSexChange={setAnimalSex}
          purpose={animalPurpose}
          onPurposeChange={setAnimalPurpose}
          onSubmit={event=>recordSubmissionGate.current.run(()=>addAnimal(event))}
        />
        <AreaDialog key={areaDialog?"new-area":"closed-area"}
          open={areaDialog}
          onOpenChange={open=>{if(!recordSubmissionGate.current.busy)setAreaDialog(open);}}
          type={areaType}
          onTypeChange={setAreaType}
          crop={cropType}
          onCropChange={setCropType}
          placement={areaPlacement}
          available={Math.max(0, totalArea - allocatedArea)}
          onSubmit={event=>recordSubmissionGate.current.run(()=>addArea(event))}
        />
        <WeightDialog
          open={weightDialog}
          onOpenChange={open=>{if(!recordSubmissionGate.current.busy)setWeightDialog(open);}}
          animals={animals}
          animalId={selectedAnimalId}
          onAnimalChange={setSelectedAnimalId}
          onSubmit={event=>recordSubmissionGate.current.run(()=>addWeight(event))}
        />
        <ProductionDialog open={productionDialog} onOpenChange={open=>{if(!recordSubmissionGate.current.busy)setProductionDialog(open);}} onSubmit={event=>recordSubmissionGate.current.run(()=>addProductionCycle(event))} />
        <InventoryDialog open={inventoryDialog} onOpenChange={open=>{if(!recordSubmissionGate.current.busy)setInventoryDialog(open);}} onSubmit={event=>recordSubmissionGate.current.run(()=>addInventoryItem(event))} />
        <RecordDetailDialog records={records} record={selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)} onDelete={deleteRecord} />
      </SidebarInset>
    </SidebarProvider>
  );
}

function FarmOnboarding({
  areaUnit,
  onAreaUnitChange,
  boundaryShape,
  onBoundaryShapeChange,
  onSubmit,
}: {
  areaUnit: string;
  onAreaUnitChange: (value: string) => void;
  boundaryShape: NonNullable<FarmPayload["boundaryShape"]>;
  onBoundaryShapeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void|Promise<void>;
}) {
  return (
    <section className="grid min-w-0 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]">
      <div className="relative min-w-0 overflow-hidden rounded-[2rem] bg-[#211d1a] p-6 text-white sm:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#4c6b3a]/25 blur-3xl" />
        <div className="relative">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
            <Building2 className="text-[#b7d79a]" size={24} />
          </span>
          <p className="mt-7 text-xs font-bold tracking-[.16em] text-[#b7d79a] sm:mt-10">TU ESPACIO, TUS DATOS</p>
          <h1 className="font-display mt-3 max-w-lg text-4xl leading-[.95] sm:text-6xl">
            Configura la finca a tu manera.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/55 sm:mt-6">
            Este sistema comienza vacío. Tú decides el nombre, la superficie, la ubicación,
            las especies, los cultivos y los objetivos de producción. No usamos medidas ni
            inventarios de otra finca como datos de ejemplo.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3 xl:grid-cols-1 2xl:grid-cols-3">
            {[
              ["📱", "En tu dispositivo", "El registro queda disponible localmente."],
              ["☁️", "Sincronización", "Se respalda al recuperar internet."],
              ["🧩", "Personalizable", "Cada módulo parte de tus decisiones."],
            ].map(([, title, text]) => (
              <div key={title} className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                <AgroCategoryIcon category={title}/>
                <p className="mt-2 break-words text-xs font-bold sm:mt-4 sm:text-sm">{title}</p>
                <p className="mt-1 hidden text-xs leading-5 text-white/40 sm:block">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-[2rem] border border-[#3e2a19]/8 bg-white p-5 shadow-[0_24px_70px_rgba(62,42,25,.07)] sm:p-10">
        <p className="text-xs font-bold tracking-[.16em] text-[#4c6b3a]">PRIMERA CONFIGURACIÓN</p>
        <h2 className="font-display mt-3 text-4xl leading-none sm:text-5xl">Crea el plano de tu finca</h2>
        <p className="mt-3 text-sm leading-6 text-[#71685f]">
          Podrás modificar estos datos después. Nada se publica en el marketplace sin tu acción.
        </p>
        <FarmRecordForm onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold">
            Nombre de la finca
            <Input name="name" required autoComplete="organization" className="mt-2 h-12 bg-[#fbf8f2]" placeholder="Escribe el nombre que utilizas" />
          </label>
          <label className="block text-sm font-semibold">
            Ubicación
            <Input name="location" autoComplete="address-level1" className="mt-2 h-12 bg-[#fbf8f2]" placeholder="Municipio, estado o referencia (opcional)" />
          </label>
          <FarmPlanFields areaUnit={areaUnit} onAreaUnitChange={onAreaUnitChange} boundaryShape={boundaryShape} onBoundaryShapeChange={onBoundaryShapeChange} initiallyOpenCoordinates={false} />
          <label className="block text-sm font-semibold">
            Objetivo principal
            <Textarea name="objective" className="mt-2 min-h-28 bg-[#fbf8f2]" placeholder="Ej. reproducción, engorde para venta, agricultura, genética o producción mixta" />
          </label>
          <FarmSaveButton className="h-12 w-full rounded-full bg-[#3e2a19] text-white hover:bg-[#211d1a] sm:w-auto sm:px-8">
            Crear plano y espacio de trabajo <ChevronRight />
          </FarmSaveButton>
        </FarmRecordForm>
      </div>
    </section>
  );
}

function FarmSettings({
  farm,
  areaUnit,
  onAreaUnitChange,
  boundaryShape,
  onBoundaryShapeChange,
  allocatedArea,
  onSubmit,
}: {
  farm: CachedEntity<FarmPayload>;
  areaUnit: string;
  onAreaUnitChange: (value: string) => void;
  boundaryShape: NonNullable<FarmPayload["boundaryShape"]>;
  onBoundaryShapeChange: (value: string) => void;
  allocatedArea: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<string|null|undefined>;
}) {
  const [editingRevision,setEditingRevision]=useState(farm.serverRevision??"__new__");
  const [saving,setSaving]=useState(false),[formError,setFormError]=useState("");
  const gate=useRef(createSubmissionGate());
  async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();if(gate.current.busy)return;setSaving(true);setFormError("");try{const confirmed=await gate.current.run(()=>onSubmit(event));if(confirmed!==undefined)setEditingRevision(confirmed??"__new__");}catch(error){setFormError(error instanceof Error?error.message:"No se pudo confirmar el guardado. Conserva tus cambios y revisa el almacenamiento.");}finally{setSaving(false);}}
  const displayedArea = areaUnit === "ha" ? farm.payload.areaSqM / 10_000 : farm.payload.areaSqM;

  return (
    <section>
      <ViewHeading
        kicker="PERSONALIZACIÓN"
        title="Configurar finca"
        description="Actualiza la identidad, ubicación, superficie y objetivo de este espacio de trabajo."
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_.55fr]">
        <form onSubmit={save} className="farm-settings-form min-w-0 space-y-5 rounded-[1.7rem] border border-[#3e2a19]/8 bg-white p-6 sm:p-8"><input type="hidden" name="baseRevision" value={editingRevision} readOnly />
          <label className="block text-sm font-semibold">
            Nombre
            <Input name="name" required defaultValue={farm.payload.name} className="mt-2 h-12 bg-[#fbf8f2]" />
          </label>
          <label className="block text-sm font-semibold">
            Ubicación
            <Input name="location" defaultValue={farm.payload.location} className="mt-2 h-12 bg-[#fbf8f2]" />
          </label>
          <FarmPlanFields areaUnit={areaUnit} onAreaUnitChange={onAreaUnitChange} boundaryShape={boundaryShape} onBoundaryShapeChange={onBoundaryShapeChange} defaultArea={displayedArea} defaultMeasurements={farm.payload.boundaryMeasurements} defaultSurveyPlan={farm.payload.surveyPlan} disabled={saving} defaultPropertySketch={farm.payload.propertySketch} defaultGeographicReference={farm.payload.geographicReference} initiallyOpenCoordinates={false} />
          <p className="text-xs text-[#837a71]">Ya distribuiste {formatHa(allocatedArea)}. La superficie total no puede quedar por debajo de esa cifra.</p>
          <label className="block text-sm font-semibold">
            Objetivo principal
            <Textarea name="objective" defaultValue={farm.payload.objective} className="mt-2 min-h-28 bg-[#fbf8f2]" />
          </label>
          <Button disabled={saving} type="submit" className="rounded-full bg-[#3e2a19] px-7 text-white">{saving?"Guardando…":"Guardar cambios"}</Button>
          {formError&&<p role="alert" className="rounded-xl bg-[#fff1ed] p-4 text-sm text-[#803a2d]">{formError}</p>}
        </form>
        <aside className="rounded-[1.7rem] bg-[#211d1a] p-7 text-white">
          <Settings2 className="text-[#b7d79a]" size={26} />
          <h2 className="font-display mt-8 text-3xl">Datos bajo tu control.</h2>
          <p className="mt-3 text-sm leading-7 text-white/50">
            La configuración es privada. Solo una publicación creada expresamente por ti puede aparecer en el mercado público.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/70">
            {["Medidas editables", "Categorías abiertas", "Objetivos propios", "Copia local sin conexión"].map((item) => (
              <p key={item} className="flex items-center gap-2"><Check size={16} className="text-[#b7d79a]" /> {item}</p>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Overview({
  farm,
  animals,
  areas,
  cycles,
  inventory,
  pending,
  online,
  onAddAnimal,
  onAddArea,
  onChangeView,
}: {
  farm?: CachedEntity<FarmPayload>;
  animals: Array<CachedEntity<FarmRecordPayload>>;
  areas: Array<CachedEntity<FarmRecordPayload>>;
  cycles: Array<CachedEntity<FarmRecordPayload>>;
  inventory: Array<CachedEntity<FarmRecordPayload>>;
  pending: number;
  online: boolean;
  onAddAnimal: () => void;
  onAddArea: () => void;
  onChangeView: (view: View) => void;
}) {
  const stats = [
    { label: "Animales registrados", value: animals.length.toLocaleString("es-VE"), icon: Dna, detail: "Todas las especies", target: "animals" as View },
    { label: "Área total", value: formatHa(farm?.payload.areaSqM ?? 0), icon: Map, detail: `${areas.length} divisiones creadas`, target: "land" as View },
    { label: "Ciclos productivos", value: cycles.length.toLocaleString("es-VE"), icon: Activity, detail: "Activos y planificados", target: "production" as View },
    { label: "Cambios pendientes", value: pending.toLocaleString("es-VE"), icon: online ? Cloud : WifiOff, detail: online ? "Listos para sincronizar" : "Protegidos en el dispositivo", target: "sync" as View },
  ];
  const recent = [...animals, ...areas, ...cycles, ...inventory].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <div>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold tracking-[.16em] text-[#4c6b3a]">PANEL DE CONTROL</p>
          <h1 className="font-display mt-2 text-4xl leading-none sm:text-5xl">Buenos días, campo.</h1>
          <p className="mt-3 text-sm text-[#71685f]">Lo esencial de la finca, disponible con o sin internet.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAddAnimal} className="rounded-full bg-[#3e2a19] text-white"><Plus /> Registrar animal</Button>
          <Button onClick={onAddArea} variant="outline" className="rounded-full border-[#3e2a19]/15 bg-white"><Map /> Dividir terreno</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <button key={stat.label} onClick={() => onChangeView(stat.target)} className="rounded-[1.5rem] border border-[#3e2a19]/8 bg-white p-5 text-left shadow-[0_18px_50px_rgba(62,42,25,.05)] transition hover:-translate-y-0.5 hover:border-[#4c6b3a]/30" aria-label={`Abrir ${stat.label}`}>
            <div className="flex items-start justify-between">
              <stat.icon className="text-[#4c6b3a]" size={22} />
              <ArrowUpRight className="text-[#b4aa9e]" size={17} />
            </div>
            <p className="mt-8 text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-sm font-semibold">{stat.label}</p>
            <p className="mt-2 text-xs text-[#837a71]">{stat.detail}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-[1.7rem] border border-[#3e2a19]/8 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Actividad reciente</p>
              <p className="mt-1 text-xs text-[#837a71]">Registros guardados en este dispositivo</p>
            </div>
            <Activity size={20} className="text-[#4c6b3a]" />
          </div>
          <div className="mt-5 divide-y divide-[#3e2a19]/8">
            {recent.length ? recent.map((record) => (
              <div key={record.key} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ebdd] text-xl">
                  <AgroCategoryIcon category={record.payload.category}/>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{record.payload.title}</p>
                  <p className="mt-0.5 text-xs text-[#837a71]">{record.payload.category || record.payload.recordType}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[.65rem] font-bold ${record.syncState === "synced" ? "bg-[#e8f0df] text-[#365026]" : "bg-[#f4e3ce] text-[#875d2c]"}`}>
                  {record.syncState === "synced" ? "Guardado" : "Pendiente"}
                </span>
              </div>
            )) : (
              <div className="py-12 text-center">
                <PackageOpen className="mx-auto text-[#b4aa9e]" size={32} />
                <p className="mt-3 text-sm font-semibold">Aún no hay registros.</p>
                <p className="mt-1 text-xs text-[#837a71]">Comienza con un animal o una división del terreno.</p>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.7rem] bg-[#211d1a] p-6 text-white">
          <CircleGauge className="text-[#b7d79a]" size={26} />
          <h2 className="font-display mt-8 text-3xl">Organiza lo que ya conoces.</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Convierte medidas, pesajes y decisiones diarias en un historial que
            ayude a producir con más claridad.
          </p>
          <div className="mt-8 space-y-2">
            {[
              ["Inventario", "inventory"],
              ["Producción", "production"],
              ["Plano de la finca", "land"],
            ].map(([label, target]) => (
              <button key={label} onClick={() => onChangeView(target as View)} className="flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/75 hover:bg-white/8 hover:text-white">
                {label} <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Animals({
  records,
  weights,
  onAdd,
  onWeigh,
}: {
  records: Array<CachedEntity<FarmRecordPayload>>;
  weights: Array<CachedEntity<FarmRecordPayload>>;
  onAdd: () => void;
  onWeigh: (animalId: string) => void;
}) {
  return (
    <section>
      <ViewHeading kicker="MANEJO ANIMAL" title="Animales" description="Identificación, nacimiento, peso, propósito y estado en una misma ficha." action={<div className="flex flex-wrap gap-2"><Button onClick={() => records[0] && onWeigh(records[0].id)} disabled={!records.length} variant="outline" className="rounded-full border-[#3e2a19]/15 bg-white"><Scale /> Registrar pesaje</Button><Button onClick={onAdd} className="rounded-full bg-[#3e2a19] text-white"><Plus /> Registrar animal</Button></div>} />
      <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-[#3e2a19]/8 bg-white">
        <div className="hidden grid-cols-[1.2fr_.8fr_.7fr_.8fr_1fr_.8fr] gap-4 border-b bg-[#f7f1e7] px-5 py-3 text-xs font-bold text-[#71685f] lg:grid">
          <span>Identificación</span><span>Especie</span><span>Sexo</span><span>Peso</span><span>Propósito</span><span>Estado</span>
        </div>
        {records.length ? records.map((record) => {
          const data = record.payload.data;
          const latestWeight = weights
            .filter((weight) => weight.payload.data.animalId === record.id)
            .sort((left, right) => String(right.payload.data.measuredAt ?? right.updatedAt).localeCompare(String(left.payload.data.measuredAt ?? left.updatedAt)))[0];
          const currentWeight = latestWeight?.payload.data.weightKg ?? data.weightKg;
          return (
            <div key={record.key} className="grid gap-3 border-b border-[#3e2a19]/8 px-5 py-4 last:border-0 lg:grid-cols-[1.2fr_.8fr_.7fr_.8fr_1fr_.8fr] lg:items-center lg:gap-4">
              <div className="flex items-center gap-3">
                <AgroCategoryIcon category={record.payload.category} size={28}/>
                <div><p className="text-sm font-semibold">{record.payload.title}</p><p className="text-xs text-[#837a71]">{String(data.tag || "Sin código")}</p></div>
              </div>
              <DataCell label="Especie" value={String(data.species ?? record.payload.category)} />
              <DataCell label="Sexo" value={String(data.sex ?? "—")} />
              <DataCell label="Peso" value={currentWeight ? `${Number(currentWeight).toLocaleString("es-VE")} kg` : "—"} />
              <DataCell label="Propósito" value={String(data.purpose ?? "—")} />
              <div className="flex flex-wrap items-center gap-2"><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${record.syncState === "synced" ? "bg-[#e8f0df] text-[#365026]" : "bg-[#f4e3ce] text-[#875d2c]"}`}>{record.syncState === "synced" ? "Sincronizado" : "Pendiente"}</span><button onClick={() => onWeigh(record.id)} className="rounded-full border border-[#3e2a19]/12 p-1.5 text-[#4c6b3a]" aria-label={`Registrar peso de ${record.payload.title}`}><Scale size={14} /></button></div>
            </div>
          );
        }) : <EmptyState icon={Dna} title="No hay animales registrados" description="Crea la primera ficha y seguirá disponible incluso sin conexión." action={<Button onClick={onAdd} className="rounded-full bg-[#3e2a19] text-white"><Plus /> Registrar primero</Button>} />}
      </div>
    </section>
  );
}

function Production({ records, onAdd, onOpen }: { records: Array<CachedEntity<FarmRecordPayload>>; onAdd: () => void; onOpen: (record: CachedEntity<FarmRecordPayload>) => void }) {
  const [selectedCategory, setSelectedCategory] = useState("Ganadería bovina");
  const lines = includeRecordedCategories([
    ["🐄", "Ganadería bovina", "Cría · ordeño · engorde"],
    ["🐖", "Porcicultura", "Cría · libre pastoreo"],
    ["🐓", "Avicultura", "Pollos de engorde"],
    ["🐟", "Piscicultura", "Producción acuícola"],
    ["🍫", "Cacao", "Cultivo tropical"],
    ["☕", "Café", "Cultivo y trazabilidad"],
    ["🐝", "Apicultura", "Colmenas y polinización"],
    ["🧬", "Genética", "Mejoramiento productivo"],
  ],records.map(record=>record.payload.category));
  return (
    <section>
      <ViewHeading kicker="CICLOS PRODUCTIVOS" title="Producción" description="Planifica objetivos, etapas, fechas y resultados por línea productiva." action={<Button onClick={onAdd} className="rounded-full bg-[#3e2a19] text-white"><Plus /> Nuevo ciclo</Button>} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {lines.map(([, name, detail]) => (
          <button key={name} onClick={() => setSelectedCategory(name)} aria-pressed={selectedCategory === name} className={`rounded-[1.5rem] border bg-white p-5 text-left transition hover:-translate-y-0.5 ${selectedCategory === name ? "border-[#4c6b3a] ring-2 ring-[#4c6b3a]/15" : "border-[#3e2a19]/8"}`}>
            <AgroCategoryIcon category={name} size={36}/>
            <h2 className="mt-7 text-lg font-semibold">{name||"Sin categoría"}</h2>
            <p className="mt-2 text-xs text-[#837a71]">{detail}</p>
            <div className="mt-5 flex items-center justify-between border-t border-[#3e2a19]/8 pt-4 text-xs"><span>{records.filter((record) => record.payload.category === name).length} ciclos</span><ChevronRight size={16} /></div>
          </button>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[#3e2a19]/8 bg-white">
        <div className="border-b border-[#3e2a19]/8 bg-[#f7f1e7] px-5 py-4"><p className="text-sm font-bold">{selectedCategory}</p><p className="mt-1 text-xs text-[#837a71]">Abre un ciclo para consultar todos sus datos o eliminarlo.</p></div>
        {records.filter((record) => record.payload.category === selectedCategory).length ? records.filter((record) => record.payload.category === selectedCategory).map((record) => <button onClick={() => onOpen(record)} key={record.key} className="grid w-full gap-3 border-b border-[#3e2a19]/8 p-5 text-left last:border-0 transition hover:bg-[#fbf8f2] sm:grid-cols-[1fr_.7fr_.7fr_auto] sm:items-center"><div><p className="text-sm font-bold">{record.payload.title}</p><p className="mt-1 text-xs text-[#837a71]">{record.payload.category}</p></div><DataCell label="Inicio" value={String(record.payload.data.startDate || "Sin fecha")} /><DataCell label="Estado productivo" value={String(record.payload.data.status || "Planificado")} /><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${record.syncState === "synced" ? "bg-[#e8f0df] text-[#365026]" : "bg-[#f4e3ce] text-[#875d2c]"}`}>{record.syncState === "synced" ? "Sincronizado" : "Pendiente de sincronizar"}</span></button>) : <div className="p-8 text-center text-sm text-[#71685f]">Esta categoría está vacía. Puedes crear su primer ciclo.</div>}
      </div>
    </section>
  );
}

function Inventory({ records, onAdd, onOpen }: { records: Array<CachedEntity<FarmRecordPayload>>; onAdd: () => void; onOpen: (record: CachedEntity<FarmRecordPayload>) => void }) {
  const [selectedCategory, setSelectedCategory] = useState("Alimentos y forrajes");
  const categories = includeRecordedCategories([
    ["🌾", "Alimentos y forrajes"],
    ["💊", "Vitaminas y medicinas"],
    ["🌱", "Semillas"],
    ["🧪", "Fertilizantes y control"],
    ["🧂", "Sal, melaza y suplementos"],
    ["🛠️", "Herramientas y cercas"],
    ["⛽", "Combustible y lubricantes"],
    ["📦", "Otros insumos"],
  ],records.map(record=>record.payload.category));
  return (
    <section>
      <ViewHeading kicker="EXISTENCIAS" title="Inventario" description="Consulta cantidades registradas, mínimos, ubicación y notas de cada insumo." action={<Button onClick={onAdd} className="rounded-full bg-[#3e2a19] text-white"><Plus /> Registrar artículo</Button>} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map(([, label]) => (
          <button key={label} onClick={() => setSelectedCategory(label)} aria-pressed={selectedCategory === label} className={`rounded-[1.5rem] border bg-white p-5 text-left transition hover:-translate-y-0.5 ${selectedCategory === label ? "border-[#4c6b3a] ring-2 ring-[#4c6b3a]/15" : "border-[#3e2a19]/8"}`}>
            <AgroCategoryIcon category={label} size={32}/>
            <p className="mt-6 text-sm font-semibold">{label||"Sin categoría"}</p>
            <p className="mt-2 text-2xl font-bold">{records.filter((record) => record.payload.category === label).length}</p>
            <p className="text-xs text-[#837a71]">artículos registrados</p>
          </button>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[#3e2a19]/8 bg-white">
        <div className="border-b border-[#3e2a19]/8 bg-[#f7f1e7] px-5 py-4"><p className="text-sm font-bold">{selectedCategory}</p><p className="mt-1 text-xs text-[#837a71]">Abre un artículo para revisar ubicación, cantidades y notas.</p></div>
        {records.filter((record) => record.payload.category === selectedCategory).length ? records.filter((record) => record.payload.category === selectedCategory).map((record) => {
            const quantity = Number(record.payload.data.quantity ?? 0);
            const minimum = Number(record.payload.data.minimum ?? 0);
            return <button onClick={() => onOpen(record)} key={record.key} className="grid w-full gap-3 border-b border-[#3e2a19]/8 p-5 text-left last:border-0 transition hover:bg-[#fbf8f2] sm:grid-cols-[1fr_.7fr_.7fr_auto] sm:items-center"><div><p className="text-sm font-bold">{record.payload.title}</p><p className="mt-1 text-xs text-[#837a71]">{record.payload.category}</p></div><DataCell label="Cantidad" value={`${quantity.toLocaleString("es-VE")} ${String(record.payload.data.unit ?? "unidad")}`} /><DataCell label="Ubicación" value={String(record.payload.data.location || "Sin indicar")} /><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${minimum > 0 && quantity <= minimum ? "bg-[#f6ded8] text-[#8d372a]" : record.syncState === "synced" ? "bg-[#e8f0df] text-[#365026]" : "bg-[#f4e3ce] text-[#875d2c]"}`}>{minimum > 0 && quantity <= minimum ? "Nivel mínimo" : record.syncState === "synced" ? "Sincronizado" : "Pendiente de sincronizar"}</span></button>;
          }) : <div className="p-8 text-center text-sm text-[#71685f]">Esta categoría está vacía. Puedes registrar su primer artículo.</div>}
      </div>
    </section>
  );
}

function MyListings({ listings,owner,onMessage }: { listings: Array<CachedEntity<ListingPayload>>;owner:string;onMessage:(message:string)=>void }) {
  return (
    <section>
      <ViewHeading kicker="MERCADO AGRO" title="Mis publicaciones" description="Borradores, publicaciones pendientes y ofertas activas desde cualquier conexión." action={<Link href="/marketplace/publicar" className="button-dark"><Plus size={17} /> Nueva publicación</Link>} />
      <div className="mt-8 rounded-[1.6rem] border border-[#3e2a19]/8 bg-white">
        {listings.length ? listings.map((listing) => (
          <div key={listing.key} className="flex flex-col gap-3 border-b border-[#3e2a19]/8 p-5 last:border-0 sm:flex-row sm:items-center">
            <span className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3ebdd]"><MarketplacePhoto compact src={listing.payload.imageDataUrl||listing.payload.imageUrl||listingPhotoUrl(listing.payload.imageKey)} alt={listing.payload.title}/></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{listing.payload.title}</p><p className="mt-1 text-xs text-[#837a71]"><AgroCategoryIcon category={listing.payload.category} size={16} className="mr-1 inline-block"/>{listing.payload.category} · {listing.payload.location}</p>{!hasListingPhoto(listing.payload)&&<ListingPhotoRepair listing={listing} owner={owner} onSaved={onMessage}/>}</div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${listing.syncState === "pending" ? "bg-[#f4e3ce] text-[#875d2c]" : "bg-[#e8f0df] text-[#365026]"}`}>{!hasListingPhoto(listing.payload)?"Falta foto · no publicable":listing.syncState === "pending" ? "Pendiente de conexión" : listing.payload.status === "active" ? "Activa" : "En revisión"}</span>
          </div>
        )) : <EmptyState icon={Store} title="Todavía no has publicado" description="Prepara una oferta ahora; si no tienes internet, quedará lista para enviarse después." action={<Link href="/marketplace/publicar" className="button-dark"><Plus size={17} /> Crear publicación</Link>} />}
      </div>
    </section>
  );
}

function SyncCenter({
  localOnly,
  online,
  syncing,
  pending,
  lastSync,
  onSync,
}: {
  localOnly: boolean;
  online: boolean;
  syncing: boolean;
  pending: number;
  lastSync: string | null;
  onSync: () => void;
}) {
  return (
    <section>
      <ViewHeading kicker="RESILIENCIA DIGITAL" title={localOnly ? "Guardado local" : "Sincronización"} description={localOnly ? "Comprueba cuántos registros permanecen guardados únicamente en este dispositivo." : "Comprueba qué está en el dispositivo y qué ya llegó al respaldo central."} />
      <OfflineReadiness />
      <SyncIssues />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.7rem] bg-[#211d1a] p-7 text-white">
          {online ? <Cloud className="text-[#b7d79a]" size={30} /> : <CloudOff className="text-[#e5b381]" size={30} />}
          <h2 className="font-display mt-8 text-4xl">{localOnly ? "Este dispositivo conserva tus registros" : online ? "Conexión disponible" : "Trabajando sin señal"}</h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/55">{localOnly ? "Puedes continuar trabajando. El contador representa información todavía no respaldada entre dispositivos." : online ? "Puedes enviar los cambios guardados y descargar la versión más reciente de tus datos." : "Continúa registrando información. Nada se enviará hasta recuperar una conexión estable."}</p>
          {!localOnly && <Button onClick={onSync} disabled={!online || syncing} className="mt-8 rounded-full bg-[#f3ebdd] text-[#211d1a] hover:bg-white">
            {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />} Sincronizar ahora
          </Button>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Metric label="Cambios pendientes" value={String(pending)} />
          <Metric label="Último respaldo" value={localOnly ? "No activo" : lastSync ? formatRelativeDate(lastSync) : "Aún no"} />
          <Metric label="Copia local" value="Activa" />
          <Metric label={localOnly ? "Alcance" : "Sincronización"} value={localOnly ? "Solo este dispositivo" : "Automática"} />
        </div>
      </div>
      <div className="mt-6 rounded-[1.6rem] border border-[#3e2a19]/8 bg-white p-6">
        <h2 className="text-base font-bold">Qué permanece disponible sin internet</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["Fichas de animales", "Pesajes e historial", "Plano y divisiones", "Inventario", "Ciclos productivos", "Borradores del marketplace"].map((item) => (
            <p key={item} className="flex items-center gap-2 text-sm text-[#5f574f]"><Check size={16} className="text-[#4c6b3a]" /> {item}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalSecurity() {
  return (
    <section>
      <ViewHeading kicker="PRIVACIDAD DEL DISPOSITIVO" title="Seguridad y privacidad" description="En modo local, la información permanece en este navegador y no se publica automáticamente." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="Almacenamiento" value="Este dispositivo" />
        <Metric label="Respaldo central" value="No activo" />
        <Metric label="Publicación automática" value="Desactivada" />
      </div>
      <div className="mt-6 rounded-[1.6rem] border border-[#875d2c]/20 bg-[#fff7e8] p-6 text-sm leading-7 text-[#6b4a2f]">
        Protege el teléfono o el ordenador con su código de acceso. Si borras los datos del navegador antes de activar el respaldo central, los registros locales podrían perderse.
      </div>
    </section>
  );
}

function AnimalDialog({
  open,
  onOpenChange,
  species: selectedSpecies,
  onSpeciesChange,
  sex,
  onSexChange,
  purpose,
  onPurposeChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  species: string;
  onSpeciesChange: (value: string) => void;
  sex: string;
  onSexChange: (value: string) => void;
  purpose: string;
  onPurposeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto bg-[#f8f3ea] sm:max-w-2xl">
        <DialogHeader><DialogTitle className="font-display text-3xl">Registrar animal</DialogTitle><DialogDescription>La ficha se guardará inmediatamente en este dispositivo.</DialogDescription></DialogHeader>
        <FarmRecordForm onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Especie
              <Select value={selectedSpecies} onValueChange={onSpeciesChange}><SelectTrigger className="mt-2 h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent>{species.map(([name]) => <SelectItem key={name} value={name}><AgroCategoryIcon category={name} size={18}/> {name}</SelectItem>)}</SelectContent></Select>
            </label>
            {selectedSpecies === "Otra especie" && <label className="text-sm font-semibold">Nombre de la especie
              <Input name="customSpecies" required className="mt-2 h-11 bg-white" placeholder="Escribe tu categoría" />
            </label>}
            <label className="text-sm font-semibold">Código o arete
              <Input name="tag" className="mt-2 h-11 bg-white" placeholder="Ej. LM-001" />
            </label>
            <label className="text-sm font-semibold">Nombre (opcional)
              <Input name="name" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Raza
              <Input name="breed" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Sexo
              <Select value={sex} onValueChange={onSexChange}><SelectTrigger className="mt-2 h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Hembra">Hembra</SelectItem><SelectItem value="Macho">Macho</SelectItem><SelectItem value="Sin determinar">Sin determinar</SelectItem></SelectContent></Select>
            </label>
            <label className="text-sm font-semibold">Fecha de nacimiento
              <Input name="birthDate" type="date" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Peso actual (kg)
              <Input name="weight" type="number" min="0" step="0.01" inputMode="decimal" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Objetivo
              <Select value={purpose} onValueChange={onPurposeChange}><SelectTrigger className="mt-2 h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent>{["Reproducción", "Engorde para venta", "Mejoramiento genético", "Producción de leche", "Producción de huevos", "Cría", "Otro"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
            </label>
            {purpose === "Otro" && <label className="text-sm font-semibold">Objetivo personalizado
              <Input name="customPurpose" className="mt-2 h-11 bg-white" placeholder="Describe el propósito" />
            </label>}
          </div>
          <DialogFooter><FarmSaveButton className="rounded-full bg-[#3e2a19] px-6 text-white">Guardar animal</FarmSaveButton></DialogFooter>
        </FarmRecordForm>
      </DialogContent>
    </Dialog>
  );
}

function WeightDialog({
  open,
  onOpenChange,
  animals,
  animalId,
  onAnimalChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animals: Array<CachedEntity<FarmRecordPayload>>;
  animalId: string;
  onAnimalChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent className="bg-[#f8f3ea] sm:max-w-xl">
        <DialogHeader><DialogTitle className="font-display text-3xl">Registrar pesaje</DialogTitle><DialogDescription>El historial permanece asociado al animal y se puede capturar sin internet.</DialogDescription></DialogHeader>
        <FarmRecordForm onSubmit={onSubmit}>
          <label className="block text-sm font-semibold">Animal
            <Select value={animalId} onValueChange={onAnimalChange}>
              <SelectTrigger className="mt-2 h-11 w-full bg-white"><SelectValue placeholder="Selecciona un animal" /></SelectTrigger>
              <SelectContent>{animals.map((animal) => <SelectItem key={animal.id} value={animal.id}><AgroCategoryIcon category={animal.payload.category} size={18}/> {animal.payload.title}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Peso (kg)
              <Input name="weightKg" type="number" min="0.01" step="0.01" inputMode="decimal" required className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Fecha
              <Input name="measuredAt" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="mt-2 h-11 bg-white" />
            </label>
          </div>
          <label className="block text-sm font-semibold">Observaciones
            <Textarea name="notes" className="mt-2 min-h-24 bg-white" placeholder="Alimentación, condición o contexto del pesaje." />
          </label>
          <DialogFooter><FarmSaveButton disabled={!animalId} className="rounded-full bg-[#3e2a19] px-6 text-white">Guardar pesaje</FarmSaveButton></DialogFooter>
        </FarmRecordForm>
      </DialogContent>
    </Dialog>
  );
}

function ProductionDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto bg-[#f8f3ea] sm:max-w-2xl">
        <DialogHeader><DialogTitle className="font-display text-3xl">Nuevo ciclo productivo</DialogTitle><DialogDescription>Usa una categoría sugerida o escribe cualquier línea productiva propia.</DialogDescription></DialogHeader>
        <FarmRecordForm onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Nombre del ciclo
              <Input name="title" required className="mt-2 h-11 bg-white" placeholder="Ej. Engorde lote septiembre" />
            </label>
            <label className="text-sm font-semibold">Categoría
              <Input name="category" required list="production-categories" className="mt-2 h-11 bg-white" placeholder="Escribe o selecciona" />
              <datalist id="production-categories">{["Ganadería bovina", "Porcicultura", "Avicultura", "Piscicultura", "Apicultura", "Genética", "Hortalizas", "Frutales", ...productionRubrics].map((item) => <option key={item} value={item} />)}</datalist>
            </label>
            <label className="text-sm font-semibold">Fecha de inicio
              <Input name="startDate" type="date" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Fecha prevista de cierre
              <Input name="endDate" type="date" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Estado
              <select name="status" defaultValue="Planificado" className="mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm"><option>Planificado</option><option>Activo</option><option>En pausa</option><option>Finalizado</option></select>
            </label>
            <label className="text-sm font-semibold">Objetivo
              <Input name="objective" className="mt-2 h-11 bg-white" placeholder="Resultado esperado" />
            </label>
          </div>
          <label className="block text-sm font-semibold">Notas
            <Textarea name="notes" className="mt-2 min-h-24 bg-white" />
          </label>
          <DialogFooter><FarmSaveButton className="rounded-full bg-[#3e2a19] px-6 text-white">Guardar ciclo</FarmSaveButton></DialogFooter>
        </FarmRecordForm>
      </DialogContent>
    </Dialog>
  );
}

function InventoryDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto bg-[#f8f3ea] sm:max-w-2xl">
        <DialogHeader><DialogTitle className="font-display text-3xl">Registrar inventario</DialogTitle><DialogDescription>Crea categorías y unidades adaptadas a la operación de tu finca.</DialogDescription></DialogHeader>
        <FarmRecordForm onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Artículo
              <Input name="title" required className="mt-2 h-11 bg-white" placeholder="Nombre del insumo o herramienta" />
            </label>
            <label className="text-sm font-semibold">Categoría
              <Input name="category" required list="inventory-categories" className="mt-2 h-11 bg-white" placeholder="Escribe o selecciona" />
              <datalist id="inventory-categories">{["Alimentos y forrajes", "Vitaminas y medicinas", "Semillas", "Fertilizantes y control", "Sal, melaza y suplementos", "Herramientas y cercas", "Combustible y lubricantes", "Otros insumos"].map((item) => <option key={item} value={item} />)}</datalist>
            </label>
            <label className="text-sm font-semibold">Cantidad
              <Input name="quantity" type="number" min="0" step="0.01" required className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Unidad
              <Input name="unit" required list="inventory-units" className="mt-2 h-11 bg-white" placeholder="kg, saco, litro, unidad…" />
              <datalist id="inventory-units">{["kg", "saco", "litro", "unidad", "rollo", "caja", "dosis"].map((item) => <option key={item} value={item} />)}</datalist>
            </label>
            <label className="text-sm font-semibold">Nivel mínimo (opcional)
              <Input name="minimum" type="number" min="0" step="0.01" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Ubicación
              <Input name="location" className="mt-2 h-11 bg-white" placeholder="Depósito, galpón o área" />
            </label>
          </div>
          <label className="block text-sm font-semibold">Notas
            <Textarea name="notes" className="mt-2 min-h-24 bg-white" />
          </label>
          <DialogFooter><FarmSaveButton className="rounded-full bg-[#3e2a19] px-6 text-white">Guardar artículo</FarmSaveButton></DialogFooter>
        </FarmRecordForm>
      </DialogContent>
    </Dialog>
  );
}

function SavingAreaOutline({value,onChange}:{value:NormalizedSketchPolygon|null;onChange:(value:NormalizedSketchPolygon|null)=>void}) {
 const saving=useFarmFormSaving();
 return <PolygonSketchEditor value={value} onChange={onChange} disabled={saving} label="Contorno irregular del área"/>;
}

function AreaDialog({
  open,
  onOpenChange,
  type,
  onTypeChange,
  crop,
  onCropChange,
  available,
  placement,
  onSubmit,
}: {
  placement?:PlanPlacement|null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  onTypeChange: (value: string) => void;
  crop: string;
  onCropChange: (value: string) => void;
  available: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}) {
  const [entryUnit, setEntryUnit] = useState(["Potrero","Cultivo","Bosque / reserva"].includes(type)?"ha":"m2");
  const [shape,setShape]=useState<string>(placement?"Rectangular":LAND_FEATURE_PRESETS.find(preset=>preset.value===type)?.shape??"Irregular");
  const [outline,setOutline]=useState<NormalizedSketchPolygon|null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto bg-[#f8f3ea] sm:max-w-2xl">
        <DialogHeader><DialogTitle className="font-display text-3xl">Agregar al plano</DialogTitle><DialogDescription>Ubica un potrero, cultivo, laguna, vivienda o instalación. Disponible: {formatHa(available)}. {placement?"El lugar ya está elegido; confirma el nombre y la superficie.":""}</DialogDescription></DialogHeader>
        <FarmRecordForm onSubmit={onSubmit}>
          <label className="block text-sm font-semibold">Nombre del área
            <Input name="name" className="mt-2 h-11 bg-white" placeholder={`Ej. ${type === "Cultivo" ? "Cacao Norte" : type}`} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Uso
              <Select value={type} onValueChange={onTypeChange}><SelectTrigger className="mt-2 h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent>{LAND_FEATURE_PRESETS.map((item) => <SelectItem key={item.value} value={item.value}><AgroCategoryIcon category={item.value} size={18}/> {item.value}</SelectItem>)}</SelectContent></Select>
            </label>
            {type === "Otro" && <label className="text-sm font-semibold sm:col-span-2">Uso personalizado
              <Input name="customUsage" required className="mt-2 h-11 bg-white" placeholder="Ej. vivero, establo, paneles solares" />
            </label>}
            {["Cultivo","Invernadero","Vivero"].includes(type) && <>
              <label className="text-sm font-semibold">Cultivo
                <Select value={crop} onValueChange={onCropChange}><SelectTrigger className="mt-2 h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent>{CROP_PRESETS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
              </label>
              {crop === "Otro cultivo" && <label className="text-sm font-semibold">Nombre del cultivo
                <Input name="customCrop" required className="mt-2 h-11 bg-white" placeholder="Escribe el cultivo" />
              </label>}
              <label className="text-sm font-semibold">Variedad (opcional)
                <Input name="cropVariety" className="mt-2 h-11 bg-white" placeholder="Ej. cacao criollo" />
              </label>
            </>}
            <div className="grid grid-cols-[1fr_7rem] gap-3 sm:col-span-2">
              <label className="text-sm font-semibold">Superficie
                <Input name="areaSqM" type="number" min="0.0001" step="0.0001" inputMode="decimal" className="mt-2 h-11 bg-white" placeholder="Superficie que conoces" />
              </label>
              <label className="text-sm font-semibold">Unidad
                <Select value={entryUnit} onValueChange={setEntryUnit}><SelectTrigger className="mt-2 h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ha">ha</SelectItem><SelectItem value="m2">m²</SelectItem></SelectContent></Select>
                <input type="hidden" name="areaEntryUnit" value={entryUnit} readOnly />
              </label>
            </div>
          </div>
          <details className="rounded-xl border p-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Medidas, forma y notas (opcional)</summary><div className="grid gap-4 sm:grid-cols-2">            <label className="text-sm font-semibold">Forma de referencia
              <select name="shape" value={shape} onChange={event=>setShape(event.target.value)} className="mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm"><option>Irregular</option><option>Rectangular</option><option>Circular</option><option>Ovalada</option></select>
            </label>
            <label className="text-sm font-semibold">Largo (m, opcional)
              <Input name="lengthM" type="number" min="0" step="0.01" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Ancho (m, opcional)
              <Input name="widthM" type="number" min="0" step="0.01" className="mt-2 h-11 bg-white" />
            </label>
            <label className="text-sm font-semibold">Diámetro (m, opcional)
              <Input name="diameterM" type="number" min="0" step="0.01" className="mt-2 h-11 bg-white" />
            </label>
          </div>
          <p className="text-xs leading-5 text-[#837a71]">Indica hectáreas o metros cuadrados. También puedes usar largo × ancho para un rectángulo o diámetro para una forma circular u ovalada.</p>
          <input type="hidden" name="areaOutlineJson" value={outline?JSON.stringify(outline):""} readOnly/>
          <label className="block text-sm font-semibold">Notas
            <Textarea name="notes" className="mt-2 min-h-24 bg-white" placeholder="Animales, cultivo, acceso al agua u observaciones." />
          </label>
          </details>
          {shape==="Irregular"&&<section aria-label="Contorno obligatorio del área"><p className="mb-2 text-sm font-semibold">Dibuja el contorno para guardar esta área irregular.</p><SavingAreaOutline value={outline} onChange={setOutline}/></section>}
          <DialogFooter><FarmSaveButton className="rounded-full bg-[#3e2a19] px-6 text-white">Guardar área</FarmSaveButton></DialogFooter>
        </FarmRecordForm>
      </DialogContent>
    </Dialog>
  );
}

function RecordDetailDialog({
  records,
  record,
  onOpenChange,
  onDelete,
}: {
  records:Array<CachedEntity<FarmRecordPayload>>;
  record: CachedEntity<FarmRecordPayload> | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (record: CachedEntity<FarmRecordPayload>) => Promise<void>;
}) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f8f3ea] sm:max-w-2xl">
        {record && <>
          <DialogHeader>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#4c6b3a]">{record.payload.category}</p>
            <DialogTitle className="font-display text-3xl sm:text-4xl">{record.payload.title}</DialogTitle>
            <DialogDescription>Ficha completa guardada en Mi Finca.</DialogDescription>
          </DialogHeader>
          {typeof record.payload.data.areaId==="string"&&<p className="rounded-xl bg-[#e8efdf] p-3 text-sm">Área vinculada: {records.find(r=>r.id===record.payload.data.areaId&&r.payload.recordType==="area"&&r.payload.farmId===record.payload.farmId)?.payload.title??"Referencia guardada a un área no disponible"}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(record.payload.data).filter(([key, value]) => !["mapX", "mapY", "mapWidth", "mapHeight", "color", "typedAreaOutline", "areaId", "planPlacement", "demoPlanPlacement"].includes(key) && value !== "" && value != null).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-[#3e2a19]/8 bg-white p-4">
                <p className="text-[.68rem] font-bold uppercase tracking-[.1em] text-[#837a71]">{humanizeField(key)}</p>
                <p className="mt-2 break-words text-sm font-semibold text-[#3e2a19]">{String(value)}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-[#3e2a19]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" className="rounded-full border-[#b42318]/25 text-[#9a2f24]" onClick={() => { if (window.confirm(`¿Eliminar “${record.payload.title}”? Esta acción se sincronizará con tu cuenta.`)) void onDelete(record); }}><Trash2 /> Eliminar registro</Button>
            <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${record.syncState === "synced" ? "bg-[#e8f0df] text-[#365026]" : "bg-[#f4e3ce] text-[#875d2c]"}`}>{record.syncState === "synced" ? "Sincronizado" : "Pendiente de sincronizar"}</span>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  );
}


function ViewHeading({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold tracking-[.16em] text-[#4c6b3a]">{kicker}</p><h1 className="font-display mt-2 text-4xl leading-none sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#71685f]">{description}</p></div>{action}</div>;
}

function EmptyState({ icon: Icon, title, description, action }: { icon: typeof Dna; title: string; description: string; action: React.ReactNode }) {
  return <div className="p-12 text-center"><Icon className="mx-auto text-[#b4aa9e]" size={34} /><p className="mt-4 text-base font-semibold">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#837a71]">{description}</p><div className="mt-6">{action}</div></div>;
}

function DataCell({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[.65rem] font-bold uppercase tracking-wide text-[#9a9188] lg:hidden">{label}</p><p className="mt-1 text-sm text-[#5f574f] lg:mt-0">{value}</p></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#3e2a19]/8 bg-white p-5"><p className="text-xs text-[#837a71]">{label}</p><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p></div>;
}

function formatHa(squareMetres: number): string {
  return squareMetres>0&&squareMetres<100?`${squareMetres.toLocaleString("es-VE",{maximumFractionDigits:4})} m²`:`${(squareMetres / 10_000).toLocaleString("es-VE", { maximumFractionDigits: 2 })} ha`;
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function humanizeField(value: string): string {
  const labels: Record<string, string> = { startDate: "Fecha de inicio", endDate: "Fecha de cierre", status: "Estado productivo", objective: "Objetivo", notes: "Notas", quantity: "Cantidad", unit: "Unidad", minimum: "Nivel mínimo", location: "Ubicación", usage: "Uso", areaSqM: "Superficie (m²)", shape: "Forma", lengthM: "Largo (m)", widthM: "Ancho (m)", diameterM: "Diámetro (m)", crop: "Cultivo", cropVariety: "Variedad" };
  return labels[value] ?? value.replace(/([A-Z])/g, " $1").trim();
}

function FarmSidebarButton(props: React.ComponentProps<typeof SidebarMenuButton>){
 const {setOpenMobile}=useSidebar();
 return <SidebarMenuButton {...props} onClick={event=>{props.onClick?.(event);if(!event.defaultPrevented)setOpenMobile(false);}}/>;
}
