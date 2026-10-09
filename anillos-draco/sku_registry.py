from pathlib import Path
import json,re
ROOT=Path(__file__).parent

def apply_skus(products):
 path=ROOT/'data/sku-registry.json'
 registry=json.loads(path.read_text()) if path.exists() else {}
 if len(set(registry.values()))!=len(registry):raise ValueError('Duplicate SKU registry values')
 highest=max([int(x.split('-')[-1]) for x in registry.values()]+[0])
 for p in products:
  if p['id'] not in registry:
   highest+=1;registry[p['id']]=f'DRC-{highest:04d}'
  p['sku']=registry[p['id']]
 path.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
 return products
if __name__=='__main__':
 p=ROOT/'data/catalog.json';products=apply_skus(json.loads(p.read_text()));p.write_text(json.dumps(products,ensure_ascii=False,indent=2)+'\n');print('Permanent SKUs assigned:',len(products))
