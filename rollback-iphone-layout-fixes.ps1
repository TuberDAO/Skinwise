# Rollback Script for iPhone Layout Fixes
# Created: January 2025
# Purpose: Rollback iPhone-specific responsive layout improvements

Write-Host "🔄 Rolling back iPhone layout fixes..." -ForegroundColor Yellow
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not available. Please install Git to proceed." -ForegroundColor Red
    exit 1
}

# Check if backup commit exists
$backupCommit = & git log --oneline -n 5 | Select-String "Backup before iPhone layout fixes"
if (-not $backupCommit) {
    Write-Host "❌ Backup commit not found!" -ForegroundColor Red
    Write-Host "Looking for recent commits..." -ForegroundColor Yellow
    & git log --oneline -n 10
    Write-Host ""
    Write-Host "Please manually specify the commit hash to rollback to:" -ForegroundColor Yellow
    Write-Host "git reset --hard <commit-hash>" -ForegroundColor Cyan
    exit 1
}

# Create current state backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Write-Host "📁 Creating backup of current state..." -ForegroundColor Blue
Copy-Item "app/page.tsx" -Destination "app/page.tsx.backup-iphone-rollback-$timestamp" -Force
Write-Host "✅ Backup created: app/page.tsx.backup-iphone-rollback-$timestamp"

# Extract commit hash
$commitHash = ($backupCommit -split '\s+')[0]
Write-Host "🔍 Found backup commit: $commitHash" -ForegroundColor Green

# Rollback to backup commit
Write-Host "🔄 Rolling back to backup commit..." -ForegroundColor Blue
$rollbackResult = & git reset --hard $commitHash 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully rolled back to backup commit" -ForegroundColor Green
} else {
    Write-Host "❌ Rollback failed!" -ForegroundColor Red
    Write-Host "Error: $rollbackResult" -ForegroundColor Yellow
    
    # Restore from file backup
    Write-Host "🔄 Restoring from file backup..." -ForegroundColor Blue
    Copy-Item "app/page.tsx.backup-iphone-rollback-$timestamp" -Destination "app/page.tsx" -Force
    Write-Host "✅ Restored from file backup"
    exit 1
}

# Test build after rollback
Write-Host "🏗️ Testing build after rollback..." -ForegroundColor Blue
$buildResult = & npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful after rollback" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed after rollback!" -ForegroundColor Red
    Write-Host "Build output:" -ForegroundColor Yellow
    Write-Host $buildResult
    exit 1
}

Write-Host ""
Write-Host "✅ iPhone layout rollback completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What was rolled back:" -ForegroundColor Cyan
Write-Host "• iPhone header overlap fixes"
Write-Host "• Mobile content spacing improvements"
Write-Host "• Typography and padding adjustments"
Write-Host "• Mobile navigation improvements"
Write-Host "• Responsive section stacking"
Write-Host ""
Write-Host "⚠️  Warning: iPhone view may have layout issues again" -ForegroundColor Yellow
Write-Host "📱 Test iPhone views in responsive preview after rollback"
Write-Host ""
Write-Host "🔄 To re-apply fixes: Check git history or re-implement iPhone optimizations"
Write-Host ""
Write-Host "📁 File backup: app/page.tsx.backup-iphone-rollback-$timestamp"
Write-Host "📜 Current commit: $(& git rev-parse --short HEAD)"

# Show current git status
Write-Host ""
Write-Host "📊 Current git status:" -ForegroundColor Blue
& git status --short 