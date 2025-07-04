#!/usr/bin/env pwsh

# Rollback script for Delayed Redirect Fix
# This script restores the previous success page if the fix causes issues

Write-Host "🔄 Rolling back Delayed Redirect Fix..." -ForegroundColor Yellow

$restored = 0
$failed = 0

# Restore from delayed fix backup
if (Test-Path "app/success/page.tsx.backup-delayed-fix") {
    try {
        Copy-Item "app/success/page.tsx.backup-delayed-fix" "app/success/page.tsx" -Force
        Write-Host "✅ Restored success page from delayed fix backup" -ForegroundColor Green
        $restored++
    } catch {
        Write-Host "❌ Failed to restore success page from delayed fix backup" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "⚠️  No delayed fix backup found, trying other backups..." -ForegroundColor Yellow
    
    # Try to find any other backup
    $backups = Get-ChildItem "app/success/page.tsx.backup-*" | Sort-Object Name -Descending
    
    if ($backups.Count -gt 0) {
        try {
            $latestBackup = $backups[0]
            Copy-Item $latestBackup.FullName "app/success/page.tsx" -Force
            Write-Host "✅ Restored from: $($latestBackup.Name)" -ForegroundColor Green
            $restored++
        } catch {
            Write-Host "❌ Failed to restore from backup" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "❌ No backup files found!" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Rollback Summary:" -ForegroundColor Cyan
Write-Host "   Restored: $restored files" -ForegroundColor Green
Write-Host "   Failed: $failed files" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "✅ Delayed redirect fix successfully rolled back!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some files could not be restored. Please check manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 To restart the server after rollback:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host ""
Write-Host "Available backup files:" -ForegroundColor Gray
Get-ChildItem "app/success/page.tsx.*" | ForEach-Object { 
    Write-Host "  - $($_.Name)" -ForegroundColor Gray 
} 