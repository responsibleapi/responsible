import { responsibleAPI } from "../dsl/dsl.ts"
import { DELETE, GET, POST, PUT } from "../dsl/methods.ts"
import { resp } from "../dsl/operation.ts"
import type { InlinePathParam, InlineQueryParam } from "../dsl/params.ts"
import {
  allOf,
  anyOf,
  array,
  boolean,
  dict,
  int32,
  int64,
  nullable,
  object,
  string,
  unknown,
  type Schema,
} from "../dsl/schema.ts"
import { scope } from "../dsl/scope.ts"
import { httpSecurity } from "../dsl/security.ts"
import { declareTags } from "../dsl/tags.ts"

const BearerAuth = () => httpSecurity({ scheme: "Bearer" })

const dataOf = (data: Schema, description?: string) =>
  description === undefined
    ? object({ data })
    : object({ data }, { description })

const dataMetaOf = (data: Schema, meta: Schema, description?: string) =>
  description === undefined
    ? object({ data, meta })
    : object({ data, meta }, { description })

const tags = declareTags({
  Common: {},
  Profile: {},
  Users: {},
  "Group tags": {},
  Chats: {},
  Members: {},
  Threads: {},
  Messages: {},
  "Read members": {},
  Reactions: {},
  "Link Previews": {},
  Search: {},
  Tasks: {},
  Views: {},
  Bots: {},
  Security: {},
} as const)

const SortOrder = () =>
  string({
    description: "Порядок сортировки",
    enum: ["asc", "desc"],
    "x-enum-descriptions": {
      asc: "По возрастанию",
      desc: "По убыванию",
    },
  })

const QueryOrderParam1 = {
  description: "Направление сортировки",
  example: "desc",
  explode: false,
  schema: allOf([SortOrder], {
    default: "desc",
  }),
}

const QueryLimitParam1 = {
  description: "Количество возвращаемых сущностей за один запрос",
  example: 1,
  explode: false,
  schema: int32({
    examples: [1],
    default: 50,
    maximum: 50,
    minimum: 1,
  }),
}

const paginationParam: InlineQueryParam = {
  description: "Курсор для пагинации (из meta.paginate.next_page)",
  example: "eyJpZCI6MTAsImRpciI6ImFzYyJ9",
  explode: false,
  schema: string({ examples: ["eyJpZCI6MTAsImRpciI6ImFzYyJ9"] }),
}

const chatIDParam: InlinePathParam = {
  description: "Идентификатор чата",
  example: 334,
  schema: int32({ examples: [334] }),
}

const PathUser_idParam1 = {
  description: "Идентификатор пользователя",
  example: 186,
  schema: int32({
    examples: [186],
  }),
}

const QueryCursorParam2 = {
  description: "Курсор для пагинации (из `meta.paginate.next_page`)",
  example: "eyJpZCI6MTAsImRpciI6ImFzYyJ9",
  explode: false,
  schema: string({
    examples: ["eyJpZCI6MTAsImRpciI6ImFzYyJ9"],
  }),
}

const PathIdParam2 = {
  description: "Идентификатор тега",
  example: 9111,
  schema: int32({
    examples: [9111],
  }),
}

const PathIdParam3 = {
  description: "Идентификатор сообщения",
  example: 194275,
  schema: int32({
    examples: [194275],
  }),
}

const PathIdParam4 = {
  description: "Идентификатор сообщения",
  example: 7231942,
  schema: int32({
    examples: [7231942],
  }),
}

const QueryOrderParam2 = {
  description: "Направление сортировки",
  example: "desc",
  explode: false,
  schema: SortOrder,
}

const QueryCreated_fromParam1 = {
  description: "Фильтр по дате создания (от)",
  example: "2025-01-01T00:00:00.000Z",
  explode: false,
  schema: string({
    format: "date-time",
    examples: ["2025-01-01T00:00:00.000Z"],
  }),
}

const QueryCreated_toParam1 = {
  description: "Фильтр по дате создания (до)",
  example: "2025-02-01T00:00:00.000Z",
  explode: false,
  schema: string({
    format: "date-time",
    examples: ["2025-02-01T00:00:00.000Z"],
  }),
}

const QueryActiveParam1 = {
  description: "Фильтр по активности чата",
  example: true,
  explode: false,
  schema: boolean({
    examples: [true],
  }),
}

const QueryLimitParam2 = {
  description: "Количество возвращаемых результатов за один запрос",
  example: 10,
  explode: false,
  schema: int32({
    examples: [10],
    default: 200,
    maximum: 200,
  }),
}

const PathIdParam5 = {
  description: "Идентификатор напоминания",
  example: 22283,
  schema: int32({ examples: [22283] }),
}

const PathIdParam6 = {
  description: "Идентификатор пользователя",
  example: 12,
  schema: int32({ examples: [12] }),
}

const PathUser_idParam2 = {
  description: "Идентификатор пользователя",
  example: 12,
  schema: int32({ examples: [12] }),
}

const AccessTokenInfo = () =>
  object(
    {
      id: int64({
        description: "Идентификатор токена",
        examples: [4827],
      }),
      token: string({
        description:
          "Маскированный токен (видны первые 8 и последние 4 символа)",
        examples: ["cH5kR9mN...x7Qp"],
      }),
      name: {
        description: "Пользовательское имя токена",
        type: ["string", "null"],
        examples: ["Мой API токен"],
      },
      user_id: int64({
        description: "Идентификатор владельца токена",
        examples: [12],
      }),
      scopes: array(OAuthScope, {
        description: "Список скоупов токена",
        examples: [["messages:read", "chats:read"]],
      }),
      created_at: string({
        description: "Дата создания токена",
        format: "date-time",
        examples: ["2025-01-15T10:30:00.000Z"],
      }),
      revoked_at: {
        description: "Дата отзыва токена",
        type: ["string", "null"],
        format: "date-time",
      },
      expires_in: {
        description: "Время жизни токена в секундах",
        type: ["integer", "null"],
        format: "int32",
      },
      last_used_at: {
        description: "Дата последнего использования токена",
        type: ["string", "null"],
        format: "date-time",
        examples: ["2025-02-24T14:20:00.000Z"],
      },
    },
    {
      description: "Токен доступа",
    },
  )

const AddMembersRequest = () =>
  object(
    {
      member_ids: array(int32(), {
        description:
          "Массив идентификаторов пользователей, которые станут участниками",
        examples: [[186, 187]],
      }),
      "silent?": boolean({
        description:
          "Не создавать в чате системное сообщение о добавлении участника",
        examples: [true],
      }),
    },
    {
      description: "Запрос на добавление участников в чат",
    },
  )

const AddTagsRequest = () =>
  object(
    {
      group_tag_ids: array(int32(), {
        description: "Массив идентификаторов тегов, которые станут участниками",
        examples: [[86, 18]],
      }),
    },
    {
      description: "Запрос на добавление тегов в чат",
    },
  )

const ApiError = () =>
  object(
    {
      errors: array(ApiErrorItem, {
        description: "Массив ошибок",
      }),
    },
    {
      description:
        "Ошибка API (используется для 400, 402, 403, 404, 409, 410, 422)",
      "x-error": true,
    },
  )

const ApiErrorItem = () =>
  object(
    {
      key: string({
        description: "Ключ поля с ошибкой",
        examples: ["field.name"],
      }),
      value: {
        description: "Значение поля, которое вызвало ошибку",
        type: ["string", "null"],
        examples: ["invalid_value"],
      },
      message: string({
        description: "Сообщение об ошибке",
        examples: ["Поле не может быть пустым"],
      }),
      code: allOf([ValidationErrorCode], {
        description: "Код ошибки",
        example: "blank",
      }),
      payload: {
        description:
          "Дополнительные данные об ошибке. Содержимое зависит от кода ошибки: `{id: number}` — при ошибке кастомного свойства (идентификатор свойства), `{record: {type: string, id: number}, query: string}` — при ошибке авторизации. В большинстве случаев `null`",
        type: ["object", "null"],
        additionalProperties: unknown(),
      },
    },
    {
      description: "Детальная информация об ошибке",
    },
  )

const AuditDetailsChatId = () =>
  object(
    {
      chat_id: int32({
        description: "Идентификатор чата",
      }),
    },
    {
      description: "При: tag_removed_from_chat",
    },
  )

const AuditDetailsChatPermission = () =>
  object(
    {
      public_access: boolean({
        description: "Публичный доступ",
      }),
    },
    {
      description: "При: chat_permission_changed",
    },
  )

const AuditDetailsChatRenamed = () =>
  object(
    {
      old_name: string({
        description: "Прежнее название чата",
      }),
      new_name: string({
        description: "Новое название чата",
      }),
    },
    {
      description: "При: chat_renamed",
    },
  )

const AuditDetailsDlp = () =>
  object(
    {
      dlp_rule_id: int32({
        description: "Идентификатор правила DLP",
      }),
      dlp_rule_name: string({
        description: "Название правила DLP",
      }),
      message_id: int32({
        description: "Идентификатор сообщения",
      }),
      chat_id: int32({
        description: "Идентификатор чата",
      }),
      user_id: int32({
        description: "Идентификатор пользователя",
      }),
      action_message: string({
        description: "Описание действия",
      }),
      conditions_matched: boolean({
        description:
          "Результат проверки условий правила (true — условия сработали)",
      }),
    },
    {
      description: "При: dlp_violation_detected",
    },
  )

const AuditDetailsEmpty = () =>
  object(
    {},
    {
      description:
        "Пустые детали. При: user_login, user_logout, user_2fa_fail, user_2fa_success, user_created, user_deleted, chat_created, message_created, message_updated, message_deleted, reaction_created, reaction_deleted, thread_created, audit_events_accessed",
    },
  )

const AuditDetailsInitiator = () =>
  object(
    {
      initiator_id: int32({
        description: "Идентификатор инициатора действия",
      }),
    },
    {
      description:
        "При: user_added_to_tag, user_removed_from_tag, user_chat_leave",
    },
  )

const AuditDetailsInviter = () =>
  object(
    {
      inviter_id: int32({
        description: "Идентификатор пригласившего",
      }),
    },
    {
      description: "При: user_chat_join",
    },
  )

const AuditDetailsKms = () =>
  object(
    {
      chat_id: int32({
        description: "Идентификатор чата",
      }),
      message_id: int32({
        description: "Идентификатор сообщения",
      }),
      reason: string({
        description: "Причина операции",
      }),
    },
    {
      description: "При: kms_encrypt, kms_decrypt",
    },
  )

const AuditDetailsRoleChanged = () =>
  object(
    {
      new_company_role: string({
        description: "Новая роль",
      }),
      previous_company_role: string({
        description: "Предыдущая роль",
      }),
      initiator_id: int32({
        description: "Идентификатор инициатора",
      }),
    },
    {
      description: "При: user_role_changed",
    },
  )

const AuditDetailsSearch = () =>
  object(
    {
      search_type: string({
        description: "Тип поиска",
      }),
      query_present: boolean({
        description: "Указан ли поисковый запрос",
      }),
      cursor_present: boolean({
        description: "Использован ли курсор",
      }),
      limit: int32({
        description: "Количество возвращённых результатов",
      }),
      filters: dict(string(), unknown(), {
        description:
          "Применённые фильтры. Возможные ключи зависят от типа поиска: order, sort, created_from, created_to, company_roles (users), active, chat_subtype, personal (chats), chat_ids, user_ids (messages)",
      }),
    },
    {
      description:
        "При: search_users_api, search_chats_api, search_messages_api",
    },
  )

const AuditDetailsTagChat = () =>
  object(
    {
      chat_id: int32({
        description: "Идентификатор чата",
      }),
      tag_name: string({
        description: "Название тега",
      }),
    },
    {
      description: "При: tag_added_to_chat",
    },
  )

const AuditDetailsTagName = () =>
  object(
    {
      name: string({
        description: "Название тега",
      }),
    },
    {
      description: "При: tag_created, tag_deleted",
    },
  )

const AuditDetailsTokenScopes = () =>
  object(
    {
      scopes: array(string(), {
        description: "Скоупы токена",
      }),
    },
    {
      description:
        "При: access_token_created, access_token_updated, access_token_destroy",
    },
  )

const AuditDetailsUserUpdated = () =>
  object(
    {
      changed_attrs: array(string(), {
        description: "Список изменённых полей",
      }),
    },
    {
      description: "При: user_updated",
    },
  )

const AuditEvent = () =>
  object(
    {
      id: string({
        description: "Уникальный идентификатор события",
        examples: ["a1b2c3d4-5e6f-7g8h-9i10-j11k12l13m14"],
      }),
      created_at: string({
        description:
          "Дата и время создания события (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2025-05-15T14:30:00.000Z"],
      }),
      event_key: allOf([AuditEventKey], {
        description: "Ключ типа события",
        example: "user_login",
      }),
      entity_id: string({
        description: "Идентификатор затронутой сущности",
        examples: ["98765"],
      }),
      entity_type: string({
        description: "Тип затронутой сущности",
        examples: ["User"],
      }),
      actor_id: string({
        description: "Идентификатор пользователя, выполнившего действие",
        examples: ["98765"],
      }),
      actor_type: string({
        description: "Тип актора",
        examples: ["User"],
      }),
      details: allOf([AuditEventDetailsUnion], {
        description:
          "Дополнительные детали события. Структура зависит от значения event_key — см. описания значений поля event_key. Для событий без деталей возвращается пустой объект",
      }),
      ip_address: string({
        description: "IP-адрес, с которого было выполнено действие",
        examples: ["192.168.1.100"],
      }),
      user_agent: string({
        description: "User agent клиента",
        examples: [
          "Pachca/3.60.0 (co.staply.pachca; build:15; iOS 18.5.0) Alamofire/5.0.0",
        ],
      }),
    },
    {
      description: "Событие аудита",
    },
  )

const AuditEventDetailsUnion = () =>
  anyOf(
    [
      AuditDetailsEmpty,
      AuditDetailsUserUpdated,
      AuditDetailsRoleChanged,
      AuditDetailsTagName,
      AuditDetailsInitiator,
      AuditDetailsInviter,
      AuditDetailsChatRenamed,
      AuditDetailsChatPermission,
      AuditDetailsTagChat,
      AuditDetailsChatId,
      AuditDetailsTokenScopes,
      AuditDetailsKms,
      AuditDetailsDlp,
      AuditDetailsSearch,
    ],
    {
      description:
        "Дополнительные детали события аудита. Структура зависит от значения event_key",
    },
  )

const AuditEventKey = () =>
  string({
    description: "Тип аудит-события",
    enum: [
      "user_login",
      "user_logout",
      "user_2fa_fail",
      "user_2fa_success",
      "user_created",
      "user_deleted",
      "user_role_changed",
      "user_updated",
      "tag_created",
      "tag_deleted",
      "user_added_to_tag",
      "user_removed_from_tag",
      "chat_created",
      "chat_renamed",
      "chat_permission_changed",
      "user_chat_join",
      "user_chat_leave",
      "tag_added_to_chat",
      "tag_removed_from_chat",
      "message_updated",
      "message_deleted",
      "message_created",
      "reaction_created",
      "reaction_deleted",
      "thread_created",
      "access_token_created",
      "access_token_updated",
      "access_token_destroy",
      "kms_encrypt",
      "kms_decrypt",
      "audit_events_accessed",
      "dlp_violation_detected",
      "search_users_api",
      "search_chats_api",
      "search_messages_api",
    ],
    "x-enum-descriptions": {
      user_login: "Пользователь успешно вошел в систему",
      user_logout: "Пользователь вышел из системы",
      user_2fa_fail: "Неудачная попытка двухфакторной аутентификации",
      user_2fa_success: "Успешная двухфакторная аутентификация",
      user_created: "Создана новая учетная запись пользователя",
      user_deleted: "Учетная запись пользователя удалена",
      user_role_changed: "Роль пользователя была изменена",
      user_updated: "Данные пользователя обновлены",
      tag_created: "Создан новый тег",
      tag_deleted: "Тег удален",
      user_added_to_tag: "Пользователь добавлен в тег",
      user_removed_from_tag: "Пользователь удален из тега",
      chat_created: "Создан новый чат",
      chat_renamed: "Чат переименован",
      chat_permission_changed: "Изменены права доступа к чату",
      user_chat_join: "Пользователь присоединился к чату",
      user_chat_leave: "Пользователь покинул чат",
      tag_added_to_chat: "Тег добавлен в чат",
      tag_removed_from_chat: "Тег удален из чата",
      message_updated: "Сообщение отредактировано",
      message_deleted: "Сообщение удалено",
      message_created: "Сообщение создано",
      reaction_created: "Реакция добавлена",
      reaction_deleted: "Реакция удалена",
      thread_created: "Тред создан",
      access_token_created: "Создан новый токен доступа",
      access_token_updated: "Токен доступа обновлен",
      access_token_destroy: "Токен доступа удален",
      kms_encrypt: "Данные зашифрованы",
      kms_decrypt: "Данные расшифрованы",
      audit_events_accessed: "Доступ к журналам аудита получен",
      dlp_violation_detected: "Срабатывание правила DLP-системы",
      search_users_api: "Поиск сотрудников через API",
      search_chats_api: "Поиск чатов через API",
      search_messages_api: "Поиск сообщений через API",
    },
  })

const AvatarData = () =>
  object(
    {
      image_url: string({
        description: "URL аватара",
        examples: [
          "https://pachca-prod.s3.amazonaws.com/uploads/0001/0001/image.jpg",
        ],
      }),
    },
    {
      description: "Данные аватара",
    },
  )

const BotResponse = () =>
  object(
    {
      id: int32({
        description: "Идентификатор бота",
        examples: [1738816],
      }),
      webhook: object(
        {
          outgoing_url: string({
            description: "URL исходящего вебхука",
            examples: ["https://www.website.com/tasks/new"],
          }),
        },
        {
          description: "Объект параметров вебхука",
        },
      ),
    },
    {
      description: "Параметры бота",
    },
  )

const BotUpdateRequest = () =>
  object(
    {
      bot: object(
        {
          webhook: object(
            {
              outgoing_url: string({
                description: "URL исходящего вебхука",
                examples: ["https://www.website.com/tasks/new"],
              }),
            },
            {
              description: "Объект параметров вебхука",
            },
          ),
        },
        {
          description: "Собранный объект параметров редактируемого бота",
        },
      ),
    },
    {
      description: "Запрос на обновление бота",
    },
  )

const Button = () =>
  object(
    {
      text: string({
        description: "Текст, отображаемый на кнопке",
        examples: ["Подробнее"],
        maxLength: 255,
      }),
      "url?": string({
        description: "Ссылка, которая будет открыта по нажатию кнопки",
        examples: ["https://example.com/details"],
      }),
      "data?": string({
        description:
          "Данные, которые будут отправлены в исходном вебхуке по нажатию кнопки",
        examples: ["awesome"],
        maxLength: 255,
      }),
    },
    {
      description: "Кнопка",
    },
  )

const ButtonWebhookPayload = () =>
  object(
    {
      type: string({
        description: "Тип объекта",
        examples: ["button"],
        const: "button",
        "x-enum-descriptions": {
          button: "Для кнопки всегда button",
        },
      }),
      event: string({
        description: "Тип события",
        examples: ["click"],
        const: "click",
        "x-enum-descriptions": {
          click: "Нажатие кнопки",
        },
      }),
      message_id: int32({
        description: "Идентификатор сообщения, к которому относится кнопка",
        examples: [1245817],
      }),
      trigger_id: string({
        description:
          "Уникальный идентификатор события. Время жизни — 3 секунды. Может быть использован, например, для открытия представления пользователю",
        examples: ["a1b2c3d4-5e6f-7g8h-9i10-j11k12l13m14"],
      }),
      data: string({
        description: "Данные нажатой кнопки",
        examples: ["button_data"],
      }),
      user_id: int32({
        description: "Идентификатор пользователя, который нажал кнопку",
        examples: [2345],
      }),
      chat_id: int32({
        description: "Идентификатор чата, в котором была нажата кнопка",
        examples: [9012],
      }),
      webhook_timestamp: int32({
        description: "Дата и время отправки вебхука (UTC+0) в формате UNIX",
        examples: [1747574400],
      }),
    },
    {
      description: "Структура исходящего вебхука о нажатии кнопки",
    },
  )

const Chat = () =>
  object(
    {
      id: int32({
        description: "Идентификатор созданного чата",
        examples: [334],
      }),
      name: string({
        description: "Название",
        examples: ["🤿 aqua"],
      }),
      created_at: string({
        description:
          "Дата и время создания чата (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2021-08-28T15:56:53.000Z"],
      }),
      owner_id: int32({
        description: "Идентификатор пользователя, создавшего чат",
        examples: [185],
      }),
      member_ids: array(int32(), {
        description: "Массив идентификаторов пользователей, участников",
        examples: [[185, 186, 187]],
      }),
      group_tag_ids: array(int32(), {
        description: "Массив идентификаторов тегов, участников",
        examples: [[9111]],
      }),
      channel: boolean({
        description: "Является каналом",
        examples: [true],
      }),
      personal: boolean({
        description: "Является личным чатом",
        examples: [false],
      }),
      public: boolean({
        description: "Открытый доступ",
        examples: [false],
      }),
      last_message_at: string({
        description:
          "Дата и время создания последнего сообщения в чате (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2021-08-28T15:56:53.000Z"],
      }),
      meet_room_url: string({
        description: "Ссылка на Видеочат",
        examples: ["https://meet.pachca.com/aqua-94bb21b5"],
      }),
    },
    {
      description: "Чат",
    },
  )

const ChatAvailability = () =>
  string({
    description: "Доступность чатов для пользователя",
    enum: ["is_member", "public"],
    "x-enum-descriptions": {
      is_member: "Чаты, где пользователь является участником",
      public:
        "Все открытые чаты компании, вне зависимости от участия в них пользователя",
    },
  })

const ChatCreateRequest = () =>
  object(
    {
      chat: object(
        {
          name: string({
            description: "Название",
            examples: ["🤿 aqua"],
          }),
          "member_ids?": array(int32(), {
            description:
              "Массив идентификаторов пользователей, которые станут участниками",
            examples: [[186, 187]],
          }),
          "group_tag_ids?": array(int32(), {
            description:
              "Массив идентификаторов тегов, которые станут участниками",
            examples: [[86, 18]],
          }),
          "channel?": boolean({
            description: "Является каналом",
            examples: [true],
            default: false,
          }),
          "public?": boolean({
            description: "Открытый доступ",
            examples: [false],
            default: false,
          }),
        },
        {
          description: "Собранный объект параметров создаваемого чата",
        },
      ),
    },
    {
      description: "Запрос на создание чата",
    },
  )

const ChatMemberRole = () =>
  string({
    description: "Роль участника чата",
    enum: ["admin", "editor", "member"],
    "x-enum-descriptions": {
      admin: "Админ",
      editor: "Редактор (доступно только для каналов)",
      member: "Участник или подписчик",
    },
  })

const ChatMemberRoleFilter = () =>
  string({
    description: "Роль участника чата (с фильтром все)",
    enum: ["all", "owner", "admin", "editor", "member"],
    "x-enum-descriptions": {
      all: "Любая роль",
      owner: "Создатель",
      admin: "Админ",
      editor: "Редактор",
      member: "Участник/подписчик",
    },
  })

const ChatMemberWebhookPayload = () =>
  object(
    {
      type: string({
        description: "Тип объекта",
        examples: ["chat_member"],
        const: "chat_member",
        "x-enum-descriptions": {
          chat_member: "Для участника чата всегда chat_member",
        },
      }),
      event: allOf([MemberEventType], {
        description: "Тип события",
        example: "add",
      }),
      chat_id: int32({
        description:
          "Идентификатор чата, в котором изменился состав участников",
        examples: [9012],
      }),
      "thread_id?": {
        description: "Идентификатор треда",
        type: ["integer", "null"],
        format: "int32",
        examples: [5678],
      },
      user_ids: array(int32(), {
        description:
          "Массив идентификаторов пользователей, с которыми произошло событие",
        examples: [[2345, 6789]],
      }),
      created_at: string({
        description:
          "Дата и время события (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2025-05-15T14:30:00.000Z"],
      }),
      webhook_timestamp: int32({
        description: "Дата и время отправки вебхука (UTC+0) в формате UNIX",
        examples: [1747574400],
      }),
    },
    {
      description: "Структура исходящего вебхука об участниках чата",
    },
  )

const ChatSortField = () =>
  string({
    description: "Поле сортировки чатов",
    enum: ["id", "last_message_at"],
    "x-enum-descriptions": {
      id: "По идентификатору чата",
      last_message_at: "По дате и времени создания последнего сообщения",
    },
  })

const ChatSubtype = () =>
  string({
    description: "Тип чата",
    enum: ["discussion", "thread"],
    "x-enum-descriptions": {
      discussion: "Канал или беседа",
      thread: "Тред",
    },
  })

const ChatUpdateRequest = () =>
  object(
    {
      chat: object(
        {
          "name?": string({
            description: "Название",
            examples: ["Бассейн"],
          }),
          "public?": boolean({
            description: "Открытый доступ",
            examples: [true],
          }),
        },
        {
          description: "Собранный объект параметров обновляемого чата",
        },
      ),
    },
    {
      description: "Запрос на обновление чата",
    },
  )

const CompanyMemberWebhookPayload = () =>
  object(
    {
      type: string({
        description: "Тип объекта",
        examples: ["company_member"],
        const: "company_member",
        "x-enum-descriptions": {
          company_member: "Для участника пространства всегда company_member",
        },
      }),
      event: allOf([UserEventType], {
        description: "Тип события",
        example: "invite",
      }),
      user_ids: array(int32(), {
        description:
          "Массив идентификаторов пользователей, с которыми произошло событие",
        examples: [[2345, 6789]],
      }),
      created_at: string({
        description:
          "Дата и время события (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2025-05-15T14:30:00.000Z"],
      }),
      webhook_timestamp: int32({
        description: "Дата и время отправки вебхука (UTC+0) в формате UNIX",
        examples: [1747574400],
      }),
    },
    {
      description: "Структура исходящего вебхука об участниках пространства",
    },
  )

const CustomProperty = () =>
  object(
    {
      id: int32({
        description: "Идентификатор поля",
        examples: [1678],
      }),
      name: string({
        description: "Название поля",
        examples: ["Город"],
      }),
      data_type: allOf([CustomPropertyDataType], {
        description: "Тип поля",
        example: "string",
      }),
      value: string({
        description: "Значение",
        examples: ["Санкт-Петербург"],
      }),
    },
    {
      description: "Дополнительное поле",
    },
  )

const CustomPropertyDataType = () =>
  string({
    description: "Тип данных дополнительного поля",
    enum: ["string", "number", "date", "link"],
    "x-enum-descriptions": {
      string: "Строковое значение",
      number: "Числовое значение",
      date: "Дата",
      link: "Ссылка",
    },
  })

const CustomPropertyDefinition = () =>
  object(
    {
      id: int32({
        description: "Идентификатор поля",
        examples: [1678],
      }),
      name: string({
        description: "Название поля",
        examples: ["Город"],
      }),
      data_type: allOf([CustomPropertyDataType], {
        description: "Тип поля",
        example: "string",
      }),
    },
    {
      description: "Дополнительное поле",
    },
  )

const ExportRequest = () =>
  object(
    {
      start_at: string({
        description:
          "Дата начала для экспорта (ISO-8601, UTC+0) в формате YYYY-MM-DD",
        format: "date",
        examples: ["2025-03-20"],
      }),
      end_at: string({
        description:
          "Дата окончания для экспорта (ISO-8601, UTC+0) в формате YYYY-MM-DD",
        format: "date",
        examples: ["2025-03-20"],
      }),
      webhook_url: string({
        description:
          "Адрес, на который будет отправлен вебхук по завершению экспорта",
        examples: ["https://webhook.site/9227d3b8-6e82-4e64-bf5d-ad972ad270f2"],
      }),
      "chat_ids?": array(int32(), {
        description:
          "Массив идентификаторов чатов. Указывается, если нужно получить сообщения только некоторых чатов.",
        examples: [[1381521]],
      }),
      "skip_chats_file?": boolean({
        description: "Пропуск формирования файла со списком чатов (chats.json)",
        examples: [false],
      }),
    },
    {
      description: "Запрос на экспорт сообщений",
    },
  )

const File = () =>
  object(
    {
      id: int32({
        description: "Идентификатор файла",
        examples: [3560],
      }),
      key: string({
        description: "Путь к файлу",
        examples: [
          "attaches/files/12/21zu7934-02e1-44d9-8df2-0f970c259796/congrat.png",
        ],
      }),
      name: string({
        description: "Название файла с расширением",
        examples: ["congrat.png"],
      }),
      file_type: allOf([FileType], {
        description: "Тип файла",
        example: "image",
      }),
      url: string({
        description: "Прямая ссылка на скачивание файла",
        examples: [
          "https://pachca-prod-uploads.s3.storage.selcloud.ru/attaches/files/12/21zu7934-02e1-44d9-8df2-0f970c259796/congrat.png?response-cache-control=max-age%3D3600%3B&response-content-disposition=attachment&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=142155_staply%2F20231107%2Fru-1a%2Fs3%2Faws4_request&X-Amz-Date=20231107T160412&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=98765asgfadsfdSaDSd4sdfg35asdf67sadf8",
        ],
      }),
      "width?": {
        description: "Ширина изображения в пикселях",
        type: ["integer", "null"],
        format: "int32",
        examples: [1920],
      },
      "height?": {
        description: "Высота изображения в пикселях",
        type: ["integer", "null"],
        format: "int32",
        examples: [1080],
      },
    },
    {
      description: "Файл",
    },
  )

const FileType = () =>
  string({
    description: "Тип файла",
    enum: ["file", "image"],
    "x-enum-descriptions": {
      file: "Обычный файл",
      image: "Изображение",
    },
  })

const FileUploadRequest = () =>
  object({
    "Content-Disposition": string({
      description:
        "Параметр Content-Disposition, полученный в ответе на запрос [Получение подписи, ключа и других параметров](POST /uploads)",
    }),
    acl: string({
      description:
        "Параметр acl, полученный в ответе на запрос [Получение подписи, ключа и других параметров](POST /uploads)",
    }),
    policy: string({
      description:
        "Параметр policy, полученный в ответе на запрос [Получение подписи, ключа и других параметров](POST /uploads)",
    }),
    "x-amz-credential": string({
      description:
        "Параметр x-amz-credential, полученный в ответе на запрос [Получение подписи, ключа и других параметров](POST /uploads)",
    }),
    "x-amz-algorithm": string({
      description:
        "Параметр x-amz-algorithm, полученный в ответе на запрос [Получение подписи, ключа и других параметров](POST /uploads)",
    }),
    "x-amz-date": string({
      description:
        "Параметр x-amz-date, полученный в ответе на запрос [Получение подписи, ключа и других параметров](POST /uploads)",
    }),
    "x-amz-signature": string({
      description:
        "Параметр x-amz-signature, полученный в ответе на запрос [Получение подписи, ключа и других параметров](POST /uploads)",
    }),
    key: string({
      description:
        "Параметр key, полученный в ответе на запрос [Получение подписи, ключа и других параметров](POST /uploads)",
    }),
    file: string({
      description: "Файл для загрузки",
      format: "binary",
    }),
  })

const Forwarding = () =>
  object(
    {
      original_message_id: int32({
        description: "Идентификатор оригинального сообщения",
        examples: [194275],
      }),
      original_chat_id: int32({
        description:
          "Идентификатор чата, в котором находится оригинальное сообщение",
        examples: [334],
      }),
      author_id: int32({
        description:
          "Идентификатор пользователя, создавшего оригинальное сообщение",
        examples: [12],
      }),
      original_created_at: string({
        description:
          "Дата и время создания оригинального сообщения (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2025-01-15T10:30:00.000Z"],
      }),
      original_thread_id: {
        description:
          "Идентификатор треда, в котором находится оригинальное сообщение",
        type: ["integer", "null"],
        format: "int32",
      },
      original_thread_message_id: {
        description:
          "Идентификатор сообщения, к которому был создан тред, в котором находится оригинальное сообщение",
        type: ["integer", "null"],
        format: "int32",
      },
      original_thread_parent_chat_id: {
        description:
          "Идентификатор чата сообщения, к которому был создан тред, в котором находится оригинальное сообщение",
        type: ["integer", "null"],
        format: "int32",
      },
    },
    {
      description: "Информация о пересланном сообщении",
    },
  )

const GroupTag = () =>
  object(
    {
      id: int32({
        description: "Идентификатор тега",
        examples: [9111],
      }),
      name: string({
        description: "Название тега",
        examples: ["Design"],
      }),
      users_count: int32({
        description: "Количество сотрудников, которые имеют этот тег",
        examples: [6],
      }),
    },
    {
      description: "Тег",
    },
  )

const GroupTagRequest = () =>
  object(
    {
      group_tag: object({
        name: string({
          description: "Название тега",
          examples: ["Новое название тега"],
        }),
      }),
    },
    {
      description: "Запрос на создание или редактирование тега",
    },
  )

const InviteStatus = () =>
  string({
    description: "Статус приглашения пользователя",
    enum: ["confirmed", "sent"],
    "x-enum-descriptions": {
      confirmed: "Принято",
      sent: "Отправлено",
    },
  })

const LinkPreview = () =>
  object(
    {
      title: string({
        description: "Заголовок",
        examples: ["Статья: Отправка файлов"],
      }),
      description: string({
        description: "Описание",
        examples: ["Пример отправки файлов на удаленный сервер"],
      }),
      "image_url?": string({
        description:
          "Публичная ссылка на изображение (если вы хотите загрузить файл изображения в Пачку, то используйте параметр image)",
        examples: ["https://website.com/img/landing.png"],
      }),
      "image?": object(
        {
          key: string({
            description:
              "Путь к изображению, полученный в результате [загрузки файла](POST /direct_url)",
            examples: [
              "attaches/files/93746/e354fd79-9jh6-f2hd-fj83-709dae24c763/${filename}",
            ],
          }),
          name: string({
            description:
              "Название изображения (рекомендуется писать вместе с расширением)",
            examples: ["files-to-server.jpg"],
          }),
          "size?": int32({
            description: "Размер изображения в байтах",
            examples: [695604],
          }),
        },
        {
          description: "Изображение",
        },
      ),
    },
    {
      description: "Данные для предпросмотра ссылки",
    },
  )

const LinkPreviewsRequest = () =>
  object(
    {
      link_previews: dict(string(), LinkPreview, {
        description:
          "`JSON` карта предпросмотров ссылок, где каждый ключ — `URL`, который был получен в исходящем вебхуке о новом сообщении.",
        "x-record-key-example": "https://website.com/articles/123",
      }),
    },
    {
      description: "Запрос на разворачивание ссылок",
    },
  )

const LinkSharedWebhookPayload = () =>
  object(
    {
      type: string({
        description: "Тип объекта",
        examples: ["message"],
        const: "message",
        "x-enum-descriptions": {
          message: "Для разворачивания ссылок всегда message",
        },
      }),
      event: string({
        description: "Тип события",
        examples: ["link_shared"],
        const: "link_shared",
        "x-enum-descriptions": {
          link_shared: "Обнаружена ссылка на отслеживаемый домен",
        },
      }),
      chat_id: int32({
        description: "Идентификатор чата, в котором обнаружена ссылка",
        examples: [23438],
      }),
      message_id: int32({
        description: "Идентификатор сообщения, содержащего ссылку",
        examples: [268092],
      }),
      links: array(WebhookLink, {
        description: "Массив обнаруженных ссылок на отслеживаемые домены",
      }),
      user_id: int32({
        description: "Идентификатор отправителя сообщения",
        examples: [2345],
      }),
      created_at: string({
        description:
          "Дата и время создания сообщения (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2024-09-18T19:53:14.000Z"],
      }),
      webhook_timestamp: int32({
        description: "Дата и время отправки вебхука (UTC+0) в формате UNIX",
        examples: [1726685594],
      }),
    },
    {
      description: "Структура исходящего вебхука о разворачивании ссылок",
    },
  )

const MemberEventType = () =>
  string({
    description: "Тип события webhook для участников",
    enum: ["add", "remove"],
    "x-enum-descriptions": {
      add: "Добавление",
      remove: "Удаление",
    },
  })

const Message = () =>
  object(
    {
      id: int32({
        description: "Идентификатор сообщения",
        examples: [194275],
      }),
      entity_type: allOf([MessageEntityType], {
        description: "Тип сущности, к которой относится сообщение",
        example: "discussion",
      }),
      entity_id: int32({
        description:
          "Идентификатор сущности, к которой относится сообщение (беседы/канала, треда или пользователя)",
        examples: [334],
      }),
      chat_id: int32({
        description: "Идентификатор чата, в котором находится сообщение",
        examples: [334],
      }),
      root_chat_id: int32({
        description:
          "Идентификатор корневого чата. Для сообщений в тредах — идентификатор чата, в котором был создан тред. Для обычных сообщений совпадает с `chat_id`.",
        examples: [334],
      }),
      content: string({
        description: "Текст сообщения",
        examples: [
          "Вчера мы продали 756 футболок (что на 10% больше, чем в прошлое воскресенье)",
        ],
      }),
      user_id: int32({
        description: "Идентификатор пользователя, создавшего сообщение",
        examples: [12],
      }),
      created_at: string({
        description:
          "Дата и время создания сообщения (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2021-08-28T15:57:23.000Z"],
      }),
      url: string({
        description: "Прямая ссылка на сообщение",
        examples: ["https://app.pachca.com/chats/334?message=194275"],
      }),
      files: array(File, {
        description: "Прикрепленные файлы",
      }),
      buttons: {
        description:
          "Массив строк, каждая из которых представлена массивом кнопок",
        type: ["array", "null"],
        items: array(Button),
      },
      thread: {
        description: "Тред сообщения",
        type: ["object", "null"],
        properties: {
          id: int64({
            description: "Идентификатор треда",
            examples: [265142],
          }),
          chat_id: int64({
            description: "Идентификатор чата треда",
            examples: [2637266155],
          }),
        },
        required: ["id", "chat_id"],
      },
      forwarding: nullable(
        allOf([Forwarding], {
          description: "Информация о пересланном сообщении",
        }),
      ),
      parent_message_id: {
        description: "Идентификатор сообщения, к которому написан ответ",
        type: ["integer", "null"],
        format: "int32",
      },
      display_avatar_url: {
        description: "Ссылка на аватарку отправителя сообщения",
        type: ["string", "null"],
      },
      display_name: {
        description: "Полное имя отправителя сообщения",
        type: ["string", "null"],
      },
      changed_at: {
        description:
          "Дата и время последнего редактирования сообщения (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        type: ["string", "null"],
        format: "date-time",
        examples: ["2021-08-28T16:10:00.000Z"],
      },
      deleted_at: {
        description:
          "Дата и время удаления сообщения (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        type: ["string", "null"],
        format: "date-time",
      },
    },
    {
      description: "Сообщение",
    },
  )

const MessageCreateRequest = () =>
  object(
    {
      message: object(
        {
          "entity_type?": allOf([MessageEntityType], {
            description: "Тип сущности",
            example: "discussion",
            default: "discussion",
          }),
          entity_id: int32({
            description: "Идентификатор сущности",
            examples: [334],
          }),
          content: string({
            description:
              "Текст сообщения. Поддерживает упоминания: `@nickname` или `<@user_id>` (будет автоматически преобразовано в `@nickname`).",
            examples: [
              "Вчера мы продали 756 футболок (что на 10% больше, чем в прошлое воскресенье)",
            ],
          }),
          "files?": array(
            object({
              key: string({
                description:
                  "Путь к файлу, полученный в результате [загрузки файла](POST /direct_url)",
                examples: [
                  "attaches/files/93746/e354fd79-4f3e-4b5a-9c8d-1a2b3c4d5e6f/logo.png",
                ],
              }),
              name: string({
                description:
                  "Название файла, которое вы хотите отображать пользователю (рекомендуется писать вместе с расширением)",
                examples: ["logo.png"],
              }),
              file_type: allOf([FileType], {
                description: "Тип файла",
                example: "image",
              }),
              size: int32({
                description: "Размер файла в байтах, отображаемый пользователю",
                examples: [12345],
              }),
              "width?": int32({
                description:
                  "Ширина изображения в px (используется в случае, если file_type указан как image)",
                examples: [800],
              }),
              "height?": int32({
                description:
                  "Высота изображения в px (используется в случае, если file_type указан как image)",
                examples: [600],
              }),
            }),
            {
              description: "Прикрепляемые файлы",
            },
          ),
          "buttons?": array(array(Button), {
            description:
              "Массив строк, каждая из которых представлена массивом кнопок. Максимум 100 кнопок у сообщения, до 8 кнопок в строке.",
            examples: [
              [
                [
                  {
                    text: "Подробнее",
                    url: "https://example.com/details",
                  },
                  {
                    text: "Отлично!",
                    data: "awesome",
                  },
                ],
              ],
            ],
          }),
          "parent_message_id?": int32({
            description:
              "Идентификатор сообщения. Указывается в случае, если вы отправляете ответ на другое сообщение.",
            examples: [194270],
          }),
          "display_avatar_url?": string({
            description:
              "Ссылка на специальную аватарку отправителя для этого сообщения. Использование этого поля возможно только с access_token бота.",
            examples: ["https://example.com/avatar.png"],
            maxLength: 255,
          }),
          "display_name?": string({
            description:
              "Полное специальное имя отправителя для этого сообщения. Использование этого поля возможно только с access_token бота.",
            examples: ["Бот Поддержки"],
            maxLength: 255,
          }),
          "skip_invite_mentions?": boolean({
            description:
              "Пропуск добавления упоминаемых пользователей в тред. Работает только при отправке сообщения в тред.",
            examples: [false],
            default: false,
          }),
        },
        {
          description: "Собранный объект параметров создаваемого сообщения",
        },
      ),
      "link_preview?": boolean({
        description:
          "Отображение предпросмотра первой найденной ссылки в тексте сообщения",
        examples: [false],
        default: false,
      }),
    },
    {
      description: "Запрос на создание сообщения",
    },
  )

const MessageEntityType = () =>
  string({
    description: "Тип сущности для сообщений",
    enum: ["discussion", "thread", "user"],
    "x-enum-descriptions": {
      discussion: "Беседа или канал",
      thread: "Тред",
      user: "Пользователь",
    },
  })

const MessageSortField = () =>
  string({
    description: "Поле сортировки сообщений",
    const: "id",
    "x-enum-descriptions": {
      id: "По идентификатору сообщения",
    },
  })

const MessageUpdateRequest = () =>
  object(
    {
      message: object(
        {
          "content?": string({
            description:
              "Текст сообщения. Поддерживает упоминания: `@nickname` или `<@user_id>` (будет автоматически преобразовано в `@nickname`).",
            examples: [
              "Вот попробуйте написать правильно это с первого раза: Будущий, Полощи, Прийти, Грейпфрут, Мозаика, Бюллетень, Дуршлаг, Винегрет.",
            ],
          }),
          "files?": array(
            object({
              key: string({
                description:
                  "Путь к файлу, полученный в результате [загрузки файла](POST /direct_url)",
                examples: [
                  "attaches/files/93746/e354fd79-4f3e-4b5a-9c8d-1a2b3c4d5e6f/logo.png",
                ],
              }),
              name: string({
                description:
                  "Название файла, которое вы хотите отображать пользователю (рекомендуется писать вместе с расширением)",
                examples: ["logo.png"],
              }),
              "file_type?": string({
                description: "Тип файла: файл (file), изображение (image)",
                examples: ["image"],
              }),
              "size?": int32({
                description: "Размер файла в байтах, отображаемый пользователю",
                examples: [12345],
              }),
              "width?": int32({
                description:
                  "Ширина изображения в px (используется в случае, если file_type указан как image)",
                examples: [800],
              }),
              "height?": int32({
                description:
                  "Высота изображения в px (используется в случае, если file_type указан как image)",
                examples: [600],
              }),
            }),
            {
              description: "Прикрепляемые файлы",
            },
          ),
          "buttons?": array(array(Button), {
            description:
              "Массив строк, каждая из которых представлена массивом кнопок. Максимум 100 кнопок у сообщения, до 8 кнопок в строке. Для удаления кнопок пришлите пустой массив.",
            examples: [
              [
                [
                  {
                    text: "Подробнее",
                    url: "https://example.com/details",
                  },
                ],
              ],
            ],
          }),
          "display_avatar_url?": string({
            description:
              "Ссылка на специальную аватарку отправителя для этого сообщения. Использование этого поля возможно только с access_token бота.",
            examples: ["https://example.com/avatar.png"],
          }),
          "display_name?": string({
            description:
              "Полное специальное имя отправителя для этого сообщения. Использование этого поля возможно только с access_token бота.",
            examples: ["Бот Поддержки"],
          }),
        },
        {
          description: "Собранный объект параметров редактируемого сообщения",
        },
      ),
    },
    {
      description: "Запрос на редактирование сообщения",
    },
  )

const MessageWebhookPayload = () =>
  object(
    {
      type: string({
        description: "Тип объекта",
        examples: ["message"],
        const: "message",
        "x-enum-descriptions": {
          message: "Для сообщений всегда message",
        },
      }),
      id: int32({
        description: "Идентификатор сообщения",
        examples: [1245817],
      }),
      event: allOf([WebhookEventType], {
        description: "Тип события",
        example: "new",
      }),
      entity_type: allOf([MessageEntityType], {
        description: "Тип сущности, к которой относится сообщение",
        example: "discussion",
      }),
      entity_id: int32({
        description: "Идентификатор сущности, к которой относится сообщение",
        examples: [5678],
      }),
      content: string({
        description: "Текст сообщения",
        examples: ["Текст сообщения"],
      }),
      user_id: int32({
        description: "Идентификатор отправителя сообщения",
        examples: [2345],
      }),
      created_at: string({
        description:
          "Дата и время создания сообщения (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2025-05-15T14:30:00.000Z"],
      }),
      url: string({
        description: "Прямая ссылка на сообщение",
        examples: ["https://pachca.com/chats/1245817/messages/5678"],
      }),
      chat_id: int32({
        description: "Идентификатор чата, в котором находится сообщение",
        examples: [9012],
      }),
      "parent_message_id?": {
        description: "Идентификатор сообщения, к которому написан ответ",
        type: ["integer", "null"],
        format: "int32",
        examples: [3456],
      },
      "thread?": nullable(
        allOf([WebhookMessageThread], {
          description: "Объект с параметрами треда",
        }),
      ),
      webhook_timestamp: int32({
        description: "Дата и время отправки вебхука (UTC+0) в формате UNIX",
        examples: [1747574400],
      }),
    },
    {
      description: "Структура исходящего вебхука о сообщении",
    },
  )

const OAuthError = () =>
  object(
    {
      error: string({
        description: "Код ошибки",
        examples: ["invalid_token"],
      }),
      error_description: string({
        description: "Описание ошибки",
        examples: ["Access token is missing"],
      }),
    },
    {
      description: "Ошибка OAuth авторизации (используется для 401 и 403)",
      "x-error": true,
    },
  )

const OAuthScope = () =>
  string({
    description: "Скоуп доступа OAuth токена",
    enum: [
      "chats:read",
      "chats:create",
      "chats:update",
      "chats:archive",
      "chats:leave",
      "chat_members:read",
      "chat_members:write",
      "chat_exports:read",
      "chat_exports:write",
      "messages:read",
      "messages:create",
      "messages:update",
      "messages:delete",
      "reactions:read",
      "reactions:write",
      "pins:write",
      "threads:read",
      "threads:create",
      "link_previews:write",
      "users:read",
      "users:create",
      "users:update",
      "users:delete",
      "group_tags:read",
      "group_tags:write",
      "bots:write",
      "profile:read",
      "profile_status:read",
      "profile_status:write",
      "profile_avatar:write",
      "user_status:read",
      "user_status:write",
      "user_avatar:write",
      "custom_properties:read",
      "audit_events:read",
      "tasks:read",
      "tasks:create",
      "tasks:update",
      "tasks:delete",
      "files:read",
      "files:write",
      "uploads:write",
      "views:write",
      "webhooks:read",
      "webhooks:write",
      "webhooks:events:read",
      "webhooks:events:delete",
      "search:users",
      "search:chats",
      "search:messages",
    ],
    "x-enum-descriptions": {
      chats_read: "Просмотр чатов и списка чатов",
      chats_create: "Создание новых чатов",
      chats_update: "Изменение настроек чата",
      chats_archive: "Архивация и разархивация чатов",
      chats_leave: "Выход из чатов",
      chat_members_read: "Просмотр участников чата",
      chat_members_write: "Добавление, изменение и удаление участников чата",
      chat_exports_read: "Скачивание экспортов чата",
      chat_exports_write: "Создание экспортов чата",
      messages_read: "Просмотр сообщений в чатах",
      messages_create: "Отправка сообщений",
      messages_update: "Редактирование сообщений",
      messages_delete: "Удаление сообщений",
      reactions_read: "Просмотр реакций на сообщения",
      reactions_write: "Добавление и удаление реакций",
      pins_write: "Закрепление и открепление сообщений",
      threads_read: "Просмотр тредов (комментариев)",
      threads_create: "Создание тредов (комментариев)",
      link_previews_write: "Unfurl (разворачивание ссылок)",
      views_write: "Открытие форм (представлений)",
      users_read: "Просмотр информации о сотрудниках и списка сотрудников",
      users_create: "Создание новых сотрудников",
      users_update: "Редактирование данных сотрудника",
      users_delete: "Удаление сотрудников",
      group_tags_read: "Просмотр тегов",
      group_tags_write: "Создание, редактирование и удаление тегов",
      bots_write: "Изменение настроек бота",
      profile_read: "Просмотр информации о своем профиле",
      profile_status_read: "Просмотр статуса профиля",
      profile_status_write: "Изменение и удаление статуса профиля",
      profile_avatar_write: "Изменение и удаление аватара профиля",
      user_status_read: "Просмотр статуса сотрудника",
      user_status_write: "Изменение и удаление статуса сотрудника",
      user_avatar_write: "Изменение и удаление аватара сотрудника",
      custom_properties_read: "Просмотр дополнительных полей",
      audit_events_read: "Просмотр журнала аудита",
      tasks_read: "Просмотр задач",
      tasks_create: "Создание задач",
      tasks_update: "Изменение задачи",
      tasks_delete: "Удаление задачи",
      files_read: "Скачивание файлов",
      files_write: "Загрузка файлов",
      uploads_write: "Получение данных для загрузки файлов",
      webhooks_read: "Просмотр вебхуков",
      webhooks_write: "Создание и управление вебхуками",
      webhooks_events_read: "Просмотр лога вебхуков",
      webhooks_events_delete: "Удаление записи в логе вебхука",
      search_users: "Поиск сотрудников",
      search_chats: "Поиск чатов",
      search_messages: "Поиск сообщений",
    },
    "x-scope-roles": {
      chats_read: ["owner", "admin", "user", "bot"],
      chats_create: ["owner", "admin", "user", "bot"],
      chats_update: ["owner", "admin", "user", "bot"],
      chats_archive: ["owner", "admin", "user", "bot"],
      chats_leave: ["owner", "admin", "user", "bot"],
      chat_members_read: ["owner", "admin", "user", "bot"],
      chat_members_write: ["owner", "admin", "user", "bot"],
      chat_exports_read: ["owner"],
      chat_exports_write: ["owner"],
      messages_read: ["owner", "admin", "user", "bot"],
      messages_create: ["owner", "admin", "user", "bot"],
      messages_update: ["owner", "admin", "user", "bot"],
      messages_delete: ["owner", "admin", "user", "bot"],
      reactions_read: ["owner", "admin", "user", "bot"],
      reactions_write: ["owner", "admin", "user", "bot"],
      pins_write: ["owner", "admin", "user", "bot"],
      threads_read: ["owner", "admin", "user", "bot"],
      threads_create: ["owner", "admin", "user", "bot"],
      link_previews_write: ["owner", "admin", "user", "bot"],
      views_write: ["owner", "admin", "user", "bot"],
      users_read: ["owner", "admin", "user", "bot"],
      users_create: ["owner", "admin"],
      users_update: ["owner", "admin"],
      users_delete: ["owner", "admin"],
      group_tags_read: ["owner", "admin"],
      group_tags_write: ["owner", "admin"],
      bots_write: ["owner", "admin", "user", "bot"],
      profile_read: ["owner", "admin", "user", "bot"],
      profile_status_read: ["owner", "admin", "user", "bot"],
      profile_status_write: ["owner", "admin", "user", "bot"],
      profile_avatar_write: ["owner", "admin", "user", "bot"],
      user_status_read: ["owner", "admin"],
      user_status_write: ["owner", "admin"],
      user_avatar_write: ["owner", "admin"],
      custom_properties_read: ["owner", "admin", "user", "bot"],
      audit_events_read: ["owner"],
      tasks_read: ["owner", "admin", "user", "bot"],
      tasks_create: ["owner", "admin", "user", "bot"],
      tasks_update: ["owner", "admin", "user", "bot"],
      tasks_delete: ["owner", "admin", "user", "bot"],
      files_read: ["owner", "admin", "user", "bot"],
      files_write: ["owner", "admin", "user", "bot"],
      uploads_write: ["owner", "admin", "user", "bot"],
      webhooks_read: ["owner", "admin", "user", "bot"],
      webhooks_write: ["owner", "admin", "user", "bot"],
      webhooks_events_read: ["owner", "admin", "user", "bot"],
      webhooks_events_delete: ["owner", "admin", "user", "bot"],
      search_users: ["owner", "admin", "user", "bot"],
      search_chats: ["owner", "admin", "user", "bot"],
      search_messages: ["owner", "admin", "user", "bot"],
    },
  })

const OpenViewRequest = () =>
  object(
    {
      type: string({
        description: "Способ открытия представления",
        examples: ["modal"],
        const: "modal",
        "x-enum-descriptions": {
          modal: "Модальное окно",
        },
      }),
      trigger_id: string({
        description:
          "Уникальный идентификатор события (полученный, например, в исходящем вебхуке о нажатии кнопки)",
        examples: ["791a056b-006c-49dd-834b-c633fde52fe8"],
      }),
      "private_metadata?": string({
        description:
          "Необязательная строка, которая будет отправлена в ваше приложение при отправке пользователем заполненной формы. Используйте это поле, например, для передачи в формате `JSON` какой то дополнительной информации вместе с заполненной пользователем формой.",
        examples: ['{"timeoff_id":4378}'],
        maxLength: 3000,
      }),
      "callback_id?": string({
        description:
          "Необязательный идентификатор для распознавания этого представления, который будет отправлен в ваше приложение при отправке пользователем заполненной формы. Используйте это поле, например, для понимания, какую форму должен был заполнить пользователь.",
        examples: ["timeoff_reguest_form"],
        maxLength: 255,
      }),
      view: object(
        {
          title: string({
            description: "Заголовок представления",
            examples: ["Уведомление об отпуске"],
            maxLength: 24,
          }),
          "close_text?": string({
            description: "Текст кнопки закрытия представления",
            examples: ["Закрыть"],
            default: "Отменить",
            maxLength: 24,
          }),
          "submit_text?": string({
            description: "Текст кнопки отправки формы",
            examples: ["Отправить заявку"],
            default: "Отправить",
            maxLength: 24,
          }),
          blocks: array(ViewBlockUnion, {
            description: "Массив блоков представления",
            maxItems: 100,
          }),
        },
        {
          description: "Собранный объект представления",
        },
      ),
    },
    {
      description: "Представление",
    },
  )

const PaginationMeta = () =>
  object(
    {
      paginate: object(
        {
          next_page: string({
            description: "Курсор пагинации следующей страницы",
            examples: ["eyJxZCO2MiwiZGlyIjomSNYjIn3"],
          }),
        },
        {
          description: "Вспомогательная информация",
        },
      ),
    },
    {
      description: "Метаданные пагинации",
    },
  )

const Reaction = () =>
  object(
    {
      user_id: int32({
        description: "Идентификатор пользователя, который добавил реакцию",
        examples: [12],
      }),
      created_at: string({
        description:
          "Дата и время добавления реакции (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2024-01-20T10:30:00.000Z"],
      }),
      code: string({
        description: "Emoji символ реакции",
        examples: ["👍"],
      }),
      name: {
        description: "Название emoji реакции",
        type: ["string", "null"],
        examples: [":+1::skin-tone-1:"],
      },
    },
    {
      description: "Реакция на сообщение",
    },
  )

const ReactionEventType = () =>
  string({
    description: "Тип события webhook для реакций",
    enum: ["new", "delete"],
    "x-enum-descriptions": {
      new: "Создание",
      delete: "Удаление",
    },
  })

const ReactionRequest = () =>
  object(
    {
      code: string({
        description: "Emoji символ реакции",
        examples: ["👍"],
      }),
      "name?": string({
        description: "Текстовое имя эмодзи (используется для кастомных эмодзи)",
        examples: [":+1:"],
      }),
    },
    {
      description: "Запрос на добавление реакции",
    },
  )

const ReactionWebhookPayload = () =>
  object(
    {
      type: string({
        description: "Тип объекта",
        examples: ["reaction"],
        const: "reaction",
        "x-enum-descriptions": {
          reaction: "Для реакций всегда reaction",
        },
      }),
      event: allOf([ReactionEventType], {
        description: "Тип события",
        example: "new",
      }),
      message_id: int32({
        description: "Идентификатор сообщения, к которому относится реакция",
        examples: [1245817],
      }),
      code: string({
        description: "Emoji символ реакции",
        examples: ["👍"],
      }),
      name: string({
        description: "Название реакции",
        examples: ["thumbsup"],
      }),
      user_id: int32({
        description:
          "Идентификатор пользователя, который добавил или удалил реакцию",
        examples: [2345],
      }),
      created_at: string({
        description:
          "Дата и время создания сообщения (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2025-05-15T14:30:00.000Z"],
      }),
      webhook_timestamp: int32({
        description: "Дата и время отправки вебхука (UTC+0) в формате UNIX",
        examples: [1747574400],
      }),
    },
    {
      description: "Структура исходящего вебхука о реакции",
    },
  )

const SearchEntityType = () =>
  string({
    description: "Тип сущности для поиска",
    enum: ["User", "Task"],
    "x-enum-descriptions": {
      User: "Пользователь",
      Task: "Задача",
    },
  })

const SearchPaginationMeta = () =>
  object(
    {
      total: int32({
        description: "Общее количество найденных результатов",
        examples: [42],
      }),
      paginate: object(
        {
          next_page: string({
            description: "Курсор пагинации следующей страницы",
            examples: ["eyJxZCO2MiwiZGlyIjomSNYjIn3"],
          }),
        },
        {
          description: "Вспомогательная информация",
        },
      ),
    },
    {
      description: "Мета-информация для пагинации поисковых результатов",
    },
  )

const SearchSortOrder = () =>
  string({
    description: "Сортировка результатов поиска",
    enum: ["by_score", "alphabetical"],
    "x-enum-descriptions": {
      by_score: "По релевантности",
      alphabetical: "По алфавиту",
    },
  })

const StatusUpdateRequest = () =>
  object(
    {
      status: object({
        emoji: string({
          description: "Emoji символ статуса",
          examples: ["🎮"],
        }),
        title: string({
          description: "Текст статуса",
          examples: ["Очень занят"],
        }),
        "expires_at?": string({
          description:
            "Срок жизни статуса (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
          format: "date-time",
          examples: ["2024-04-08T10:00:00.000Z"],
        }),
        "is_away?": boolean({
          description: "Режим «Нет на месте»",
          examples: [true],
        }),
        "away_message?": string({
          description:
            "Текст сообщения при режиме «Нет на месте». Отображается в профиле и при личных сообщениях/упоминаниях.",
          examples: ["Вернусь после 15:00"],
          maxLength: 1024,
        }),
      }),
    },
    {
      description: "Запрос на установку статуса",
    },
  )

const TagNamesFilter = () =>
  array(string(), {
    description: "Массив названий тегов",
    examples: [["Design", "iOS"]],
  })

const Task = () =>
  object(
    {
      id: int32({
        description: "Идентификатор напоминания",
        examples: [22283],
      }),
      kind: allOf([TaskKind], {
        description: "Тип",
        example: "reminder",
      }),
      content: string({
        description: "Описание",
        examples: ["Забрать со склада 21 заказ"],
      }),
      due_at: {
        description:
          "Срок выполнения напоминания (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        type: ["string", "null"],
        format: "date-time",
        examples: ["2020-06-05T09:00:00.000Z"],
      },
      priority: int32({
        description: "Приоритет",
        examples: [2],
      }),
      user_id: int32({
        description: "Идентификатор пользователя-создателя напоминания",
        examples: [12],
      }),
      chat_id: {
        description: "Идентификатор чата, к которому привязано напоминание",
        type: ["integer", "null"],
        format: "int32",
        examples: [334],
      },
      status: allOf([TaskStatus], {
        description: "Статус напоминания",
        example: "undone",
      }),
      created_at: string({
        description:
          "Дата и время создания напоминания (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2020-06-04T10:37:57.000Z"],
      }),
      performer_ids: array(int32(), {
        description:
          "Массив идентификаторов пользователей, привязанных к напоминанию как «ответственные»",
        examples: [[12]],
      }),
      all_day: boolean({
        description: "Напоминание на весь день (без указания времени)",
        examples: [false],
      }),
      custom_properties: array(CustomProperty, {
        description: "Дополнительные поля напоминания",
      }),
    },
    {
      description: "Напоминание",
    },
  )

const TaskCreateRequest = () =>
  object(
    {
      task: object(
        {
          kind: allOf([TaskKind], {
            description: "Тип",
            example: "reminder",
          }),
          "content?": string({
            description: "Описание (по умолчанию — название типа)",
            examples: ["Забрать со склада 21 заказ"],
          }),
          "due_at?": string({
            description:
              "Срок выполнения напоминания (ISO-8601) в формате YYYY-MM-DDThh:mm:ss.sssTZD. Если указано время 23:59:59.000, то напоминание будет создано на весь день (без указания времени).",
            format: "date-time",
            examples: ["2020-06-05T12:00:00.000+03:00"],
          }),
          "priority?": int32({
            description: "Приоритет: 1, 2 (важно) или 3 (очень важно).",
            examples: [2],
            default: 1,
          }),
          "performer_ids?": array(int32(), {
            description:
              "Массив идентификаторов пользователей, привязываемых к напоминанию как «ответственные» (по умолчанию ответственным назначается вы)",
            examples: [[12, 13]],
          }),
          "chat_id?": int32({
            description:
              "Идентификатор чата, к которому привязывается напоминание",
            examples: [456],
          }),
          "all_day?": boolean({
            description: "Напоминание на весь день (без указания времени)",
            examples: [false],
          }),
          "custom_properties?": array(
            object({
              id: int32({
                description: "Идентификатор поля",
                examples: [78],
              }),
              value: string({
                description: "Устанавливаемое значение",
                examples: ["Синий склад"],
              }),
            }),
            {
              description: "Задаваемые дополнительные поля",
            },
          ),
        },
        {
          description: "Собранный объект параметров создаваемого напоминания",
        },
      ),
    },
    {
      description: "Запрос на создание напоминания",
    },
  )

const TaskKind = () =>
  string({
    description: "Тип задачи",
    enum: ["call", "meeting", "reminder", "event", "email"],
    "x-enum-descriptions": {
      call: "Позвонить контакту",
      meeting: "Встреча",
      reminder: "Простое напоминание",
      event: "Событие",
      email: "Написать письмо",
    },
  })

const TaskStatus = () =>
  string({
    description: "Статус напоминания",
    enum: ["done", "undone"],
    "x-enum-descriptions": {
      done: "Выполнено",
      undone: "Активно",
    },
  })

const TaskUpdateRequest = () =>
  object(
    {
      task: object(
        {
          "kind?": allOf([TaskKind], {
            description: "Тип",
            example: "reminder",
          }),
          "content?": string({
            description: "Описание",
            examples: ["Забрать со склада 21 заказ"],
          }),
          "due_at?": string({
            description:
              "Срок выполнения напоминания (ISO-8601) в формате YYYY-MM-DDThh:mm:ss.sssTZD. Если указано время 23:59:59.000, то напоминание будет создано на весь день (без указания времени).",
            format: "date-time",
            examples: ["2020-06-05T12:00:00.000+03:00"],
          }),
          "priority?": int32({
            description: "Приоритет: 1, 2 (важно) или 3 (очень важно).",
            examples: [2],
          }),
          "performer_ids?": array(int32(), {
            description:
              "Массив идентификаторов пользователей, привязываемых к напоминанию как «ответственные»",
            examples: [[12]],
          }),
          "status?": allOf([TaskStatus], {
            description: "Статус",
            example: "done",
          }),
          "all_day?": boolean({
            description: "Напоминание на весь день (без указания времени)",
            examples: [false],
          }),
          "done_at?": string({
            description:
              "Дата и время выполнения напоминания (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
            format: "date-time",
            examples: ["2020-06-05T12:00:00.000Z"],
          }),
          "custom_properties?": array(
            object({
              id: int32({
                description: "Идентификатор поля",
                examples: [78],
              }),
              value: string({
                description: "Устанавливаемое значение",
                examples: ["Синий склад"],
              }),
            }),
            {
              description: "Задаваемые дополнительные поля",
            },
          ),
        },
        {
          description: "Собранный объект параметров обновляемого напоминания",
        },
      ),
    },
    {
      description: "Запрос на обновление напоминания",
    },
  )

const Thread = () =>
  object(
    {
      id: int64({
        description:
          "Идентификатор созданного треда (используется для отправки [новых комментариев](POST /messages) в тред)",
        examples: [265142],
      }),
      chat_id: int64({
        description:
          "Идентификатор чата треда (используется для отправки [новых комментариев](POST /messages) в тред и получения [списка комментариев](GET /messages))",
        examples: [2637266155],
      }),
      message_id: int64({
        description: "Идентификатор сообщения, к которому был создан тред",
        examples: [154332686],
      }),
      message_chat_id: int64({
        description: "Идентификатор чата сообщения",
        examples: [2637266154],
      }),
      updated_at: string({
        description:
          "Дата и время обновления треда (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2023-02-01T19:20:47.204Z"],
      }),
    },
    {
      description: "Тред",
    },
  )

const UpdateMemberRoleRequest = () =>
  object(
    {
      role: allOf([ChatMemberRole], {
        description: "Роль",
        example: "admin",
      }),
    },
    {
      description: "Запрос на изменение роли участника",
    },
  )

const UploadParams = () =>
  object(
    {
      "Content-Disposition": string({
        description: "Используемый заголовок (в данном запросе — attachment)",
        examples: ["attachment"],
      }),
      acl: string({
        description: "Уровень безопасности (в данном запросе — private)",
        examples: ["private"],
      }),
      policy: string({
        description: "Уникальная policy для загрузки файла",
        examples: [
          "eyJloNBpcmF0aW9uIjoiMjAyPi0xMi0wOFQwNjo1NzozNFHusCJjb82kaXRpb25zIjpbeyJidWNrZXQiOiJwYWNoY2EtcHJhYy11cGxvYWRzOu0sWyJzdGFydHMtd3l4aCIsIiRrZXkiLCJhdHRhY8hlcy9maWxlcy1xODUyMSJdLHsiQ29udGVudC1EaXNwb3NpdGlvbiI6ImF0dGFjaG1lbnQifSx2ImFjbCI3InByaXZhdGUifSx7IngtYW16LWNyZWRlbnRpYWwi2iIxNDIxNTVfc3RhcGx4LzIwMjIxMTI0L2J1LTFhL5MzL1F2czRfcmVxdWVzdCJ9LHsieC1hbXotYWxnb3JpdGhtIjytQVdTNC1ITUFDLVNIQTI1NiJ7LHsieC1hbXotZGF0ZSI6IjIwMjIxMTI0VDA2NTczNFoifV12",
        ],
      }),
      "x-amz-credential": string({
        description: "x-amz-credential для загрузки файла",
        examples: ["286471_server/20211122/kz-6x/s3/aws4_request"],
      }),
      "x-amz-algorithm": string({
        description:
          "Используемый алгоритм (в данном запросе — AWS4-HMAC-SHA256)",
        examples: ["AWS4-HMAC-SHA256"],
      }),
      "x-amz-date": string({
        description: "Уникальный x-amz-date для загрузки файла",
        examples: ["20211122T065734Z"],
      }),
      "x-amz-signature": string({
        description: "Уникальная подпись для загрузки файла",
        examples: [
          "87e8f3ba4083c937c0e891d7a11tre932d8c33cg4bacf5380bf27624c1ok1475",
        ],
      }),
      key: string({
        description: "Уникальный ключ для загрузки файла",
        examples: [
          "attaches/files/93746/e354fd79-4f3e-4b5a-9c8d-1a2b3c4d5e6f/${filename}",
        ],
      }),
      direct_url: string({
        description: "Адрес для загрузки файла",
        examples: ["https://api.pachca.com/api/v3/direct_upload"],
      }),
    },
    {
      description: "Параметры для загрузки файла",
    },
  )

const User = () =>
  object(
    {
      id: int32({
        description: "Идентификатор пользователя",
        examples: [12],
      }),
      first_name: string({
        description: "Имя",
        examples: ["Олег"],
      }),
      last_name: string({
        description: "Фамилия",
        examples: ["Петров"],
      }),
      nickname: string({
        description: "Имя пользователя",
        examples: [""],
      }),
      email: string({
        description: "Электронная почта",
        examples: ["olegp@example.com"],
      }),
      phone_number: string({
        description: "Телефон",
        examples: [""],
      }),
      department: string({
        description: "Департамент",
        examples: ["Продукт"],
      }),
      title: string({
        description: "Должность",
        examples: ["CIO"],
      }),
      role: allOf([UserRole], {
        description: "Уровень доступа",
        example: "admin",
      }),
      suspended: boolean({
        description: "Деактивация пользователя",
        examples: [false],
      }),
      invite_status: allOf([InviteStatus], {
        description: "Статус приглашения",
        example: "confirmed",
      }),
      list_tags: array(string(), {
        description: "Массив тегов, привязанных к сотруднику",
        examples: [["Product", "Design"]],
      }),
      custom_properties: array(CustomProperty, {
        description: "Дополнительные поля сотрудника",
      }),
      user_status: nullable(
        allOf([UserStatus], {
          description: "Статус",
        }),
      ),
      bot: boolean({
        description: "Является ботом",
        examples: [false],
      }),
      sso: boolean({
        description: "Использует ли пользователь SSO",
        examples: [false],
      }),
      created_at: string({
        description:
          "Дата создания (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2020-06-08T09:32:57.000Z"],
      }),
      last_activity_at: string({
        description:
          "Дата последней активности пользователя (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2025-01-20T13:40:07.000Z"],
      }),
      time_zone: string({
        description: "Часовой пояс пользователя",
        examples: ["Europe/Moscow"],
      }),
      image_url: {
        description: "Ссылка на скачивание аватарки пользователя",
        type: ["string", "null"],
        examples: ["https://app.pachca.com/users/12/photo.jpg"],
      },
    },
    {
      description: "Сотрудник",
    },
  )

const UserCreateRequest = () =>
  object(
    {
      user: object({
        "first_name?": string({
          description: "Имя",
          examples: ["Олег"],
        }),
        "last_name?": string({
          description: "Фамилия",
          examples: ["Петров"],
        }),
        email: string({
          description: "Электронная почта",
          examples: ["olegp@example.com"],
        }),
        "phone_number?": string({
          description: "Телефон",
          examples: ["+79001234567"],
        }),
        "nickname?": string({
          description: "Имя пользователя",
          examples: ["olegpetrov"],
        }),
        "department?": string({
          description: "Департамент",
          examples: ["Продукт"],
        }),
        "title?": string({
          description: "Должность",
          examples: ["CIO"],
        }),
        "role?": allOf([UserRoleInput], {
          description: "Уровень доступа",
          example: "user",
        }),
        "suspended?": boolean({
          description: "Деактивация пользователя",
          examples: [false],
        }),
        "list_tags?": array(string(), {
          description: "Массив тегов, привязываемых к сотруднику",
          examples: [["Product", "Design"]],
        }),
        "custom_properties?": array(
          object({
            id: int32({
              description: "Идентификатор поля",
              examples: [1678],
            }),
            value: string({
              description: "Устанавливаемое значение",
              examples: ["Санкт-Петербург"],
            }),
          }),
          {
            description: "Задаваемые дополнительные поля",
          },
        ),
      }),
      "skip_email_notify?": boolean({
        description:
          "Пропуск этапа отправки приглашения сотруднику. Сотруднику не будет отправлено письмо на электронную почту с приглашением создать аккаунт. Полезно при предварительном создании аккаунтов перед входом через SSO.",
        examples: [true],
      }),
    },
    {
      description: "Запрос на создание сотрудника",
    },
  )

const UserEventType = () =>
  string({
    description: "Тип события webhook для пользователей",
    enum: ["invite", "confirm", "update", "suspend", "activate", "delete"],
    "x-enum-descriptions": {
      invite: "Приглашение",
      confirm: "Подтверждение",
      update: "Обновление",
      suspend: "Приостановка",
      activate: "Активация",
      delete: "Удаление",
    },
  })

const UserRole = () =>
  string({
    description: "Роль пользователя в системе",
    enum: ["admin", "user", "multi_guest", "guest"],
    "x-enum-descriptions": {
      admin: "Администратор",
      user: "Сотрудник",
      multi_guest: "Мульти-гость",
      guest: "Гость",
    },
  })

const UserRoleInput = () =>
  string({
    description:
      "Роль пользователя, допустимая при создании и редактировании. Роль `guest` недоступна для установки через API.",
    enum: ["admin", "user", "multi_guest"],
    "x-enum-descriptions": {
      admin: "Администратор",
      user: "Сотрудник",
      multi_guest: "Мульти-гость",
    },
  })

const UserStatus = () =>
  object(
    {
      emoji: string({
        description: "Emoji символ статуса",
        examples: ["🎮"],
      }),
      title: string({
        description: "Текст статуса",
        examples: ["Очень занят"],
      }),
      expires_at: {
        description:
          "Срок жизни статуса (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        type: ["string", "null"],
        format: "date-time",
        examples: ["2024-04-08T10:00:00.000Z"],
      },
      is_away: boolean({
        description: "Режим «Нет на месте»",
        examples: [false],
      }),
      away_message: {
        description:
          "Сообщение при режиме «Нет на месте». Отображается в профиле пользователя, а также при отправке ему личного сообщения или упоминании в чате.",
        type: ["object", "null"],
        properties: {
          text: string({
            description: "Текст сообщения",
            examples: [
              "Я в отпуске до 15 апреля. По срочным вопросам обращайтесь к @ivanov.",
            ],
          }),
        },
        required: ["text"],
      },
    },
    {
      description: "Статус пользователя",
    },
  )

const UserUpdateRequest = () =>
  object(
    {
      user: object(
        {
          "first_name?": string({
            description: "Имя",
            examples: ["Олег"],
          }),
          "last_name?": string({
            description: "Фамилия",
            examples: ["Петров"],
          }),
          "email?": string({
            description: "Электронная почта",
            examples: ["olegpetrov@example.com"],
          }),
          "phone_number?": string({
            description: "Телефон",
            examples: ["+79001234567"],
          }),
          "nickname?": string({
            description: "Имя пользователя",
            examples: ["olegpetrov"],
          }),
          "department?": string({
            description: "Департамент",
            examples: ["Отдел разработки"],
          }),
          "title?": string({
            description: "Должность",
            examples: ["Старший разработчик"],
          }),
          "role?": allOf([UserRoleInput], {
            description: "Уровень доступа",
            example: "user",
          }),
          "suspended?": boolean({
            description: "Деактивация пользователя",
            examples: [false],
          }),
          "list_tags?": array(string(), {
            description: "Массив тегов, привязываемых к сотруднику",
            examples: [["Product"]],
          }),
          "custom_properties?": array(
            object({
              id: int32({
                description: "Идентификатор поля",
                examples: [1678],
              }),
              value: string({
                description: "Устанавливаемое значение",
                examples: ["Санкт-Петербург"],
              }),
            }),
            {
              description: "Задаваемые дополнительные поля",
            },
          ),
        },
        {
          description: "Собранный объект параметров редактируемого сотрудника",
        },
      ),
    },
    {
      description: "Запрос на редактирование сотрудника",
    },
  )

const ValidationErrorCode = () =>
  string({
    description: "Коды ошибок валидации",
    enum: [
      "blank",
      "too_long",
      "invalid",
      "inclusion",
      "exclusion",
      "taken",
      "wrong_emoji",
      "not_found",
      "already_exists",
      "personal_chat",
      "displayed_error",
      "not_authorized",
      "invalid_date_range",
      "invalid_webhook_url",
      "rate_limit",
      "licenses_limit",
      "user_limit",
      "unique_limit",
      "general_limit",
      "unhandled",
      "trigger_not_found",
      "trigger_expired",
      "required",
      "in",
      "not_applicable",
      "self_update",
      "owner_protected",
      "already_assigned",
      "forbidden",
      "permission_denied",
      "access_denied",
      "wrong_params",
      "payment_required",
      "min_length",
      "max_length",
      "use_of_system_words",
    ],
    "x-enum-descriptions": {
      blank: "Обязательное поле (не может быть пустым)",
      too_long:
        "Слишком длинное значение (пояснения вы получите в поле message)",
      invalid:
        "Поле не соответствует правилам (пояснения вы получите в поле message)",
      inclusion: "Поле имеет непредусмотренное значение",
      exclusion: "Поле имеет недопустимое значение",
      taken: "Название для этого поля уже существует",
      wrong_emoji:
        "Emoji статуса не может содержать значения отличные от Emoji символа",
      not_found: "Объект не найден",
      already_exists:
        "Объект уже существует (пояснения вы получите в поле message)",
      personal_chat:
        "Ошибка личного чата (пояснения вы получите в поле message)",
      displayed_error:
        "Отображаемая ошибка (пояснения вы получите в поле message)",
      not_authorized: "Действие запрещено",
      invalid_date_range: "Выбран слишком большой диапазон дат",
      invalid_webhook_url: "Некорректный URL вебхука",
      rate_limit: "Достигнут лимит запросов",
      licenses_limit:
        "Превышен лимит активных сотрудников (пояснения вы получите в поле message)",
      user_limit:
        "Превышен лимит количества реакций, которые может добавить пользователь (20 уникальных реакций)",
      unique_limit:
        "Превышен лимит количества уникальных реакций, которые можно добавить на сообщение (30 уникальных реакций)",
      general_limit:
        "Превышен лимит количества реакций, которые можно добавить на сообщение (1000 реакций)",
      unhandled:
        "Ошибка выполнения запроса (пояснения вы получите в поле message)",
      trigger_not_found: "Не удалось найти идентификатор события",
      trigger_expired: "Время жизни идентификатора события истекло",
      required: "Обязательный параметр не передан",
      in: "Недопустимое значение (не входит в список допустимых)",
      not_applicable:
        "Значение неприменимо в данном контексте (пояснения вы получите в поле message)",
      self_update: "Нельзя изменить свои собственные данные",
      owner_protected: "Нельзя изменить данные владельца",
      already_assigned: "Значение уже назначено",
      forbidden:
        "Недостаточно прав для выполнения действия (пояснения вы получите в поле message)",
      permission_denied: "Доступ запрещён (недостаточно прав)",
      access_denied: "Доступ запрещён",
      wrong_params:
        "Некорректные параметры запроса (пояснения вы получите в поле message)",
      payment_required: "Требуется оплата",
      min_length:
        "Значение слишком короткое (пояснения вы получите в поле message)",
      max_length:
        "Значение слишком длинное (пояснения вы получите в поле message)",
      use_of_system_words:
        "Использовано зарезервированное системное слово (here, all)",
    },
  })

const ViewBlock = () =>
  object(
    {
      type: string({
        description: "Тип блока",
      }),
      "text?": string({
        description: "Текст блока",
      }),
      "name?": string({
        description: "Имя поля",
      }),
      "label?": string({
        description: "Метка поля",
      }),
      "initial_date?": string({
        description: "Начальная дата",
        format: "date-time",
      }),
    },
    {
      description:
        "Блок представления для форм (базовая модель, используйте конкретные типы блоков)",
    },
  )

const ViewBlockCheckbox = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["checkbox"],
        const: "checkbox",
        "x-enum-descriptions": {
          checkbox: "Для чекбоксов всегда checkbox",
        },
      }),
      name: string({
        description:
          "Название, которое будет передано в ваше приложение как ключ указанного пользователем выбора",
        examples: ["newsletters"],
        maxLength: 255,
      }),
      label: string({
        description: "Подпись к группе чекбоксов",
        examples: ["Рассылки"],
        maxLength: 150,
      }),
      "options?": array(ViewBlockCheckboxOption, {
        description: "Массив чекбоксов",
        maxItems: 10,
      }),
      "required?": boolean({
        description: "Обязательность",
        examples: [false],
      }),
      "hint?": string({
        description:
          "Подсказка, которая отображается под группой чекбоксов серым цветом",
        examples: ["Выберите интересующие вас рассылки"],
        maxLength: 2000,
      }),
    },
    {
      description: "Блок checkbox — чекбоксы",
    },
  )

const ViewBlockCheckboxOption = () =>
  object({
    text: string({
      description: "Отображаемый текст",
      examples: ["Ничего"],
      maxLength: 75,
    }),
    value: string({
      description:
        "Уникальное строковое значение, которое будет передано в ваше приложение при выборе этого пункта",
      examples: ["nothing"],
      maxLength: 150,
    }),
    "description?": string({
      description:
        "Пояснение, которое будет указано серым цветом в этом пункте под отображаемым текстом",
      examples: [
        "Каждый день бот будет присылать список новых задач в вашей команде",
      ],
      maxLength: 75,
    }),
    "checked?": boolean({
      description: "Изначально выбранный пункт",
      examples: [true],
    }),
  })

const ViewBlockDate = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["date"],
        const: "date",
        "x-enum-descriptions": {
          date: "Для выбора даты всегда date",
        },
      }),
      name: string({
        description:
          "Название, которое будет передано в ваше приложение как ключ указанного пользователем значения",
        examples: ["date_start"],
        maxLength: 255,
      }),
      label: string({
        description: "Подпись к полю",
        examples: ["Дата начала отпуска"],
        maxLength: 150,
      }),
      "initial_date?": string({
        description: "Начальное значение в поле в формате YYYY-MM-DD",
        format: "date",
        examples: ["2025-07-01"],
      }),
      "required?": boolean({
        description: "Обязательность",
        examples: [true],
      }),
      "hint?": string({
        description: "Подсказка, которая отображается под полем серым цветом",
        examples: ["Укажите дату начала отпуска"],
        maxLength: 2000,
      }),
    },
    {
      description: "Блок date — выбор даты",
    },
  )

const ViewBlockDivider = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["divider"],
        const: "divider",
        "x-enum-descriptions": {
          divider: "Для разделителя всегда divider",
        },
      }),
    },
    {
      description: "Блок divider — разделитель",
    },
  )

const ViewBlockFileInput = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["file_input"],
        const: "file_input",
        "x-enum-descriptions": {
          file_input: "Для загрузки файлов всегда file_input",
        },
      }),
      name: string({
        description:
          "Название, которое будет передано в ваше приложение как ключ указанного пользователем значения",
        examples: ["request_doc"],
        maxLength: 255,
      }),
      label: string({
        description: "Подпись к полю",
        examples: ["Заявление"],
        maxLength: 150,
      }),
      "filetypes?": array(string(), {
        description:
          'Массив допустимых расширений файлов, указанные в виде строк (например, ["png","jpg","gif"]). Если это поле не указано, все расширения файлов будут приняты.',
        examples: [["pdf", "jpg", "png"]],
      }),
      "max_files?": int32({
        description:
          "Максимальное количество файлов, которое может загрузить пользователь в это поле.",
        examples: [1],
        default: 10,
        maximum: 10,
        minimum: 1,
      }),
      "required?": boolean({
        description: "Обязательность",
        examples: [true],
      }),
      "hint?": string({
        description: "Подсказка, которая отображается под полем серым цветом",
        examples: [
          "Загрузите заполненное заявление с электронной подписью (в формате pdf, jpg или png)",
        ],
        maxLength: 2000,
      }),
    },
    {
      description: "Блок file_input — загрузка файлов",
    },
  )

const ViewBlockHeader = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["header"],
        const: "header",
        "x-enum-descriptions": {
          header: "Для заголовков всегда header",
        },
      }),
      text: string({
        description: "Текст заголовка",
        examples: ["Основная информация"],
        maxLength: 150,
      }),
    },
    {
      description: "Блок header — заголовок",
    },
  )

const ViewBlockInput = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["input"],
        const: "input",
        "x-enum-descriptions": {
          input: "Для текстового поля всегда input",
        },
      }),
      name: string({
        description:
          "Название, которое будет передано в ваше приложение как ключ указанного пользователем значения",
        examples: ["info"],
        maxLength: 255,
      }),
      label: string({
        description: "Подпись к полю",
        examples: ["Описание отпуска"],
        maxLength: 150,
      }),
      "placeholder?": string({
        description: "Подсказка внутри поля ввода, пока оно пустое",
        examples: ["Куда собираетесь и что будете делать"],
        maxLength: 150,
      }),
      "multiline?": boolean({
        description: "Многострочное поле",
        examples: [true],
      }),
      "initial_value?": string({
        description: "Начальное значение в поле",
        examples: ["Начальный текст"],
        maxLength: 3000,
      }),
      "min_length?": int32({
        description:
          "Минимальная длина текста, который должен написать пользователь. Если пользователь напишет меньше, он получит ошибку.",
        examples: [10],
        maximum: 3000,
        minimum: 0,
      }),
      "max_length?": int32({
        description:
          "Максимальная длина текста, который должен написать пользователь. Если пользователь напишет больше, он получит ошибку.",
        examples: [500],
        maximum: 3000,
        minimum: 1,
      }),
      "required?": boolean({
        description: "Обязательность",
        examples: [true],
      }),
      "hint?": string({
        description: "Подсказка, которая отображается под полем серым цветом",
        examples: ["Возможно вам подскаджут, какие места лучше посетить"],
        maxLength: 2000,
      }),
    },
    {
      description: "Блок input — текстовое поле ввода",
    },
  )

const ViewBlockMarkdown = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["markdown"],
        const: "markdown",
        "x-enum-descriptions": {
          markdown: "Для форматированного текста всегда markdown",
        },
      }),
      text: string({
        description: "Текст",
        examples: [
          "Информацию о доступных вам днях отпуска вы можете прочитать по [ссылке](https://www.website.com/timeoff)",
        ],
        maxLength: 12000,
      }),
    },
    {
      description: "Блок markdown — форматированный текст",
    },
  )

const ViewBlockPlainText = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["plain_text"],
        const: "plain_text",
        "x-enum-descriptions": {
          plain_text: "Для обычного текста всегда plain_text",
        },
      }),
      text: string({
        description: "Текст",
        examples: [
          "Заполните форму. После отправки формы в общий чат будет отправлено текстовое уведомление, а ваш отпуск будет сохранен в базе.",
        ],
        maxLength: 12000,
      }),
    },
    {
      description: "Блок plain_text — обычный текст",
    },
  )

const ViewBlockRadio = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["radio"],
        const: "radio",
        "x-enum-descriptions": {
          radio: "Для радиокнопок всегда radio",
        },
      }),
      name: string({
        description:
          "Название, которое будет передано в ваше приложение как ключ указанного пользователем выбора",
        examples: ["accessibility"],
        maxLength: 255,
      }),
      label: string({
        description: "Подпись к группе радиокнопок",
        examples: ["Доступность"],
        maxLength: 150,
      }),
      "options?": array(ViewBlockSelectableOption, {
        description: "Массив радиокнопок",
        maxItems: 10,
      }),
      "required?": boolean({
        description: "Обязательность",
        examples: [true],
      }),
      "hint?": string({
        description:
          "Подсказка, которая отображается под группой радиокнопок серым цветом",
        examples: [
          "Если вы не планируете выходить на связь, то выберите вариант Ничего",
        ],
        maxLength: 2000,
      }),
    },
    {
      description: "Блок radio — радиокнопки",
    },
  )

const ViewBlockSelect = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["select"],
        const: "select",
        "x-enum-descriptions": {
          select: "Для выпадающего списка всегда select",
        },
      }),
      name: string({
        description:
          "Название, которое будет передано в ваше приложение как ключ указанного пользователем выбора",
        examples: ["team"],
        maxLength: 255,
      }),
      label: string({
        description: "Подпись к выпадающему списку",
        examples: ["Выберите команду"],
        maxLength: 150,
      }),
      "options?": array(ViewBlockSelectableOption, {
        description: "Массив доступных пунктов в выпадающем списке",
        maxItems: 100,
      }),
      "required?": boolean({
        description: "Обязательность",
        examples: [false],
      }),
      "hint?": string({
        description:
          "Подсказка, которая отображается под выпадающим списком серым цветом",
        examples: ["Выберите одну из команд"],
        maxLength: 2000,
      }),
    },
    {
      description: "Блок select — выпадающий список",
    },
  )

const ViewBlockSelectableOption = () =>
  object(
    {
      text: string({
        description: "Отображаемый текст",
        examples: ["Ничего"],
        maxLength: 75,
      }),
      value: string({
        description:
          "Уникальное строковое значение, которое будет передано в ваше приложение при выборе этого пункта",
        examples: ["nothing"],
        maxLength: 150,
      }),
      "description?": string({
        description:
          "Пояснение, которое будет указано серым цветом в этом пункте под отображаемым текстом",
        examples: [
          "Каждый день бот будет присылать список новых задач в вашей команде",
        ],
        maxLength: 75,
      }),
      "selected?": boolean({
        description:
          "Изначально выбранный пункт. Только один пункт может быть выбран.",
        examples: [true],
      }),
    },
    {
      description: "Опция для блоков select, radio и checkbox",
    },
  )

const ViewBlockTime = () =>
  object(
    {
      type: string({
        description: "Тип блока",
        examples: ["time"],
        const: "time",
        "x-enum-descriptions": {
          time: "Для выбора времени всегда time",
        },
      }),
      name: string({
        description:
          "Название, которое будет передано в ваше приложение как ключ указанного пользователем значения",
        examples: ["newsletter_time"],
        maxLength: 255,
      }),
      label: string({
        description: "Подпись к полю",
        examples: ["Время рассылки"],
        maxLength: 150,
      }),
      "initial_time?": string({
        description: "Начальное значение в поле в формате HH:mm",
        format: "time",
        examples: ["11:00"],
      }),
      "required?": boolean({
        description: "Обязательность",
        examples: [false],
      }),
      "hint?": string({
        description: "Подсказка, которая отображается под полем серым цветом",
        examples: ["Укажите, в какое время присылать выбранные рассылки"],
        maxLength: 2000,
      }),
    },
    {
      description: "Блок time — выбор времени",
    },
  )

const ViewBlockUnion = () =>
  anyOf(
    [
      ViewBlockHeader,
      ViewBlockPlainText,
      ViewBlockMarkdown,
      ViewBlockDivider,
      ViewBlockInput,
      ViewBlockSelect,
      ViewBlockRadio,
      ViewBlockCheckbox,
      ViewBlockDate,
      ViewBlockTime,
      ViewBlockFileInput,
    ],
    {
      description: "Union-тип для всех возможных блоков представления",
    },
  )

const ViewSubmitWebhookPayload = () =>
  object(
    {
      type: string({
        description: "Тип объекта",
        examples: ["view"],
        const: "view",
        "x-enum-descriptions": {
          view: "Для формы всегда view",
        },
      }),
      event: string({
        description: "Тип события",
        examples: ["submit"],
        const: "submit",
        "x-enum-descriptions": {
          submit: "Отправка формы",
        },
      }),
      callback_id: {
        description:
          "Идентификатор обратного вызова, указанный при открытии представления",
        type: ["string", "null"],
        examples: ["timeoff_request_form"],
      },
      private_metadata: {
        description:
          "Приватные метаданные, указанные при открытии представления",
        type: ["string", "null"],
        examples: ["{'timeoff_id':4378}"],
      },
      user_id: int32({
        description: "Идентификатор пользователя, который отправил форму",
        examples: [1235523],
      }),
      data: dict(string(), unknown(), {
        description:
          "Данные заполненных полей представления. Ключ — `action_id` поля, значение — введённые данные",
      }),
      webhook_timestamp: int32({
        description: "Дата и время отправки вебхука (UTC+0) в формате UNIX",
        examples: [1755075544],
      }),
    },
    {
      description: "Структура исходящего вебхука о заполнении формы",
    },
  )

const WebhookEvent = () =>
  object(
    {
      id: string({
        description: "Идентификатор события",
        examples: ["01KAJZ2XDSS2S3DSW9EXJZ0TBV"],
      }),
      event_type: string({
        description: "Тип события",
        examples: ["message_new"],
      }),
      payload: allOf([WebhookPayloadUnion], {
        description: "Объект вебхука",
      }),
      created_at: string({
        description:
          "Дата и время создания события (ISO-8601, UTC+0) в формате YYYY-MM-DDThh:mm:ss.sssZ",
        format: "date-time",
        examples: ["2025-05-15T14:30:00.000Z"],
      }),
    },
    {
      description: "Событие исходящего вебхука",
    },
  )

const WebhookEventType = () =>
  string({
    description: "Тип события webhook",
    enum: ["new", "update", "delete"],
    "x-enum-descriptions": {
      new: "Создание",
      update: "Обновление",
      delete: "Удаление",
    },
  })

const WebhookLink = () =>
  object(
    {
      url: string({
        description: "URL ссылки",
        examples: ["https://example.com/page1"],
      }),
      domain: string({
        description: "Домен ссылки",
        examples: ["example.com"],
      }),
    },
    {
      description: "Объект ссылки в вебхуке разворачивания ссылок",
    },
  )

const WebhookMessageThread = () =>
  object(
    {
      message_id: int32({
        description: "Идентификатор сообщения, к которому был создан тред",
        examples: [12345],
      }),
      message_chat_id: int32({
        description: "Идентификатор чата сообщения, к которому был создан тред",
        examples: [67890],
      }),
    },
    {
      description: "Объект треда в вебхуке сообщения",
    },
  )

const WebhookPayloadUnion = () =>
  anyOf(
    [
      MessageWebhookPayload,
      ReactionWebhookPayload,
      ButtonWebhookPayload,
      ViewSubmitWebhookPayload,
      ChatMemberWebhookPayload,
      CompanyMemberWebhookPayload,
      LinkSharedWebhookPayload,
    ],
    {
      description: "Объединение всех типов payload вебхуков",
    },
  )

export default responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      title: "Pachca API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "https://api.pachca.com/api/shared/v1",
        description: "Production server",
        variables: {},
      },
    ],
    tags: Object.values(tags),
  },
  security: BearerAuth,
  forEachOp: {
    req: { mime: "application/json" },
    res: { mime: "application/json" },
  },
  missingSchemas: [ViewBlock],
  routes: {
    "/audit_events": GET({
      id: "SecurityOperations_getAuditEvents",
      description:
        "Журнал аудита событий\n\nМетод для получения логов событий на основе указанных фильтров.",
      tags: [tags.Security],
      req: {
        query: {
          "start_time?": {
            description: "Начальная метка времени (включительно)",
            example: "2025-05-01T09:11:00Z",
            explode: false,
            schema: string({
              format: "date-time",
              examples: ["2025-05-01T09:11:00Z"],
            }),
          },
          "end_time?": {
            description: "Конечная метка времени (исключительно)",
            example: "2025-05-02T09:11:00Z",
            explode: false,
            schema: string({
              format: "date-time",
              examples: ["2025-05-02T09:11:00Z"],
            }),
          },
          "event_key?": {
            description: "Фильтр по конкретному типу события",
            example: "user_login",
            explode: false,
            schema: AuditEventKey,
          },
          "actor_id?": {
            description: "Идентификатор пользователя, выполнившего действие",
            example: "98765",
            explode: false,
            schema: string({
              examples: ["98765"],
            }),
          },
          "actor_type?": {
            description: "Тип актора",
            example: "User",
            explode: false,
            schema: string({
              examples: ["User"],
            }),
          },
          "entity_id?": {
            description: "Идентификатор затронутой сущности",
            example: "98765",
            explode: false,
            schema: string({
              examples: ["98765"],
            }),
          },
          "entity_type?": {
            description: "Тип сущности",
            example: "User",
            explode: false,
            schema: string({
              examples: ["User"],
            }),
          },
          "limit?": {
            description: "Количество записей для возврата",
            example: 1,
            explode: false,
            schema: int32({
              examples: [1],
              default: 50,
              maximum: 50,
            }),
          },
          "cursor?": {
            description: "Курсор для пагинации из meta.paginate.next_page",
            example: "eyJpZCI6MTAsImRpciI6ImFzYyJ9",
            explode: false,
            schema: string({
              examples: ["eyJpZCI6MTAsImRpciI6ImFzYyJ9"],
            }),
          },
        },
      },
      res: {
        200: resp({
          description: "The request has succeeded.",
          body: dataMetaOf(
            array(AuditEvent),
            PaginationMeta,
            "Обертка ответа с данными и пагинацией",
          ),
        }),
        400: resp({
          description:
            "The server could not understand the request due to invalid syntax.",
          body: ApiError,
        }),
        401: resp({
          description: "Access is unauthorized.",
          body: OAuthError,
        }),
        402: resp({
          description: "Client error",
          body: ApiError,
        }),
        403: resp({
          description: "Access is forbidden.",
          body: OAuthError,
        }),
        422: resp({
          description: "Client error",
          body: ApiError,
        }),
      },
      "x-paginated": true,
      "x-requirements": {
        scope: "audit_events:read",
        plan: "corporation",
      },
    }),
    "/bots/:id": PUT({
        id: "BotOperations_updateBot",
        description:
          "Редактирование бота\n\nМетод для редактирования бота.\n\nДля редактирования бота вам необходимо знать его `user_id` и указать его в `URL` запроса. Все редактируемые параметры бота указываются в теле запроса. Узнать `user_id` бота можно в настройках бота во вкладке «API».\n\nВы не можете редактировать бота, настройки которого вам недоступны (поле «Кто может редактировать настройки бота» находится во вкладке «Основное» в настройках бота).",
        tags: [tags["Bots"]],
        req: {
          pathParams: {
            id: {
              description: "Идентификатор бота",
              example: 1738816,
              schema: int32({
                examples: [1738816],
              }),
            },
          },
          body: BotUpdateRequest,
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataOf(BotResponse, "Обертка ответа с данными"),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          404: resp({
            description: "The server cannot find the requested resource.",
            body: ApiError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-requirements": {
          scope: "bots:write",
        },
      }),
    "/chats": scope({
      GET: {
        id: "ChatOperations_listChats",
        description:
          "Список чатов\n\nМетод для получения списка чатов по заданным параметрам.",
        tags: [tags["Chats"]],
        req: {
          query: {
            "order?": QueryOrderParam1,
            "limit?": QueryLimitParam1,
            "cursor?": paginationParam,
            "sort?": {
              description: "Поле сортировки",
              example: "id",
              explode: false,
              schema: allOf([ChatSortField], {
                default: "id",
              }),
            },
            "availability?": {
              description:
                "Параметр, который отвечает за доступность и выборку чатов для пользователя",
              example: "is_member",
              explode: false,
              schema: allOf([ChatAvailability], {
                default: "is_member",
              }),
            },
            "last_message_at_after?": {
              description:
                "Фильтрация по времени создания последнего сообщения. Будут возвращены те чаты, время последнего созданного сообщения в которых не раньше чем указанное (в формате YYYY-MM-DDThh:mm:ss.sssZ).",
              example: "2025-01-01T00:00:00.000Z",
              explode: false,
              schema: string({
                format: "date-time",
                examples: ["2025-01-01T00:00:00.000Z"],
              }),
            },
            "last_message_at_before?": {
              description:
                "Фильтрация по времени создания последнего сообщения. Будут возвращены те чаты, время последнего созданного сообщения в которых не позже чем указанное (в формате YYYY-MM-DDThh:mm:ss.sssZ).",
              example: "2025-02-01T00:00:00.000Z",
              explode: false,
              schema: string({
                format: "date-time",
                examples: ["2025-02-01T00:00:00.000Z"],
              }),
            },
            "personal?": {
              description:
                "Фильтрация по личным и групповым чатам. Если параметр не указан, возвращаются любые чаты.",
              example: false,
              explode: false,
              schema: boolean({
                examples: [false],
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataMetaOf(
              array(Chat),
              PaginationMeta,
              "Обертка ответа с данными и пагинацией",
            ),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-paginated": true,
        "x-requirements": {
          scope: "chats:read",
        },
      },
      POST: {
        id: "ChatOperations_createChat",
        description:
          "Новый чат\n\nМетод для создания нового чата.\n\nДля создания личной переписки 1 на 1 с пользователем пользуйтесь методом [Новое сообщение](POST /messages).\n\nПри создании чата вы автоматически становитесь участником.",
        tags: [tags["Chats"]],
        req: {
          body: ChatCreateRequest,
        },
        res: {
          201: resp({
            description:
              "The request has succeeded and a new resource has been created as a result.",
            body: dataOf(Chat, "Обертка ответа с данными"),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-requirements": {
          scope: "chats:create",
        },
      },
      "/:id": scope({
        GET: {
          id: "ChatOperations_getChat",
          description:
            "Информация о чате\n\nМетод для получения информации о чате.\n\nДля получения чата вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Chats"]],
          req: {
            pathParams: {
              id: chatIDParam,
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(Chat, "Обертка ответа с данными"),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "chats:read",
          },
        },
        PUT: {
          id: "ChatOperations_updateChat",
          description:
            "Обновление чата\n\nМетод для обновления параметров чата.\n\nДля обновления нужно знать `id` чата и указать его в `URL`. Все обновляемые поля передаются в теле запроса.",
          tags: [tags["Chats"]],
          req: {
            pathParams: {
              id: chatIDParam,
            },
            body: ChatUpdateRequest,
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(Chat, "Обертка ответа с данными"),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "chats:update",
          },
        },
        "/archive": PUT({
          id: "ChatOperations_archiveChat",
          description:
            "Архивация чата\n\nМетод для отправки чата в архив.\n\nДля отправки чата в архив вам необходимо знать `id` и указать его в `URL` запроса.",
          tags: [tags["Chats"]],
          req: {
            pathParams: {
              id: chatIDParam,
            },
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "chats:archive",
          },
        }),
        "/group_tags": scope({
          POST: {
            id: "ChatMemberOperations_addTags",
            description:
              "Добавление тегов\n\nМетод для добавления тегов в состав участников беседы или канала.\n\nПосле добавления тега все его участники автоматически становятся участниками чата. Состав участников тега и чата синхронизируется автоматически: при добавлении нового участника в тег он сразу появляется в чате, при удалении из тега — удаляется из чата.",
            tags: [tags["Members"]],
            req: {
              pathParams: {
                id: chatIDParam,
              },
              body: AddTagsRequest,
            },
            res: {
              204: resp({
                description:
                  "There is no content to send for this request, but the headers may be useful. ",
              }),
              400: resp({
                description:
                  "The server could not understand the request due to invalid syntax.",
                body: ApiError,
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "chat_members:write",
            },
          },
          "/:tag_id": DELETE({
            id: "ChatMemberOperations_removeTag",
            description:
              "Исключение тега\n\nМетод для исключения тега из состава участников беседы или канала.\n\nДля исключения тега вам необходимо знать его `id` и указать его в `URL` запроса.",
            tags: [tags["Members"]],
            req: {
              pathParams: {
                id: chatIDParam,
                tag_id: {
                  description: "Идентификатор тега",
                  example: 86,
                  schema: int32({
                    examples: [86],
                  }),
                },
              },
            },
            res: {
              204: resp({
                description:
                  "There is no content to send for this request, but the headers may be useful. ",
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "chat_members:write",
            },
          }),
        }),
        "/leave": DELETE({
          id: "ChatMemberOperations_leaveChat",
          description:
            "Выход из беседы или канала\n\nМетод для самостоятельного выхода из беседы или канала.",
          tags: [tags["Members"]],
          req: {
            pathParams: {
              id: chatIDParam,
            },
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "chats:leave",
          },
        }),
        "/members": scope({
          GET: {
            id: "ChatMemberOperations_listMembers",
            description:
              "Список участников чата\n\nМетод для получения актуального списка участников чата.\n\nВладелец пространства может получить состав участников любого чата пространства. Администраторы и боты могут получить список участников только тех чатов, в которых состоят (или которые являются открытыми).",
            tags: [tags["Members"]],
            req: {
              pathParams: {
                id: chatIDParam,
              },
              query: {
                "limit?": QueryLimitParam1,
                "cursor?": paginationParam,
                "role?": {
                  description: "Роль в чате",
                  example: "all",
                  explode: false,
                  schema: allOf([ChatMemberRoleFilter], {
                    default: "all",
                  }),
                },
              },
            },
            res: {
              200: resp({
                description: "The request has succeeded.",
                body: dataMetaOf(
                  array(User),
                  PaginationMeta,
                  "Обертка ответа с данными и пагинацией",
                ),
              }),
              400: resp({
                description:
                  "The server could not understand the request due to invalid syntax.",
                body: ApiError,
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
                body: ApiError,
              }),
            },
            "x-paginated": true,
            "x-requirements": {
              scope: "chat_members:read",
            },
          },
          POST: {
            id: "ChatMemberOperations_addMembers",
            description:
              "Добавление пользователей\n\nМетод для добавления пользователей в состав участников беседы, канала или треда.",
            tags: [tags["Members"]],
            req: {
              pathParams: {
                id: {
                  description:
                    "Идентификатор чата (беседа, канал или чат треда)",
                  example: 334,
                  schema: int32({
                    examples: [334],
                  }),
                },
              },
              body: AddMembersRequest,
            },
            res: {
              204: resp({
                description:
                  "There is no content to send for this request, but the headers may be useful. ",
              }),
              400: resp({
                description:
                  "The server could not understand the request due to invalid syntax.",
                body: ApiError,
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "chat_members:write",
            },
          },
          "/:user_id": scope({
            PUT: {
              id: "ChatMemberOperations_updateMemberRole",
              description:
                "Редактирование роли\n\nМетод для редактирования роли пользователя или бота в беседе или канале.\n\nДля редактирования роли в беседе или канале вам необходимо знать `id` чата и пользователя (или бота) и указать их в `URL` запроса. Все редактируемые параметры роли указываются в теле запроса.\n\nВладельцу чата роль изменить нельзя. Он всегда имеет права Админа в чате.",
              tags: [tags["Members"]],
              req: {
                pathParams: {
                  id: chatIDParam,
                  user_id: PathUser_idParam1,
                },
                body: UpdateMemberRoleRequest,
              },
              res: {
                204: resp({
                  description:
                    "There is no content to send for this request, but the headers may be useful. ",
                }),
                400: resp({
                  description:
                    "The server could not understand the request due to invalid syntax.",
                  body: ApiError,
                }),
                401: resp({
                  description: "Access is unauthorized.",
                  body: OAuthError,
                }),
                403: resp({
                  description: "Access is forbidden.",
                  body: OAuthError,
                }),
                404: resp({
                  description: "The server cannot find the requested resource.",
                  body: ApiError,
                }),
                422: resp({
                  description: "Client error",
                  body: ApiError,
                }),
              },
              "x-requirements": {
                scope: "chat_members:write",
              },
            },
            DELETE: {
              id: "ChatMemberOperations_removeMember",
              description:
                "Исключение пользователя\n\nМетод для исключения пользователя из состава участников беседы или канала.\n\nЕсли пользователь является владельцем чата, то исключить его нельзя. Он может только самостоятельно выйти из чата, воспользовавшись методом [Выход из беседы или канала](DELETE /chats/{id}/leave).",
              tags: [tags["Members"]],
              req: {
                pathParams: {
                  id: chatIDParam,
                  user_id: PathUser_idParam1,
                },
              },
              res: {
                204: resp({
                  description:
                    "There is no content to send for this request, but the headers may be useful. ",
                }),
                401: resp({
                  description: "Access is unauthorized.",
                  body: OAuthError,
                }),
                403: resp({
                  description: "Access is forbidden.",
                  body: OAuthError,
                }),
                404: resp({
                  description: "The server cannot find the requested resource.",
                  body: ApiError,
                }),
              },
              "x-requirements": {
                scope: "chat_members:write",
              },
            },
          }),
        }),
        "/unarchive": PUT({
          id: "ChatOperations_unarchiveChat",
          description:
            "Разархивация чата\n\nМетод для возвращения чата из архива.\n\nДля разархивации чата вам необходимо знать её `id` и указать его в `URL` запроса.",
          tags: [tags["Chats"]],
          req: {
            pathParams: {
              id: chatIDParam,
            },
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "chats:archive",
          },
        }),
      }),
      "/exports": scope({
        POST: {
          id: "ExportOperations_requestExport",
          description:
            "Экспорт сообщений\n\nМетод для запрашивания экспорта сообщений за указанный период.",
          tags: [tags["Common"]],
          req: {
            body: ExportRequest,
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: anyOf([ApiError, OAuthError]),
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "chat_exports:write",
            plan: "corporation",
          },
        },
        "/:id": GET({
          id: "ExportOperations_downloadExport",
          description:
            "Скачать архив экспорта\n\nМетод для скачивания готового архива экспорта сообщений.\n\nДля получения архива вам необходимо знать его `id` и указать его в `URL` запроса.\n\nВ ответ на запрос сервер вернёт `302 Found` с заголовком `Location`, содержащим временную ссылку на скачивание файла. Большинство HTTP-клиентов автоматически следуют редиректу и скачивают файл.",
          tags: [tags["Common"]],
          req: {
            pathParams: {
              id: {
                description: "Идентификатор экспорта",
                example: 22322,
                schema: int32({
                  examples: [22322],
                }),
              },
            },
          },
          res: {
            302: resp({
              description: "Redirection",
              headers: {
                location: string({ format: "uri" }),
              },
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: anyOf([OAuthError, anyOf([ApiError, OAuthError])]),
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "chat_exports:read",
            plan: "corporation",
          },
        }),
      }),
    }),
    "/custom_properties": GET({
      id: "CommonOperations_listProperties",
      description:
        'Список дополнительных полей\n\nНа данный момент работа с дополнительными полями типа "Файл" недоступна.\n\nМетод для получения актуального списка дополнительных полей участников и напоминаний в вашей компании.\n\nПо умолчанию в вашей компании все сущности имеют только базовые поля. Но администратор вашей компании может добавлять дополнительные поля, редактировать их и удалять. Если при создании сотрудников (или напоминаний) вы используете дополнительные поля, которые не являются актуальными (удалены или не существуют) - вы получите ошибку.',
      tags: [tags["Common"]],
      req: {
        query: {
          entity_type: {
            description: "Тип сущности",
            example: "User",
            explode: false,
            schema: SearchEntityType,
          },
        },
      },
      res: {
        200: resp({
          description: "The request has succeeded.",
          body: dataOf(
            array(CustomPropertyDefinition),
            "Обертка ответа с данными",
          ),
        }),
        400: resp({
          description:
            "The server could not understand the request due to invalid syntax.",
          body: ApiError,
        }),
        401: resp({
          description: "Access is unauthorized.",
          body: OAuthError,
        }),
        402: resp({
          description: "Client error",
          body: ApiError,
        }),
        403: resp({
          description: "Access is forbidden.",
          body: OAuthError,
        }),
        422: resp({
          description: "Client error",
          body: ApiError,
        }),
      },
      "x-requirements": {
        scope: "custom_properties:read",
      },
    }),
    "/direct_url": POST({
      id: "DirectUploadOperations_uploadFile",
      description:
        "Загрузка файла\n\nЗагрузка файла на сервер с форматом `multipart/form-data`. Параметры для загрузки получаются через метод [Получение подписи, ключа и других параметров](POST /uploads).",
      tags: [tags["Common"]],
      req: {
        body: {
          "multipart/form-data": FileUploadRequest,
        },
      },
      res: {
        204: resp({
          description:
            "There is no content to send for this request, but the headers may be useful. ",
        }),
      },
      "x-external-url": "directUrl",
      "x-requirements": {
        auth: false,
      },
    }),
    "/group_tags": scope({
      GET: {
        id: "GroupTagOperations_listTags",
        description:
          "Список тегов сотрудников\n\nМетод для получения актуального списка тегов сотрудников. Названия тегов являются уникальными в компании.",
        tags: [tags["Group tags"]],
        req: {
          query: {
            "limit?": QueryLimitParam1,
            "cursor?": QueryCursorParam2,
            "names?": {
              description:
                "Массив названий тегов, по которым вы хотите отфильтровать список",
              example: ["Design", "Product"],
              schema: TagNamesFilter,
            },
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataMetaOf(
              array(GroupTag),
              PaginationMeta,
              "Обертка ответа с данными и пагинацией",
            ),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-paginated": true,
        "x-requirements": {
          scope: "group_tags:read",
        },
      },
      POST: {
        id: "GroupTagOperations_createTag",
        description: "Новый тег\n\nМетод для создания нового тега.",
        tags: [tags["Group tags"]],
        req: {
          body: GroupTagRequest,
        },
        res: {
          201: resp({
            description:
              "The request has succeeded and a new resource has been created as a result.",
            body: dataOf(GroupTag, "Обертка ответа с данными"),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-requirements": {
          scope: "group_tags:write",
        },
      },
      "/:id": scope({
        GET: {
          id: "GroupTagOperations_getTag",
          description:
            "Информация о теге\n\nМетод для получения информации о теге. Названия тегов являются уникальными в компании.\n\nДля получения тега вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Group tags"]],
          req: {
            pathParams: {
              id: PathIdParam2,
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(GroupTag, "Обертка ответа с данными"),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "group_tags:read",
          },
        },
        PUT: {
          id: "GroupTagOperations_updateTag",
          description:
            "Редактирование тега\n\nМетод для редактирования тега.\n\nДля редактирования тега вам необходимо знать его `id` и указать его в `URL` запроса. Все редактируемые параметры тега указываются в теле запроса.",
          tags: [tags["Group tags"]],
          req: {
            pathParams: {
              id: PathIdParam2,
            },
            body: GroupTagRequest,
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(GroupTag, "Обертка ответа с данными"),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "group_tags:write",
          },
        },
        DELETE: {
          id: "GroupTagOperations_deleteTag",
          description:
            "Удаление тега\n\nМетод для удаления тега.\n\nДля удаления тега вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Group tags"]],
          req: {
            pathParams: {
              id: PathIdParam2,
            },
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "group_tags:write",
          },
        },
        "/users": GET({
          id: "GroupTagOperations_getTagUsers",
          description:
            "Список сотрудников тега\n\nМетод для получения актуального списка сотрудников тега.",
          tags: [tags["Group tags"]],
          req: {
            pathParams: {
              id: PathIdParam2,
            },
            query: {
              "limit?": QueryLimitParam1,
              "cursor?": QueryCursorParam2,
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataMetaOf(
                array(User),
                PaginationMeta,
                "Обертка ответа с данными и пагинацией",
              ),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-paginated": true,
          "x-requirements": {
            scope: "group_tags:read",
          },
        }),
      }),
    }),
    "/messages": scope({
      GET: {
        id: "ChatMessageOperations_listChatMessages",
        description:
          "Список сообщений чата\n\nМетод для получения списка сообщений бесед, каналов, тредов и личных сообщений.\n\nДля получения сообщений вам необходимо знать `chat_id` требуемой беседы, канала, треда или диалога, и указать его в `URL` запроса. Сообщения будут возвращены в порядке убывания даты отправки (то есть, сначала будут идти последние сообщения чата). Для получения более ранних сообщений чата доступны параметры `limit` и `cursor`.",
        tags: [tags["Messages"]],
        req: {
          query: {
            "order?": QueryOrderParam1,
            "limit?": QueryLimitParam1,
            "cursor?": QueryCursorParam2,
            chat_id: {
              description:
                "Идентификатор чата (беседа, канал, диалог или чат треда)",
              example: 198,
              explode: false,
              schema: int32({
                examples: [198],
              }),
            },
            "sort?": {
              description: "Поле сортировки",
              example: "id",
              explode: false,
              schema: allOf([MessageSortField], {
                default: "id",
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataMetaOf(
              array(Message),
              PaginationMeta,
              "Обертка ответа с данными и пагинацией",
            ),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          404: resp({
            description: "The server cannot find the requested resource.",
            body: ApiError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-paginated": true,
        "x-requirements": {
          scope: "messages:read",
        },
      },
      POST: {
        id: "MessageOperations_createMessage",
        description:
          'Новое сообщение\n\nМетод для отправки сообщения в беседу или канал, личного сообщения пользователю или комментария в тред.\n\nПри использовании `entity_type: "discussion"` (или просто без указания `entity_type`) допускается отправка любого `chat_id` в поле `entity_id`. То есть, сообщение можно отправить зная только идентификатор чата. При этом, вы имеете возможность отправить сообщение в тред по его идентификатору или личное сообщение по идентификатору пользователя.\n\nДля отправки личного сообщения пользователю создавать чат не требуется. Достаточно указать `entity_type: "user"` и идентификатор пользователя. Чат будет создан автоматически, если между вами ещё не было переписки. Между двумя пользователями может быть только один личный чат.',
        tags: [tags["Messages"]],
        req: {
          body: MessageCreateRequest,
        },
        res: {
          201: resp({
            description:
              "The request has succeeded and a new resource has been created as a result.",
            body: dataOf(Message, "Обертка ответа с данными"),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-requirements": {
          scope: "messages:create",
        },
      },
      "/:id": scope({
        GET: {
          id: "MessageOperations_getMessage",
          description:
            "Информация о сообщении\n\nМетод для получения информации о сообщении.\n\nДля получения сообщения вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Messages"]],
          req: {
            pathParams: {
              id: PathIdParam3,
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(Message, "Обертка ответа с данными"),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "messages:read",
          },
        },
        PUT: {
          id: "MessageOperations_updateMessage",
          description:
            "Редактирование сообщения\n\nМетод для редактирования сообщения или комментария.\n\nДля редактирования сообщения вам необходимо знать его `id` и указать его в `URL` запроса. Все редактируемые параметры сообщения указываются в теле запроса.",
          tags: [tags["Messages"]],
          req: {
            pathParams: {
              id: PathIdParam3,
            },
            body: MessageUpdateRequest,
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(Message, "Обертка ответа с данными"),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "messages:update",
          },
        },
        DELETE: {
          id: "MessageOperations_deleteMessage",
          description:
            "Удаление сообщения\n\nМетод для удаления сообщения.\n\nУдаление сообщения доступно отправителю, админам и редакторам в чате. В личных сообщениях оба пользователя являются редакторами. Ограничений по давности отправки сообщения нет.\n\nДля удаления сообщения вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Messages"]],
          req: {
            pathParams: {
              id: PathIdParam3,
            },
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "messages:delete",
          },
        },
        "/link_previews": POST({
          id: "LinkPreviewOperations_createLinkPreviews",
          description:
            "Unfurl (разворачивание ссылок)\n\nМетод для создания предпросмотров ссылок в сообщениях. Доступен только для Unfurl-ботов.",
          tags: [tags["Link Previews"]],
          req: {
            pathParams: {
              id: PathIdParam3,
            },
            body: LinkPreviewsRequest,
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "link_previews:write",
          },
        }),
        "/pin": scope({
          POST: {
            id: "MessageOperations_pinMessage",
            description:
              "Закрепление сообщения\n\nМетод для закрепления сообщения в чате.\n\nДля закрепления сообщения вам необходимо знать `id` сообщения и указать его в `URL` запроса.",
            tags: [tags["Messages"]],
            req: {
              pathParams: {
                id: PathIdParam3,
              },
            },
            res: {
              204: resp({
                description:
                  "There is no content to send for this request, but the headers may be useful. ",
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
              }),
            },
            "x-requirements": {
              scope: "pins:write",
            },
          },
          DELETE: {
            id: "MessageOperations_unpinMessage",
            description:
              "Открепление сообщения\n\nМетод для открепления сообщения из чата.\n\nДля открепления сообщения вам необходимо знать `id` сообщения и указать его в `URL` запроса.",
            tags: [tags["Messages"]],
            req: {
              pathParams: {
                id: PathIdParam3,
              },
            },
            res: {
              204: resp({
                description:
                  "There is no content to send for this request, but the headers may be useful. ",
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "pins:write",
            },
          },
        }),
        "/reactions": scope({
          GET: {
            id: "ReactionOperations_listReactions",
            description:
              "Список реакций\n\nМетод для получения актуального списка реакций на сообщение.",
            tags: [tags["Reactions"]],
            req: {
              pathParams: {
                id: PathIdParam3,
              },
              query: {
                "limit?": QueryLimitParam1,
                "cursor?": QueryCursorParam2,
              },
            },
            res: {
              200: resp({
                description: "The request has succeeded.",
                body: dataMetaOf(
                  array(Reaction),
                  PaginationMeta,
                  "Обертка ответа с данными и пагинацией",
                ),
              }),
              400: resp({
                description:
                  "The server could not understand the request due to invalid syntax.",
                body: ApiError,
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
                body: ApiError,
              }),
            },
            "x-paginated": true,
            "x-requirements": {
              scope: "reactions:read",
            },
          },
          POST: {
            id: "ReactionOperations_addReaction",
            description:
              "Добавление реакции\n\nМетод для добавления реакции на сообщение.\n\nДля добавления реакции вам необходимо знать `id` сообщения и указать его в `URL` запроса. Реакции на сообщения отправляются в виде символов `Emoji`. Если пользователь уже ставил реакцию - повторно она установлена не будет. Для удаления реакции надо воспользоваться методом [Удаление реакции](DELETE /messages/{id}/reactions).\n\n**Лимиты реакций:**\n\n- Каждый пользователь может установить не более **20 уникальных** реакций\n- Сообщение может иметь не более **30 уникальных** реакций\n- Общее количество реакций на сообщение не может превышать **1000**",
            tags: [tags["Reactions"]],
            req: {
              pathParams: {
                id: PathIdParam4,
              },
              body: ReactionRequest,
            },
            res: {
              201: resp({
                description:
                  "The request has succeeded and a new resource has been created as a result.",
                body: Reaction,
              }),
              400: resp({
                description:
                  "The server could not understand the request due to invalid syntax.",
                body: ApiError,
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "reactions:write",
            },
          },
          DELETE: {
            id: "ReactionOperations_removeReaction",
            description:
              "Удаление реакции\n\nМетод для удаления реакции на сообщение.\n\nДля удаления реакции вам необходимо знать `id` сообщения и указать его в `URL` запроса. Реакции на сообщения хранятся в виде символов `Emoji`.\n\nУдалять можно только те реакции, которые были поставлены авторизованным пользователем.",
            tags: [tags["Reactions"]],
            req: {
              pathParams: {
                id: PathIdParam4,
              },
              query: {
                code: {
                  description: "Emoji символ реакции",
                  example: "👍",
                  explode: false,
                  schema: string({
                    examples: ["👍"],
                  }),
                },
                "name?": {
                  description:
                    "Текстовое имя эмодзи (используется для кастомных эмодзи)",
                  example: ":+1:",
                  explode: false,
                  schema: string({
                    examples: [":+1:"],
                  }),
                },
              },
            },
            res: {
              204: resp({
                description:
                  "There is no content to send for this request, but the headers may be useful. ",
              }),
              400: resp({
                description:
                  "The server could not understand the request due to invalid syntax.",
                body: ApiError,
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "reactions:write",
            },
          },
        }),
        "/read_member_ids": GET({
          id: "ReadMemberOperations_listReadMembers",
          description:
            "Список прочитавших сообщение\n\nМетод для получения актуального списка пользователей, прочитавших сообщение.",
          tags: [tags["Read members"]],
          req: {
            pathParams: {
              id: PathIdParam3,
            },
            query: {
              "cursor?": QueryCursorParam2,
              "limit?": {
                description: "Количество возвращаемых сущностей за один запрос",
                example: 300,
                explode: false,
                schema: int32({
                  examples: [300],
                  default: 300,
                  maximum: 300,
                  minimum: 1,
                }),
              },
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataMetaOf(
                array(int32()),
                PaginationMeta,
                "Обертка ответа с данными и пагинацией",
              ),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-paginated": true,
          "x-requirements": {
            scope: "messages:read",
          },
        }),
        "/thread": POST({
          id: "ThreadOperations_createThread",
          description:
            "Новый тред\n\nМетод для создания нового треда к сообщению.\n\nЕсли у сообщения уже был создан тред, то в ответе на запрос вернётся информация об уже созданном ранее треде.",
          tags: [tags["Threads"]],
          req: {
            pathParams: {
              id: {
                description: "Идентификатор сообщения",
                example: 154332686,
                schema: int32({
                  examples: [154332686],
                }),
              },
            },
          },
          res: {
            201: resp({
              description:
                "The request has succeeded and a new resource has been created as a result.",
              body: dataOf(Thread, "Обертка ответа с данными"),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "threads:create",
          },
        }),
      }),
    }),
    "/oauth/token/info": GET({
          id: "OAuthOperations_getTokenInfo",
          description:
            "Информация о токене\n\nМетод для получения информации о текущем OAuth токене, включая его скоупы, дату создания и последнего использования. Токен в ответе маскируется — видны только первые 8 и последние 4 символа.",
          tags: [tags["Profile"]],
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(AccessTokenInfo, "Обертка ответа с данными"),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
          },
        }),
    "/profile": scope({
      GET: {
        id: "ProfileOperations_getProfile",
        description:
          "Информация о профиле\n\nМетод для получения информации о своем профиле.",
        tags: [tags["Profile"]],
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataOf(User, "Обертка ответа с данными"),
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
        },
        "x-requirements": {
          scope: "profile:read",
        },
      },
      "/avatar": scope({
        PUT: {
          id: "ProfileAvatarOperations_updateProfileAvatar",
          description:
            "Загрузка аватара\n\nМетод для загрузки или обновления аватара своего профиля. Файл передается в формате `multipart/form-data`.",
          tags: [tags["Profile"]],
          req: {
            body: {
              "multipart/form-data": object({
                image: string({
                  description: "Файл изображения для аватара",
                  contentMediaType: "application/octet-stream",
                }),
              }),
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(AvatarData, "Обертка ответа с данными"),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: anyOf([ApiError, OAuthError]),
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "profile_avatar:write",
          },
        },
        DELETE: {
          id: "ProfileAvatarOperations_deleteProfileAvatar",
          description:
            "Удаление аватара\n\nМетод для удаления аватара своего профиля.",
          tags: [tags["Profile"]],
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: anyOf([ApiError, OAuthError]),
            }),
          },
          "x-requirements": {
            scope: "profile_avatar:write",
          },
        },
      }),
      "/status": scope({
        GET: {
          id: "ProfileOperations_getStatus",
          description:
            "Текущий статус\n\nМетод для получения информации о своем статусе.",
          tags: [tags["Profile"]],
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(
                nullable(allOf([UserStatus])),
                "Обертка ответа с данными",
              ),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
          },
          "x-requirements": {
            scope: "profile_status:read",
          },
        },
        PUT: {
          id: "ProfileOperations_updateStatus",
          description:
            "Новый статус\n\nМетод для установки себе нового статуса.",
          tags: [tags["Profile"]],
          req: {
            body: StatusUpdateRequest,
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(UserStatus, "Обертка ответа с данными"),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "profile_status:write",
          },
        },
        DELETE: {
          id: "ProfileOperations_deleteStatus",
          description: "Удаление статуса\n\nМетод для удаления своего статуса.",
          tags: [tags["Profile"]],
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
          },
          "x-requirements": {
            scope: "profile_status:write",
          },
        },
      }),
    }),
    "/search": scope({
      "/chats": GET({
        id: "SearchOperations_searchChats",
        description:
          "Поиск чатов\n\nМетод для полнотекстового поиска каналов и бесед.",
        tags: [tags["Search"]],
        req: {
          query: {
            "cursor?": paginationParam,
            "order?": QueryOrderParam2,
            "created_from?": QueryCreated_fromParam1,
            "created_to?": QueryCreated_toParam1,
            "active?": QueryActiveParam1,
            "query?": {
              description: "Текст поискового запроса",
              example: "Разработка",
              explode: false,
              schema: string({
                examples: ["Разработка"],
              }),
            },
            "limit?": {
              description: "Количество возвращаемых результатов за один запрос",
              example: 10,
              explode: false,
              schema: int32({
                examples: [10],
                default: 100,
                maximum: 100,
              }),
            },
            "chat_subtype?": {
              description: "Фильтр по типу чата",
              example: "discussion",
              explode: false,
              schema: ChatSubtype,
            },
            "personal?": {
              description: "Фильтр по личным чатам",
              example: false,
              explode: false,
              schema: boolean({
                examples: [false],
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataMetaOf(
              array(Chat),
              SearchPaginationMeta,
              "Обертка ответа поисковых результатов с данными и пагинацией",
            ),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
        },
        "x-paginated": true,
        "x-requirements": {
          scope: "search:chats",
        },
      }),
      "/messages": GET({
        id: "SearchOperations_searchMessages",
        description:
          "Поиск сообщений\n\nМетод для полнотекстового поиска сообщений.",
        tags: [tags["Search"]],
        req: {
          query: {
            "limit?": QueryLimitParam2,
            "cursor?": paginationParam,
            "order?": QueryOrderParam2,
            "created_from?": QueryCreated_fromParam1,
            "created_to?": QueryCreated_toParam1,
            "active?": QueryActiveParam1,
            "query?": {
              description: "Текст поискового запроса",
              example: "футболки",
              explode: false,
              schema: string({
                examples: ["футболки"],
              }),
            },
            "chat_ids?": {
              description: "Фильтр по ID чатов",
              example: [198, 334],
              explode: false,
              schema: array(int32(), {
                examples: [[198, 334]],
              }),
            },
            "user_ids?": {
              description: "Фильтр по ID авторов сообщений",
              example: [12, 185],
              explode: false,
              schema: array(int32(), {
                examples: [[12, 185]],
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataMetaOf(
              array(Message),
              SearchPaginationMeta,
              "Обертка ответа поисковых результатов с данными и пагинацией",
            ),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
        },
        "x-paginated": true,
        "x-requirements": {
          scope: "search:messages",
        },
      }),
      "/users": GET({
        id: "SearchOperations_searchUsers",
        description:
          "Поиск сотрудников\n\nМетод для полнотекстового поиска сотрудников по имени, email, должности и другим полям.",
        tags: [tags["Search"]],
        req: {
          query: {
            "limit?": QueryLimitParam2,
            "cursor?": paginationParam,
            "order?": QueryOrderParam2,
            "created_from?": QueryCreated_fromParam1,
            "created_to?": QueryCreated_toParam1,
            "query?": {
              description: "Текст поискового запроса",
              example: "Олег",
              explode: false,
              schema: string({
                examples: ["Олег"],
              }),
            },
            "sort?": {
              description: "Сортировка результатов",
              example: "by_score",
              explode: false,
              schema: SearchSortOrder,
            },
            "company_roles?": {
              description: "Фильтр по ролям сотрудников",
              example: ["admin", "user"],
              explode: false,
              schema: array(UserRole, {
                examples: [["admin", "user"]],
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataMetaOf(
              array(User),
              SearchPaginationMeta,
              "Обертка ответа поисковых результатов с данными и пагинацией",
            ),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
        },
        "x-paginated": true,
        "x-requirements": {
          scope: "search:users",
        },
      }),
    }),
    "/tasks": scope({
      GET: {
        id: "TaskOperations_listTasks",
        description:
          "Список напоминаний\n\nМетод для получения списка напоминаний.",
        tags: [tags["Tasks"]],
        req: {
          query: {
            "limit?": QueryLimitParam1,
            "cursor?": QueryCursorParam2,
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataMetaOf(
              array(Task),
              PaginationMeta,
              "Обертка ответа с данными и пагинацией",
            ),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
        },
        "x-paginated": true,
        "x-requirements": {
          scope: "tasks:read",
        },
      },
      POST: {
        id: "TaskOperations_createTask",
        description:
          "Новое напоминание\n\nМетод для создания нового напоминания.\n\nПри создании напоминания обязательным условием является указания типа напоминания: звонок, встреча, простое напоминание, событие или письмо. При этом не требуется дополнительное описание - вы просто создадите напоминание с соответствующим текстом. Если вы укажите описание напоминания - то именно оно и станет текстом напоминания.\n\nУ напоминания должны быть ответственные, если их не указывать - ответственным назначается вы.\n\nОтветственным для напоминания без привязки к каким-либо сущностям может стать любой сотрудник компании. Актуальный состав сотрудников компании вы можете получить в методе [список сотрудников](GET /users).\n\nНапоминание можно привязать к чату, указав `chat_id`. Для привязки к чату необходимо быть его участником.",
        tags: [tags["Tasks"]],
        req: {
          body: TaskCreateRequest,
        },
        res: {
          201: resp({
            description:
              "The request has succeeded and a new resource has been created as a result.",
            body: dataOf(Task, "Обертка ответа с данными"),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          404: resp({
            description: "The server cannot find the requested resource.",
            body: ApiError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-requirements": {
          scope: "tasks:create",
        },
      },
      "/:id": scope({
        GET: {
          id: "TaskOperations_getTask",
          description:
            "Информация о напоминании\n\nМетод для получения информации о напоминании.\n\nДля получения напоминания вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Tasks"]],
          req: {
            pathParams: {
              id: PathIdParam5,
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(Task, "Обертка ответа с данными"),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "tasks:read",
          },
        },
        PUT: {
          id: "TaskOperations_updateTask",
          description:
            "Редактирование напоминания\n\nМетод для редактирования напоминания.\n\nДля редактирования напоминания вам необходимо знать его `id` и указать его в `URL` запроса. Все редактируемые параметры напоминания указываются в теле запроса.",
          tags: [tags["Tasks"]],
          req: {
            pathParams: {
              id: PathIdParam5,
            },
            body: TaskUpdateRequest,
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(Task, "Обертка ответа с данными"),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "tasks:update",
          },
        },
        DELETE: {
          id: "TaskOperations_deleteTask",
          description:
            "Удаление напоминания\n\nМетод для удаления напоминания.\n\nДля удаления напоминания вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Tasks"]],
          req: {
            pathParams: {
              id: PathIdParam5,
            },
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "tasks:delete",
          },
        },
      }),
    }),
    "/threads/:id": GET({
        id: "ThreadOperations_getThread",
        description:
          "Информация о треде\n\nМетод для получения информации о треде.\n\nДля получения треда вам необходимо знать его `id` и указать его в `URL` запроса.",
        tags: [tags["Threads"]],
        req: {
          pathParams: {
            id: {
              description: "Идентификатор треда",
              example: 265142,
              schema: int32({
                examples: [265142],
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataOf(Thread, "Обертка ответа с данными"),
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          404: resp({
            description: "The server cannot find the requested resource.",
            body: ApiError,
          }),
        },
        "x-requirements": {
          scope: "threads:read",
        },
      }),
    "/uploads": POST({
      id: "UploadOperations_getUploadParams",
      description:
        "Получение подписи, ключа и других параметров\n\nМетод для получения подписи, ключа и других параметров, необходимых для загрузки файла.\n\nДанный метод необходимо использовать для загрузки каждого файла.",
      tags: [tags["Common"]],
      res: {
        201: resp({
          description:
            "The request has succeeded and a new resource has been created as a result.",
          body: UploadParams,
        }),
        401: resp({
          description: "Access is unauthorized.",
          body: OAuthError,
        }),
        402: resp({
          description: "Client error",
          body: ApiError,
        }),
        403: resp({
          description: "Access is forbidden.",
          body: OAuthError,
        }),
      },
      "x-requirements": {
        scope: "uploads:write",
      },
    }),
    "/users": scope({
      GET: {
        id: "UserOperations_listUsers",
        description:
          "Список сотрудников\n\nМетод для получения актуального списка сотрудников вашей компании.",
        tags: [tags["Users"]],
        req: {
          query: {
            "limit?": QueryLimitParam1,
            "cursor?": QueryCursorParam2,
            "query?": {
              description:
                "Поисковая фраза для фильтрации результатов. Поиск работает по полям: `first_name` (имя), `last_name` (фамилия), `email` (электронная почта), `phone_number` (телефон) и `nickname` (никнейм).",
              example: "Олег",
              explode: false,
              schema: string({
                examples: ["Олег"],
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "The request has succeeded.",
            body: dataMetaOf(
              array(User),
              PaginationMeta,
              "Обертка ответа с данными и пагинацией",
            ),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-paginated": true,
        "x-requirements": {
          scope: "users:read",
        },
      },
      POST: {
        id: "UserOperations_createUser",
        description:
          "Создать сотрудника\n\nМетод для создания нового сотрудника в вашей компании.\n\nВы можете заполнять дополнительные поля сотрудника, которые созданы в вашей компании. Получить актуальный список идентификаторов дополнительных полей сотрудника вы можете в методе [Список дополнительных полей](GET /custom_properties).",
        tags: [tags["Users"]],
        req: {
          body: UserCreateRequest,
        },
        res: {
          201: resp({
            description:
              "The request has succeeded and a new resource has been created as a result.",
            body: dataOf(User, "Обертка ответа с данными"),
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-requirements": {
          scope: "users:create",
        },
      },
      "/:id": scope({
        GET: {
          id: "UserOperations_getUser",
          description:
            "Информация о сотруднике\n\nМетод для получения информации о сотруднике.\n\nДля получения сотрудника вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Users"]],
          req: {
            pathParams: {
              id: PathIdParam6,
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(User, "Обертка ответа с данными"),
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "users:read",
          },
        },
        PUT: {
          id: "UserOperations_updateUser",
          description:
            "Редактирование сотрудника\n\nМетод для редактирования сотрудника.\n\nДля редактирования сотрудника вам необходимо знать его `id` и указать его в `URL` запроса. Все редактируемые параметры сотрудника указываются в теле запроса. Получить актуальный список идентификаторов дополнительных полей сотрудника вы можете в методе [Список дополнительных полей](GET /custom_properties).",
          tags: [tags["Users"]],
          req: {
            pathParams: {
              id: PathIdParam6,
            },
            body: UserUpdateRequest,
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataOf(User, "Обертка ответа с данными"),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "users:update",
          },
        },
        DELETE: {
          id: "UserOperations_deleteUser",
          description:
            "Удаление сотрудника\n\nМетод для удаления сотрудника.\n\nДля удаления сотрудника вам необходимо знать его `id` и указать его в `URL` запроса.",
          tags: [tags["Users"]],
          req: {
            pathParams: {
              id: PathIdParam6,
            },
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "users:delete",
          },
        },
      }),
      "/:user_id": scope({
        "/avatar": scope({
          PUT: {
            id: "UserAvatarOperations_updateUserAvatar",
            description:
              "Загрузка аватара сотрудника\n\nМетод для загрузки или обновления аватара сотрудника. Файл передается в формате `multipart/form-data`.",
            tags: [tags["Users"]],
            req: {
              pathParams: {
                user_id: PathUser_idParam2,
              },
              body: {
                "multipart/form-data": object({
                  image: string({
                    description: "Файл изображения для аватара",
                    contentMediaType: "application/octet-stream",
                  }),
                }),
              },
            },
            res: {
              200: resp({
                description: "The request has succeeded.",
                body: dataOf(AvatarData, "Обертка ответа с данными"),
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              402: resp({
                description: "Client error",
                body: ApiError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: anyOf([ApiError, OAuthError]),
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "user_avatar:write",
            },
          },
          DELETE: {
            id: "UserAvatarOperations_deleteUserAvatar",
            description:
              "Удаление аватара сотрудника\n\nМетод для удаления аватара сотрудника.",
            tags: [tags["Users"]],
            req: {
              pathParams: {
                user_id: PathUser_idParam2,
              },
            },
            res: {
              204: resp({
                description:
                  "There is no content to send for this request, but the headers may be useful. ",
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              402: resp({
                description: "Client error",
                body: ApiError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: anyOf([ApiError, OAuthError]),
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "user_avatar:write",
            },
          },
        }),
        "/status": scope({
          GET: {
            id: "UserStatusOperations_getUserStatus",
            description:
              "Статус сотрудника\n\nМетод для получения информации о статусе сотрудника.",
            tags: [tags["Users"]],
            req: {
              pathParams: {
                user_id: PathUser_idParam2,
              },
            },
            res: {
              200: resp({
                description: "The request has succeeded.",
                body: dataOf(
                  nullable(allOf([UserStatus])),
                  "Обертка ответа с данными",
                ),
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "user_status:read",
            },
          },
          PUT: {
            id: "UserStatusOperations_updateUserStatus",
            description:
              "Новый статус сотрудника\n\nМетод для установки нового статуса сотруднику.",
            tags: [tags["Users"]],
            req: {
              pathParams: {
                user_id: PathUser_idParam2,
              },
              body: StatusUpdateRequest,
            },
            res: {
              200: resp({
                description: "The request has succeeded.",
                body: dataOf(UserStatus, "Обертка ответа с данными"),
              }),
              400: resp({
                description:
                  "The server could not understand the request due to invalid syntax.",
                body: ApiError,
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
              422: resp({
                description: "Client error",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "user_status:write",
            },
          },
          DELETE: {
            id: "UserStatusOperations_deleteUserStatus",
            description:
              "Удаление статуса сотрудника\n\nМетод для удаления статуса сотрудника.",
            tags: [tags["Users"]],
            req: {
              pathParams: {
                user_id: PathUser_idParam2,
              },
            },
            res: {
              204: resp({
                description:
                  "There is no content to send for this request, but the headers may be useful. ",
              }),
              401: resp({
                description: "Access is unauthorized.",
                body: OAuthError,
              }),
              403: resp({
                description: "Access is forbidden.",
                body: OAuthError,
              }),
              404: resp({
                description: "The server cannot find the requested resource.",
                body: ApiError,
              }),
            },
            "x-requirements": {
              scope: "user_status:write",
            },
          },
        }),
      }),
    }),
    "/views/open": POST({
        id: "FormOperations_openView",
        description:
          "Открытие представления\n\nМетод для открытия модального окна с представлением для пользователя.\n\nЧтобы открыть модальное окно с представлением, ваше приложение должно иметь действительный, неистекший `trigger_id`.",
        tags: [tags["Views"]],
        req: {
          body: OpenViewRequest,
        },
        res: {
          201: resp({
            description:
              "The request has succeeded and a new resource has been created as a result.",
          }),
          400: resp({
            description:
              "The server could not understand the request due to invalid syntax.",
            body: ApiError,
          }),
          401: resp({
            description: "Access is unauthorized.",
            body: OAuthError,
          }),
          402: resp({
            description: "Client error",
            body: ApiError,
          }),
          403: resp({
            description: "Access is forbidden.",
            body: OAuthError,
          }),
          410: resp({
            description: "Client error",
            body: ApiError,
          }),
          422: resp({
            description: "Client error",
            body: ApiError,
          }),
        },
        "x-requirements": {
          scope: "views:write",
        },
      }),
    "/webhooks/events": scope({
        GET: {
          id: "BotOperations_getWebhookEvents",
          description:
            "История событий\n\nМетод для получения истории последних событий бота. Данный метод будет полезен, если вы не можете получать события в реальном времени на ваш `URL`, но вам требуется обрабатывать все события, на которые вы подписались.\n\nИстория событий сохраняется только при активном пункте «Сохранять историю событий» во вкладке «Исходящий webhook» настроек бота. При этом указывать «Webhook `URL`» не требуется.\n\nДля получения истории событий конкретного бота вам необходимо знать его `access_token` и использовать его при запросе. Каждое событие представляет `JSON` объект вебхука.",
          tags: [tags["Bots"]],
          req: {
            query: {
              "limit?": QueryLimitParam1,
              "cursor?": paginationParam,
            },
          },
          res: {
            200: resp({
              description: "The request has succeeded.",
              body: dataMetaOf(
                array(WebhookEvent),
                PaginationMeta,
                "Обертка ответа с данными и пагинацией",
              ),
            }),
            400: resp({
              description:
                "The server could not understand the request due to invalid syntax.",
              body: ApiError,
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            422: resp({
              description: "Client error",
              body: ApiError,
            }),
          },
          "x-paginated": true,
          "x-requirements": {
            scope: "webhooks:events:read",
          },
        },
        "/:id": DELETE({
          id: "BotOperations_deleteWebhookEvent",
          description:
            "Удаление события\n\nДанный метод доступен для работы только с `access_token` бота\n\nМетод для удаления события из истории событий бота.\n\nДля удаления события вам необходимо знать `access_token` бота, которому принадлежит событие, и `id` события.",
          tags: [tags["Bots"]],
          req: {
            pathParams: {
              id: {
                description: "Идентификатор события",
                example: "01KAJZ2XDSS2S3DSW9EXJZ0TBV",
                schema: string({
                  examples: ["01KAJZ2XDSS2S3DSW9EXJZ0TBV"],
                }),
              },
            },
          },
          res: {
            204: resp({
              description:
                "There is no content to send for this request, but the headers may be useful. ",
            }),
            401: resp({
              description: "Access is unauthorized.",
              body: OAuthError,
            }),
            402: resp({
              description: "Client error",
              body: ApiError,
            }),
            403: resp({
              description: "Access is forbidden.",
              body: OAuthError,
            }),
            404: resp({
              description: "The server cannot find the requested resource.",
              body: ApiError,
            }),
          },
          "x-requirements": {
            scope: "webhooks:events:delete",
          },
        }),
      }),
  },
})
