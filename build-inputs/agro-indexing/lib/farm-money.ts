import { currencySchema, type Currency } from './exchange-rates';

/** Historical finance/planning forms were explicitly USD. Missing currency preserves that meaning. */
export function farmRecordCurrency(data:Record<string,unknown>):Currency|null {
  if(data.currency===undefined)return 'USD';
  const parsed=currencySchema.safeParse(data.currency);
  return parsed.success?parsed.data:null;
}
export function summarizeFarmMoney(records:{payload:{data:Record<string,unknown>}}[]) {
  const groups:Partial<Record<Currency,{income:number;cost:number;count:number}>>={};
  let legacyCount=0,invalidCount=0;
  for(const {payload:{data}} of records){
    const currency=farmRecordCurrency(data),amount=typeof data.amount==='number'?data.amount:typeof data.amount==='string'&&data.amount.trim()!==''?Number(data.amount):NaN;
    if(!currency||!Number.isFinite(amount)||amount<0){invalidCount++;continue;}
    const group=groups[currency]??{income:0,cost:0,count:0};
    if(data.kind==='Ingreso')group.income+=amount;else group.cost+=amount;
    group.count++;groups[currency]=group;
    if(data.currency===undefined)legacyCount++;
  }
  return {groups,legacyCount,invalidCount};
}
