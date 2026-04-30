import {
  GET,
  POST,
  allOf,
  array,
  boolean,
  declareTags,
  headerParam,
  httpSecurity,
  integer,
  named,
  object,
  oneOf,
  pathParam,
  queryParam,
  resp,
  responseHeader,
  responsibleAPI,
  scope,
  string,
} from "../index.ts"

const apply = () =>
  object({
    name: string({
      minLength: 1,
      description: "Your full name",
      default: "Your Name",
    }),
    email: string({
      format: "email",
      description: "A valid email we can reach you at.",
      default: "you@example.com",
    }),
    job: string({
      description:
        "The job you're looking to apply for (https://readme.com/careers).",
    }),
    "pronouns?": string({
      description: "Learn more at https://pronoun.is/",
    }),
    "linkedin?": string({
      format: "url",
      description: "What have you been up to the past few years?",
    }),
    "github?": string({
      format: "url",
      description: "Or Bitbucket, Gitlab or anywhere else your code is hosted!",
    }),
    "coverLetter?": string({
      format: "blob",
      description: "What should we know about you?",
    }),
    "dontReallyApply?": boolean({
      description:
        "Want to play with the API but not actually apply? Set this to true.",
      default: false,
    }),
  })

const jobOpening = () =>
  object({
    "slug?": string({
      description: "A slugified version of the job opening title.",
      examples: ["api-engineer"],
    }),
    "title?": string({
      description: "The job opening position.",
      examples: ["API Engineer"],
    }),
    "description?": string({
      description:
        "The description for this open position. This content is formatted as HTML.",
    }),
    "pullquote?": string({
      description: "A short pullquote for the open position.",
      examples: ["Deeply knowledgeable of the web, HTTP, and the API space."],
    }),
    "location?": string({
      description: "Where this position is located at.",
      examples: ["Remote"],
    }),
    "department?": string({
      description: "The internal organization you'll be working in.",
      examples: ["Engineering"],
    }),
    "url?": string({
      format: "url",
      description: "The place where you can apply for the position!",
    }),
  })

const apiSpecificationUpload = object({
  "spec?": string({
    contentMediaType: "application/octet-stream",
    description: "OpenAPI/Swagger file. We accept JSON or YAML.",
  }),
})

const categorySlug = pathParam({
  name: "slug",
  description:
    'A URL-safe representation of the category title. Slugs must be all lowercase, and replace spaces with hyphens. For example, for the the category "Getting Started", enter the slug "getting-started".',
  example: "getting-started",
  schema: string(),
})

const pageQuery = named(
  "page",
  queryParam({
    name: "page",
    description: "Used to specify further pages (starts at 1).",
    schema: integer({
      default: 1,
      minimum: 1,
    }),
  }),
)

const perPageQuery = named(
  "perPage",
  queryParam({
    name: "perPage",
    description:
      "Number of items to include in pagination (up to 100, defaults to 10).",
    schema: integer({
      default: 10,
      minimum: 1,
      maximum: 100,
    }),
  }),
)

const paginationParams = [perPageQuery, pageQuery] as const

const xReadmeVersionParam = named(
  "x-readme-version",
  headerParam({
    name: "x-readme-version",
    description:
      "Version number of your docs project, for example, v3.0. By default the main project version is used. To see all valid versions for your docs project call https://docs.readme.com/reference/version#getversions.",
    example: "v3.0",
    required: false,
    schema: string(),
  }),
)

const versionIdParam = named(
  "versionId",
  pathParam({
    name: "versionId",
    description:
      "Semver identifier for the project version. For best results, use the formatted `version_clean` value listed in the response from the [Get Versions endpoint](/reference/getversions).",
    example: "v1.0.0",
    schema: string(),
  }),
)

const categoryTitleRequired = {}
Object.assign(categoryTitleRequired, { required: ["title"] })

const tags = declareTags({
  "API Registry": {},
  "API Specification": {},
  "Apply to ReadMe": {},
  Categories: {},
  Changelog: {},
  "Custom Pages": {},
  Docs: {},
  Errors: {},
  Projects: {},
  Version: {},
} as const)

const basicAuth = named("apiKey", httpSecurity({ scheme: "basic" }))

const baseError = named(
  "baseError",
  object({
    "error?": string({
      description: "An error code unique to the error received.",
    }),
    "message?": string({
      description: "The reason why the error occured.",
    }),
    "suggestion?": string({
      description: "A helpful suggestion for how to alleviate the error.",
    }),
    "docs?": string({
      format: "url",
      description:
        "A [ReadMe Metrics](https://readme.com/metrics/) log URL where you can see more information the request that you made. If we have metrics URLs unavailable for your request, this URL will be a URL to our API Reference.",
      examples: [
        "https://docs.readme.com/logs/6883d0ee-cf79-447a-826f-a48f7d5bdf5f",
      ],
    }),
    "help?": string({
      description:
        "Information on where you can receive additional assistance from our wonderful support team.",
      examples: ["If you need help, email support@readme.io"],
    }),
    "poem?": array(string(), {
      description: "A short poem we wrote you about your error.",
      examples: [
        [
          "If you're seeing this error,",
          "Things didn't quite go the way we hoped.",
          "When we tried to process your request,",
          "Maybe trying again it'll work—who knows!",
        ],
      ],
    }),
  }),
)

const ERROR_DEFS = [
  ["APIKEY_EMPTY", "An API key was not supplied."],
  ["APIKEY_MISMATCH", "The API key doesn't match the project."],
  ["APIKEY_NOTFOUND", "The API key couldn't be located."],
  ["APPLY_INVALID_EMAIL", "You need to provide a valid email."],
  ["APPLY_INVALID_JOB", "You need to provide a job."],
  ["APPLY_INVALID_NAME", "You need to provide a name."],
  ["CATEGORY_INVALID", "The category couldn't be saved."],
  ["CATEGORY_NOTFOUND", "The category couldn't be found."],
  ["CHANGELOG_INVALID", "The changelog couldn't be saved."],
  ["CHANGELOG_NOTFOUND", "The changelog couldn't be found."],
  ["CUSTOMPAGE_INVALID", "The page couldn't be saved."],
  ["CUSTOMPAGE_NOTFOUND", "The custom page couldn't be found."],
  ["DOC_INVALID", "The doc couldn't be saved."],
  ["DOC_NOTFOUND", "The doc couldn't be found."],
  ["ENDPOINT_NOTFOUND", "The endpoint doesn't exist."],
  ["INTERNAL_ERROR", "An unknown error has occurred."],
  ["PROJECT_NOTFOUND", "The project couldn't be found."],
  ["REGISTRY_INVALID", "The registry entry couldn't be found."],
  ["REGISTRY_NOTFOUND", "The registry entry couldn't be found."],
  ["SPEC_FILE_EMPTY", "A spec file wasn't included."],
  ["SPEC_ID_DUPLICATE", "The spec ID already tied to another version."],
  ["SPEC_ID_INVALID", "The spec ID isn't valid."],
  ["SPEC_INVALID", "The uploaded spec isn't valid JSON or YAML."],
  ["SPEC_INVALID_SCHEMA", "The uploaded spec has OpenAPI validation errors."],
  ["SPEC_NOTFOUND", "The spec couldn't be found."],
  ["SPEC_TIMEOUT", "The spec upload timed out."],
  ["SPEC_VERSION_NOTFOUND", "The spec version couldn't be found."],
  ["UNEXPECTED_ERROR", "An unknown error has occurred."],
  ["VERSION_CANT_DEMOTE_STABLE", "A stable version can't be demoted."],
  ["VERSION_CANT_REMOVE_STABLE", "A stable version can't be removed."],
  ["VERSION_DUPLICATE", "The version already exists."],
  ["VERSION_EMPTY", "No version was supplied."],
  [
    "VERSION_FORK_EMPTY",
    "New versions need to be forked from an existing version.",
  ],
  ["VERSION_FORK_NOTFOUND", "The version couldn't be found."],
  ["VERSION_INVALID", "The version is invalid."],
  ["VERSION_NOTFOUND", "The version couldn't be found."],
] as const

type ErrorCode = (typeof ERROR_DEFS)[number][0]

function mkErr(code: string, responseDescription: string) {
  const schema = named(
    `error_${code}`,
    allOf([
      baseError,
      object({
        "error?": string({ default: code }),
      }),
    ]),
  )

  const response = named(
    `error_${code}`,
    resp({
      description: responseDescription,
      body: { "application/json": schema },
    }),
  )

  return { schema, response }
}

/* Object.fromEntries widens keys to string; ERROR_DEFS is the exhaustive source of truth. */
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const err = Object.fromEntries(
  ERROR_DEFS.map(([code, desc]) => [code, mkErr(code, desc)]),
) as Record<ErrorCode, ReturnType<typeof mkErr>>

const UNUSED_ERROR_RESPONSES = [
  "APIKEY_EMPTY",
  "APIKEY_MISMATCH",
  "APIKEY_NOTFOUND",
  "APPLY_INVALID_EMAIL",
  "APPLY_INVALID_JOB",
  "APPLY_INVALID_NAME",
  "CHANGELOG_INVALID",
  "CHANGELOG_NOTFOUND",
  "ENDPOINT_NOTFOUND",
  "INTERNAL_ERROR",
  "PROJECT_NOTFOUND",
  "REGISTRY_INVALID",
  "SPEC_FILE_EMPTY",
  "SPEC_ID_DUPLICATE",
  "SPEC_INVALID",
  "SPEC_INVALID_SCHEMA",
  "SPEC_VERSION_NOTFOUND",
  "UNEXPECTED_ERROR",
  "VERSION_DUPLICATE",
  "VERSION_FORK_EMPTY",
  "VERSION_INVALID",
] as const satisfies readonly ErrorCode[]

const authUnauthorized = named(
  "authUnauthorized",
  resp({
    description: "Unauthorized",
    body: {
      "application/json": oneOf([
        err.APIKEY_EMPTY.schema,
        err.APIKEY_NOTFOUND.schema,
      ]),
    },
  }),
)

const authForbidden = named(
  "authForbidden",
  resp({
    description: "Unauthorized",
    body: {
      "application/json": oneOf([err.APIKEY_MISMATCH.schema]),
    },
  }),
)

const categoryTitle = string({
  description:
    "A short title for the category. This is what will show in the sidebar.",
})

const category = () =>
  object({
    "title?": categoryTitle,
    "type?": string({
      enum: ["reference", "guide"],
      default: "guide",
      description:
        "A category can be part of your reference or guide documentation, which is determined by this field.",
    }),
  })

const changelog = () =>
  object({
    title: string({
      description: "Title of the changelog.",
    }),
    "type?": string({
      default: "",
      enum: ["", "added", "fixed", "improved", "deprecated", "removed"],
    }),
    body: string({
      description: "Body content of the changelog.",
    }),
    "hidden?": boolean({
      description: "Visibility of the changelog.",
      default: true,
    }),
  })

const condensedProjectData = () =>
  object({
    "name?": string(),
    "subdomain?": string(),
    "jwtSecret?": string(),
    "baseUrl?": string({
      format: "url",
      description:
        "The base URL for the project. If the project is not running under a custom domain, it will be `https://projectSubdomain.readme.io`, otherwise it can either be or `https://example.com` or, in the case of an enterprise child project `https://example.com/projectSubdomain`.",
    }),
    "plan?": string(),
  })

const customPage = () =>
  object({
    title: string({
      description: "Title of the custom page.",
    }),
    "body?": string({
      description: "Body formatted in Markdown (displayed by default).",
    }),
    "html?": string({
      description:
        "Body formatted in HTML (sanitized, only displayed if `htmlmode` is **true**).",
    }),
    "htmlmode?": boolean({
      description:
        "**true** if `html` should be displayed, **false** if `body` should be displayed.",
      default: false,
    }),
    "hidden?": boolean({
      description: "Visibility of the custom page.",
      default: true,
    }),
  })

const doc = () =>
  object({
    title: string({
      description: "Title of the page.",
    }),
    "type?": string({
      description:
        'Type of the page. The available types all show up under the /docs/ URL path of your docs project (also known as the "guides" section). Can be "basic" (most common), "error" (page desribing an API error), or "link" (page that redirects to an external link).',
      enum: ["basic", "error", "link"],
    }),
    "body?": string({
      description:
        "Body content of the page, formatted in ReadMe or GitHub flavored Markdown. Accepts long page content, for example, greater than 100k characters.",
    }),
    category: string({
      description:
        "Category ID of the page, which you can get through https://docs.readme.com/reference/categories#getcategory.",
    }),
    "hidden?": boolean({
      description: "Visibility of the page.",
      default: true,
    }),
    "order?": integer({
      description: "The position of the page in your project sidebar.",
      default: 999,
    }),
    "parentDoc?": string({
      description:
        "For a subpage, specify the parent doc ID, which you can get through https://docs.readme.com/reference/docs#getdoc.",
    }),
    "error?": object({
      "code?": string({
        description: 'The error code for docs with the "error" type.',
      }),
    }),
  })

const version = () =>
  object({
    version: string({
      description: "Semantic Version",
    }),
    "codename?": string({
      description: "Dubbed name of version.",
    }),
    from: string({
      description: "Semantic Version to use as the base fork.",
    }),
    "is_stable?": boolean({
      description: "Should this be the **main** version?",
    }),
    "is_beta?": boolean({
      default: true,
    }),
    "is_hidden?": boolean({
      description: "Should this be publically accessible?",
    }),
    "is_deprecated?": boolean({
      description: "Should this be deprecated? Only allowed in PUT operations.",
    }),
  })

const linkPaginationHeader = named(
  "link",
  responseHeader({
    description:
      "Pagination information. See https://docs.readme.com/reference/pagination for more information.",
    schema: string(),
  }),
)

const xTotalCountHeader = named(
  "x-total-count",
  responseHeader({
    description:
      "The total amount of results, ignoring pagination. See https://docs.readme.com/reference/pagination for more information about pagination.",
    schema: string(),
  }),
)

const paginationHeaderParams = [
  linkPaginationHeader,
  xTotalCountHeader,
] as const

const authResponses = {
  401: authUnauthorized,
  403: authForbidden,
}

export default responsibleAPI({
  missingResponses: UNUSED_ERROR_RESPONSES.map(c => err[c].response),
  partialDoc: {
    openapi: "3.1.0",
    info: {
      description:
        "Create beautiful product and API documentation with our developer friendly platform.",
      version: "2.0.0",
      title: "API Endpoints",
      contact: {
        name: "API Support",
        url: "https://docs.readme.com/docs/contact-support",
        email: "support@readme.io",
      },
    },
    servers: [{ url: "http://dash.readme.local:3000/api/v1" }],
    tags: Object.values(tags),
  },
  routes: {
    "/api-registry/:uuid": GET({
      id: "getAPIRegistry",
      summary: "Retrieve an entry from the API Registry",
      description: "Get an API definition file that's been uploaded to ReadMe.",
      tags: [tags["API Registry"]],
      req: {
        pathParams: {
          uuid: {
            description:
              "An API Registry UUID. This can be found by navigating to your API Reference page and viewing code snippets for Node with the `api` library.",
            schema: string(),
          },
        },
      },
      res: {
        200: resp({
          description: "Successfully retrieved API registry entry.",
          body: { "application/json": object() },
        }),
        404: err.REGISTRY_NOTFOUND.response,
      },
    }),
    "/api-specification": scope({
      forEachOp: {
        tags: [tags["API Specification"]],
        req: {
          security: basicAuth,
        },
        res: {
          add: authResponses,
        },
      },
      GET: {
        id: "getAPISpecification",
        summary: "Get metadata",
        description: "Get API specification metadata.",
        req: {
          params: [...paginationParams, xReadmeVersionParam],
        },
        res: {
          200: resp({
            description: "Successfully retrieved API specification metadata.",
            headerParams: paginationHeaderParams,
          }),
          400: err.VERSION_EMPTY.response,
          404: err.VERSION_NOTFOUND.response,
        },
      },
      POST: {
        id: "uploadAPISpecification",
        summary: "Upload specification",
        description:
          "Upload an API specification to ReadMe. Or, to use a newer solution see https://docs.readme.com/docs/automatically-sync-api-specification-with-github.",
        req: {
          params: [xReadmeVersionParam],
          body: {
            "multipart/form-data": apiSpecificationUpload,
          },
        },
        res: {
          201: resp({
            description: "The API specification was successfully uploaded.",
          }),
          400: resp({
            description: "There was a validation error during upload.",
            body: {
              "application/json": oneOf([
                err.SPEC_FILE_EMPTY.schema,
                err.SPEC_INVALID.schema,
                err.SPEC_INVALID_SCHEMA.schema,
                err.SPEC_VERSION_NOTFOUND.schema,
              ]),
            },
          }),
          408: err.SPEC_TIMEOUT.response,
        },
      },
    }),
    "/api-specification/:id": scope({
      forEachOp: {
        tags: [tags["API Specification"]],
        req: {
          security: basicAuth,
          pathParams: {
            id: {
              description:
                "ID of the API specification. The unique ID for each API can be found by navigating to your **API Definitions** page.",
              schema: string(),
            },
          },
        },
        res: {
          add: authResponses,
        },
      },
      PUT: {
        id: "updateAPISpecification",
        summary: "Update specification",
        description: "Update an API specification in ReadMe.",
        req: {
          body: {
            "multipart/form-data": apiSpecificationUpload,
          },
        },
        res: {
          200: resp({
            description: "The API specification was updated.",
          }),
          400: resp({
            description: "There was a validation error during upload.",
            body: {
              "application/json": oneOf([
                err.SPEC_FILE_EMPTY.schema,
                err.SPEC_ID_DUPLICATE.schema,
                err.SPEC_ID_INVALID.schema,
                err.SPEC_INVALID.schema,
                err.SPEC_INVALID_SCHEMA.schema,
                err.SPEC_VERSION_NOTFOUND.schema,
              ]),
            },
          }),
          404: resp({
            description: "There is no API specification with that ID.",
          }),
          408: err.SPEC_TIMEOUT.response,
        },
      },
      DELETE: {
        id: "deleteAPISpecification",
        summary: "Delete specification",
        description: "Delete an API specification in ReadMe.",
        res: {
          204: resp({
            description: "The API specification was deleted.",
          }),
          400: err.SPEC_ID_INVALID.response,
          404: err.SPEC_NOTFOUND.response,
        },
      },
    }),
    "/apply": scope({
      forEachOp: {
        tags: [tags["Apply to ReadMe"]],
        req: { mime: "application/json" },
        res: { mime: "application/json" },
      },
      GET: {
        id: "getOpenRoles",
        summary: "Get open roles",
        description: "Returns all the roles we're hiring for at ReadMe!",
        res: {
          200: resp({
            description: "All the roles that we're hiring for.",
            body: array(jobOpening),
          }),
        },
      },
      POST: {
        id: "applyToReadMe",
        summary: "Submit your application!",
        description:
          "This endpoint will let you apply to a job at ReadMe programatically, without having to go through our UI!",
        req: {
          body: apply,
        },
        res: {
          200: resp({
            description: "You did it!",
          }),
        },
      },
    }),
    "/categories": scope({
      forEachOp: {
        tags: [tags.Categories],
        req: {
          mime: "application/json",
          security: basicAuth,
        },
      },
      GET: {
        id: "getCategories",
        summary: "Get all categories",
        description: "Returns all the categories for a specified version.",
        req: {
          params: [xReadmeVersionParam, ...paginationParams],
        },
        res: {
          200: resp({
            description: "The list of categories.",
            headerParams: paginationHeaderParams,
          }),
        },
      },
      POST: {
        id: "createCategory",
        summary: "Create category",
        description: "Create a new category inside of this project.",
        req: {
          params: [xReadmeVersionParam],
          body: allOf([category, categoryTitleRequired]),
        },
        res: {
          201: resp({
            description: "The category has successfully been created.",
          }),
          400: err.CATEGORY_INVALID.response,
        },
      },
    }),
    "/categories/:slug": scope({
      forEachOp: {
        tags: [tags.Categories],
        req: {
          mime: "application/json",
          security: basicAuth,
          params: [categorySlug, xReadmeVersionParam],
        },
      },
      GET: {
        id: "getCategory",
        summary: "Get category",
        description: "Returns the category with this slug.",
        res: {
          200: resp({
            description: "The category exists and has been returned.",
          }),
          404: err.CATEGORY_NOTFOUND.response,
        },
      },
      PUT: {
        id: "updateCategory",
        summary: "Update category",
        description: "Change the properties of a category.",
        req: {
          body: category,
        },
        res: {
          200: resp({
            description: "The category was successfully updated.",
          }),
          400: err.CATEGORY_INVALID.response,
          404: err.CATEGORY_NOTFOUND.response,
        },
      },
      DELETE: {
        id: "deleteCategory",
        summary: "Delete category",
        description:
          "Delete the category with this slug.\n>⚠️Heads Up!\n> This will also delete all of the docs within this category.",
        res: {
          204: resp({
            description: "The category was deleted.",
          }),
          404: err.CATEGORY_NOTFOUND.response,
        },
      },
    }),
    "/categories/:slug/docs": GET({
      id: "getCategoryDocs",
      summary: "Get docs for category",
      description: "Returns the docs and children docs within this category.",
      tags: [tags.Categories],
      req: {
        security: basicAuth,
        params: [categorySlug, xReadmeVersionParam],
      },
      res: {
        200: resp({
          description:
            "The category exists and all of the docs have been returned.",
        }),
        404: err.CATEGORY_NOTFOUND.response,
      },
    }),
    "/changelogs": scope({
      forEachOp: {
        tags: [tags.Changelog],
        req: {
          mime: "application/json",
          security: basicAuth,
        },
      },
      GET: {
        id: "getChangelogs",
        summary: "Get changelogs",
        description: "Returns a list of changelogs.",
        req: {
          params: paginationParams,
        },
        res: {
          200: resp({
            description: "The list of changelogs.",
            headerParams: paginationHeaderParams,
          }),
        },
      },
      POST: {
        id: "createChangelog",
        summary: "Create changelog",
        description: "Create a new changelog entry.",
        req: {
          body: changelog,
        },
        res: {
          201: resp({
            description: "The changelog was successfully created.",
          }),
          400: resp({
            description: "There was a validation error during creation.",
          }),
        },
      },
    }),
    "/changelogs/:slug": scope({
      forEachOp: {
        tags: [tags.Changelog],
        req: {
          mime: "application/json",
          security: basicAuth,
          pathParams: {
            slug: {
              description:
                'A URL-safe representation of the changelog title. Slugs must be all lowercase, and replace spaces with hyphens. For example, for the the changelog "Owlet Weekly Update", enter the slug "owlet-weekly-update".',
              schema: string(),
            },
          },
        },
      },
      GET: {
        id: "getChangelog",
        summary: "Get changelog",
        description: "Returns the changelog with this slug.",
        res: {
          200: resp({
            description: "The changelog exists and has been returned.",
          }),
          404: resp({
            description: "There is no changelog with that slug.",
          }),
        },
      },
      PUT: {
        id: "updateChangelog",
        summary: "Update changelog",
        description: "Update a changelog with this slug.",
        req: {
          body: changelog,
        },
        res: {
          200: resp({
            description: "The changelog was successfully updated.",
          }),
          400: resp({
            description: "There was a validation error during update.",
          }),
          404: resp({
            description: "There is no changelog with that slug.",
          }),
        },
      },
      DELETE: {
        id: "deleteChangelog",
        summary: "Delete changelog",
        description: "Delete the changelog with this slug.",
        res: {
          204: resp({
            description: "The changelog was successfully updated.",
          }),
          404: resp({
            description: "There is no changelog with that slug.",
          }),
        },
      },
    }),
    "/custompages": scope({
      forEachOp: {
        tags: [tags["Custom Pages"]],
        req: {
          mime: "application/json",
          security: basicAuth,
        },
        res: {
          add: authResponses,
        },
      },
      GET: {
        id: "getCustomPages",
        summary: "Get custom pages",
        description: "Returns a list of custom pages.",
        req: {
          params: paginationParams,
        },
        res: {
          200: resp({
            description: "The list of custom pages.",
            headerParams: paginationHeaderParams,
          }),
        },
      },
      POST: {
        id: "createCustomPage",
        summary: "Create custom page",
        description: "Create a new custom page inside of this project.",
        req: {
          body: customPage,
        },
        res: {
          201: resp({
            description: "The custom page was successfully created.",
          }),
          400: err.CUSTOMPAGE_INVALID.response,
        },
      },
    }),
    "/custompages/:slug": scope({
      forEachOp: {
        tags: [tags["Custom Pages"]],
        req: {
          mime: "application/json",
          security: basicAuth,
          pathParams: {
            slug: {
              description:
                'A URL-safe representation of the custom page title. Slugs must be all lowercase, and replace spaces with hyphens. For example, for the the custom page "Getting Started", enter the slug "getting-started".',
              schema: string(),
            },
          },
        },
        res: {
          add: authResponses,
        },
      },
      GET: {
        id: "getCustomPage",
        summary: "Get custom page",
        description: "Returns the custom page with this slug.",
        res: {
          200: resp({
            description: "The custom page exists and has been returned.",
          }),
          404: err.CUSTOMPAGE_NOTFOUND.response,
        },
      },
      PUT: {
        id: "updateCustomPage",
        summary: "Update custom page",
        description: "Update a custom page with this slug.",
        req: {
          body: customPage,
        },
        res: {
          200: resp({
            description: "The custom page was successfully updated.",
          }),
          400: err.CUSTOMPAGE_INVALID.response,
          404: err.CUSTOMPAGE_NOTFOUND.response,
        },
      },
      DELETE: {
        id: "deleteCustomPage",
        summary: "Delete custom page",
        description: "Delete the custom page with this slug.",
        res: {
          204: resp({
            description: "The custom page was successfully updated.",
          }),
          404: err.CUSTOMPAGE_NOTFOUND.response,
        },
      },
    }),
    "/docs/:slug": scope({
      forEachOp: {
        tags: [tags.Docs],
        req: {
          mime: "application/json",
          security: basicAuth,
          pathParams: {
            slug: {
              description:
                'A URL-safe representation of the doc title. Slugs must be all lowercase, and replace spaces with hyphens. For example, for the the doc "New Features", enter the slug "new-features".',
              example: "new-features",
              schema: string(),
            },
          },
          params: [xReadmeVersionParam],
        },
        res: {
          add: authResponses,
        },
      },
      GET: {
        id: "getDoc",
        summary: "Get doc",
        description: "Returns the doc with this slug.",
        res: {
          200: resp({
            description: "The doc exists and has been returned.",
          }),
          404: err.DOC_NOTFOUND.response,
        },
      },
      PUT: {
        id: "updateDoc",
        summary: "Update doc",
        description: "Update a doc with this slug.",
        req: {
          body: doc,
        },
        res: {
          200: resp({
            description: "The doc was successfully updated.",
          }),
          400: err.DOC_INVALID.response,
          404: err.DOC_NOTFOUND.response,
        },
      },
      DELETE: {
        id: "deleteDoc",
        summary: "Delete doc",
        description: "Delete the doc with this slug.",
        res: {
          204: resp({
            description: "The doc was successfully updated.",
          }),
          404: err.DOC_NOTFOUND.response,
        },
      },
    }),
    "/docs": POST({
      id: "createDoc",
      summary: "Create doc",
      description: "Create a new doc inside of this project.",
      tags: [tags.Docs],
      req: {
        security: basicAuth,
        params: [xReadmeVersionParam],
        body: { "application/json": doc },
      },
      res: {
        201: resp({
          description: "The doc was successfully created.",
        }),
        400: err.DOC_INVALID.response,
        ...authResponses,
      },
    }),
    "/docs/search": POST({
      id: "searchDocs",
      summary: "Search docs",
      description: "Returns all docs that match the search.",
      tags: [tags.Docs],
      req: {
        security: basicAuth,
        params: [xReadmeVersionParam],
        query: {
          search: {
            description: "Search string to look for.",
            schema: string(),
          },
        },
      },
      res: {
        200: resp({
          description: "The search was successful and results were returned.",
        }),
        ...authResponses,
      },
    }),
    "/errors": GET({
      id: "getErrors",
      summary: "Get errors",
      description: "Returns with all of the error page types for this project.",
      tags: [tags.Errors],
      req: {
        security: basicAuth,
      },
      res: {
        200: resp({
          description: "An array of the errors.",
        }),
        ...authResponses,
      },
    }),
    "/": GET({
      id: "getProject",
      summary: "Get metadata about the current project",
      description: "Returns project data for the API key.",
      tags: [tags.Projects],
      req: {
        security: basicAuth,
      },
      res: {
        200: resp({
          description: "Project data",
          body: { "application/json": condensedProjectData },
        }),
        ...authResponses,
      },
    }),
    "/version": scope({
      forEachOp: {
        tags: [tags.Version],
        req: {
          mime: "application/json",
          security: basicAuth,
        },
        res: {
          add: authResponses,
        },
      },
      GET: {
        id: "getVersions",
        summary: "Get versions",
        description:
          "Retrieve a list of versions associated with a project API key.",
        res: {
          200: resp({
            description: "A list of versions.",
          }),
        },
      },
      POST: {
        id: "createVersion",
        summary: "Create version",
        description: "Create a new version.",
        req: {
          body: version,
        },
        res: {
          200: resp({
            description: "The version was successfully created.",
          }),
          400: resp({
            description: "There was a validation error during creation.",
            body: {
              "application/json": oneOf([
                err.VERSION_EMPTY.schema,
                err.VERSION_DUPLICATE.schema,
                err.VERSION_FORK_EMPTY.schema,
              ]),
            },
          }),
          404: err.VERSION_FORK_NOTFOUND.response,
        },
      },
    }),
    "/version/:versionId": scope({
      forEachOp: {
        tags: [tags.Version],
        req: {
          mime: "application/json",
          security: basicAuth,
          params: [versionIdParam],
        },
        res: {
          add: authResponses,
        },
      },
      GET: {
        id: "getVersion",
        summary: "Get version",
        description: "Returns the version with this version ID.",
        res: {
          200: resp({
            description: "The version exists and has been returned.",
          }),
          404: err.VERSION_NOTFOUND.response,
        },
      },
      PUT: {
        id: "updateVersion",
        summary: "Update version",
        description: "Update an existing version.",
        req: {
          body: version,
        },
        res: {
          200: resp({
            description: "The version was successfully updated.",
          }),
          400: err.VERSION_CANT_DEMOTE_STABLE.response,
          404: err.VERSION_NOTFOUND.response,
        },
      },
      DELETE: {
        id: "deleteVersion",
        summary: "Delete version",
        description: "Delete a version",
        res: {
          200: resp({
            description: "The version was successfully deleted.",
          }),
          400: err.VERSION_CANT_REMOVE_STABLE.response,
          404: err.VERSION_NOTFOUND.response,
        },
      },
    }),
  },
})
