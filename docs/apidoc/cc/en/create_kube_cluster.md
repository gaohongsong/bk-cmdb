### Functional description

create a new container cluster (v3.12.1+, permission: kube cluster editing permissions)

### Request Parameters

{{ common_args_desc }}

#### Interface Parameters

| Field             | Type   | Required | Description                                            |
|-------------------|--------|----------|--------------------------------------------------------|
| bk_biz_id         | int    | yes      | business ID                                            |
| name              | string | yes      | cluster name                                           |
| scheduling_engine | string | no       | scheduling engine                                      |
| uid               | string | yes      | cluster own ID                                         |
| xid               | string | no       | associated cluster ID                                  |
| version           | string | no       | cluster version                                        |
| network_type      | string | no       | network type                                           |
| region            | string | no       | the region where the cluster is located                |
| vpc               | string | no       | vpc network                                            |
| network           | array  | no       | cluster network                                        |
| type              | string | yes      | cluster type. enum: INDEPENDENT_CLUSTER, SHARE_CLUSTER |
| bk_project_id     | string | no       | project_id                                             |
| bk_project_name   | string | no       | project name                                           |
| bk_project_code   | string | no       | project english name                                   |

### Request Parameters Example

```json
{
  "bk_app_code": "esb_test",
  "bk_app_secret": "xxx",
  "bk_username": "xxx",
  "bk_token": "xxx",
  "bk_biz_id": 2,
  "name": "cluster",
  "scheduling_engine": "k8s",
  "uid": "xxx",
  "xid": "xxx",
  "version": "1.1.0",
  "network_type": "underlay",
  "region": "xxx",
  "vpc": "xxx",
  "network": [
    "127.0.0.0/21"
  ],
  "type": "INDEPENDENT_CLUSTER",
  "bk_project_id": "21bf9ef9be7c4d38a1d1f2uc0b44a8f2",
  "bk_project_name": "test",
  "bk_project_code": "test"
}
```

### Return Result Example

```json
{
  "result": true,
  "code": 0,
  "message": "success",
  "permission": null,
  "data": {
    "id": 1
  },
  "request_id": "87de106ab55549bfbcc46e47ecf5bcc7"
}
```

### Return result parameter

| Name       | Type   | Description                                                                        |
|------------|--------|------------------------------------------------------------------------------------|
| result     | bool   | Whether the request succeeded or not. True: request succeeded;false request failed |
| code       | int    | Wrong code. 0 indicates success,>0 indicates failure error                         |
| message    | string | Error message returned by request failure                                          |
| permission | object | Permission information                                                             |
| data       | object | Data returned by request                                                           |
| request_id | string | Request chain id                                                                   |

### data

| Name | Type | Description             |
|------|------|-------------------------|
| id   | int  | created kube cluster ID |
