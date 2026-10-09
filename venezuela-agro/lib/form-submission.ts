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
