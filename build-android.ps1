# Builds the debug APK. Gradle chokes on OneDrive "files on demand" placeholders, so the project is
# mirrored to C:\sw-build and built there; the finished APK is copied back to .\dist.
$ErrorActionPreference = 'Stop'
$src = $PSScriptRoot
$dst = 'C:\sw-build'
if (-not $env:JAVA_HOME) { $env:JAVA_HOME = 'C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot' }
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = 'C:\Android\sdk' }
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

New-Item -ItemType Directory -Force $dst | Out-Null
robocopy $src $dst /MIR /XD node_modules android .git dist .claude /XF *.apk /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed ($LASTEXITCODE)" }

Push-Location $dst
try {
    if (-not (Test-Path node_modules)) { npm install }
    if (-not (Test-Path android)) { npx cap add android }
    node scripts/setup-android.js
    npx cap sync android

    Push-Location android
    $apk = 'app\build\outputs\apk\debug\app-debug.apk'
    for ($i = 1; $i -le 3; $i++) {
        .\gradlew.bat assembleDebug
        if ($LASTEXITCODE -eq 0 -and (Test-Path $apk)) { break }
        Write-Host "Gradle attempt $i failed, retrying..."
    }
    if (-not (Test-Path $apk)) { throw 'Gradle build failed' }
    Pop-Location

    New-Item -ItemType Directory -Force "$src\dist" | Out-Null
    Copy-Item "$dst\android\$apk" "$src\dist\Swagatam-debug.apk" -Force
    Write-Host "APK: $src\dist\Swagatam-debug.apk"
} finally { Pop-Location }
