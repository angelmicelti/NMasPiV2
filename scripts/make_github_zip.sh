#!/bin/bash
# Genera un archivo zip limpio con el código fuente del proyecto
# listo para subir a GitHub.
set -e

OUT="/home/z/my-project/download/planes-ies-github.zip"
WORK="/tmp/planes-ies-build"

echo "==> Limpiando directorio temporal..."
rm -rf "$WORK"
mkdir -p "$WORK/planes-ies"

echo "==> Copiando archivos del proyecto..."
cd /home/z/my-project

# Archivos raíz
cp README.md "$WORK/planes-ies/"
cp .env.example "$WORK/planes-ies/"
cp .gitignore "$WORK/planes-ies/"
cp package.json "$WORK/planes-ies/"
cp tsconfig.json "$WORK/planes-ies/"
cp next.config.ts "$WORK/planes-ies/"
cp tailwind.config.ts "$WORK/planes-ies/"
cp postcss.config.mjs "$WORK/planes-ies/"
cp components.json "$WORK/planes-ies/"
cp eslint.config.mjs "$WORK/planes-ies/"

# Directorios principales
cp -r src "$WORK/planes-ies/"
cp -r public "$WORK/planes-ies/"
cp -r scripts "$WORK/planes-ies/"

# Eliminar api/route.ts de ejemplo (no se usa)
rm -f "$WORK/planes-ies/src/app/api/route.ts"
rmdir "$WORK/planes-ies/src/app/api" 2>/dev/null || true

# Eliminar db.ts (no se usa Prisma, se usa Firebase)
rm -f "$WORK/planes-ies/src/lib/db.ts"

# Eliminar prisma (no se usa)
# (no se copia explícitamente)

# Eliminar archivos internos no necesarios
rm -f "$WORK/planes-ies/src/lib/utils.ts" 2>/dev/null || true
# (utils.ts sí es usado por shadcn/ui, lo restauramos)
cp src/lib/utils.ts "$WORK/planes-ies/src/lib/utils.ts"

# Crear .nojekyll para GitHub Pages (evita procesamiento Jekyll)
touch "$WORK/planes-ies/.nojekyll"

echo "==> Verificando estructura final:"
find "$WORK/planes-ies" -type f -not -path "*/node_modules/*" | sort | head -80

echo ""
echo "==> Creando zip..."
cd "$WORK"
rm -f "$OUT"
zip -rq "$OUT" "planes-ies"

echo ""
echo "==> ¡Listo!"
ls -lh "$OUT"
echo ""
echo "El zip contiene:"
unzip -l "$OUT" | tail -5
