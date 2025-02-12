### 功能描述

批量删除namespace (版本：v3.12.1+，权限：容器命名空间删除)

### 请求参数

{{ common_args_desc }}

#### 接口参数

- 通用字段：

| 字段        | 类型    | 必选  | 描述                                     |
|-----------|-------|-----|----------------------------------------|
| bk_biz_id | int   | 是   | 业务id                                   |
| ids       | array | 是   | 要删除的namespace在cc中的id唯一标识数组, 一次限制大小为200 |

### 请求参数示例

```json
{
  "bk_app_code": "esb_test",
  "bk_app_secret": "xxx",
  "bk_username": "xxx",
  "bk_token": "xxx",
  "bk_biz_id": 3,
  "ids": [
    1
  ]
}
```

### 返回结果示例

```json

{
  "result": true,
  "code": 0,
  "data": null,
  "message": "success",
  "permission": null,
  "request_id": "87de106ab55549bfbcc46e47ecf5bcc7"
}
```

### 返回结果参数说明

#### response

| 名称         | 类型     | 描述                         |
|------------|--------|----------------------------|
| result     | bool   | 请求成功与否。true:请求成功；false请求失败 |
| code       | int    | 错误编码。 0表示success，>0表示失败错误  |
| message    | string | 请求失败返回的错误信息                |
| permission | object | 权限信息                       |
| request_id | string | 请求链id                      |
| data       | object | 请求返回的数据                    |
