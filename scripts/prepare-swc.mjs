import {createRequire} from 'node:module';
import {cpSync,mkdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const nextPackage=require.resolve('next/package.json');
const wasmPackage=require.resolve('@next/swc-wasm-nodejs/package.json');
const nextVersion=JSON.parse(readFileSync(nextPackage,'utf8')).version;
const wasmVersion=JSON.parse(readFileSync(wasmPackage,'utf8')).version;
if(nextVersion!==wasmVersion)throw Error('Next.js and @next/swc-wasm-nodejs must use the same version.');
// Next 16.4.5 resolves its first WASM import as a file URL, then checks this
// fallback directory before downloading. Populate it from the locked npm package.
const destination=path.join(path.dirname(nextPackage),'wasm','@next','swc-wasm-nodejs');
mkdirSync(destination,{recursive:true});
cpSync(path.dirname(wasmPackage),destination,{recursive:true});
console.log(`SWC WebAssembly fallback prepared (${wasmVersion}).`);
