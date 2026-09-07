# Откат Mira

Бэкап создан перед установкой Mira.

## Восстановить

Из корня проекта:

```powershell
$bak = ".mira-backup-20260831-184929"
Remove-Item -Recurse -Force "resources/js/components/ui"
Copy-Item -Recurse "$bak/ui" "resources/js/components/ui"
Copy-Item "$bak/components.json" "components.json" -Force
Copy-Item "$bak/app.css" "resources/css/app.css" -Force
Copy-Item "$bak/package.json" "package.json" -Force
Copy-Item "$bak/package-lock.json" "package-lock.json" -Force
npm install
npm run build
```

После отката можно удалить папку `.mira-backup-20260831-184929`.
