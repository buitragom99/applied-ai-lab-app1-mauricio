export const SAMPLE_SALES_CSV = `quarter,region,channel,product,units,discount_pct,revenue
Q1,North America,Direct Enterprise,Cloud ERP Suite,120,5.0,720000
Q1,North America,Digital Online,AI Analytics Core,310,12.0,465000
Q1,North America,Strategic Partner,CyberSec Gateway,190,15.0,380000
Q1,North America,Wholesale Distributor,Mobile Device Fleet,450,18.0,450000
Q1,EMEA,Direct Enterprise,Cloud ERP Suite,90,6.0,540000
Q1,EMEA,Digital Online,AI Analytics Core,220,10.0,330000
Q1,EMEA,Strategic Partner,CyberSec Gateway,160,14.0,320000
Q1,EMEA,Wholesale Distributor,Mobile Device Fleet,300,16.0,300000
Q1,APAC,Direct Enterprise,Cloud ERP Suite,70,8.0,420000
Q1,APAC,Digital Online,AI Analytics Core,180,15.0,270000
Q1,APAC,Strategic Partner,CyberSec Gateway,110,12.0,220000
Q1,APAC,Wholesale Distributor,Mobile Device Fleet,200,20.0,200000
Q1,Latin America,Direct Enterprise,Cloud ERP Suite,40,7.0,240000
Q1,Latin America,Digital Online,AI Analytics Core,80,14.0,120000
Q1,Latin America,Strategic Partner,CyberSec Gateway,50,15.0,100000
Q2,North America,Direct Enterprise,Cloud ERP Suite,145,6.0,870000
Q2,North America,Digital Online,AI Analytics Core,340,11.0,510000
Q2,North America,Strategic Partner,CyberSec Gateway,240,14.0,480000
Q2,North America,Wholesale Distributor,Mobile Device Fleet,590,17.0,590000
Q2,EMEA,Direct Enterprise,Cloud ERP Suite,105,5.5,630000
Q2,EMEA,Digital Online,AI Analytics Core,250,9.0,375000
Q2,EMEA,Strategic Partner,CyberSec Gateway,175,13.0,350000
Q2,EMEA,Wholesale Distributor,Mobile Device Fleet,265,15.0,265000
Q2,APAC,Direct Enterprise,Cloud ERP Suite,85,7.0,510000
Q2,APAC,Digital Online,AI Analytics Core,200,14.5,300000
Q2,APAC,Strategic Partner,CyberSec Gateway,115,12.0,230000
Q2,APAC,Wholesale Distributor,Mobile Device Fleet,140,18.0,140000
Q2,Latin America,Direct Enterprise,Cloud ERP Suite,45,6.0,270000
Q2,Latin America,Digital Online,AI Analytics Core,75,12.0,112500
Q2,Latin America,Strategic Partner,CyberSec Gateway,45,15.0,90000
Q3,North America,Direct Enterprise,Cloud ERP Suite,130,7.5,780000
Q3,North America,Digital Online,AI Analytics Core,315,13.0,472500
Q3,North America,Strategic Partner,CyberSec Gateway,220,16.0,440000
Q3,North America,Wholesale Distributor,Mobile Device Fleet,517,19.0,517500
Q3,EMEA,Direct Enterprise,Cloud ERP Suite,115,5.0,690000
Q3,EMEA,Digital Online,AI Analytics Core,270,8.5,405000
Q3,EMEA,Strategic Partner,CyberSec Gateway,190,12.5,380000
Q3,EMEA,Wholesale Distributor,Mobile Device Fleet,305,14.0,305000
Q3,APAC,Direct Enterprise,Cloud ERP Suite,110,6.0,660000
Q3,APAC,Digital Online,AI Analytics Core,520,8.2,780000
Q3,APAC,Strategic Partner,CyberSec Gateway,140,10.0,280000
Q3,APAC,Wholesale Distributor,Mobile Device Fleet,120,15.0,120000
Q3,Latin America,Direct Enterprise,Cloud ERP Suite,55,5.0,330000
Q3,Latin America,Digital Online,AI Analytics Core,105,10.0,157500
Q3,Latin America,Strategic Partner,CyberSec Gateway,50,13.0,102500
Q4,North America,Direct Enterprise,Cloud ERP Suite,160,5.0,960000
Q4,North America,Digital Online,AI Analytics Core,390,10.0,585000
Q4,North America,Strategic Partner,CyberSec Gateway,270,13.0,540000
Q4,North America,Wholesale Distributor,Mobile Device Fleet,620,16.0,620000
Q4,EMEA,Direct Enterprise,Cloud ERP Suite,125,5.0,750000
Q4,EMEA,Digital Online,AI Analytics Core,290,8.0,435000
Q4,EMEA,Strategic Partner,CyberSec Gateway,210,11.0,420000
Q4,EMEA,Wholesale Distributor,Mobile Device Fleet,340,13.0,340000
Q4,APAC,Direct Enterprise,Cloud ERP Suite,130,5.5,780000
Q4,APAC,Digital Online,AI Analytics Core,580,7.5,870000
Q4,APAC,Strategic Partner,CyberSec Gateway,160,9.0,320000
Q4,APAC,Wholesale Distributor,Mobile Device Fleet,150,14.0,150000
Q4,Latin America,Direct Enterprise,Cloud ERP Suite,65,5.0,390000
Q4,Latin America,Digital Online,AI Analytics Core,120,9.0,180000
Q4,Latin America,Strategic Partner,CyberSec Gateway,60,12.0,120000`;

export function downloadSampleCsvFile() {
  const blob = new Blob([SAMPLE_SALES_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'sales_orders_quarterly_sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
