export const exampleKDL = `
info {
    title "yanic"
    version "1.0.0"
}

// defined in an external lib. yt-dlp for python, manually for kotlin
type "YtDlInfo" "struct"
tyoe "YtDlOpts" "struct"

struct "InfoReq" {
    url "httpURL"
    opts "YtDlOpts"
}

struct "DownloadReq" {
    info "YtDlInfo"
    opts "YtDlOpts"
}

scope {
    req {
        mime "application/json"
    }

    res {
        mime "application/json"

        header "Content-Length" "int32" minimum=1

        "400" "text/plain" "string" minLength=1
        "422" "text/plain" "string" minLength=1
    }
}

POST "/info" {
    req "InfoReq"
    res {
        "200" "YtDlInfo"
    }
}

POST "/download" {
    req "DownloadReq"
    res {
        "200" "unknown"
    }
}
`
