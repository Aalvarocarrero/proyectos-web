var farm_demo_fixture_default = {
	metadata: {
		"version": 10,
		"namespace": "venezuela-agro-demo-v1",
		"idPrefix": "demo_v1_",
		"asOf": "2026-10-13",
		"label": "Demostración editable",
		"notice": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales.",
		"persistence": "demo-only-local",
		"canSynchronize": false,
		"canPublish": false,
		"farmAreaSqM": 1e5,
		"allocatedAreaSqM": 65902.477736,
		"remainingAreaSqM": 34097.522264,
		"geography": "Unknown; proportional fictional 400 × 250 m layout; no survey or geographic point",
		"timestamps": "Fixed sample dates, not live tasks or deadlines"
	},
	farms: [{
		"id": "demo_v1_farm_horizonte",
		"payload": {
			"name": "Finca Horizonte · demostración",
			"location": "Ubicación sin definir · finca ficticia",
			"areaSqM": 1e5,
			"boundaryShape": "Rectángulo",
			"boundaryMeasurements": {
				"northM": 400,
				"southM": 400,
				"eastM": 250,
				"westM": 250
			},
			"propertySketch": {
				"version": 1,
				"coordinateSpace": "normalized-100",
				"vertices": [
					{
						"id": "A",
						"x": 0,
						"y": 0
					},
					{
						"id": "B",
						"x": 100,
						"y": 0
					},
					{
						"id": "C",
						"x": 100,
						"y": 62.5
					},
					{
						"id": "D",
						"x": 0,
						"y": 62.5
					}
				]
			},
			"geographicReference": null,
			"objective": "Explorar una finca mixta ficticia de 10 ha (400 × 250 m), con seis cultivos, animales registrados, potreros, edificios, caminos y agua. La composición es proporcional, sin ubicación geográfica ni valor de levantamiento; no prescribe una explotación real."
		}
	}],
	records: [
		{
			"id": "demo_v1_animal_alba",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Alba · ejemplo",
				"data": {
					"tag": "DEM-B01",
					"name": "Alba",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 36,
						"y": 52,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_trigo",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Porcino",
				"title": "Trigo · ejemplo",
				"data": {
					"tag": "DEM-P01",
					"name": "Trigo",
					"species": "Porcino",
					"sex": "Macho",
					"birthDate": "2026-04-12",
					"weightKg": 120,
					"breed": "Cruce de ejemplo",
					"purpose": "Engorde para venta",
					"status": "Activo",
					"areaId": "demo_v7_area_porcinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_porcinos",
						"x": 35,
						"y": 40,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Gallina",
				"title": "Nube · ejemplo",
				"data": {
					"tag": "DEM-A01",
					"name": "Nube",
					"species": "Gallina",
					"sex": "Hembra",
					"birthDate": "2026-03-08",
					"weightKg": 1.8,
					"breed": "Ponedoras de ejemplo",
					"purpose": "Producción de huevos",
					"status": "Activo",
					"areaId": "demo_v1_area_galpon",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_galpon",
						"x": 20,
						"y": 30,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_scene_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 2 · ejemplo",
				"data": {
					"tag": "DEM-B01-2",
					"name": "Bovino 2 · ejemplo",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 20,
						"y": 28,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_scene_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 3 · ejemplo",
				"data": {
					"tag": "DEM-B01-3",
					"name": "Bovino 3 · ejemplo",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 45,
						"y": 25,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_scene_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 4 · ejemplo",
				"data": {
					"tag": "DEM-B01-4",
					"name": "Bovino 4 · ejemplo",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 70,
						"y": 32,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_scene_4",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 5 · ejemplo",
				"data": {
					"tag": "DEM-B01-5",
					"name": "Bovino 5 · ejemplo",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 24,
						"y": 72,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_scene_5",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 6 · ejemplo",
				"data": {
					"tag": "DEM-B01-6",
					"name": "Bovino 6 · ejemplo",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 58,
						"y": 75,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_scene_6",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 7 · ejemplo",
				"data": {
					"tag": "DEM-B01-7",
					"name": "Bovino 7 · ejemplo",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 78,
						"y": 61,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_trigo_scene_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Porcino",
				"title": "Porcino 2 · ejemplo",
				"data": {
					"tag": "DEM-P01-2",
					"name": "Porcino 2 · ejemplo",
					"species": "Porcino",
					"sex": "Macho",
					"birthDate": "2026-04-12",
					"weightKg": 120,
					"breed": "Cruce de ejemplo",
					"purpose": "Engorde para venta",
					"status": "Activo",
					"areaId": "demo_v7_area_porcinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_porcinos",
						"x": 25,
						"y": 30,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_trigo_scene_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Porcino",
				"title": "Porcino 3 · ejemplo",
				"data": {
					"tag": "DEM-P01-3",
					"name": "Porcino 3 · ejemplo",
					"species": "Porcino",
					"sex": "Macho",
					"birthDate": "2026-04-12",
					"weightKg": 120,
					"breed": "Cruce de ejemplo",
					"purpose": "Engorde para venta",
					"status": "Activo",
					"areaId": "demo_v7_area_porcinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_porcinos",
						"x": 65,
						"y": 32,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_trigo_scene_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Porcino",
				"title": "Porcino 4 · ejemplo",
				"data": {
					"tag": "DEM-P01-4",
					"name": "Porcino 4 · ejemplo",
					"species": "Porcino",
					"sex": "Macho",
					"birthDate": "2026-04-12",
					"weightKg": 120,
					"breed": "Cruce de ejemplo",
					"purpose": "Engorde para venta",
					"status": "Activo",
					"areaId": "demo_v7_area_porcinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_porcinos",
						"x": 35,
						"y": 72,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube_scene_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Gallina",
				"title": "Gallina 2 · ejemplo",
				"data": {
					"tag": "DEM-A01-2",
					"name": "Gallina 2 · ejemplo",
					"species": "Gallina",
					"sex": "Hembra",
					"birthDate": "2026-03-08",
					"weightKg": 1.8,
					"breed": "Ponedoras de ejemplo",
					"purpose": "Producción de huevos",
					"status": "Activo",
					"areaId": "demo_v1_area_galpon",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_galpon",
						"x": 40,
						"y": 30,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube_scene_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Gallina",
				"title": "Gallina 3 · ejemplo",
				"data": {
					"tag": "DEM-A01-3",
					"name": "Gallina 3 · ejemplo",
					"species": "Gallina",
					"sex": "Hembra",
					"birthDate": "2026-03-08",
					"weightKg": 1.8,
					"breed": "Ponedoras de ejemplo",
					"purpose": "Producción de huevos",
					"status": "Activo",
					"areaId": "demo_v1_area_galpon",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_galpon",
						"x": 60,
						"y": 30,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube_scene_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Gallina",
				"title": "Gallina 4 · ejemplo",
				"data": {
					"tag": "DEM-A01-4",
					"name": "Gallina 4 · ejemplo",
					"species": "Gallina",
					"sex": "Hembra",
					"birthDate": "2026-03-08",
					"weightKg": 1.8,
					"breed": "Ponedoras de ejemplo",
					"purpose": "Producción de huevos",
					"status": "Activo",
					"areaId": "demo_v1_area_galpon",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_galpon",
						"x": 80,
						"y": 30,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube_scene_4",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Gallina",
				"title": "Gallina 5 · ejemplo",
				"data": {
					"tag": "DEM-A01-5",
					"name": "Gallina 5 · ejemplo",
					"species": "Gallina",
					"sex": "Hembra",
					"birthDate": "2026-03-08",
					"weightKg": 1.8,
					"breed": "Ponedoras de ejemplo",
					"purpose": "Producción de huevos",
					"status": "Activo",
					"areaId": "demo_v1_area_galpon",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_galpon",
						"x": 25,
						"y": 70,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube_scene_5",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Gallina",
				"title": "Gallina 6 · ejemplo",
				"data": {
					"tag": "DEM-A01-6",
					"name": "Gallina 6 · ejemplo",
					"species": "Gallina",
					"sex": "Hembra",
					"birthDate": "2026-03-08",
					"weightKg": 1.8,
					"breed": "Ponedoras de ejemplo",
					"purpose": "Producción de huevos",
					"status": "Activo",
					"areaId": "demo_v1_area_galpon",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_galpon",
						"x": 50,
						"y": 70,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_bufalo_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo de ejemplo 1 · ejemplo",
				"data": {
					"tag": "DEM-BUFALO-01",
					"name": "Búfalo de ejemplo 1",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 30,
						"y": 35,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_bufalo_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo de ejemplo 2 · ejemplo",
				"data": {
					"tag": "DEM-BUFALO-02",
					"name": "Búfalo de ejemplo 2",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 60,
						"y": 30,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_bufalo_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo de ejemplo 3 · ejemplo",
				"data": {
					"tag": "DEM-BUFALO-03",
					"name": "Búfalo de ejemplo 3",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 46,
						"y": 65,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_caballo_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caballo",
				"title": "Caballo de ejemplo 1 · ejemplo",
				"data": {
					"tag": "DEM-CABALLO-01",
					"name": "Caballo de ejemplo 1",
					"species": "Caballo",
					"sex": "Sin definir",
					"weightKg": 430,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_equinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_equinos",
						"x": 27,
						"y": 30,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_caballo_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caballo",
				"title": "Caballo de ejemplo 2 · ejemplo",
				"data": {
					"tag": "DEM-CABALLO-02",
					"name": "Caballo de ejemplo 2",
					"species": "Caballo",
					"sex": "Sin definir",
					"weightKg": 430,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_equinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_equinos",
						"x": 67,
						"y": 33,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_burro_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Burro",
				"title": "Burro de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-BURRO-01",
					"name": "Burro de ejemplo",
					"species": "Burro",
					"sex": "Sin definir",
					"weightKg": 190,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_equinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_equinos",
						"x": 30,
						"y": 68,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_mula_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Mula",
				"title": "Mula de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-MULA-01",
					"name": "Mula de ejemplo",
					"species": "Mula",
					"sex": "Sin definir",
					"weightKg": 310,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_equinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_equinos",
						"x": 66,
						"y": 69,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_oveja_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Oveja de ejemplo 1 · ejemplo",
				"data": {
					"tag": "DEM-OVEJA-01",
					"name": "Oveja de ejemplo 1",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 22,
						"y": 28,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_oveja_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Oveja de ejemplo 2 · ejemplo",
				"data": {
					"tag": "DEM-OVEJA-02",
					"name": "Oveja de ejemplo 2",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 43,
						"y": 28,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_oveja_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Oveja de ejemplo 3 · ejemplo",
				"data": {
					"tag": "DEM-OVEJA-03",
					"name": "Oveja de ejemplo 3",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 65,
						"y": 27,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_cabra_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Cabra de ejemplo 1 · ejemplo",
				"data": {
					"tag": "DEM-CABRA-01",
					"name": "Cabra de ejemplo 1",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 27,
						"y": 65,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_cabra_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Cabra de ejemplo 2 · ejemplo",
				"data": {
					"tag": "DEM-CABRA-02",
					"name": "Cabra de ejemplo 2",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 50,
						"y": 72,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_cabra_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Cabra de ejemplo 3 · ejemplo",
				"data": {
					"tag": "DEM-CABRA-03",
					"name": "Cabra de ejemplo 3",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 73,
						"y": 64,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_gallo_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Gallo",
				"title": "Gallo de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-GALLO-01",
					"name": "Gallo de ejemplo",
					"species": "Gallo",
					"sex": "Sin definir",
					"weightKg": 2.8,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v1_area_galpon",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_galpon",
						"x": 77,
						"y": 72,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_codorniz_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Codorniz",
				"title": "Codorniz de ejemplo 1 · ejemplo",
				"data": {
					"tag": "DEM-CODORNIZ-01",
					"name": "Codorniz de ejemplo 1",
					"species": "Codorniz",
					"sex": "Sin definir",
					"weightKg": .23,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_codornices",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_codornices",
						"x": 35,
						"y": 40,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_codorniz_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Codorniz",
				"title": "Codorniz de ejemplo 2 · ejemplo",
				"data": {
					"tag": "DEM-CODORNIZ-02",
					"name": "Codorniz de ejemplo 2",
					"species": "Codorniz",
					"sex": "Sin definir",
					"weightKg": .23,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_codornices",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_codornices",
						"x": 67,
						"y": 62,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_pavo_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Pavo",
				"title": "Pavo de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-PAVO-01",
					"name": "Pavo de ejemplo",
					"species": "Pavo",
					"sex": "Sin definir",
					"weightKg": 7,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v1_area_galpon",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_galpon",
						"x": 70,
						"y": 50,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_conejo_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Conejo",
				"title": "Conejo de ejemplo 1 · ejemplo",
				"data": {
					"tag": "DEM-CONEJO-01",
					"name": "Conejo de ejemplo 1",
					"species": "Conejo",
					"sex": "Sin definir",
					"weightKg": 2.5,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_conejos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_conejos",
						"x": 35,
						"y": 38,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_conejo_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Conejo",
				"title": "Conejo de ejemplo 2 · ejemplo",
				"data": {
					"tag": "DEM-CONEJO-02",
					"name": "Conejo de ejemplo 2",
					"species": "Conejo",
					"sex": "Sin definir",
					"weightKg": 2.5,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_conejos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_conejos",
						"x": 65,
						"y": 63,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_pato_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Pato",
				"title": "Pato de ejemplo 1 · ejemplo",
				"data": {
					"tag": "DEM-PATO-01",
					"name": "Pato de ejemplo 1",
					"species": "Pato",
					"sex": "Sin definir",
					"weightKg": 2.2,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_aves_agua",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_aves_agua",
						"x": 25,
						"y": 40,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_pato_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Pato",
				"title": "Pato de ejemplo 2 · ejemplo",
				"data": {
					"tag": "DEM-PATO-02",
					"name": "Pato de ejemplo 2",
					"species": "Pato",
					"sex": "Sin definir",
					"weightKg": 2.2,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_aves_agua",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_aves_agua",
						"x": 65,
						"y": 65,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_ganso_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ganso",
				"title": "Ganso de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-GANSO-01",
					"name": "Ganso de ejemplo",
					"species": "Ganso",
					"sex": "Sin definir",
					"weightKg": 4.8,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_aves_agua",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_aves_agua",
						"x": 50,
						"y": 35,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_pez_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Tilapia",
				"title": "Pez de ejemplo 1 · ejemplo",
				"data": {
					"tag": "DEM-PEZ-01",
					"name": "Pez de ejemplo 1",
					"species": "Tilapia",
					"sex": "Sin definir",
					"weightKg": .65,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v1_area_agua",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_agua",
						"x": 35,
						"y": 45,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_pez_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Tilapia",
				"title": "Pez de ejemplo 2 · ejemplo",
				"data": {
					"tag": "DEM-PEZ-02",
					"name": "Pez de ejemplo 2",
					"species": "Tilapia",
					"sex": "Sin definir",
					"weightKg": .65,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v1_area_agua",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_agua",
						"x": 64,
						"y": 60,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_camaron_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Camarón",
				"title": "Camarón de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-CAMARON-01",
					"name": "Camarón de ejemplo",
					"species": "Camarón",
					"sex": "Sin definir",
					"weightKg": .03,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_laguna_menor",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_laguna_menor",
						"x": 52,
						"y": 48,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_colmena_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Colmena",
				"title": "Colmena de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-COLMENA-01",
					"name": "Colmena de ejemplo",
					"species": "Colmena",
					"sex": "Sin definir",
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_apiario",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_apiario",
						"x": 35,
						"y": 65,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_abeja_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Abeja",
				"title": "Abeja de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-ABEJA-01",
					"name": "Abeja de ejemplo",
					"species": "Abeja",
					"sex": "Sin definir",
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_apiario",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_apiario",
						"x": 70,
						"y": 35,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v7_animal_lombriz_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Lombriz",
				"title": "Lombriz de ejemplo · ejemplo",
				"data": {
					"tag": "DEM-LOMBRIZ-01",
					"name": "Lombriz de ejemplo",
					"species": "Lombriz",
					"sex": "Sin definir",
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v5_area_compost",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v5_area_compost",
						"x": 50,
						"y": 50,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_8",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 8 · ejemplo",
				"data": {
					"tag": "DEM-V8-B08",
					"name": "Bovino 8",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 35.9357,
						"y": 45.2232,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_9",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 9 · ejemplo",
				"data": {
					"tag": "DEM-V8-B09",
					"name": "Bovino 9",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 22.1545,
						"y": 22.7951,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_10",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 10 · ejemplo",
				"data": {
					"tag": "DEM-V8-B10",
					"name": "Bovino 10",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 50.4308,
						"y": 19.1701,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_11",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 11 · ejemplo",
				"data": {
					"tag": "DEM-V8-B11",
					"name": "Bovino 11",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 64.3365,
						"y": 25.5167,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_12",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 12 · ejemplo",
				"data": {
					"tag": "DEM-V8-B12",
					"name": "Bovino 12",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 27.0108,
						"y": 78.5995,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_13",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 13 · ejemplo",
				"data": {
					"tag": "DEM-V8-B13",
					"name": "Bovino 13",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 68.0784,
						"y": 72.5642,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_14",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 14 · ejemplo",
				"data": {
					"tag": "DEM-V8-B14",
					"name": "Bovino 14",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 85.8393,
						"y": 53.6886,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_15",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 15 · ejemplo",
				"data": {
					"tag": "DEM-V8-B15",
					"name": "Bovino 15",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 46.233,
						"y": 46.1885,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_16",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 16 · ejemplo",
				"data": {
					"tag": "DEM-V8-B16",
					"name": "Bovino 16",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 12.5304,
						"y": 31.1217,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_17",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 17 · ejemplo",
				"data": {
					"tag": "DEM-V8-B17",
					"name": "Bovino 17",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 36.6645,
						"y": 25.9185,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_18",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 18 · ejemplo",
				"data": {
					"tag": "DEM-V8-B18",
					"name": "Bovino 18",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 78.7872,
						"y": 28.5724,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_19",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 19 · ejemplo",
				"data": {
					"tag": "DEM-V8-B19",
					"name": "Bovino 19",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 17.8342,
						"y": 79.1614,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_20",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 20 · ejemplo",
				"data": {
					"tag": "DEM-V8-B20",
					"name": "Bovino 20",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 54.4267,
						"y": 81.0151,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_21",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 21 · ejemplo",
				"data": {
					"tag": "DEM-V8-B21",
					"name": "Bovino 21",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 83.4639,
						"y": 66.9421,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_22",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 22 · ejemplo",
				"data": {
					"tag": "DEM-V8-B22",
					"name": "Bovino 22",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 32.9725,
						"y": 56.727,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_23",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 23 · ejemplo",
				"data": {
					"tag": "DEM-V8-B23",
					"name": "Bovino 23",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 25.7051,
						"y": 35.9042,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_24",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 24 · ejemplo",
				"data": {
					"tag": "DEM-V8-B24",
					"name": "Bovino 24",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 35.9319,
						"y": 19.0101,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_25",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 25 · ejemplo",
				"data": {
					"tag": "DEM-V8-B25",
					"name": "Bovino 25",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 75.1039,
						"y": 22.8722,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_26",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 26 · ejemplo",
				"data": {
					"tag": "DEM-V8-B26",
					"name": "Bovino 26",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 31.8224,
						"y": 68.4234,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_27",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 27 · ejemplo",
				"data": {
					"tag": "DEM-V8-B27",
					"name": "Bovino 27",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 61.1569,
						"y": 69.437,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_28",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 28 · ejemplo",
				"data": {
					"tag": "DEM-V8-B28",
					"name": "Bovino 28",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 72.2224,
						"y": 57.5213,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_29",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 29 · ejemplo",
				"data": {
					"tag": "DEM-V8-B29",
					"name": "Bovino 29",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 43.3799,
						"y": 58.5162,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bovino_30",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Bovino",
				"title": "Bovino 30 · ejemplo",
				"data": {
					"tag": "DEM-V8-B30",
					"name": "Bovino 30",
					"species": "Bovino",
					"sex": "Hembra",
					"birthDate": "2023-03-15",
					"weightKg": 412,
					"breed": "Mestiza",
					"purpose": "Producción de leche",
					"status": "Activo",
					"areaId": "demo_v1_area_potrero_norte",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v1_area_potrero_norte",
						"x": 29.3037,
						"y": 22.6675,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_4",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 4 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF04",
					"name": "Búfalo 4",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 39.3379,
						"y": 31.0588,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_5",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 5 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF05",
					"name": "Búfalo 5",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 54.3942,
						"y": 24.7778,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_6",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 6 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF06",
					"name": "Búfalo 6",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 40.3181,
						"y": 60.0434,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_7",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 7 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF07",
					"name": "Búfalo 7",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 35.3186,
						"y": 39.2644,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_8",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 8 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF08",
					"name": "Búfalo 8",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 56.7778,
						"y": 17.184,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_9",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 9 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF09",
					"name": "Búfalo 9",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 43.464,
						"y": 75.9243,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_10",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 10 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF10",
					"name": "Búfalo 10",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 41.8611,
						"y": 42.5261,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_11",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 11 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF11",
					"name": "Búfalo 11",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 71.4714,
						"y": 31.0656,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_12",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 12 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF12",
					"name": "Búfalo 12",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 54.5289,
						"y": 71.0899,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_13",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 13 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF13",
					"name": "Búfalo 13",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 20.6716,
						"y": 36.9785,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_14",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 14 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF14",
					"name": "Búfalo 14",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 53.6676,
						"y": 34.425,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_15",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 15 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF15",
					"name": "Búfalo 15",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 51.7678,
						"y": 54.9883,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_bufalo_16",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Búfalo",
				"title": "Búfalo 16 · ejemplo",
				"data": {
					"tag": "DEM-V8-BF16",
					"name": "Búfalo 16",
					"species": "Búfalo",
					"sex": "Sin definir",
					"weightKg": 620,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_bufalos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_bufalos",
						"x": 33.6012,
						"y": 46.1527,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_4",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 4 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV04",
					"name": "Ovino 4",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 17.0109,
						"y": 22.0226,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_5",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 5 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV05",
					"name": "Ovino 5",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 40.6532,
						"y": 38.3297,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_6",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 6 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV06",
					"name": "Ovino 6",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 61.1373,
						"y": 15.3364,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_7",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 7 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV07",
					"name": "Ovino 7",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 24.6719,
						"y": 21.3267,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_8",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 8 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV08",
					"name": "Ovino 8",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 48.0707,
						"y": 35.4213,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_9",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 9 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV09",
					"name": "Ovino 9",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 69.2953,
						"y": 36.5871,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_10",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 10 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV10",
					"name": "Ovino 10",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 32.5373,
						"y": 29.13,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_11",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 11 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV11",
					"name": "Ovino 11",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 36.1788,
						"y": 23.347,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_ovino_12",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Ovino",
				"title": "Ovino 12 · ejemplo",
				"data": {
					"tag": "DEM-V8-OV12",
					"name": "Ovino 12",
					"species": "Ovino",
					"sex": "Sin definir",
					"weightKg": 46,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 67.3195,
						"y": 20.4703,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_4",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 4 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP04",
					"name": "Caprino 4",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 23.7836,
						"y": 56.7329,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_5",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 5 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP05",
					"name": "Caprino 5",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 57.4955,
						"y": 73.1125,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_6",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 6 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP06",
					"name": "Caprino 6",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 80.4198,
						"y": 66.0829,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_7",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 7 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP07",
					"name": "Caprino 7",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 30.3426,
						"y": 72.3091,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_8",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 8 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP08",
					"name": "Caprino 8",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 55.4015,
						"y": 68.437,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_9",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 9 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP09",
					"name": "Caprino 9",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 67.5549,
						"y": 71.342,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_10",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 10 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP10",
					"name": "Caprino 10",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 28.4271,
						"y": 56.5585,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_11",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 11 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP11",
					"name": "Caprino 11",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 44.7768,
						"y": 80.1336,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caprino_12",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caprino",
				"title": "Caprino 12 · ejemplo",
				"data": {
					"tag": "DEM-V8-CP12",
					"name": "Caprino 12",
					"species": "Caprino",
					"sex": "Sin definir",
					"weightKg": 38,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_ovinos_caprinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_ovinos_caprinos",
						"x": 68.4754,
						"y": 53.3517,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caballo_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caballo",
				"title": "Caballo 3 · ejemplo",
				"data": {
					"tag": "DEM-V8-EQ03",
					"name": "Caballo 3",
					"species": "Caballo",
					"sex": "Sin definir",
					"weightKg": 430,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_equinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_equinos",
						"x": 32.1135,
						"y": 24.7412,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v8_animal_caballo_4",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "animal",
				"category": "Caballo",
				"title": "Caballo 4 · ejemplo",
				"data": {
					"tag": "DEM-V8-EQ04",
					"name": "Caballo 4",
					"species": "Caballo",
					"sex": "Sin definir",
					"weightKg": 430,
					"breed": "Sin definir · ejemplo",
					"purpose": "Demostración visual del registro",
					"status": "Activo",
					"areaId": "demo_v7_area_equinos",
					"demoPlanPlacement": {
						"version": 1,
						"coordinateSpace": "area-percent",
						"areaId": "demo_v7_area_equinos",
						"x": 59.9697,
						"y": 40.5642,
						"source": "fictional-demo"
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Posición guardada para una escena de práctica; no recomienda alojamiento, compatibilidad entre especies ni carga animal."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_weight_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Bovino",
				"title": "Pesaje · Alba · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"weightKg": 387.28,
					"measuredAt": "2026-09-01",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_weight_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Bovino",
				"title": "Pesaje · Alba · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"weightKg": 399.64,
					"measuredAt": "2026-09-15",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_alba_weight_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Bovino",
				"title": "Pesaje · Alba · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"weightKg": 412,
					"measuredAt": "2026-10-01",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_trigo_weight_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Porcino",
				"title": "Pesaje · Trigo · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_trigo",
					"animalTitle": "Trigo · ejemplo",
					"weightKg": 60,
					"measuredAt": "2026-07-01",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_trigo_weight_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Porcino",
				"title": "Pesaje · Trigo · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_trigo",
					"animalTitle": "Trigo · ejemplo",
					"weightKg": 70,
					"measuredAt": "2026-08-01",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_trigo_weight_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Porcino",
				"title": "Pesaje · Trigo · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_trigo",
					"animalTitle": "Trigo · ejemplo",
					"weightKg": 80,
					"measuredAt": "2026-09-01",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube_weight_1",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Gallina",
				"title": "Pesaje · Nube · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_nube",
					"animalTitle": "Nube · ejemplo",
					"weightKg": 1.69,
					"measuredAt": "2026-09-01",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube_weight_2",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Gallina",
				"title": "Pesaje · Nube · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_nube",
					"animalTitle": "Nube · ejemplo",
					"weightKg": 1.75,
					"measuredAt": "2026-09-15",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_nube_weight_3",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Gallina",
				"title": "Pesaje · Nube · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_nube",
					"animalTitle": "Nube · ejemplo",
					"weightKg": 1.8,
					"measuredAt": "2026-10-01",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_animal_trigo_weight_4",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "weight",
				"category": "Porcino",
				"title": "Pesaje · Trigo · ejemplo",
				"data": {
					"animalId": "demo_v1_animal_trigo",
					"animalTitle": "Trigo · ejemplo",
					"weightKg": 120,
					"measuredAt": "2026-10-01",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lectura sintética para mostrar el historial."
				}
			}
		},
		{
			"id": "demo_v1_area_potrero_norte",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Potrero",
				"title": "Potrero bovino norte · ejemplo",
				"data": {
					"name": "Potrero bovino norte · ejemplo",
					"usage": "Potrero",
					"areaSqM": 7544,
					"shape": "Rectangular",
					"lengthM": 82,
					"widthM": 92,
					"diameterM": null,
					"color": "#557347",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": -6.768627451,
					"mapY": .8784313725,
					"mapWidth": 24.7607843137,
					"mapHeight": 27.7803921569,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true,
					"waterTrough": {
						"version": 1,
						"source": "fictional-demo",
						"x": 86,
						"y": 15,
						"lengthM": 4,
						"widthM": 1.5,
						"heightM": .65
					},
					"boundaryPlanting": {
						"version": 1,
						"source": "fictional-demo",
						"layoutWidthM": 82,
						"layoutHeightM": 92,
						"plants": [
							{
								"x": 13.4146,
								"y": 6.5217,
								"kind": "broadleaf",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 13.4146,
								"y": 93.4783,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 40.2439,
								"y": 6.5217,
								"kind": "palm",
								"heightM": 6.7,
								"crownRadiusM": 2.6
							},
							{
								"x": 40.2439,
								"y": 93.4783,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 67.0732,
								"y": 6.5217,
								"kind": "broadleaf",
								"heightM": 9,
								"crownRadiusM": 2.7
							},
							{
								"x": 67.0732,
								"y": 93.4783,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 92.6829,
								"y": 30.4348,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 54.3478,
								"kind": "broadleaf",
								"heightM": 10,
								"crownRadiusM": 2.7
							},
							{
								"x": 92.6829,
								"y": 54.3478,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 78.2609,
								"kind": "palm",
								"heightM": 6.1,
								"crownRadiusM": 2.6
							},
							{
								"x": 92.6829,
								"y": 78.2609,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							}
						]
					}
				}
			}
		},
		{
			"id": "demo_v7_area_bufalos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Potrero",
				"title": "Potrero de búfalos · ejemplo",
				"data": {
					"name": "Potrero de búfalos · ejemplo",
					"usage": "Potrero",
					"areaSqM": 7544,
					"shape": "Rectangular",
					"lengthM": 82,
					"widthM": 92,
					"diameterM": null,
					"color": "#557347",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 21.6156862745,
					"mapY": .8784313725,
					"mapWidth": 24.7607843137,
					"mapHeight": 27.7803921569,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true,
					"waterTrough": {
						"version": 1,
						"source": "fictional-demo",
						"x": 86,
						"y": 15,
						"lengthM": 4,
						"widthM": 1.5,
						"heightM": .65
					},
					"boundaryPlanting": {
						"version": 1,
						"source": "fictional-demo",
						"layoutWidthM": 82,
						"layoutHeightM": 92,
						"plants": [
							{
								"x": 13.4146,
								"y": 6.5217,
								"kind": "broadleaf",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 13.4146,
								"y": 93.4783,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 40.2439,
								"y": 6.5217,
								"kind": "palm",
								"heightM": 6.7,
								"crownRadiusM": 2.6
							},
							{
								"x": 40.2439,
								"y": 93.4783,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 67.0732,
								"y": 6.5217,
								"kind": "broadleaf",
								"heightM": 9,
								"crownRadiusM": 2.7
							},
							{
								"x": 67.0732,
								"y": 93.4783,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 30.4348,
								"kind": "palm",
								"heightM": 5.5,
								"crownRadiusM": 2.6
							},
							{
								"x": 92.6829,
								"y": 30.4348,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 54.3478,
								"kind": "broadleaf",
								"heightM": 10,
								"crownRadiusM": 2.7
							},
							{
								"x": 92.6829,
								"y": 54.3478,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 78.2609,
								"kind": "palm",
								"heightM": 6.1,
								"crownRadiusM": 2.6
							},
							{
								"x": 92.6829,
								"y": 78.2609,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							}
						]
					}
				}
			}
		},
		{
			"id": "demo_v7_area_equinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Potrero",
				"title": "Potrero de equinos · ejemplo",
				"data": {
					"name": "Potrero de equinos · ejemplo",
					"usage": "Potrero",
					"areaSqM": 5904,
					"shape": "Rectangular",
					"lengthM": 82,
					"widthM": 72,
					"diameterM": null,
					"color": "#557347",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": -6.768627451,
					"mapY": 31.0745098039,
					"mapWidth": 24.7607843137,
					"mapHeight": 21.7411764706,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true,
					"waterTrough": {
						"version": 1,
						"source": "fictional-demo",
						"x": 86,
						"y": 15,
						"lengthM": 4,
						"widthM": 1.5,
						"heightM": .65
					},
					"boundaryPlanting": {
						"version": 1,
						"source": "fictional-demo",
						"layoutWidthM": 82,
						"layoutHeightM": 72,
						"plants": [
							{
								"x": 13.4146,
								"y": 8.3333,
								"kind": "broadleaf",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 13.4146,
								"y": 91.6667,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 40.2439,
								"y": 8.3333,
								"kind": "palm",
								"heightM": 6.7,
								"crownRadiusM": 2.6
							},
							{
								"x": 40.2439,
								"y": 91.6667,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 67.0732,
								"y": 8.3333,
								"kind": "broadleaf",
								"heightM": 9,
								"crownRadiusM": 2.7
							},
							{
								"x": 67.0732,
								"y": 91.6667,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 38.8889,
								"kind": "palm",
								"heightM": 5.5,
								"crownRadiusM": 2.6
							},
							{
								"x": 92.6829,
								"y": 38.8889,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 69.4444,
								"kind": "broadleaf",
								"heightM": 10,
								"crownRadiusM": 2.7
							},
							{
								"x": 92.6829,
								"y": 69.4444,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							}
						]
					}
				}
			}
		},
		{
			"id": "demo_v7_area_ovinos_caprinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Potrero",
				"title": "Potrero de ovinos y caprinos · ejemplo",
				"data": {
					"name": "Potrero de ovinos y caprinos · ejemplo",
					"usage": "Potrero",
					"areaSqM": 5904,
					"shape": "Rectangular",
					"lengthM": 82,
					"widthM": 72,
					"diameterM": null,
					"color": "#557347",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 21.6156862745,
					"mapY": 31.0745098039,
					"mapWidth": 24.7607843137,
					"mapHeight": 21.7411764706,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true,
					"waterTrough": {
						"version": 1,
						"source": "fictional-demo",
						"x": 86,
						"y": 15,
						"lengthM": 4,
						"widthM": 1.5,
						"heightM": .65
					},
					"boundaryPlanting": {
						"version": 1,
						"source": "fictional-demo",
						"layoutWidthM": 82,
						"layoutHeightM": 72,
						"plants": [
							{
								"x": 13.4146,
								"y": 8.3333,
								"kind": "broadleaf",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 13.4146,
								"y": 91.6667,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 40.2439,
								"y": 8.3333,
								"kind": "palm",
								"heightM": 6.7,
								"crownRadiusM": 2.6
							},
							{
								"x": 40.2439,
								"y": 91.6667,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 67.0732,
								"y": 8.3333,
								"kind": "broadleaf",
								"heightM": 9,
								"crownRadiusM": 2.7
							},
							{
								"x": 67.0732,
								"y": 91.6667,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 38.8889,
								"kind": "palm",
								"heightM": 5.5,
								"crownRadiusM": 2.6
							},
							{
								"x": 92.6829,
								"y": 38.8889,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 7.3171,
								"y": 69.4444,
								"kind": "broadleaf",
								"heightM": 10,
								"crownRadiusM": 2.7
							},
							{
								"x": 92.6829,
								"y": 69.4444,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							}
						]
					}
				}
			}
		},
		{
			"id": "demo_v7_area_tomate",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Cultivo",
				"title": "Parcela de Tomate · ejemplo",
				"data": {
					"name": "Parcela de Tomate · ejemplo",
					"usage": "Cultivo",
					"areaSqM": 1840,
					"shape": "Rectangular",
					"lengthM": 46,
					"widthM": 40,
					"diameterM": null,
					"color": "#92a85b",
					"crop": "Tomate",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 54.831372549,
					"mapY": .8784313725,
					"mapWidth": 13.8901960784,
					"mapHeight": 12.0784313725,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Las plantas mostradas son símbolos; no indican cantidad de plantas ni distancias de siembra."
				}
			}
		},
		{
			"id": "demo_v7_area_cebolla",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Cultivo",
				"title": "Parcela de Cebolla · ejemplo",
				"data": {
					"name": "Parcela de Cebolla · ejemplo",
					"usage": "Cultivo",
					"areaSqM": 1760,
					"shape": "Rectangular",
					"lengthM": 44,
					"widthM": 40,
					"diameterM": null,
					"color": "#92a85b",
					"crop": "Cebolla",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 70.5333333333,
					"mapY": .8784313725,
					"mapWidth": 13.2862745098,
					"mapHeight": 12.0784313725,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Las plantas mostradas son símbolos; no indican cantidad de plantas ni distancias de siembra."
				}
			}
		},
		{
			"id": "demo_v7_area_maiz",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Cultivo",
				"title": "Parcela de Maíz · ejemplo",
				"data": {
					"name": "Parcela de Maíz · ejemplo",
					"usage": "Cultivo",
					"areaSqM": 6300,
					"shape": "Rectangular",
					"lengthM": 70,
					"widthM": 90,
					"diameterM": null,
					"color": "#92a85b",
					"crop": "Maíz",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 85.631372549,
					"mapY": .8784313725,
					"mapWidth": 21.137254902,
					"mapHeight": 27.1764705882,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Las plantas mostradas son símbolos; no indican cantidad de plantas ni distancias de siembra."
				}
			}
		},
		{
			"id": "demo_v7_area_cilantro",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Cultivo",
				"title": "Parcela de Cilantro · ejemplo",
				"data": {
					"name": "Parcela de Cilantro · ejemplo",
					"usage": "Cultivo",
					"areaSqM": 1932,
					"shape": "Rectangular",
					"lengthM": 46,
					"widthM": 42,
					"diameterM": null,
					"color": "#92a85b",
					"crop": "Cilantro",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 54.831372549,
					"mapY": 15.3725490196,
					"mapWidth": 13.8901960784,
					"mapHeight": 12.6823529412,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Las plantas mostradas son símbolos; no indican cantidad de plantas ni distancias de siembra."
				}
			}
		},
		{
			"id": "demo_v7_area_perejil",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Cultivo",
				"title": "Parcela de Perejil · ejemplo",
				"data": {
					"name": "Parcela de Perejil · ejemplo",
					"usage": "Cultivo",
					"areaSqM": 1848,
					"shape": "Rectangular",
					"lengthM": 44,
					"widthM": 42,
					"diameterM": null,
					"color": "#92a85b",
					"crop": "Perejil",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 70.5333333333,
					"mapY": 15.3725490196,
					"mapWidth": 13.2862745098,
					"mapHeight": 12.6823529412,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Las plantas mostradas son símbolos; no indican cantidad de plantas ni distancias de siembra."
				}
			}
		},
		{
			"id": "demo_v7_area_soya",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Cultivo",
				"title": "Parcela de Soya · ejemplo",
				"data": {
					"name": "Parcela de Soya · ejemplo",
					"usage": "Cultivo",
					"areaSqM": 4620,
					"shape": "Rectangular",
					"lengthM": 70,
					"widthM": 66,
					"diameterM": null,
					"color": "#92a85b",
					"crop": "Soya",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 85.631372549,
					"mapY": 31.0745098039,
					"mapWidth": 21.137254902,
					"mapHeight": 19.9294117647,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Las plantas mostradas son símbolos; no indican cantidad de plantas ni distancias de siembra."
				}
			}
		},
		{
			"id": "demo_v1_area_casa",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Casa",
				"title": "Hacienda principal · ejemplo",
				"data": {
					"name": "Hacienda principal · ejemplo",
					"usage": "Casa",
					"areaSqM": 704,
					"shape": "Rectangular",
					"lengthM": 32,
					"widthM": 22,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 56.0392156863,
					"mapY": 57.0431372549,
					"mapWidth": 9.662745098,
					"mapHeight": 6.6431372549,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v7_area_galpon_principal",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Galpón",
				"title": "Galpón de maquinaria y heno · ejemplo",
				"data": {
					"name": "Galpón de maquinaria y heno · ejemplo",
					"usage": "Galpón",
					"areaSqM": 1120,
					"shape": "Rectangular",
					"lengthM": 40,
					"widthM": 28,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": -6.768627451,
					"mapY": 55.231372549,
					"mapWidth": 12.0784313725,
					"mapHeight": 8.4549019608,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v1_area_deposito",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Depósito",
				"title": "Depósito central · ejemplo",
				"data": {
					"name": "Depósito central · ejemplo",
					"usage": "Depósito",
					"areaSqM": 704,
					"shape": "Rectangular",
					"lengthM": 32,
					"widthM": 22,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 7.1215686275,
					"mapY": 57.0431372549,
					"mapWidth": 9.662745098,
					"mapHeight": 6.6431372549,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v1_area_corrales",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Vaquera / corrales",
				"title": "Vaquera y corral de manejo · ejemplo",
				"data": {
					"name": "Vaquera y corral de manejo · ejemplo",
					"usage": "Vaquera / corrales",
					"areaSqM": 1200,
					"shape": "Rectangular",
					"lengthM": 40,
					"widthM": 30,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 21.6156862745,
					"mapY": 54.6274509804,
					"mapWidth": 12.0784313725,
					"mapHeight": 9.0588235294,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true
				}
			}
		},
		{
			"id": "demo_v7_area_porcinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Otro",
				"title": "Módulo porcino · ejemplo",
				"data": {
					"name": "Módulo porcino · ejemplo",
					"usage": "Porqueriza",
					"areaSqM": 1020,
					"shape": "Rectangular",
					"lengthM": 34,
					"widthM": 30,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 36.1098039216,
					"mapY": 54.6274509804,
					"mapWidth": 10.2666666667,
					"mapHeight": 9.0588235294,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true
				}
			}
		},
		{
			"id": "demo_v1_area_galpon",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Galpón",
				"title": "Gallinero y patio de aves · ejemplo",
				"data": {
					"name": "Gallinero y patio de aves · ejemplo",
					"usage": "Gallinero",
					"areaSqM": 384,
					"shape": "Rectangular",
					"lengthM": 32,
					"widthM": 12,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": -6.768627451,
					"mapY": 67.9137254902,
					"mapWidth": 9.662745098,
					"mapHeight": 3.6235294118,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true
				}
			}
		},
		{
			"id": "demo_v7_area_codornices",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Otro",
				"title": "Módulo de codornices · ejemplo",
				"data": {
					"name": "Módulo de codornices · ejemplo",
					"usage": "Gallinero",
					"areaSqM": 144,
					"shape": "Rectangular",
					"lengthM": 12,
					"widthM": 12,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 4.7058823529,
					"mapY": 67.9137254902,
					"mapWidth": 3.6235294118,
					"mapHeight": 3.6235294118,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true
				}
			}
		},
		{
			"id": "demo_v7_area_conejos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Otro",
				"title": "Módulo de conejos · ejemplo",
				"data": {
					"name": "Módulo de conejos · ejemplo",
					"usage": "Galpón",
					"areaSqM": 144,
					"shape": "Rectangular",
					"lengthM": 12,
					"widthM": 12,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 10.1411764706,
					"mapY": 67.9137254902,
					"mapWidth": 3.6235294118,
					"mapHeight": 3.6235294118,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true
				}
			}
		},
		{
			"id": "demo_v7_area_aves_agua",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Otro",
				"title": "Patio de patos y gansos · ejemplo",
				"data": {
					"name": "Patio de patos y gansos · ejemplo",
					"usage": "Corral",
					"areaSqM": 1176,
					"shape": "Rectangular",
					"lengthM": 42,
					"widthM": 28,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 55.4352941176,
					"mapY": 44.9647058824,
					"mapWidth": 12.6823529412,
					"mapHeight": 8.4549019608,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal.",
					"fenced": true
				}
			}
		},
		{
			"id": "demo_v1_area_agua",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Laguna / agua",
				"title": "Laguna mayor de peces · ejemplo",
				"data": {
					"name": "Laguna mayor de peces · ejemplo",
					"usage": "Laguna / agua",
					"areaSqM": 1055.575132,
					"shape": "Ovalada",
					"lengthM": 42,
					"widthM": 32,
					"diameterM": null,
					"color": "#4f91a8",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 55.4352941176,
					"mapY": 34.0941176471,
					"mapWidth": 12.6823529412,
					"mapHeight": 9.662745098,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. 42 × 32 m son los ejes completos de la elipse; superficie π × 21 × 16 m²."
				}
			}
		},
		{
			"id": "demo_v7_area_laguna_menor",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Laguna / agua",
				"title": "Laguna menor acuícola · ejemplo",
				"data": {
					"name": "Laguna menor acuícola · ejemplo",
					"usage": "Laguna / agua",
					"areaSqM": 518.362788,
					"shape": "Ovalada",
					"lengthM": 30,
					"widthM": 22,
					"diameterM": null,
					"color": "#4f91a8",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 70.5333333333,
					"mapY": 35.9058823529,
					"mapWidth": 9.0588235294,
					"mapHeight": 6.6431372549,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. 30 × 22 m son los ejes completos de la elipse; superficie π × 15 × 11 m². Escenario visual, sin especificación de agua ni compatibilidad productiva."
				}
			}
		},
		{
			"id": "demo_v5_area_tank",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Tanque de agua",
				"title": "Tanque de agua · ejemplo",
				"data": {
					"name": "Tanque de agua · ejemplo",
					"usage": "Tanque de agua",
					"areaSqM": 78.539816,
					"shape": "Circular",
					"lengthM": 10,
					"widthM": 10,
					"diameterM": 10,
					"color": "#4f91a8",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 72.3450980392,
					"mapY": 47.3803921569,
					"mapWidth": 3.0196078431,
					"mapHeight": 3.0196078431,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Diámetro ficticio de 10 m; superficie de base π × 5² m². La capacidad no se ha calculado."
				}
			}
		},
		{
			"id": "demo_v1_area_potrero_sur",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Bosque / reserva",
				"title": "Reserva arbolada · ejemplo",
				"data": {
					"name": "Reserva arbolada · ejemplo",
					"usage": "Bosque / reserva",
					"areaSqM": 3016,
					"shape": "Rectangular",
					"lengthM": 58,
					"widthM": 52,
					"diameterM": null,
					"color": "#29442c",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 89.2549019608,
					"mapY": 53.4196078431,
					"mapWidth": 17.5137254902,
					"mapHeight": 15.7019607843,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v5_area_greenhouse",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Invernadero",
				"title": "Invernadero de práctica · ejemplo",
				"data": {
					"name": "Invernadero de práctica · ejemplo",
					"usage": "Invernadero",
					"areaSqM": 648,
					"shape": "Rectangular",
					"lengthM": 36,
					"widthM": 18,
					"diameterM": null,
					"color": "#92a85b",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 69.9294117647,
					"mapY": 53.4196078431,
					"mapWidth": 10.8705882353,
					"mapHeight": 5.4352941176,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Sin cultivo asignado; no añade una séptima especie a las seis parcelas."
				}
			}
		},
		{
			"id": "demo_v5_area_nursery",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Vivero",
				"title": "Vivero de práctica · ejemplo",
				"data": {
					"name": "Vivero de práctica · ejemplo",
					"usage": "Vivero",
					"areaSqM": 504,
					"shape": "Rectangular",
					"lengthM": 36,
					"widthM": 14,
					"diameterM": null,
					"color": "#92a85b",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 69.9294117647,
					"mapY": 60.062745098,
					"mapWidth": 10.8705882353,
					"mapHeight": 4.2274509804,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Sin cultivo asignado; plantas ilustrativas sin inventario botánico."
				}
			}
		},
		{
			"id": "demo_v5_area_compost",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Compostera",
				"title": "Compostera y lombricultura · ejemplo",
				"data": {
					"name": "Compostera y lombricultura · ejemplo",
					"usage": "Compostera",
					"areaSqM": 216,
					"shape": "Rectangular",
					"lengthM": 18,
					"widthM": 12,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 82.0078431373,
					"mapY": 65.4980392157,
					"mapWidth": 5.4352941176,
					"mapHeight": 3.6235294118,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v7_area_apiario",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Otro",
				"title": "Apiario de práctica · ejemplo",
				"data": {
					"name": "Apiario de práctica · ejemplo",
					"usage": "Apiario",
					"areaSqM": 480,
					"shape": "Rectangular",
					"lengthM": 16,
					"widthM": 30,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 82.6117647059,
					"mapY": 54.6274509804,
					"mapWidth": 4.831372549,
					"mapHeight": 9.0588235294,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Colmena y abeja son registros didácticos independientes; la abeja no representa el número de individuos de una colonia."
				}
			}
		},
		{
			"id": "demo_v1_area_vial",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Vías",
				"title": "Camino central norte–sur · ejemplo",
				"data": {
					"name": "Camino central norte–sur · ejemplo",
					"usage": "Vías",
					"areaSqM": 2e3,
					"shape": "Rectangular",
					"lengthM": 8,
					"widthM": 250,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 48.7921568627,
					"mapY": -2.7450980392,
					"mapWidth": 2.4156862745,
					"mapHeight": 75.4901960784,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. Camino de 8 m de ancho conectado al portón sur y a los accesos transversales."
				}
			}
		},
		{
			"id": "demo_v7_area_via_oeste",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Vías",
				"title": "Acceso transversal oeste · ejemplo",
				"data": {
					"name": "Acceso transversal oeste · ejemplo",
					"usage": "Vías",
					"areaSqM": 1568,
					"shape": "Rectangular",
					"lengthM": 196,
					"widthM": 8,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": -10.3921568627,
					"mapY": 28.6588235294,
					"mapWidth": 59.1843137255,
					"mapHeight": 2.4156862745,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v5_area_access_east",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Vías",
				"title": "Acceso transversal este · ejemplo",
				"data": {
					"name": "Acceso transversal este · ejemplo",
					"usage": "Vías",
					"areaSqM": 1568,
					"shape": "Rectangular",
					"lengthM": 196,
					"widthM": 8,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 51.2078431373,
					"mapY": 28.6588235294,
					"mapWidth": 59.1843137255,
					"mapHeight": 2.4156862745,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v7_area_via_servicios_oeste",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Vías",
				"title": "Camino de servicios oeste · ejemplo",
				"data": {
					"name": "Camino de servicios oeste · ejemplo",
					"usage": "Vías",
					"areaSqM": 1472,
					"shape": "Rectangular",
					"lengthM": 184,
					"widthM": 8,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": -6.768627451,
					"mapY": 64.8941176471,
					"mapWidth": 55.5607843137,
					"mapHeight": 2.4156862745,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v7_area_via_servicios_este",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Vías",
				"title": "Camino de servicios este · ejemplo",
				"data": {
					"name": "Camino de servicios este · ejemplo",
					"usage": "Vías",
					"areaSqM": 800,
					"shape": "Rectangular",
					"lengthM": 100,
					"widthM": 8,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 51.2078431373,
					"mapY": 64.8941176471,
					"mapWidth": 30.1960784314,
					"mapHeight": 2.4156862745,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal."
				}
			}
		},
		{
			"id": "demo_v7_area_cerca_perimetral",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Cerca",
				"title": "Cerca perimetral de madera y alambre · ejemplo",
				"data": {
					"name": "Cerca perimetral de madera y alambre · ejemplo",
					"usage": "Cerca",
					"areaSqM": 130,
					"shape": "Rectangular",
					"lengthM": 1300,
					"widthM": .1,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": -10.3921568627,
					"mapY": -2.7450980392,
					"mapWidth": 120.7843137255,
					"mapHeight": 75.4901960784,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. El contorno encierra los 400 × 250 m de la finca. Los 1.300 m lineales de postes de madera y alambre ocupan una franja nominal de 0,10 m (130 m²); esta huella no vuelve a sumar las 10 ha encerradas. Los portones son accesos independientes en el perímetro.",
					"boundaryPlanting": {
						"version": 1,
						"source": "fictional-demo",
						"layoutWidthM": 400,
						"layoutHeightM": 250,
						"plants": [
							{
								"x": 2.75,
								"y": 2.4,
								"kind": "palm",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 8.75,
								"y": 2.4,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.6
							},
							{
								"x": 14.75,
								"y": 2.4,
								"kind": "palm",
								"heightM": 9,
								"crownRadiusM": 2.7
							},
							{
								"x": 20.75,
								"y": 2.4,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.6
							},
							{
								"x": 26.75,
								"y": 2.4,
								"kind": "palm",
								"heightM": 10,
								"crownRadiusM": 2.7
							},
							{
								"x": 26.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 32.75,
								"y": 2.4,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.6
							},
							{
								"x": 32.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 38.75,
								"y": 2.4,
								"kind": "palm",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 38.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 44.75,
								"y": 2.4,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.6
							},
							{
								"x": 44.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 56.75,
								"y": 2.4,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.6
							},
							{
								"x": 56.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 62.75,
								"y": 2.4,
								"kind": "palm",
								"heightM": 10,
								"crownRadiusM": 2.7
							},
							{
								"x": 62.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 68.75,
								"y": 2.4,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.6
							},
							{
								"x": 68.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 74.75,
								"y": 2.4,
								"kind": "palm",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 74.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 80.75,
								"y": 2.4,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.6
							},
							{
								"x": 80.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 86.75,
								"y": 2.4,
								"kind": "palm",
								"heightM": 9,
								"crownRadiusM": 2.7
							},
							{
								"x": 86.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 92.75,
								"y": 2.4,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.6
							},
							{
								"x": 92.75,
								"y": 97.6,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 1.5,
								"y": 12,
								"kind": "palm",
								"heightM": 10,
								"crownRadiusM": 2.7
							},
							{
								"x": 98.5,
								"y": 12,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 1.5,
								"y": 21.6,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.6
							},
							{
								"x": 98.5,
								"y": 21.6,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 1.5,
								"y": 31.2,
								"kind": "palm",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 98.5,
								"y": 31.2,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 1.5,
								"y": 50.4,
								"kind": "palm",
								"heightM": 9,
								"crownRadiusM": 2.7
							},
							{
								"x": 98.5,
								"y": 50.4,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 1.5,
								"y": 60,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.6
							},
							{
								"x": 98.5,
								"y": 60,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							},
							{
								"x": 1.5,
								"y": 69.6,
								"kind": "palm",
								"heightM": 10,
								"crownRadiusM": 2.7
							},
							{
								"x": 98.5,
								"y": 69.6,
								"kind": "broadleaf",
								"heightM": 5.5,
								"crownRadiusM": 2.9
							},
							{
								"x": 1.5,
								"y": 79.2,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.6
							},
							{
								"x": 98.5,
								"y": 79.2,
								"kind": "broadleaf",
								"heightM": 6.7,
								"crownRadiusM": 2.9
							},
							{
								"x": 1.5,
								"y": 88.8,
								"kind": "palm",
								"heightM": 8,
								"crownRadiusM": 2.7
							},
							{
								"x": 98.5,
								"y": 88.8,
								"kind": "broadleaf",
								"heightM": 6.1,
								"crownRadiusM": 2.9
							}
						]
					}
				}
			}
		},
		{
			"id": "demo_v7_area_porton_sur",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Portón",
				"title": "Portón principal sur · ejemplo",
				"data": {
					"name": "Portón principal sur · ejemplo",
					"usage": "Portón",
					"areaSqM": 8,
					"shape": "Rectangular",
					"lengthM": 8,
					"widthM": 1,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 48.7921568627,
					"mapY": 72.4431372549,
					"mapWidth": 2.4156862745,
					"mapHeight": .3019607843,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. La superficie corresponde a la franja nominal del acceso; se superpone al límite y no es otra parcela productiva."
				}
			}
		},
		{
			"id": "demo_v7_area_porton_oeste",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Portón",
				"title": "Portón de servicio oeste · ejemplo",
				"data": {
					"name": "Portón de servicio oeste · ejemplo",
					"usage": "Portón",
					"areaSqM": 8,
					"shape": "Rectangular",
					"lengthM": 1,
					"widthM": 8,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": -10.3921568627,
					"mapY": 28.6588235294,
					"mapWidth": .3019607843,
					"mapHeight": 2.4156862745,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. La superficie corresponde a la franja nominal del acceso; se superpone al límite y no es otra parcela productiva."
				}
			}
		},
		{
			"id": "demo_v7_area_porton_este",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Portón",
				"title": "Portón de servicio este · ejemplo",
				"data": {
					"name": "Portón de servicio este · ejemplo",
					"usage": "Portón",
					"areaSqM": 8,
					"shape": "Rectangular",
					"lengthM": 1,
					"widthM": 8,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 110.0901960784,
					"mapY": 28.6588235294,
					"mapWidth": .3019607843,
					"mapHeight": 2.4156862745,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. La superficie corresponde a la franja nominal del acceso; se superpone al límite y no es otra parcela productiva."
				}
			}
		},
		{
			"id": "demo_v7_area_porton_norte",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Portón",
				"title": "Portón de servicio norte · ejemplo",
				"data": {
					"name": "Portón de servicio norte · ejemplo",
					"usage": "Portón",
					"areaSqM": 8,
					"shape": "Rectangular",
					"lengthM": 8,
					"widthM": 1,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 48.7921568627,
					"mapY": -2.7450980392,
					"mapWidth": 2.4156862745,
					"mapHeight": .3019607843,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. La superficie corresponde a la franja nominal del acceso; se superpone al límite y no es otra parcela productiva."
				}
			}
		},
		{
			"id": "demo_v7_area_porton_bovinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Portón",
				"title": "Portón del potrero bovino · ejemplo",
				"data": {
					"name": "Portón del potrero bovino · ejemplo",
					"usage": "Portón",
					"areaSqM": 6,
					"shape": "Rectangular",
					"lengthM": 6,
					"widthM": 1,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 4.7058823529,
					"mapY": 28.3568627451,
					"mapWidth": 1.8117647059,
					"mapHeight": .3019607843,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. La superficie corresponde a la franja nominal del acceso; se superpone al límite y no es otra parcela productiva."
				}
			}
		},
		{
			"id": "demo_v7_area_porton_bufalos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Portón",
				"title": "Portón del potrero de búfalos · ejemplo",
				"data": {
					"name": "Portón del potrero de búfalos · ejemplo",
					"usage": "Portón",
					"areaSqM": 6,
					"shape": "Rectangular",
					"lengthM": 6,
					"widthM": 1,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 33.0901960784,
					"mapY": 28.3568627451,
					"mapWidth": 1.8117647059,
					"mapHeight": .3019607843,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. La superficie corresponde a la franja nominal del acceso; se superpone al límite y no es otra parcela productiva."
				}
			}
		},
		{
			"id": "demo_v7_area_porton_equinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Portón",
				"title": "Portón del potrero de equinos · ejemplo",
				"data": {
					"name": "Portón del potrero de equinos · ejemplo",
					"usage": "Portón",
					"areaSqM": 6,
					"shape": "Rectangular",
					"lengthM": 6,
					"widthM": 1,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 4.7058823529,
					"mapY": 31.0745098039,
					"mapWidth": 1.8117647059,
					"mapHeight": .3019607843,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. La superficie corresponde a la franja nominal del acceso; se superpone al límite y no es otra parcela productiva."
				}
			}
		},
		{
			"id": "demo_v7_area_porton_ovinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "area",
				"category": "Portón",
				"title": "Portón del potrero de ovinos y caprinos · ejemplo",
				"data": {
					"name": "Portón del potrero de ovinos y caprinos · ejemplo",
					"usage": "Portón",
					"areaSqM": 6,
					"shape": "Rectangular",
					"lengthM": 6,
					"widthM": 1,
					"diameterM": null,
					"color": "#a58a69",
					"crop": "",
					"cropVariety": "",
					"mapLayoutVersion": 2,
					"mapX": 33.0901960784,
					"mapY": 31.0745098039,
					"mapWidth": 1.8117647059,
					"mapHeight": .3019607843,
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Composición ficticia proporcional de 400 × 250 m; no es un levantamiento ni una recomendación de distribución o carga animal. La superficie corresponde a la franja nominal del acceso; se superpone al límite y no es otra parcela productiva."
				}
			}
		},
		{
			"id": "demo_v1_cycle_bovinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "production-cycle",
				"category": "Ganadería bovina",
				"title": "Seguimiento de Alba · ejemplo",
				"data": {
					"objective": "Registrar pesajes y revisar el historial individual.",
					"startDate": "2026-09-01",
					"endDate": "2026-12-15",
					"status": "Activo",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Fechas de interfaz; no son plazos técnicos recomendados."
				}
			}
		},
		{
			"id": "demo_v1_cycle_porcinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "production-cycle",
				"category": "Porcicultura",
				"title": "Lote piloto porcino · ejemplo",
				"data": {
					"objective": "Consolidar pesajes de Trigo y notas del lote.",
					"startDate": "2026-09-02",
					"endDate": "2026-12-16",
					"status": "Activo",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Fechas de interfaz; no son plazos técnicos recomendados."
				}
			}
		},
		{
			"id": "demo_v1_cycle_aves",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "production-cycle",
				"category": "Avicultura",
				"title": "Registro de aves · ejemplo",
				"data": {
					"objective": "Practicar el seguimiento de consumo y producción.",
					"startDate": "2026-09-03",
					"endDate": "2026-12-17",
					"status": "Activo",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Fechas de interfaz; no son plazos técnicos recomendados."
				}
			}
		},
		{
			"id": "demo_v1_cycle_peces",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "production-cycle",
				"category": "Piscicultura",
				"title": "Evaluación de un módulo acuícola · ejemplo",
				"data": {
					"objective": "Comparar escenarios de costos con los registros acuícolas ficticios.",
					"startDate": "2026-09-04",
					"endDate": "2026-12-18",
					"status": "Planificado",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Fechas de interfaz; no son plazos técnicos recomendados.",
					"areaId": "demo_v1_area_agua"
				}
			}
		},
		{
			"id": "demo_v1_cycle_cacao",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "production-cycle",
				"category": "Cultivos",
				"title": "Cosecha de tomate · ejemplo",
				"data": {
					"objective": "Registrar selección, pesaje y trazabilidad de tomates por lote.",
					"startDate": "2026-09-05",
					"endDate": "2026-12-19",
					"status": "Activo",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Fechas de interfaz; no son plazos técnicos recomendados.",
					"areaId": "demo_v7_area_tomate"
				}
			}
		},
		{
			"id": "demo_v1_cycle_cafe",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "production-cycle",
				"category": "Cultivos",
				"title": "Preparación de cosecha de maíz · ejemplo",
				"data": {
					"objective": "Organizar herramientas y hojas de recepción.",
					"startDate": "2026-09-06",
					"endDate": "2026-12-20",
					"status": "Planificado",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Fechas de interfaz; no son plazos técnicos recomendados.",
					"areaId": "demo_v7_area_maiz"
				}
			}
		},
		{
			"id": "demo_v1_cycle_abejas",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "production-cycle",
				"category": "Apicultura",
				"title": "Registro de apiario · ejemplo",
				"data": {
					"objective": "Practicar el seguimiento del módulo ficticio de abejas y colmenas.",
					"startDate": "2026-09-07",
					"endDate": "2026-12-21",
					"status": "Planificado",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Fechas de interfaz; no son plazos técnicos recomendados.",
					"areaId": "demo_v7_area_apiario"
				}
			}
		},
		{
			"id": "demo_v1_cycle_genetica",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "production-cycle",
				"category": "Genética",
				"title": "Revisión del registro bovino · ejemplo",
				"data": {
					"objective": "Organizar identificación y antecedentes; no certifica genética.",
					"startDate": "2026-09-08",
					"endDate": "2026-12-22",
					"status": "En pausa",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Fechas de interfaz; no son plazos técnicos recomendados."
				}
			}
		},
		{
			"id": "demo_v1_inventory_heno",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Alimentos y forrajes",
				"title": "Heno seco en pacas",
				"data": {
					"quantity": 24,
					"unit": "paca",
					"minimum": 8,
					"location": "Depósito central · zona seca",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Pacas ficticias identificadas como DEM-H01. La cantidad cuenta pacas, no kilogramos.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_alimento",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Alimentos y forrajes",
				"title": "Alimento almacenado para aves",
				"data": {
					"quantity": 6,
					"unit": "saco",
					"minimum": 3,
					"location": "Depósito central · estante A",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Sacos de ejemplo de 40 kg. Referencia de empaque; no representa una recomendación alimentaria.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_vitaminas",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Vitaminas y medicinas",
				"title": "Envase de vitaminas veterinarias · muestra",
				"data": {
					"quantity": 2,
					"unit": "envase",
					"minimum": 2,
					"location": "Gabinete sanitario · estante 1",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Artículo genérico sin marca ni principio activo. Sin dosis ni indicación de uso; sirve para practicar el control de envases.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_botiquin",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Vitaminas y medicinas",
				"title": "Gasas para botiquín",
				"data": {
					"quantity": 5,
					"unit": "caja",
					"minimum": 2,
					"location": "Gabinete sanitario · estante 2",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Cajas demostrativas cerradas. Registrar lote y vencimiento reales cuando se disponga de ellos.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_maiz",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Semillas",
				"title": "Semilla de maíz · lote de práctica",
				"data": {
					"quantity": 12,
					"unit": "kg",
					"minimum": 5,
					"location": "Depósito central · estante B",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Lote DEM-S01. Identificación ficticia; no implica certificación, germinación ni procedencia verificadas.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_hortalizas",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Semillas",
				"title": "Semillas de hortalizas · sobres de práctica",
				"data": {
					"quantity": 20,
					"unit": "sobre",
					"minimum": 6,
					"location": "Depósito central · cajón B2",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Sobres de ejemplo separados por rubro. Edita especie, variedad y lote según tu registro real.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_abono",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Fertilizantes y control",
				"title": "Abono orgánico ensacado",
				"data": {
					"quantity": 10,
					"unit": "saco",
					"minimum": 4,
					"location": "Depósito central · zona de insumos",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Sacos ficticios de 25 kg para mostrar empaque. No indica composición, dosis ni frecuencia de aplicación.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_trampas",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Fertilizantes y control",
				"title": "Trampas adhesivas de monitoreo",
				"data": {
					"quantity": 12,
					"unit": "unidad",
					"minimum": 5,
					"location": "Depósito central · estante C",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Material demostrativo de observación. No constituye diagnóstico ni programa de control.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_sal",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Sal, melaza y suplementos",
				"title": "Sal mineral ensacada · ejemplo",
				"data": {
					"quantity": 3,
					"unit": "saco",
					"minimum": 3,
					"location": "Depósito central · estante D",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Sacos ficticios de 20 kg. Composición y uso por definir con el profesional responsable.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_melaza",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Sal, melaza y suplementos",
				"title": "Melaza en envase cerrado",
				"data": {
					"quantity": 40,
					"unit": "litro",
					"minimum": 15,
					"location": "Depósito central · zona de recipientes",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Cantidad sintética para registrar entradas y salidas; no es una ración o indicación de mezcla.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_alambre",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Herramientas y cercas",
				"title": "Alambre para reparación de cerca",
				"data": {
					"quantity": 2,
					"unit": "rollo",
					"minimum": 1,
					"location": "Depósito central · panel de herramientas",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Rollos de práctica de 100 m. Sin garantía de resistencia ni especificación para una instalación concreta.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_palas",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Herramientas y cercas",
				"title": "Palas de trabajo",
				"data": {
					"quantity": 4,
					"unit": "unidad",
					"minimum": 2,
					"location": "Depósito central · panel de herramientas",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Herramientas ficticias numeradas DEM-T01 a DEM-T04. Permite practicar reposición y ubicación.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_diesel",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Combustible y lubricantes",
				"title": "Diésel · control de existencias",
				"data": {
					"quantity": 25,
					"unit": "litro",
					"minimum": 10,
					"location": "Área técnica · almacenamiento identificado",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Existencia ficticia; no documenta compra ni cumplimiento de condiciones de almacenamiento.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_aceite",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Combustible y lubricantes",
				"title": "Aceite lubricante · envases de práctica",
				"data": {
					"quantity": 4,
					"unit": "envase",
					"minimum": 2,
					"location": "Área técnica · gabinete",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Envases de ejemplo de 1 litro. Compatibilidad, especificación y mantenimiento por verificar en el equipo real.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_sacos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Otros insumos",
				"title": "Sacos vacíos de recolección",
				"data": {
					"quantity": 30,
					"unit": "unidad",
					"minimum": 10,
					"location": "Depósito central · estante E",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Sacos demostrativos limpios para identificar lotes. Sin capacidad ni uso alimentario certificados.",
					"areaId": "demo_v1_area_deposito"
				}
			}
		},
		{
			"id": "demo_v1_inventory_etiquetas",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "inventory",
				"category": "Otros insumos",
				"title": "Etiquetas de identificación",
				"data": {
					"quantity": 100,
					"unit": "unidad",
					"minimum": 25,
					"location": "Hacienda principal · archivador",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Etiquetas sintéticas para animales, pesajes y cosechas de práctica. Sin códigos oficiales.",
					"areaId": "demo_v1_area_casa"
				}
			}
		},
		{
			"id": "demo_v1_finance_alimento",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "finance",
				"category": "Costo",
				"title": "Alimento del lote · ejemplo",
				"data": {
					"kind": "Costo",
					"amount": 120,
					"date": "2026-09-05",
					"supplier": "Proveedor ficticio A",
					"invoiceReference": "DEM-REF-ALIMENTO",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Monto en USD creado únicamente para probar cálculos; referencia no fiscal."
				}
			}
		},
		{
			"id": "demo_v1_finance_herramientas",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "finance",
				"category": "Inversión",
				"title": "Herramientas de trabajo · ejemplo",
				"data": {
					"kind": "Inversión",
					"amount": 85,
					"date": "2026-09-08",
					"supplier": "Proveedor ficticio B",
					"invoiceReference": "DEM-REF-HERRAMIENTAS",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Monto en USD creado únicamente para probar cálculos; referencia no fiscal."
				}
			}
		},
		{
			"id": "demo_v1_finance_transporte",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "finance",
				"category": "Costo",
				"title": "Traslado de insumos · ejemplo",
				"data": {
					"kind": "Costo",
					"amount": 35,
					"date": "2026-09-10",
					"supplier": "Servicio ficticio C",
					"invoiceReference": "DEM-REF-TRANSPORTE",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Monto en USD creado únicamente para probar cálculos; referencia no fiscal."
				}
			}
		},
		{
			"id": "demo_v1_finance_cacao",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "finance",
				"category": "Cultivos",
				"title": "Ingreso de tomates · ejemplo",
				"data": {
					"kind": "Ingreso",
					"amount": 300,
					"date": "2026-09-25",
					"supplier": "Comprador ficticio A",
					"invoiceReference": "DEM-REF-TOMATE",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Monto en USD creado únicamente para probar cálculos; referencia no fiscal."
				}
			}
		},
		{
			"id": "demo_v1_finance_huevos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "finance",
				"category": "Ingreso",
				"title": "Ingreso de huevos · ejemplo",
				"data": {
					"kind": "Ingreso",
					"amount": 60,
					"date": "2026-09-28",
					"supplier": "Comprador ficticio B",
					"invoiceReference": "DEM-REF-HUEVOS",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Monto en USD creado únicamente para probar cálculos; referencia no fiscal."
				}
			}
		},
		{
			"id": "demo_v1_health_bovinos",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "health",
				"category": "Bovinos",
				"title": "Revisión visual registrada · ejemplo",
				"data": {
					"event": "Revisión visual registrada · ejemplo",
					"group": "Alba DEM-B01",
					"date": "2026-09-20",
					"nextDate": "2026-10-20",
					"product": "",
					"batch": "",
					"professional": "Responsable de ejemplo · sin credencial asignada",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Agenda administrativa simulada. No documenta diagnóstico, tratamiento, vacunación ni aptitud sanitaria; no prescribe una frecuencia de atención."
				}
			}
		},
		{
			"id": "demo_v1_health_aves",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "health",
				"category": "Avicultura",
				"title": "Revisión del registro sanitario · ejemplo",
				"data": {
					"event": "Revisión del registro sanitario · ejemplo",
					"group": "Nube DEM-A01",
					"date": "2026-09-22",
					"nextDate": "2026-10-22",
					"product": "",
					"batch": "",
					"professional": "Responsable de ejemplo · sin credencial asignada",
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Agenda administrativa simulada. No documenta diagnóstico, tratamiento, vacunación ni aptitud sanitaria; no prescribe una frecuencia de atención."
				}
			}
		},
		{
			"id": "demo_v1_plan_aves",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "plan",
				"category": "Gallinas ponedoras",
				"title": "Escenario editable de aves · ejemplo",
				"data": {
					"quantity": 12,
					"days": 30,
					"feedPerUnit": 3,
					"waterPerUnitDay": .4,
					"areaPerUnit": 1,
					"costPerUnit": 6,
					"expectedRevenue": 120,
					"totals": {
						"feed": 36,
						"water": 144,
						"area": 12,
						"variableCost": 72,
						"margin": 48
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Coeficientes arbitrarios para aprender a usar la calculadora. No son recomendaciones agronómicas ni promesas de rendimiento.",
					"assumptionsReviewed": false
				}
			}
		},
		{
			"id": "demo_v1_plan_cacao",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "plan",
				"category": "Cultivos",
				"title": "Escenario editable de maíz · ejemplo",
				"data": {
					"quantity": 100,
					"days": 90,
					"feedPerUnit": 1,
					"waterPerUnitDay": 1,
					"areaPerUnit": 4,
					"costPerUnit": 2,
					"expectedRevenue": 300,
					"totals": {
						"feed": 100,
						"water": 9e3,
						"area": 400,
						"variableCost": 200,
						"margin": 100
					},
					"notes": "Ejemplo ficticio editable. No representa existencias, precios ni actividades reales. Coeficientes arbitrarios para aprender a usar la calculadora. No son recomendaciones agronómicas ni promesas de rendimiento.",
					"assumptionsReviewed": false
				}
			}
		},
		{
			"id": "demo_v4_task_cerca",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "task",
				"category": "Mantenimiento",
				"title": "Revisar cerca · tarea ficticia",
				"data": {
					"areaId": "demo_v1_area_potrero_norte",
					"status": "Pendiente",
					"date": "2026-10-09",
					"notes": "Ejercicio de aprendizaje. No representa trabajo real ni una recomendación técnica."
				}
			}
		},
		{
			"id": "demo_v4_task_agua",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "task",
				"category": "Mantenimiento",
				"title": "Revisar entrada de agua · tarea ficticia",
				"data": {
					"areaId": "demo_v1_area_agua",
					"status": "Completada",
					"date": "2026-10-07",
					"notes": "Ejercicio de aprendizaje. No representa trabajo real ni una recomendación técnica."
				}
			}
		},
		{
			"id": "demo_v1_health_alba_vaccination",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "health",
				"category": "Bovino",
				"title": "Vacunación registrada · ejemplo ficticio",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"eventType": "vaccination",
					"date": "2026-06-05",
					"professional": "Responsable ficticio de la demostración",
					"notes": "Registro enteramente ficticio para aprender a usar el expediente. No documenta salud, manejo, diagnóstico ni tratamiento de ningún animal real.",
					"event": "Vacunación registrada · ejemplo ficticio",
					"nextDate": "",
					"product": "",
					"batch": "",
					"group": ""
				}
			}
		},
		{
			"id": "demo_v1_health_alba_deworming",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "health",
				"category": "Bovino",
				"title": "Desparasitación registrada · ejemplo ficticio",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"eventType": "deworming",
					"date": "2026-07-12",
					"professional": "Responsable ficticio de la demostración",
					"notes": "Registro enteramente ficticio para aprender a usar el expediente. No documenta salud, manejo, diagnóstico ni tratamiento de ningún animal real.",
					"event": "Desparasitación registrada · ejemplo ficticio",
					"nextDate": "",
					"product": "",
					"batch": "",
					"group": ""
				}
			}
		},
		{
			"id": "demo_v1_health_alba_illness",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "health",
				"category": "Bovino",
				"title": "Observación de enfermedad · ejemplo ficticio",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"eventType": "illness",
					"date": "2026-08-16",
					"professional": "Responsable ficticio de la demostración",
					"notes": "Registro enteramente ficticio para aprender a usar el expediente. No documenta salud, manejo, diagnóstico ni tratamiento de ningún animal real.",
					"event": "Observación de enfermedad · ejemplo ficticio",
					"nextDate": "",
					"product": "",
					"batch": "",
					"group": ""
				}
			}
		},
		{
			"id": "demo_v1_health_alba_review",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "health",
				"category": "Bovino",
				"title": "Revisión individual · ejemplo ficticio",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"eventType": "review",
					"date": "2026-09-20",
					"professional": "Responsable ficticio de la demostración",
					"notes": "Registro enteramente ficticio para aprender a usar el expediente. No documenta salud, manejo, diagnóstico ni tratamiento de ningún animal real.",
					"event": "Revisión individual · ejemplo ficticio",
					"nextDate": "",
					"product": "",
					"batch": "",
					"group": ""
				}
			}
		},
		{
			"id": "demo_v1_reproduction_alba_pregnancy_check",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "reproduction",
				"category": "Bovino",
				"title": "Control reproductivo · ejemplo ficticio",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"eventType": "pregnancy-check",
					"date": "2026-03-02",
					"professional": "Responsable ficticio de la demostración",
					"notes": "Registro enteramente ficticio para aprender a usar el expediente. No documenta salud, manejo, diagnóstico ni tratamiento de ningún animal real.",
					"outcome": "Dato ficticio; no confirma un estado actual ni crea una ficha de cría."
				}
			}
		},
		{
			"id": "demo_v1_reproduction_alba_birth",
			"payload": {
				"farmId": "demo_v1_farm_horizonte",
				"recordType": "reproduction",
				"category": "Bovino",
				"title": "Parto registrado · ejemplo ficticio",
				"data": {
					"animalId": "demo_v1_animal_alba",
					"animalTitle": "Alba · ejemplo",
					"eventType": "birth",
					"date": "2026-09-12",
					"professional": "Responsable ficticio de la demostración",
					"notes": "Registro enteramente ficticio para aprender a usar el expediente. No documenta salud, manejo, diagnóstico ni tratamiento de ningún animal real.",
					"outcome": "Dato ficticio; no confirma un estado actual ni crea una ficha de cría."
				}
			}
		}
	],
	listings: [{
		"id": "demo_v1_listing_cacao",
		"payload": {
			"title": "Lote de tomates · borrador de ejemplo",
			"category": "Tomate",
			"status": "draft",
			"location": "Zona de ejemplo · sin ubicación real"
		}
	}, {
		"id": "demo_v1_listing_aves",
		"payload": {
			"title": "Aves · borrador de ejemplo",
			"category": "Avicultura",
			"status": "draft",
			"location": "Zona de ejemplo · sin ubicación real"
		}
	}]
};
//#endregion
export { farm_demo_fixture_default as t };
