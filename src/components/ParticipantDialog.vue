<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">Добавить участника</div>
        </q-card-section>
  
        <q-card-section class="q-pt-none">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Имя *"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
  
            <q-input
              v-model="form.role"
              label="Роль *"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
  
            <q-input
              v-model="form.joinDate"
              label="Дата присоединения *"
              type="date"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
  
            <q-input
              v-model="form.instrument"
              label="Инструмент"
              outlined
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
  import type { Participant } from '@/types/models'
  import { grammyApiService } from '@/services/api'
  import { buildParticipantXml } from '@/utils/xmlParser'
  
  interface Props {
    modelValue: boolean
    bandId?: number | null | undefined
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': []
  }>()
  
  const $q = useQuasar()
  
  const saving = ref(false)
  
  const form = ref({
    name: '',
    role: '',
    joinDate: '',
    instrument: ''
  })
  
  watch(() => props.modelValue, (newVal) => {
    if (newVal) {
      resetForm()
    }
  })
  
  function resetForm() {
    form.value = {
      name: '',
      role: '',
      joinDate: '',
      instrument: ''
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
      const participantData: Partial<Participant> = {
        name: form.value.name,
        role: form.value.role,
        joinDate: form.value.joinDate,
        instrument: form.value.instrument || null
      }
  
      const xml = buildParticipantXml(participantData)
      await grammyApiService.addParticipant(props.bandId, xml)
  
      $q.notify({
        type: 'positive',
        message: 'Участник успешно добавлен',
        position: 'top'
      })
  
      emit('save')
      close()
    } catch (error) {
      console.error('Failed to add participant:', error)
    } finally {
      saving.value = false
    }
  }
  
  function close() {
    emit('update:modelValue', false)
  }
  </script>