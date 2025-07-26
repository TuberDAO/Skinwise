# Comprehensive Responsive Design Overhaul Rollback Script
# Created: January 2025
# Purpose: Rollback comprehensive mobile-first responsive design fixes

Write-Host "🔄 Rolling back comprehensive responsive design overhaul..." -ForegroundColor Yellow
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not available. Please install Git to proceed." -ForegroundColor Red
    exit 1
}

# Check if backup commit exists
$backupCommit = & git log --oneline -n 5 | Select-String "Backup before comprehensive responsive design overhaul"
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

# Backup all modified files
$filesToBackup = @(
    "app/page.tsx",
    "app/layout.tsx", 
    "app/payment/page.tsx",
    "app/upload/page.tsx",
    "app/success/page.tsx",
    "components/dev/responsive-preview.tsx"
)

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        Copy-Item $file -Destination "$file.backup-responsive-rollback-$timestamp" -Force
        Write-Host "✅ Backup created: $file.backup-responsive-rollback-$timestamp"
    }
}

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
    
    # Restore from file backups
    Write-Host "🔄 Restoring from file backups..." -ForegroundColor Blue
    foreach ($file in $filesToBackup) {
        $backupFile = "$file.backup-responsive-rollback-$timestamp"
        if (Test-Path $backupFile) {
            Copy-Item $backupFile -Destination $file -Force
            Write-Host "✅ Restored $file from backup"
        }
    }
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
Write-Host "✅ Comprehensive responsive design rollback completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What was rolled back:" -ForegroundColor Cyan
Write-Host "• Mobile-first responsive design overhaul"
Write-Host "• Header navigation overlap fixes"
Write-Host "• Assessment process cards text wrapping fixes"
Write-Host "• Breakpoint optimizations (320px-1440px+)"
Write-Host "• Typography and spacing improvements"
Write-Host "• Grid/flex layout improvements"
Write-Host "• Cross-device compatibility enhancements"
Write-Host ""
Write-Host "⚠️  Warning: Site may have responsive issues again" -ForegroundColor Yellow
Write-Host "📱 Test all device views and breakpoints after rollback"
Write-Host ""
Write-Host "🔄 To re-apply fixes: Check git history or re-implement responsive improvements"
Write-Host ""
Write-Host "📁 File backups: *backup-responsive-rollback-$timestamp"
Write-Host "📜 Current commit: $(& git rev-parse --short HEAD)"

# Show current git status
Write-Host ""
Write-Host "📊 Current git status:" -ForegroundColor Blue
& git status --short 