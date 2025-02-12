<!--
 * Tencent is pleased to support the open source community by making 蓝鲸 available.
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
-->

<template>
  <bk-sideslider
    :transfer="true"
    :width="1202"
    :title="title"
    :is-show.sync="isShow"
    :before-close="handleSliderBeforeClose"
    class="dynamic-slidebar"
    @hidden="handleHidden">
    <bk-resize-layout
      :collapsible="true"
      :initial-divide="412"
      :min="400"
      :max="500"
      slot="content"
      style="height: 100%;">
      <div slot="aside" class="dynamic-group-info">
        <bk-form
          class="dynamic-group-form"
          ref="form"
          form-type="vertical"
          v-bkloading="{ isLoading: $loading([request.mainline, request.property, request.details]) }">
          <h5 class="form-title">
            {{ $t('基础信息') }}
          </h5>
          <bk-form-item :label="$t('分组名称')" required>
            <bk-input class="form-item"
              v-model.trim="formData.name"
              v-validate="'required|length:256'"
              data-vv-name="name"
              :data-vv-as="$t('查询名称')"
              :disabled="isPreviewProp"
              :placeholder="$t('请输入xx', { name: $t('查询名称') })">
            </bk-input>
            <p class="form-error" v-if="errors.has('name')">{{errors.first('name')}}</p>
          </bk-form-item>
          <bk-form-item :label="$t('查询对象')" required>
            <form-target class="form-item"
              v-model="formData.bk_obj_id"
              :disabled="!isCreateMode"
              @change="handleModelChange">
            </form-target>
          </bk-form-item>
          <h5 class="form-title">
            {{ $t('分组条件') }}
          </h5>
          <bk-form-item class="">
            <form-property-list ref="propertyList" @remove="handleRemoveProperty"
              :disabled="isPreviewProp"></form-property-list>
            <bk-button class="form-condition-button" :style="{ marginTop: selectedProperties.length ? '10px' : 0 }"
              icon="icon-plus-circle"
              :text="true"
              :disabled="isPreviewProp"
              @click="handleShowPropertySelector">
              {{$t('添加条件')}}
            </bk-button>
            <input type="hidden"
              v-validate="'min_value:1'"
              data-vv-name="condition"
              data-vv-validate-on="submit"
              :data-vv-as="$t('查询条件')"
              v-model="selectedProperties.length">
            <p class="form-error" v-if="errors.has('condition')">{{$t('请添加查询条件')}}</p>
          </bk-form-item>
        </bk-form>
        <div :class="['dynamic-group-options', footerIsFixed ? '' : 'no-fixed']" slot="footer">
          <cmdb-auth :auth="saveAuth">
            <bk-button class="mr10" slot-scope="{ disabled }"
              theme="primary"
              :disabled="disabled"
              :loading="$loading([request.create, request.update])"
              @click="handleConfirm">
              {{ $t(confirmText) }}
            </bk-button>
          </cmdb-auth>
          <bk-button v-show="!isPreviewProp"
            class="mr10" theme="default" @click="handlePreview" :disabled="!selectedProperties.length">
            {{$t('预览')}}
          </bk-button>
          <bk-popconfirm
            :content="$t('确定清空分组条件')"
            width="280"
            trigger="click"
            :confirm-text="$t('确定')"
            :cancel-text="$t('取消')"
            @confirm="handleClearCondition">
            <bk-button v-show="!isPreviewProp" class="mr10" theme="default" :disabled="!selectedProperties.length">
              {{$t('清空条件')}}
            </bk-button>
          </bk-popconfirm>
          <bk-button v-show="!isPreviewProp"
            class="mr10 btn-cancel" theme="default" @click="handleSliderBeforeClose('cancel')">
            {{$t('取消')}}
          </bk-button>
        </div>
      </div>
      <div slot="main" class="dynamic-group-preview">
        <preview-result class="preview-result"
          :condition="previewCondition" :mode="bkObjId">
        </preview-result>
      </div>
    </bk-resize-layout>
  </bk-sideslider>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { t } from '@/i18n'
  import FormPropertyList from './form-property-list.vue'
  import FormPropertySelector from './form-property-selector.js'
  import FormTarget from './form-target.vue'
  import RouterQuery from '@/router/query'
  import { PROPERTY_TYPES } from '@/dictionary/property-constants'
  import useSideslider from '@/hooks/use-sideslider'
  import isEqual from 'lodash/isEqual'
  import PreviewResult from '../preview/preview-result.vue'
  import FilterStore from '../store'
  import { $success } from '@/magicbox'

  export default {
    components: {
      FormPropertyList,
      FormTarget,
      PreviewResult
    },
    props: {
      id: [String, Number],
      title: String,
      isPreview: {
        type: Boolean,
        value: false
      }
    },
    provide() {
      return {
        dynamicGroupForm: this
      }
    },
    data() {
      return {
        footerIsFixed: false,
        isPreviewData: false,
        bkObjId: 'host',
        previewCondition: {},
        isShow: false,
        details: null,
        formData: {
          name: '',
          bk_obj_id: 'host'
        },
        originFormData: {
          bk_obj_id: 'host',
          name: '',
        },
        selectedProperties: [],
        originProperties: [],
        request: Object.freeze({
          mainline: Symbol('mainline'),
          property: Symbol('property'),
          details: Symbol('details'),
          create: Symbol('create'),
          update: Symbol('update')
        }),
        availableModelIds: Object.freeze(['host', 'module', 'set']),
        availableModels: [],
        propertyMap: {},
        disabledPropertyMap: {}
      }
    },
    computed: {
      ...mapGetters(['supplierAccount']),
      ...mapGetters('objectBiz', ['bizId']),
      isCreateMode() {
        return !this.id
      },
      searchTargetModels() {
        return this.availableModels.filter(model => ['host', 'set'].includes(model.bk_obj_id))
      },
      saveAuth() {
        if (this.id) {
          return { type: this.$OPERATION.U_CUSTOM_QUERY, relation: [this.bizId, this.id] }
        }
        return { type: this.$OPERATION.C_CUSTOM_QUERY, relation: [this.bizId] }
      },
      isPreviewProp() {
        return this.isPreviewData
      },
      confirmText() {
        let text = '保存'
        if (this.isPreviewProp) {
          text = '编辑'
        } else if (this.isCreateMode) {
          text = '提交'
        }
        return text
      }
    },
    watch: {
      selectedProperties: {
        deep: true,
        handler() {
          this.errors.remove('condition')
        }
      }
    },
    async created() {
      await this.getMainLineModels()
      await this.getModelProperties()
      if (this.id) {
        this.getDetails()
      }
      const { beforeClose, setChanged } = useSideslider()
      this.beforeClose = beforeClose
      this.setChanged = setChanged
      this.isPreviewData = this.isPreview
      if (this.isPreview || this.id) {
        setTimeout(() => {
          this.initPreviewParams()
        }, 300)
      }
    },
    methods: {
      async getMainLineModels() {
        try {
          const models = await this.$store.dispatch('objectMainLineModule/searchMainlineObject', {
            config: {
              requestId: this.request.mainline,
              fromCache: true
            }
          })
          // 业务调用方暂时只需要一下三种类型的查询
          // eslint-disable-next-line max-len
          const availableModels = this.availableModelIds.map(modelId => models.find(model => model.bk_obj_id === modelId))
          this.availableModels = Object.freeze(availableModels)
        } catch (error) {
          console.error(error)
        }
      },
      async getModelProperties() {
        try {
          const propertyMap = await this.$store.dispatch('objectModelProperty/batchSearchObjectAttribute', {
            params: {
              bk_biz_id: this.bizId,
              bk_obj_id: { $in: this.availableModels.map(model => model.bk_obj_id) },
              bk_supplier_account: this.supplierAccount
            },
            config: {
              requestId: this.request.property,
              fromCache: true
            }
          })
          propertyMap.module.unshift(this.getServiceTemplateProperty())
          this.propertyMap = Object.freeze(propertyMap)

          Object.keys(this.propertyMap).forEach((objId) => {
            this.disabledPropertyMap[objId] = this.propertyMap[objId]
              .filter(item => item.bk_property_type === PROPERTY_TYPES.INNER_TABLE)
              .map(item => item.bk_property_id)
          })
        } catch (error) {
          console.error(error)
          this.propertyMap = {}
        }
      },
      getServiceTemplateProperty() {
        return {
          id: Date.now(),
          bk_obj_id: 'module',
          bk_property_id: 'service_template_id',
          bk_property_name: t('服务模板'),
          bk_property_index: -1,
          bk_property_type: 'service-template',
          isonly: true,
          ispre: true,
          bk_isapi: true,
          bk_issystem: true,
          isreadonly: true,
          editable: false,
          bk_property_group: null,
          _is_inject_: true
        }
      },
      async getDetails() {
        try {
          const details = await this.$store.dispatch('dynamicGroup/details', {
            bizId: this.bizId,
            id: this.id,
            config: {
              requestId: this.request.details
            }
          })
          const transformedDetails = this.transformDetails(details)
          this.originFormData.name = transformedDetails.name
          this.originFormData.bk_obj_id = transformedDetails.bk_obj_id
          this.formData.name = transformedDetails.name
          this.formData.bk_obj_id = transformedDetails.bk_obj_id
          this.details = transformedDetails
          this.$nextTick(this.setDetailsSelectedProperties)
          setTimeout(this.$refs.propertyList?.setDetailsCondition, 0)
        } catch (error) {
          console.error(error)
        }
      },
      transformDetails(details) {
        const { condition } = details.info
        const transformedCondition = []
        condition.forEach((data) => {
          const realCondition = (data.condition || []).reduce((accumulator, current) => {
            if (['$gte', '$lte'].includes(current.operator)) {
              // $gte和$lte，可能是单个field也可能是同一field的范围设置，如果是范围一个field会拆分为两条cond
              const isRange = data.condition.filter(cond => cond.field === current.field)?.length > 1

              // 将相同字段的$gte/$lte两个条件合并为一个range条件，用于表单组件渲染
              let index = accumulator.findIndex(exist => exist.field === current.field)
              if (index === -1) {
                index = accumulator.push({
                  field: current.field,
                  operator: isRange ? '$range' : current.operator,
                  value: isRange ? [] : current.value
                }) - 1
              }
              const range = accumulator[index]

              // 如果是范围并且确保field一致，需要组装为一个范围数组格式值
              if (isRange && current.field === range.field) {
                range.value?.[current.operator === '$gte' ? 'unshift' : 'push'](current.value)
              }
            } else if (current.operator === '$eq') {
              // 将老数据的eq转换为当前支持的数据格式
              const transformType = ['singlechar', 'longchar', 'enum', 'objuser']
              const property = this.getConditionProperty(data.bk_obj_id, current.field)
              if (property && transformType.includes(property.bk_property_type)) {
                accumulator.push({
                  field: current.field,
                  operator: '$in',
                  value: Array.isArray(current.value) ? current.value : [current.value]
                })
              } else {
                accumulator.push(current)
              }
            } else {
              accumulator.push(current)
            }
            return accumulator
          }, [])
          if (data.time_condition) {
            data.time_condition.rules.forEach(({ field, start, end }) => {
              realCondition.push({
                field,
                operator: '$range',
                value: [start, end]
              })
            })
          }
          transformedCondition.push({
            bk_obj_id: data.bk_obj_id,
            condition: realCondition
          })
        })
        return {
          ...details,
          info: {
            condition: transformedCondition
          }
        }
      },
      getConditionProperty(modelId, field) {
        const properties = this.propertyMap[modelId] || []
        return properties.find(property => property.bk_property_id === field)
      },
      setDetailsSelectedProperties() {
        const conditions = this.details.info.condition
        const properties = []
        conditions.forEach(({ bk_obj_id: modelId, condition }) => {
          condition.forEach(({ field }) => {
            const property = this.propertyMap[modelId].find(property => property.bk_property_id === field)
            property && properties.push(property)
          })
        })
        this.selectedProperties = this.$tools.clone(properties)
        this.originProperties = this.$tools.clone(properties)
        this.setFooterCls()
      },
      setFooterCls() {
        this.$nextTick(() => {
          // 根据选择的条件 展示不同的样式
          const el = document.querySelector('.dynamic-group-form')
          const { clientHeight, scrollHeight } = el
          // 是否出现了滚动条
          if (scrollHeight > clientHeight) {
            this.footerIsFixed = true
          } else {
            this.footerIsFixed = false
          }
        })
      },
      handleModelChange() {
        this.selectedProperties = []
      },
      handleClearCondition() {
        this.selectedProperties = []
      },
      handleShowPropertySelector(event) {
        this.formPropertySelector = FormPropertySelector.show({
          selected: this.selectedProperties,
          handler: this.handlePropertySelected
        }, this, event?.target)
      },
      handlePropertySelected(selected) {
        this.selectedProperties = selected
        this.setFooterCls()
      },
      handleRemoveProperty(property) {
        const index = this.selectedProperties.findIndex(target => target.id === property.id)
        if (index > -1) {
          this.selectedProperties.splice(index, 1)
        }
        this.setFooterCls()
      },
      async handlePreview() {
        const result = await this.$refs.propertyList.$validator.validateAll()
        if (!result) {
          return
        }
        this.initPreviewParams()
      },
      initPreviewParams() {
        this.bkObjId = this.formData.bk_obj_id
        FilterStore.setDynamicGroupModel(this.formData.bk_obj_id)
        this.previewCondition = this.$tools.clone(this.$refs.propertyList?.condition)
      },
      async handleConfirm() {
        try {
          if (this.isPreviewProp) {
            this.isPreviewData = false
            return
          }
          const results = [
            await this.$validator.validateAll(),
            await this.$refs.propertyList.$validator.validateAll()
          ]
          if (results.some(isValid => !isValid)) {
            return false
          }
          if (this.id) {
            await this.updateDynamicGroup()
            $success('保存成功')
          } else {
            await this.createDynamicGroup()
            $success('新建成功')
          }
          this.close('submit')
        } catch (error) {
          console.error(error)
        }
      },
      updateDynamicGroup() {
        return this.$store.dispatch('dynamicGroup/update', {
          bizId: this.bizId,
          id: this.id,
          params: {
            bk_biz_id: this.bizId,
            bk_obj_id: this.formData.bk_obj_id,
            name: this.formData.name,
            info: {
              condition: this.getSubmitCondition()
            }
          },
          config: {
            requestId: this.request.update
          }
        })
      },
      createDynamicGroup() {
        return this.$store.dispatch('dynamicGroup/create', {
          params: {
            bk_biz_id: this.bizId,
            bk_obj_id: this.formData.bk_obj_id,
            name: this.formData.name,
            info: {
              condition: this.getSubmitCondition()
            }
          },
          config: {
            requestId: this.request.create
          }
        })
      },
      getSubmitCondition() {
        const baseConditionMap = {}
        const timeConditionMap = {}
        const propertyCondition = this.$refs.propertyList.condition
        Object.values(propertyCondition).forEach(({ property, operator, value }) => {
          if (property.bk_property_type === 'time') { // 时间类型特殊处理
            const timeCondition = timeConditionMap[property.bk_obj_id] || { oper: 'and', rules: [] }
            const [start, end] = value
            timeCondition.rules.push({
              field: property.bk_property_id,
              start,
              end
            })
            timeConditionMap[property.bk_obj_id] = timeCondition
            return
          }
          const submitCondition = baseConditionMap[property.bk_obj_id] || []
          if (operator === '$range') {
            const [start, end] = value
            submitCondition.push({
              field: property.bk_property_id,
              operator: '$gte',
              value: start
            }, {
              field: property.bk_property_id,
              operator: '$lte',
              value: end
            })
          } else {
            submitCondition.push({
              field: property.bk_property_id,
              operator,
              value
            })
          }
          baseConditionMap[property.bk_obj_id] = submitCondition
        })
        const baseConditions = Object.keys(baseConditionMap).map(modelId => ({
          bk_obj_id: modelId,
          condition: baseConditionMap[modelId]
        }))
        Object.keys(timeConditionMap).forEach((modelId) => {
          const condition = baseConditions.find(condition => condition.bk_obj_id === modelId)
          if (condition) {
            condition.time_condition = timeConditionMap[modelId]
          } else {
            baseConditions.push({
              bk_obj_id: modelId,
              time_condition: timeConditionMap[modelId]
            })
          }
        })
        return baseConditions
      },
      close(type) {
        this.isShow = false
        if (type !== 'normal') {
          RouterQuery.set({
            _t: Date.now(),
            action: ''
          })
        }
      },
      show() {
        this.isShow = true
      },
      handleSliderBeforeClose(type = 'normal') {
        const changedValues = !isEqual(this.formData, this.originFormData)
        const changedProperties =  !isEqual(this.selectedProperties, this.originProperties)
        if (changedValues || changedProperties) {
          this.setChanged(true)
          return this.beforeClose(() => {
            this.close(type)
          })
        }
        this.close(type)
        FormPropertySelector?.hide(this.formPropertySelector)
        return true
      },
      handleHidden() {
        this.$emit('close')
      }
    }
  }
</script>

<style lang="scss" scoped>
.dynamic-slidebar {
  :deep(.bk-sideslider-content) {
    overflow-x: hidden;
  }
}
.dynamic-group-info {
  width: 100%;
  float: left;
  height: calc(100% - 53px);
}
.dynamic-group-preview {
  width: 100%;
  float: right;
  height: 100%;
  padding-bottom: 11px;
  background: #F5F7FA;
}
.dynamic-group-form {
  padding: 18px 16px 0;
  max-height: 100%;
  @include scrollbar-y;
  .form-item {
    width: 100%;
  }
  .form-error {
    position: absolute;
    top: 100%;
    font-size: 12px;
    line-height: 14px;
    color: $dangerColor;
  }
  .form-title {
    font-weight: 700;
    font-size: 14px;
    color: #313238;
    line-height: 22px;
    margin-bottom: 10px;
  }
  :deep(.bk-form-item) {
    margin-bottom: 20px;
    margin-top: 0 !important;
  }
  .form-condition-button {
    /deep/ > div {
      display: flex;
      align-items: center;
      .bk-icon {
        top: 0;
      }
    }
  }
}
.dynamic-group-options {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border-top: 1px solid $borderColor;
  background: #FAFBFD;
  :deep(.bk-button) {
    width: 88px;
    padding: 0 !important;
    &.btn-cancel {
      position: relative;

      &::before {
        content: '';
        width: 1px;
        height: 16px;
        background: #C4C6CC;
        display: inline-block;
        position: absolute;
        left: -6PX;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
}
.no-fixed {
  border-top: 0;
  padding-top: 4px;
  background: transparent;
}
</style>
