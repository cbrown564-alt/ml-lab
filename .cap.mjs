import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport:{width:1440,height:1150} })).newPage();
await p.goto('http://localhost:3100/exhibits/regression-task', { waitUntil:'networkidle' });
const panel = p.getByRole('tabpanel', { includeHidden:false });
// See it beat 1: confirm no literal asterisks in the prose
const t1 = await panel.innerText();
console.log('asterisks in See-it prose:', (t1.match(/\*/g)||[]).length);
await p.getByRole('tab', { name: 'Run it' }).click(); await p.waitForTimeout(500);
const svg = panel.locator('svg').first(); const box = await svg.boundingBox();
await p.screenshot({ path:'/Users/cobro/code/ml-lab/.rt-prereveal.png', clip:{x:box.x-2,y:box.y-2,width:box.width+4,height:box.height+4} });
console.log('drag affordance present:', t1.includes('*') ? 'check' : (await panel.innerText()).includes('drag') ? 'yes(text)' : 'svg-only');
await b.close();
