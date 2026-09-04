# Stillvial (demo HTML5)

Build exportada desde Godot 4.7 (`stillvial/game`, preset **Web**, threads off).

- **Jugar:** [index.html](./index.html)
- **Repo:** https://github.com/waldopanozo/Stillvial
- **Preview card:** `stillvial.png`

Regenerar desde el proyecto:

```bash
cd ~/work/opensource/stillvial/game
godot --headless --path . --export-release "Web" ../export/web/index.html
rsync -a --delete ../export/web/ ~/work/waldopanozo.github.io/assets/samples/godot/stillvial/
# conservar stillvial.png y este README tras el sync si hace falta
```

Nota: `index.wasm` ~38 MB; el push a GitHub Pages puede tardar.
