### Functional description

query the project (version: v3.10.23+, permissions: view permission of the project)

### Request Parameters

{{ common_args_desc }}

#### Interface Parameters

| Field      | Type      | Required   | Description                                                                                                                                 |
|-----------|------------|--------|---------------------------------------------------------------------------------------------------------------------------------------------|
| filter | object  | no   | query filter                                                                                                                                |
| fields | array   | no   | attribute list, which controls which fields are in the returned result, which can accelerate interface requests and reduce network traffic. |
| page | object  | yes   | page condition                                                                                                                              |

#### filter

this parameter is a combination of filtering rules for service attribute fields, and is used to search for services according to the service attribute fields. The combination only supports AND operation and can be nested, with a maximum of 2 layers.

| Field      | Type      | Required   | Description      |
|-----------|------------|--------|------------|
| condition |  string  | yes      | Rule operator|
| rules |  array  |yes     | Scope rule for filtering node|


#### rules
The filtering rule is triplet`field`,`operator`,`value`

| Name     | Type   | Required| Default value|  Description                                                  |
| -------- | ------ | ---- | ------ | ------------------------------------------------------------ |
| field    |  string |yes   | None     | Field name|                                                              |
| operator | string |yes   | None     | Operator| Optional values equal,not_equal,in,not_in,less,less_or_equal,greater,greater_or_equal,between,not_between|
| value    | -      |no   | None     | Operand| Different values correspond to different value formats                            |

Assembly rules can be found at: https://github.com/Tencent/bk-cmdb/blob/master/src/common/querybuilder/README.md

#### page

| Field      | Type      | Required   | Description      |
|-----------|------------|--------|------------|
| start    |   int    | yes  | Record start position|
| limit    |   int    | yes  | Limit bars per page, Max. 500|
| enable_count |  bool |yes| Whether this request is a token to obtain quantity or details|
| sort     |   string |no     | Sort the field. By adding sort in front of the field, for example, sort&#34;: sort field&#34; can indicate descending order by field field|


**Note:**
- `enable_count`If this flag is true, this request is a get quantity. The remaining fields must be initialized, start is 0, and limit is: 0, sort is "."
- `sort`If the caller does not specify it, the background specifies it as the container node ID by default.
- Paging parameters must be set, and the maximum query data at one time does not exceed 500.
- bk_cluster_id and cluster_uid cannot be empty or filled at the same time.

### Request Parameters Example

### Request Details Request Parameters

```json
{
  "bk_app_code": "esb_test",
  "bk_app_secret": "xxx",
  "bk_username": "xxx",
  "bk_token": "xxx",
  "filter": {
    "condition": "AND",
    "rules": [
      {
        "field": "id",
        "operator": "equal",
        "value": 1
      },
      {
        "field": "bk_status",
        "operator": "equal",
        "value": "enable"
      }
    ]
  },
  "page": {
    "start": 0,
    "limit": 10,
    "sort": "id",
    "enable_count": false
  }
}
```

### get quantity request parameters
```json
{
  "bk_app_code": "esb_test",
  "bk_app_secret": "xxx",
  "bk_username": "xxx",
  "bk_token": "xxx",
  "filter": {
    "condition": "AND",
    "rules": [
      {
        "field": "id",
        "operator": "equal",
        "value": 1
      },
      {
        "field": "bk_status",
        "operator": "equal",
        "value": "enable"
      }
    ]
  },
  "page": {
    "enable_count":true
  }
}
```

### Return Result Example

### Details interface response
```json
{
  "result": true,
  "code": 0,
  "data": {
    "count": 0,
    "info": [
      {
        "id": 1,
        "bk_project_id": "21bf9ef9be7c4d38a1d1f2uc0b44a8f2",
        "bk_project_name": "test",
        "bk_project_code": "test",
        "bk_project_desc": "test project",
        "bk_project_type": "mobile_game",
        "bk_project_sec_lvl": "public",
        "bk_project_owner": "admin",
        "bk_project_team": [1, 2],
        "bk_status": "enable",
        "bk_project_icon": "https://127.0.0.1/file/png/11111",
        "bk_supplier_account": "0",
        "create_time": "2022-12-22T11:22:17.504+08:00",
        "last_time": "2022-12-22T11:23:31.728+08:00"
      }
    ]
  },
  "message": "success",
  "permission": null,
  "request_id": "87de106ab55549bfbcc46e47ecf5bcc7"
}
```

### quantity interface response
```json
{
  "result":true,
  "code":0,
  "message":"success",
  "permission":null,
  "data":{
    "count":1,
    "info":[
    ]
  },
  "request_id": "87de106ab55549bfbcc46e47ecf5bcc7"
}
```

### Return Result Parameters Description

| Name    | Type   | Description                                    |
| ------- | ------ | ------------------------------------- |
| result  | bool   | Whether the request succeeded or not. True: request succeeded;false request failed|
| code    |  int    | Wrong code. 0 indicates success,>0 indicates failure error    |
| message | string |Error message returned by request failure                    |
| permission    |  object |Permission information    |
| data    |  object |Data returned by request                           |
| request_id    |  string |Request chain id    |

#### data

| Field      | Type      | Description     |
|-----------|-----------|-----------|
| count     |  int       | Number of records|
| info      |  array     | Actual data|

#### data.info
| Field | Type | Description                                                                                                   |
| ---------------------| ----- |---------------------------------------------------------------------------------------------------------------|
| id | int | Unique identifier of the project in cc                                                                        |
| bk_project_id | string | project_id                                                                                                    |
| bk_project_name | string | project name                                                                                                  |
| bk_project_code | string | project english name                                                                                             |
| bk_project_desc | string | project_description                                                                                           |
| bk_project_type | enum | Project type, optional values: "mobile_game", "pc_game", "web_game", "platform_prod", "support_prod", "other" |
| bk_project_sec_lvl | enum | Confidentiality level, optional values: "public", "private", "classified"                                     |
| bk_project_owner | string | project_owner                                                                                                 |
| bk_project_team | array | team                                                                                                          |
| bk_project_icon | string | Project icon                                                                                                  |
| bk_status | string | Project status, optional values: "enabled", "disabled"                                                        |
| bk_supplier_account | string | Developer account                                                                                             |
| create_time | string | creation time                                                                                                 |
| last_time | string | update_time                                                                                                   |


**Note:**
- If this request is to query details, count is 0. If the query is quantity, info is empty.

