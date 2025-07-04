# Rollback script for UI/UX layout fixes
# Run this script if the layout changes cause any issues

Write-Host "Rolling back UI/UX layout fixes..." -ForegroundColor Yellow

# Reset to the checkpoint commit
git reset --hard HEAD~1

Write-Host "UI/UX layout fixes have been rolled back successfully!" -ForegroundColor Green
Write-Host "The site should now be back to the previous layout state." -ForegroundColor Green 