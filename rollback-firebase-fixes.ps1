#!/usr/bin/env pwsh

# Rollback script for Firebase configuration fixes
# This script restores all backups if there are issues

Write-Host "🔄 Rolling back Firebase configuration fixes..." -ForegroundColor Yellow

$restored = 0
$failed = 0

# List of files to restore
$backupFiles = @(
    @{ original = "app/upload/page.tsx"; backup = "app/upload/page.tsx.working-backup" },
    @{ original = "firebase.ts"; backup = "firebase.ts.working-backup" },
    @{ original = ".env.local"; backup = ".env.local.working-backup" }
)

foreach ($file in $backupFiles) {
    if (Test-Path $file.backup) {
        try {
            Copy-Item $file.backup $file.original -Force
            Write-Host "✅ Restored: $($file.original)" -ForegroundColor Green
            $restored++
        } catch {
            Write-Host "❌ Failed to restore: $($file.original)" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "⚠️  No backup found for: $($file.original)" -ForegroundColor Yellow
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Rollback Summary:" -ForegroundColor Cyan
Write-Host "   Restored: $restored files" -ForegroundColor Green
Write-Host "   Failed: $failed files" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "✅ All files successfully restored!" -ForegroundColor Green
    Write-Host "🔄 Firebase configuration fixes have been rolled back." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some files could not be restored. Please check manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 To restart the server after rollback:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Gray 