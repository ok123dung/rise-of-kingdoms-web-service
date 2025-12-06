$headers = @{'Content-Type'='application/json'}
$body = '{"email":"newtest456@example.com"}'
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3003/api/auth/forgot-password' -Method POST -Headers $headers -Body $body
    $response | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        Write-Host $reader.ReadToEnd()
    }
}
