<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? 'Редактировать группу' : 'Создать группу' }}</div>
        </q-card-section>
  
        <q-card-section class="q-pt-none">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Название *"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
  
            <q-select
              v-model="form.genre"
              :options="genreOptions"
              label="Жанр *"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
  
            <q-input
              v-model.number="form.numberOfParticipants"
              label="Количество участников *"
              type="number"
              outlined
              :rules="[
                val => !!val || 'Обязательное поле',
                val => val > 0 || 'Должно быть больше 0'
              ]"
            />
  
            <q-input
              v-model.number="form.albumsCount"
              label="Количество альбомов"
              type="number"
              outlined
              :rules="[
                val => val === null || val === '' || val > 0 || 'Должно быть больше 0'
              ]"
            />
  
            <div class="text-subtitle2">Координаты *</div>
            <div class="row q-gutter-md">
              <q-input
                v-model.number="form.coordinates.x"
                label="X"
                type="number"
                outlined
                style="width: 200px"
              />
              <q-input
                v-model.number="form.coordinates.y"
                label="Y *"
                type="number"
                outlined
                style="width: 200px"
                :rules="[
                  val => val !== null && val !== '' || 'Обязательное поле',
                  val => val <= 945 || 'Должно быть не больше 945'
                ]"
              />
            </div>
  
            <div class="text-subtitle2">Лейбл (опционально)</div>
            <q-input
              v-model.number="form.labelSales"
              label="Продажи"
              type="number"
              outlined
              :rules="[
                val => val === null || val === '' || val > 0 || 'Должно быть больше 0'
              ]"
            />
  
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Отмена" flat @click="close" />
              <q-btn label="Сохранить" type="submit" color="primary" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useQuasar } from 'quasar'
  import type { MusicBand } from '@/types/models'
  import { MusicGenre } from '@/types/models'
  import { bandsApi } from '@/services/api'
  import { buildBandXml } from '@/utils/xmlParser'
  
  interface Props {
    modelValue: boolean
    band?: MusicBand | null
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': []
  }>()
  
  const $q = useQuasar()
  
  const saving = ref(false)
  const genreOptions: MusicGenre[] = [MusicGenre.PROGRESSIVE_ROCK, MusicGenre.POP, MusicGenre.MATH_ROCK]
  
  const form = ref({
    name: '',
    genre: null as MusicGenre | null,
    numberOfParticipants: null as number | null,
    albumsCount: null as number | null,
    coordinates: {
      x: null as number | null,
      y: null as number | null
    },
    labelSales: null as number | null
  })
  
  const isEdit = computed(() => !!props.band?.id)
  
  watch(() => props.modelValue, (newVal) => {
    if (newVal) {
      if (props.band) {
        form.value = {
          name: props.band.name,
          genre: props.band.genre,
          numberOfParticipants: props.band.numberOfParticipants,
          albumsCount: props.band.albumsCount,
          coordinates: {
            x: props.band.coordinates.x,
            y: props.band.coordinates.y
          },
          labelSales: props.band.label?.sales || null
        }
      } else {
        resetForm()
      }
    }
  })
  
  function resetForm() {
    form.value = {
      name: '',
      genre: null,
      numberOfParticipants: null,
      albumsCount: null,
      coordinates: {
        x: null,
        y: null
      },
      labelSales: null
    }
  }
  
  async function onSubmit() {
    saving.value = true
    try {
      const bandData: Partial<MusicBand> = {
        name: form.value.name,
        genre: form.value.genre!,
        numberOfParticipants: form.value.numberOfParticipants!,
        albumsCount: form.value.albumsCount,
        coordinates: {
          x: form.value.coordinates.x,
          y: form.value.coordinates.y!
        },
        label: form.value.labelSales ? { sales: form.value.labelSales } : null
      }
  
      const xml = buildBandXml(bandData)
  
      if (isEdit.value && props.band?.id) {
        await bandsApi.update(props.band.id, xml)
        $q.notify({
          type: 'positive',
          message: 'Группа успешно обновлена',
          position: 'top'
        })
      } else {
        await bandsApi.create(xml)
        $q.notify({
          type: 'positive',
          message: 'Группа успешно создана',
          position: 'top'
        })
      }
  
      emit('save')
      close()
    } catch (error) {
      console.error('Failed to save band:', error)
    } finally {
      saving.value = false
    }
  }
  
  function close() {
    emit('update:modelValue', false)
  }
  </script>