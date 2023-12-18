/*
 * Tencent is pleased to support the open source community by making 蓝鲸 available.
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Meta from '@/router/meta'
import { MENU_BUSINESS, MENU_BUSINESS_HOST_AND_SERVICE } from '@/dictionary/menu-symbol'

export default [{
  name: 'createServiceInstance',
  path: 'service/instance/create/set/:setId/module/:moduleId',
  component: () => import('./create.new.vue'),
  meta: new Meta({
    owner: MENU_BUSINESS,
    menu: {
      i18n: '添加服务实例',
      relative: MENU_BUSINESS_HOST_AND_SERVICE
    }
  })
}, {
  name: 'cloneServiceInstance',
  path: 'service/instance/clone/set/:setId/module/:moduleId/instance/:instanceId/host/:hostId',
  props: true,
  component: () => import('./clone.vue'),
  meta: new Meta({
    owner: MENU_BUSINESS,
    menu: {
      i18n: '克隆服务实例',
      relative: MENU_BUSINESS_HOST_AND_SERVICE
    }
  })
}]
