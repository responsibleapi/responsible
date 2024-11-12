## Language Reference

### Types

```kdl
responsible syntax=1

// alias
type "UserID" "string" minLength=1

/** object */
struct "User" {
    id "UserID"
    name "string" minLength=1

/** arrays */
    (?)friends "array" "UserID"

/** dicts */
    (?)metadata "dict" "string" "string"
}
```

### Security

https://learn.openapis.org/specification/security.html

```kdl
responsible syntax=1

/** required Authorization header */
security {
    header "Authorization"
}

/** optional Authorization header */
security {
    (?)header "Authorization"
}

/**
 * multiple security options (AND/OR logic)
 *
 * https://swagger.io/docs/specification/authentication/#multiple
 */
security {
    OR {
        header "Authorization"
        cookie "JSESSIONID"
    }
}
```
