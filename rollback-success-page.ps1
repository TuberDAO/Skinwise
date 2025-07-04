#!/usr/bin/env pwsh

# Rollback script for Success Page improvements
# This script restores the original success page if issues occur

Write-Host "🔄 Rolling back Success Page changes..." -ForegroundColor Yellow

$restored = 0
$failed = 0

# Find the most recent backup
$backups = Get-ChildItem "app/success/page.tsx.backup-*" | Sort-Object Name -Descending

if ($backups.Count -gt 0) {
    try {
        $latestBackup = $backups[0]
        Copy-Item $latestBackup.FullName "app/success/page.tsx" -Force
        Write-Host "✅ Restored success page from: $($latestBackup.Name)" -ForegroundColor Green
        $restored++
    } catch {
        Write-Host "❌ Failed to restore success page" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "⚠️  No success page backup found" -ForegroundColor Yellow
    $failed++
}

Write-Host ""
Write-Host "📊 Rollback Summary:" -ForegroundColor Cyan
Write-Host "   Restored: $restored files" -ForegroundColor Green
Write-Host "   Failed: $failed files" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "✅ Success page successfully restored!" -ForegroundColor Green
    Write-Host "🔄 Success page changes have been rolled back." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some files could not be restored. Please check manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 To restart the server after rollback:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host ""
Write-Host "Available backup files:" -ForegroundColor Gray
Get-ChildItem "app/success/page.tsx.backup-*" | ForEach-Object { 
    Write-Host "  - $($_.Name)" -ForegroundColor Gray 
} 