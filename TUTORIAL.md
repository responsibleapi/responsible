# Responsible in 15 minutes

We'll use YouTube API v3 to demonstrate the Responsible DSL. Take a look at the documentation:
https://developers.google.com/youtube/v3/docs/search/list#request

### Declare a simple endpoint

```kdl
GET "/youtube/v3/search" {
    req {
        query {
            part "string" enum="snippet"

        // Filters (specify 0 or 1 of the following parameters)
            (?)forContentOwner "boolean"
            (?)forDeveloper "boolean"
            (?)forMine "boolean"
            (?)relatedToVideoId "string" minLength=1

            (?)channelId "string" minLength=1
            (?)channelType "enum" {
                any
                show
            }
            (?)eventType "enum" {
                completed
                live
                upcoming
            }
        }
    }
    res {
        "200" "unknown"
    }
}
```

### Declare a simple POST endpoint

```kdl
POST "/submit" {

    req "struct" {
        (?)name "string"
        age "int32" minimum=18
    }

    res {
        "200" "struct" {
            ok "boolean"
        }

        "400" "struct" {
            error "string"
        }
    }
}
```
