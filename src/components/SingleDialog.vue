<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">Добавить сингл</div>
        </q-card-section>
  
        <q-card-section class="q-pt-none">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.title"
              label="Название *"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
  
            <q-input
              v-model.number="form.duration"
              label="Длительность (секунды) *"
              type="number"
              outlined
              :rules="[
                val => !!val || 'Обязательное поле',
                val => val > 0 || 'Должно быть больше 0'
              ]"
            />
  
            <q-input
              v-model="form.releaseDate"
              label="Дата релиза *"
              type="date"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
  
            <q-input
              v-model.number="form.chartPosition"
              label="Позиция в чарте"
              type="number"
              outlined
              :rules="[
                val => val === null || val === '' || val > 0 || 'Должно быть больше 0'
              ]"
            />
  
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Отмена" flat @click="close" />
              <q-btn label="Добавить" type="submit" color="primary" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useQuasar } from 'quasar'
  import type { Single } from '@/types/models'
  import { grammyApiService } from '@/services/api'
  import { buildSingleXml } from '@/utils/xmlParser'
  
  interface Props {
    modelValue: boolean
    bandId?: number | null
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': []
  }>()
  
  const $q = useQuasar()
  
  const saving = ref(false)
  
  const form = ref({
    title: '',
    duration: null as number | null,
    releaseDate: '',
    chartPosition: null as number | null
  })
  
  watch(() => props.modelValue, (newVal) => {
    if (newVal) {
      resetForm()
    }
  })
  
  function resetForm() {
    form.value = {
      title: '',
      duration: null,
      releaseDate: '',
      chartPosition: null
    }
  }
  
  async function onSubmit() {
    if (!props.bandId) {
      $q.notify({
        type: 'negative',
        message: 'ID группы не указан',
        position: 'top'
      })
      return
    }
  
    saving.value = true
    try {
      const singleData: Partial<Single> = {
        title: form.value.title,
        duration: form.value.duration!,
        releaseDate: form.value.releaseDate,
        chartPosition: form.value.chartPosition
      }
  
      const xml = buildSingleXml(singleData)
      await grammyApiService.addSingle(props.bandId, xml)
  
      $q.notify({
        type: 'positive',
        message: 'Сингл успешно добавлен',
        position: 'top'
      })
  
      emit('save')
      close()
    } catch (error) {
      console.error('Failed to add single:', error)
    } finally {
      saving.value = false
    }
  }
  
  function close() {
    emit('update:modelValue', false)
  }
  </script>