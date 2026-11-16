/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test runner */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function load(path) {
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const mod = {exports:{}}; new Function('require','module','exports',js)(require,mod,mod.exports); return mod.exports
}
const {safeAdminRedirect,isSameOriginMutation,isEditorRole,imageSignatureMatches} = load('src/lib/security/guards.ts')
const {readBoundedJson} = load('src/lib/security/json.ts')
const {DesignProjectSchema} = load('src/lib/validation/schemas.ts')
async function main() {
  for (const value of [null,'javascript:alert(1)','https://evil.invalid','//evil.invalid','/admin/../../evil','/admin/%2f%2fevil','/admin/\\evil','/admin/login','/admin/x\n']) assert.equal(safeAdminRedirect(value),'/admin/dashboard')
  assert.equal(safeAdminRedirect('/admin/media'),'/admin/media')
  assert.equal(isSameOriginMutation('https://ravzen.vercel.app','ravzen.vercel.app','same-origin'),true)
  for(const args of [[null,'ravzen.vercel.app',null],['https://evil.invalid','ravzen.vercel.app','cross-site'],['https://ravzen.vercel.app','ravzen.vercel.app','cross-site'],['https://ravzen.vercel.app.evil.invalid','ravzen.vercel.app',null]]) assert.equal(isSameOriginMutation(...args),false)
  assert.equal(isEditorRole('EDITOR'),true); assert.equal(isEditorRole('USER'),false); assert.equal(isEditorRole(null),false)
  assert.equal(imageSignatureMatches(Uint8Array.from([137,80,78,71,13,10,26,10]),'image/png'),true)
  assert.equal(imageSignatureMatches(new TextEncoder().encode('<svg onload="alert(1)">'),'image/png'),false)
  assert.equal(imageSignatureMatches(Uint8Array.from([255]),'image/jpeg'),false)
  assert.deepEqual(await readBoundedJson(new Request('https://test.invalid',{method:'POST',body:'{"ok":true}'})),{ok:true})
  await assert.rejects(readBoundedJson(new Request('https://test.invalid',{method:'POST',body:'{"large":"abcdef"}'}),8))
  await assert.rejects(readBoundedJson(new Request('https://test.invalid',{method:'POST',body:'{}',headers:{'content-length':'100'}}),8))
  await assert.rejects(readBoundedJson(new Request('https://test.invalid',{method:'POST',body:'not json'})))
  const base={title:'Test',slug:'test',price:null,currency:null}
  assert.equal(DesignProjectSchema.safeParse({...base,external_url:'https://example.com'}).success,true)
  assert.equal(DesignProjectSchema.safeParse({...base,external_url:'javascript:alert(1)'}).success,false)
  console.warn('Security regression checks passed: redirects, CSRF, roles, signatures, bounded JSON, URL schemes')
}
main().catch(error=>{console.error(error);process.exitCode=1})
