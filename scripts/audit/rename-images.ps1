# PowerShell Image Rename Script for Gyzenn Community
# Run this script in PowerShell to normalize original image filenames
if (Test-Path "26.1.jpg") { Rename-Item "26.1.jpg" "26-1.jpg" }
if (Test-Path "26.3.jpg") { Rename-Item "26.3.jpg" "26-3.jpg" }
if (Test-Path "TikTok.jpeg") { Rename-Item "TikTok.jpeg" "tiktok.jpeg" }
if (Test-Path "cobra fresh.jpg") { Rename-Item "cobra fresh.jpg" "cobra-fresh.jpg" }
if (Test-Path "survival v2.jpg") { Rename-Item "survival v2.jpg" "survival-v2.jpg" }
Write-Host "Image renaming complete for PowerShell!"
