# TODO

## Single endpoint scope

Ban this on type level

```ts
"/exports": scope({
  "/workbook": GET({
    id: "downloadWorkbookExport",
    description:
      "Download current user's recurring expense export as a workbook. Response is proxied through from the internal sheets service to preserve the generated file body and download headers.",
    req: {
      query: {
        "format?": WorkbookFormat,
      },
    },
    res: {
      200: WorkbookExportResponse,
    },
  }),
}),
```

## Minor

- rename req.params to req.reusableparams, because it's not clear why we're
  defining an inline query param in `query` but some other random named param in
  `params`
- we have "legacy" stuff already in `src/compiler/`. wtf

## Someday

https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2

[LLM SSE Plan](docs/plan/llm-sse.md)
