# Tumblr OAuth 1.0a - Complete PowerShell Implementation
# This script completes the full 3-step OAuth flow with robust response handling

param([string]$Key, [string]$Secret)

Add-Type -AssemblyName System.Web

function UrlEncode([string]$Text) {
    if ([string]::IsNullOrEmpty($Text)) { return "" }
    $unreserved = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
    $sb = New-Object System.Text.StringBuilder
    foreach ($b in $bytes) {
        if ($unreserved.IndexOf([char]$b) -ge 0) {
            [void]$sb.Append([char]$b)
        } else {
            [void]$sb.AppendFormat("%{0:X2}", $b)
        }
    }
    return $sb.ToString()
}

function Get-Signature([string]$Method, [string]$Url, $Params, [string]$CSecret, [string]$TSecret="") {
    $sorted = $Params.Keys | Sort-Object
    $pArray = @()
    foreach ($k in $sorted) {
        $pArray += "$(UrlEncode $k)=$(UrlEncode $Params[$k])"
    }
    $pString = $pArray -join "&"
    $base = "$Method&$(UrlEncode $Url)&$(UrlEncode $pString)"
    $key = "$(UrlEncode $CSecret)&$(UrlEncode $TSecret)"
    $hmac = New-Object System.Security.Cryptography.HMACSHA1
    $hmac.Key = [System.Text.Encoding]::ASCII.GetBytes($key)
    $hash = $hmac.ComputeHash([System.Text.Encoding]::ASCII.GetBytes($base))
    return [Convert]::ToBase64String($hash)
}

if (-not $Key) {
    $env = Get-Content "$PSScriptRoot\.env" -Raw
    if ($env -match 'TUMBLR_CONSUMER_KEY=([^\r\n]+)') { $Key = $matches[1].Trim() }
    if ($env -match 'TUMBLR_CONSUMER_SECRET=([^\r\n]+)') { $Secret = $matches[1].Trim() }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Tumblr OAuth 1.0a Token Generator" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1
Write-Host "[1/3] Requesting token..." -ForegroundColor Yellow

$url1 = "https://www.tumblr.com/oauth/request_token"
$p1 = @{
    oauth_callback = "http://localhost:3000/callback"
    oauth_consumer_key = $Key
    oauth_nonce = [Guid]::NewGuid().ToString("N")
    oauth_signature_method = "HMAC-SHA1"
    oauth_timestamp = [string]([int][double]::Parse((Get-Date -UFormat %s)))
    oauth_version = "1.0"
}
$p1.oauth_signature = Get-Signature "POST" $url1 $p1 $Secret

$auth1 = "OAuth " + (($p1.Keys | Sort-Object | ForEach-Object { "$(UrlEncode $_)=`"$(UrlEncode $p1[$_])`"" }) -join ", ")

try {
    $r1 = Invoke-WebRequest -Uri $url1 -Method POST -Headers @{Authorization=$auth1} -UseBasicParsing

    # Handle content if it's a byte array
    $content1 = $r1.Content
    if ($content1 -is [byte[]]) {
        $content1 = [System.Text.Encoding]::UTF8.GetString($content1)
    }

    $d1 = @{}
    foreach ($pair in ($content1 -split '&')) {
        if ($pair -match '^([^=]+)=(.*)$') {
            $d1[$matches[1]] = [System.Web.HttpUtility]::UrlDecode($matches[2])
        }
    }

    $reqTok = $d1.oauth_token
    $reqSec = $d1.oauth_token_secret

    if (-not $reqTok) {
        Write-Host "Raw Response: $content1" -ForegroundColor Red
        throw "No request token received"
    }

    Write-Host "[OK] Token received`n" -ForegroundColor Green

    # Step 2
    Write-Host "[2/3] User authorization...`n" -ForegroundColor Yellow

    $authUrl = "https://www.tumblr.com/oauth/authorize?oauth_token=$reqTok"
    Write-Host "Opening: $authUrl`n" -ForegroundColor Cyan
    Start-Process $authUrl
    Start-Sleep -Seconds 2
        oauth_timestamp = [string]([int][double]::Parse((Get-Date -UFormat %s)))
        oauth_token = $reqTok
        oauth_verifier = $ver
        oauth_version = "1.0"
    }
    $p2.oauth_signature = Get-Signature "POST" $url2 $p2 $Secret $reqSec

    $auth2 = "OAuth " + (($p2.Keys | Sort-Object | ForEach-Object { "$(UrlEncode $_)=`"$(UrlEncode $p2[$_])`"" }) -join ", ")

    $r2 = Invoke-WebRequest -Uri $url2 -Method POST -Headers @{Authorization=$auth2} -UseBasicParsing

    # Handle content if it's a byte array
    $content2 = $r2.Content
    if ($content2 -is [byte[]]) {
        $content2 = [System.Text.Encoding]::UTF8.GetString($content2)
    }

    $d2 = @{}
    foreach ($pair in ($content2 -split '&')) {
        if ($pair -match '^([^=]+)=(.*)$') {
            $d2[$matches[1]] = [System.Web.HttpUtility]::UrlDecode($matches[2])
        }
    }

    $accTok = $d2.oauth_token
    $accSec = $d2.oauth_token_secret

    if (-not $accTok -or -not $accSec) { throw "No access token received" }

    Write-Host "[OK] Access tokens received!`n" -ForegroundColor Green

    # Update .env
    Write-Host "Updating .env...`n" -ForegroundColor Yellow

    $envContent = Get-Content "$PSScriptRoot\.env" -Raw
    $envContent = $envContent -replace 'TUMBLR_TOKEN=[^\r\n]*', "TUMBLR_TOKEN=$accTok"
    $envContent = $envContent -replace 'TUMBLR_ACCESS_TOKEN=[^\r\n]*', "TUMBLR_ACCESS_TOKEN=$accTok"
    $envContent = $envContent -replace 'TUMBLR_TOKEN_SECRET=[^\r\n]*', "TUMBLR_TOKEN_SECRET=$accSec"
    Set-Content "$PSScriptRoot\.env" -Value $envContent -NoNewline

    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Tumblr OAuth tokens saved to .env" -ForegroundColor White
    Write-Host "  Token: $($accTok.Substring(0,[Math]::Min(10,$accTok.Length)))..." -ForegroundColor Green
    Write-Host "  Secret: $($accSec.Substring(0,[Math]::Min(10,$accSec.Length)))...`n" -ForegroundColor Green

} catch {
    Write-Host "`nERROR: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}
