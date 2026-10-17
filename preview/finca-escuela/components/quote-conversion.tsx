'use client';

import { CurrencyCalculator } from '@/components/currency-calculator';

/** No amount is inferred, saved as a price, or included in a quote request. */
export function QuoteConversion({context,demo=false}:{context:string;demo?:boolean}) {
  return <CurrencyCalculator compact title="Convertir un importe recibido" description={`${context}: no hay un precio publicado para convertir. ${demo?'Puedes probar con un importe ficticio; este ejemplo no ofrece una venta ni un servicio real.':'Si recibes una cotización, introduce su importe y moneda original para consultar una equivalencia.'} Se convierte exactamente la cifra escrita, sin multiplicarla por cantidad ni asumir un precio por unidad. El cálculo no fija el precio de este producto o servicio.`}/>;
}
