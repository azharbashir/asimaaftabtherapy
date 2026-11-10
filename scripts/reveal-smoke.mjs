import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const effects=[],observers=[],classes=new Set(),properties=new Map();
const element={dataset:{},classList:{add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n))},style:{setProperty:(k,v)=>properties.set(k,v),removeProperty:k=>properties.delete(k)},getBoundingClientRect:()=>({top:2000}),parentElement:null};
class Observer{
 constructor(callback){this.callback=callback;this.observed=new Set();observers.push(this);}
 observe(el){this.observed.add(el);}
 unobserve(el){this.observed.delete(el);}
 disconnect(){this.observed.clear();}
}
const context={exports:{},require:()=>({useEffect:callback=>effects.push(callback)}),window:{matchMedia:()=>({matches:false}),innerHeight:800,IntersectionObserver:Observer},document:{querySelectorAll:()=>[element],body:{}},IntersectionObserver:Observer,MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}};
vm.runInNewContext(ts.transpileModule(readFileSync('components/site/motion.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
context.exports.useReveal();
const firstCleanup=effects[0]();
assert(classes.has('rv'));
assert(observers[0].observed.has(element));
firstCleanup();
assert(!classes.has('rv'),'cleanup must restore visible content');
assert.equal(element.dataset.rv,undefined);
const secondCleanup=effects[0]();
assert(observers[1].observed.has(element),'replayed effect must observe the section again');
observers[1].callback([{isIntersecting:true,target:element}]);
assert(classes.has('in'),'section must reveal when scrolled into view');
secondCleanup();
assert(!classes.has('rv'));
assert(!properties.has('--rv-d'));
delete context.window.IntersectionObserver;
assert.equal(effects[0](),undefined,'unsupported browsers must leave sections visible');
assert(!classes.has('rv'));
console.log('Reveal checks passed: effect replay, scroll visibility, cleanup, and missing observer support.');
