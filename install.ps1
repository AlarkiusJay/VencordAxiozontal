# Copies (or hard-links) Axiozontal.theme.css into every Discord client theme folder found on this machine.
# Usage:  .\install.ps1          copy
#         .\install.ps1 -Link    hard link (edits here show up in Discord after a theme reload)
param([switch]$Link)

$src = Join-Path $PSScriptRoot 'Axiozontal.theme.css'
if (-not (Test-Path $src)) { Write-Error "Theme file not found: $src"; exit 1 }

$targets = @(
    (Join-Path $env:APPDATA 'BetterDiscord\themes'),
    (Join-Path $env:APPDATA 'Vencord\themes'),
    (Join-Path $env:APPDATA 'replugged\themes')
)

$did = 0
foreach ($dir in $targets) {
    if (-not (Test-Path $dir)) { continue }
    $dst = Join-Path $dir 'Axiozontal.theme.css'
    if (Test-Path $dst) { Remove-Item $dst -Force }
    if ($Link) {
        New-Item -ItemType HardLink -Path $dst -Target $src | Out-Null
        Write-Host "Linked  -> $dst"
    } else {
        Copy-Item $src $dst
        Write-Host "Copied  -> $dst"
    }
    $did++
}
if ($did -eq 0) { Write-Warning 'No BetterDiscord, Vencord or Replugged theme folder found.' }
