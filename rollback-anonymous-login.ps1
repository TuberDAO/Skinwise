#!/usr/bin/env pwsh

# Rollback script for anonymous login removal changes
# This script restores all backup files created before removing anonymous login

Write-Host "🔄 Rolling back anonymous login removal changes..." -ForegroundColor Yellow

# List of files to restore
$files = @(
    "app/test-firebase/page.tsx",
    "app/upload/page.tsx", 
    "app/payment/page.tsx",
    "app/success/page.tsx",
    "app/admin/page.tsx"
)

$restored = 0
$failed = 0

foreach ($file in $files) {
    $backupFile = "$file.backup"
    
    if (Test-Path $backupFile) {
        try {
            Copy-Item $backupFile $file -Force
            Write-Host "✅ Restored: $file" -ForegroundColor Green
            $restored++
        } catch {
            Write-Host "❌ Failed to restore: $file" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "⚠️  Backup not found: $backupFile" -ForegroundColor Yellow
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Rollback Summary:" -ForegroundColor Cyan
Write-Host "   Restored: $restored files" -ForegroundColor Green
Write-Host "   Failed: $failed files" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "✅ All files successfully restored!" -ForegroundColor Green
    Write-Host "🔄 Anonymous login functionality has been restored." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some files could not be restored. Please check manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: firebase.backup.ts already contains the anonymous login functions" -ForegroundColor Gray
Write-Host "To use anonymous login, you would need to import signInAsAnonymous from firebase.backup.ts" -ForegroundColor Gray 