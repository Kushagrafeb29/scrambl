Add-Type -AssemblyName System.Drawing

$sourceImagePath = "C:\Users\KUSHAGRA MISHRA\.gemini\antigravity\brain\9f9b16da-2cbe-4964-88c2-596704d05d8c\scrambl_cover_1776533393113.png"
if (-Not (Test-Path $sourceImagePath)) {
    Write-Output "Source image not found at $sourceImagePath"
    exit
}

$img = [System.Drawing.Image]::FromFile($sourceImagePath)

function Resize-Image {
    param($w, $h, $out)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Fill background with dark color matching the game theme
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 30, 30))
    $graph.FillRectangle($brush, 0, 0, $w, $h)
    
    # Calculate scale to preserve aspect ratio
    $ratioX = $w / $img.Width
    $ratioY = $h / $img.Height
    $ratio = if ($ratioX -lt $ratioY) { $ratioX } else { $ratioY }
    
    $newW = [math]::Round($img.Width * $ratio)
    $newH = [math]::Round($img.Height * $ratio)
    $posX = [math]::Round(($w - $newW) / 2)
    $posY = [math]::Round(($h - $newH) / 2)
    
    # High quality interpolation
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $graph.DrawImage($img, $posX, $posY, $newW, $newH)
    
    $bmp.Save(".\$out", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $graph.Dispose()
    $bmp.Dispose()
    $brush.Dispose()
    Write-Output "Created $out"
}

Resize-Image 512 384 "gd_512x384.jpg"
Resize-Image 512 512 "gd_512x512.jpg"
Resize-Image 200 120 "gd_200x120.jpg"
Resize-Image 1280 720 "gd_1280x720.jpg"
Resize-Image 1280 550 "gd_1280x550.jpg"

$img.Dispose()
Write-Output "All required .jpg assets generated successfully!"
