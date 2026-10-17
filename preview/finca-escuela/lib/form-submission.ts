/** Synchronous guard lives outside React render timing and may be shared across reopened dialogs. */
export function createSubmissionGate() {
  let busy=false;
  return {
    get busy(){return busy;},
    async run<T>(save:()=>Promise<T>|T):Promise<T>{
      if(busy)throw new Error("Espera: hay un guardado en curso. No vuelvas a pulsar Guardar.");
      busy=true;
      try{return await save();}finally{busy=false;}
    },
  };
}

/** Prevent native navigation even when a repeated submission is rejected by the gate. */
export async function submitGuardedForm(event:{preventDefault:()=>void},gate:ReturnType<typeof createSubmissionGate>,save:()=>Promise<unknown>|unknown,onError:(error:unknown)=>void):Promise<void> {
  event.preventDefault();
  try {await gate.run(save);} catch(error) {onError(error);}
}
