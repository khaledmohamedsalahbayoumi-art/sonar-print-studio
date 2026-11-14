Add-Type -AssemblyName System.Drawing

$rootDir = (Get-Location).Path
$sourcePath = 'C:/Users/ElSakka Group/.gemini/antigravity/brain/2e1c21ce-c366-4aab-945b-37a0b3edebbb/.user_uploaded/media_1794667115003_ae21a4aa.png'

# 1. Ensure target dirs
$publicDir = Join-Path $rootDir 'public'
$srcAssetsDir = Join-Path $rootDir 'src/assets'
$buildDir = Join-Path $rootDir 'build'

New-Item -ItemType Directory -Force -Path $publicDir | Out-Null
New-Item -ItemType Directory -Force -Path $srcAssetsDir | Out-Null
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

# 2. Save full horizontal logo
Copy-Item $sourcePath (Join-Path $publicDir 'logo.png') -Force
Copy-Item $sourcePath (Join-Path $srcAssetsDir 'logo.png') -Force
Write-Output "Full logo copied to public/logo.png and src/assets/logo.png"

# Load source image
$srcImg = [System.Drawing.Image]::FromFile($sourcePath)

# 3. Crop mark (0..234, 0..278)
$cropW = 235
$cropH = 279
$cropRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
$croppedMark = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gCrop = [System.Drawing.Graphics]::FromImage($croppedMark)
$gCrop.DrawImage($srcImg, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()

# Create 1024x1024 square icon
$targetSize = 1024
$iconBmp1024 = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gSquare = [System.Drawing.Graphics]::FromImage($iconBmp1024)
$gSquare.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gSquare.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gSquare.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$maxInner = 860
$scale = [Math]::Min($maxInner / $cropW, $maxInner / $cropH)
$drawW = [int]($cropW * $scale)
$drawH = [int]($cropH * $scale)
$drawX = [int](($targetSize - $drawW) / 2)
$drawY = [int](($targetSize - $drawH) / 2)

$destRect = New-Object System.Drawing.Rectangle($drawX, $drawY, $drawW, $drawH)
$gSquare.DrawImage($croppedMark, $destRect)
$gSquare.Dispose()

$pubIcon = Join-Path $publicDir 'icon.png'
$srcIcon = Join-Path $srcAssetsDir 'icon.png'
$buildIcon = Join-Path $buildDir 'icon.png'

$iconBmp1024.Save($pubIcon, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp1024.Save($srcIcon, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp1024.Save($buildIcon, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Square icon saved successfully to $pubIcon, $srcIcon, $buildIcon"

# 4. Generate multi-resolution Windows ICO (256, 128, 64, 48, 32, 16)
$sizes = @(256, 128, 64, 48, 32, 16)
$pngBytesList = @()

foreach ($sz in $sizes) {
    $resized = New-Object System.Drawing.Bitmap($sz, $sz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gRes = [System.Drawing.Graphics]::FromImage($resized)
    $gRes.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gRes.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gRes.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gRes.DrawImage($iconBmp1024, 0, 0, $sz, $sz)
    $gRes.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytesList += ,($ms.ToArray())
    $ms.Dispose()
    $resized.Dispose()
}

function Write-IcoFile($outPath, $sizesArr, $pngList) {
    $fs = [System.IO.File]::Create($outPath)
    $bw = New-Object System.IO.BinaryWriter($fs)

    # ICONDIR header (6 bytes)
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$sizesArr.Length)

    $offset = 6 + ($sizesArr.Length * 16)
    for ($i = 0; $i -lt $sizesArr.Length; $i++) {
        $sz = $sizesArr[$i]
        $len = $pngList[$i].Length

        $bWidth = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }
        $bHeight = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }

        $bw.Write($bWidth)
        $bw.Write($bHeight)
        $bw.Write([byte]0) # Color count
        $bw.Write([byte]0) # Reserved
        $bw.Write([uint16]1) # Color planes
        $bw.Write([uint16]32) # Bits per pixel
        $bw.Write([uint32]$len) # Size of image data
        $bw.Write([uint32]$offset) # Offset of image data

        $offset += $len
    }

    # Write image data chunks
    for ($i = 0; $i -lt $sizesArr.Length; $i++) {
        $bw.Write($pngList[$i])
    }

    $bw.Dispose()
    $fs.Dispose()
}

$buildIco = Join-Path $buildDir 'icon.ico'
$pubFavicon = Join-Path $publicDir 'favicon.ico'

Write-IcoFile $buildIco $sizes $pngBytesList
Write-IcoFile $pubFavicon $sizes $pngBytesList
Write-Output "ICO files created at $buildIco and $pubFavicon"

$croppedMark.Dispose()
$iconBmp1024.Dispose()
$srcImg.Dispose()
