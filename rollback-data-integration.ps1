#!/usr/bin/env pwsh

# Rollback script for data integration changes
# This script restores backup files if there are issues with the Firestore data integration

Write-Host "🔄 Rolling back data integration changes..." -ForegroundColor Yellow

# Find the most recent backup files
$uploadBackups = Get-ChildItem "app/upload/page.tsx.backup-*" | Sort-Object Name -Descending
$adminBackups = Get-ChildItem "app/admin/page.tsx.backup-*" | Sort-Object Name -Descending

$restored = 0
$failed = 0

# Restore upload page
if ($uploadBackups.Count -gt 0) {
    try {
        $latestUploadBackup = $uploadBackups[0]
        Copy-Item $latestUploadBackup.FullName "app/upload/page.tsx" -Force
        Write-Host "✅ Restored upload page from: $($latestUploadBackup.Name)" -ForegroundColor Green
        $restored++
    } catch {
        Write-Host "❌ Failed to restore upload page" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "⚠️  No upload page backup found" -ForegroundColor Yellow
    $failed++
}

# Restore admin page  
if ($adminBackups.Count -gt 0) {
    try {
        $latestAdminBackup = $adminBackups[0]
        Copy-Item $latestAdminBackup.FullName "app/admin/page.tsx" -Force
        Write-Host "✅ Restored admin page from: $($latestAdminBackup.Name)" -ForegroundColor Green
        $restored++
    } catch {
        Write-Host "❌ Failed to restore admin page" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "⚠️  No admin page backup found" -ForegroundColor Yellow
    $failed++
}

Write-Host ""
Write-Host "📊 Rollback Summary:" -ForegroundColor Cyan
Write-Host "   Restored: $restored files" -ForegroundColor Green
Write-Host "   Failed: $failed files" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "✅ All files successfully restored!" -ForegroundColor Green
    Write-Host "🔄 Data integration changes have been rolled back." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some files could not be restored. Please check manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Available backup files:" -ForegroundColor Gray
Get-ChildItem "app/*/page.tsx.backup-*" | ForEach-Object { 
    Write-Host "  - $($_.Name)" -ForegroundColor Gray 
} 