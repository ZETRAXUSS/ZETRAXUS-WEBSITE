import json, sys, glob
ns = {}
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'dict.py')).read(), ns)
D = ns['D']
for extra in sorted([]):
    e = {}
    exec(open(extra).read(), e)
    D.update(e['X'])
root = __import__('os').path.join(__import__('os').path.dirname(__file__),'..','..','lib','i18n','dictionaries')+'/'
def q(s): return json.dumps(s, ensure_ascii=False)
keys = sorted(D)
en = "/* English UI strings. Keys are shared with tr.ts (TypeScript enforces parity). */\n\nexport const en = {\n" + "".join(f"  {q(k)}: {q(D[k][0])},\n" for k in keys) + "};\n"
tr = "/* Türkçe arayüz metinleri. */\n\nimport type { en } from \"./en\";\n\nexport const tr: Record<keyof typeof en, string> = {\n" + "".join(f"  {q(k)}: {q(D[k][1])},\n" for k in keys) + "};\n"
if '--check' in sys.argv:
    print(open(root+'en.ts').read()==en, open(root+'tr.ts').read()==tr)
else:
    open(root+'en.ts','w').write(en); open(root+'tr.ts','w').write(tr); print(len(keys),'keys')
