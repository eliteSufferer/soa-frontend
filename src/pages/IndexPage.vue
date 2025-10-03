<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row justify-between items-center">
      <div class="text-h4">Music Bands</div>
      <q-btn 
        color="primary" 
        label="Создать группу" 
        icon="add"
        @click="openCreateDialog"
      />
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Статистика</div>
      </q-card-section>
      <q-card-section class="row q-gutter-md">
        <div class="col">
          <div class="text-caption text-grey">Всего групп</div>
          <div class="text-h4">{{ pagination.rowsNumber }}</div>
        </div>
        <div class="col">
          <div class="text-caption text-grey">Среднее кол-во участников</div>
          <div class="text-h4">{{ averageParticipants.toFixed(1) }}</div>
        </div>
      </q-card-section>
    </q-card>

<q-card class="q-mb-md">
  <q-expansion-item
    icon="filter_alt"
    label="Фильтры"
    :caption="activeFiltersCount > 0 ? `Активных: ${activeFiltersCount}` : 'Нажмите, чтобы развернуть'"
    default-opened
  >
    <q-card-section>
      <div class="q-gutter-md">
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="filters.name.value"
            label="Название"
            outlined
            dense
            style="width: 250px"
          />
          <q-select
            v-model="filters.name.operator"
            :options="stringOperators"
            outlined
            dense
            style="width: 150px"
            emit-value
            map-options
          />
        </div>

        <div class="row q-gutter-sm items-center">
          <q-select
            v-model="filters.genre.value"
            :options="genreOptions"
            label="Жанр"
            outlined
            dense
            clearable
            style="width: 250px"
          />
          <q-select
            v-model="filters.genre.operator"
            :options="equalityOperators"
            outlined
            dense
            style="width: 150px"
            emit-value
            map-options
          />
        </div>

        <div class="row q-gutter-sm items-center">
          <q-input
            v-model.number="filters.numberOfParticipants.value"
            label="Количество участников"
            type="number"
            outlined
            dense
            style="width: 250px"
          />
          <q-select
            v-model="filters.numberOfParticipants.operator"
            :options="numericOperators"
            outlined
            dense
            style="width: 150px"
            emit-value
            map-options
          />
        </div>

        <div class="row q-gutter-sm items-center">
          <q-input
            v-model.number="filters.albumsCount.value"
            label="Количество альбомов"
            type="number"
            outlined
            dense
            style="width: 250px"
          />
          <q-select
            v-model="filters.albumsCount.operator"
            :options="numericOperators"
            outlined
            dense
            style="width: 150px"
            emit-value
            map-options
          />
        </div>

        <div class="row q-gutter-sm items-center">
          <q-input
            v-model.number="filters.coordinatesX.value"
            label="Координата X"
            type="number"
            outlined
            dense
            style="width: 250px"
          />
          <q-select
            v-model="filters.coordinatesX.operator"
            :options="numericOperators"
            outlined
            dense
            style="width: 150px"
            emit-value
            map-options
          />
        </div>

        <div class="row q-gutter-sm items-center">
          <q-input
            v-model.number="filters.coordinatesY.value"
            label="Координата Y"
            type="number"
            outlined
            dense
            style="width: 250px"
          />
          <q-select
            v-model="filters.coordinatesY.operator"
            :options="numericOperators"
            outlined
            dense
            style="width: 150px"
            emit-value
            map-options
          />
        </div>

        <div class="row q-gutter-sm items-center">
          <q-input
            v-model.number="filters.labelSales.value"
            label="Продажи"
            type="number"
            outlined
            dense
            style="width: 250px"
          />
          <q-select
            v-model="filters.labelSales.operator"
            :options="numericOperators"
            outlined
            dense
            style="width: 150px"
            emit-value
            map-options
          />
        </div>

        <div class="row q-gutter-sm q-mt-md">
          <q-btn 
            color="primary" 
            label="Применить фильтры" 
            icon="filter_alt"
            @click="applyFilters"
          />
          <q-btn 
            color="grey" 
            label="Сбросить все" 
            flat
            @click="resetFilters"
          />
        </div>
      </div>
    </q-card-section>
  </q-expansion-item>
</q-card>

    <q-table
      :rows="bands"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      binary-state-sort
    >
    <template v-slot:no-data>
      <div class="full-width justify-center items-center">
        <div class="column justify-center items-center">
          <div class="text-h6">Нет данных</div>
          <q-icon name="sentiment_dissatisfied" size="40px" />
        </div>
      
      </div>
    </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            round
            icon="edit"
            color="primary"
            @click="editBand(props.row)"
            @mouseenter.stop
            @mouseleave.stop
          >
            <q-tooltip>Редактировать</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click="confirmDelete(props.row)"
            @mouseenter.stop
            @mouseleave.stop
          >
            <q-tooltip>Удалить</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="music_note"
            color="purple"
            label=""
            @click="addSingle(props.row)"
            @mouseenter.stop
            @mouseleave.stop
          > 
            <q-tooltip>Добавить сингл</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="person_add"
            color="green"
            @click="addParticipant(props.row)"
            @mouseenter.stop
            @mouseleave.stop
          >
            <q-tooltip>Добавить участника</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:body-cell-genre="props">
        <q-td :props="props">
          <q-badge :color="getGenreColor(props.value)">
            {{ formatGenre(props.value) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-coordinates="props">
        <q-td :props="props">
          ({{ props.row.coordinates.x || 0 }}, {{ props.row.coordinates.y }})
        </q-td>
      </template>

      <template v-slot:body-cell-label="props">
        <q-td :props="props">
          {{ props.row.label?.sales || '-' }}
        </q-td>
      </template>
    </q-table>

    <BandDialog
      v-model="showCreateDialog"
      :band="selectedBand"
      @save="handleSaveBand"
    />

    <SingleDialog
      v-model="showSingleDialog"
      :band-id="selectedBand?.id"
      @save="handleAddSingle"
    />

    <ParticipantDialog
      v-model="showParticipantDialog"
      :band-id="selectedBand?.id"
      @save="handleAddParticipant"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import type { MusicBand } from '@/types/models'
import { MusicGenre } from '@/types/models'
import { bandsApi } from '@/services/api'
import BandDialog from '@/components/BandDialog.vue'
import SingleDialog from '@/components/SingleDialog.vue'
import ParticipantDialog from '@/components/ParticipantDialog.vue'

const $q = useQuasar()

const bands = ref<MusicBand[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showSingleDialog = ref(false)
const showParticipantDialog = ref(false)
const selectedBand = ref<MusicBand | null>(null)
const averageParticipants = ref(0)

const stringOperators = [
  { label: 'Содержит', value: 'contains' },
  { label: 'Равно', value: 'eq' },
  { label: 'Не равно', value: 'ne' }
]

const numericOperators = [
  { label: 'Равно', value: 'eq' },
  { label: 'Не равно', value: 'ne' },
  { label: 'Больше', value: 'gt' },
  { label: 'Больше или равно', value: 'gte' },
  { label: 'Меньше', value: 'lt' },
  { label: 'Меньше или равно', value: 'lte' }
]

const equalityOperators = [
  { label: 'Равно', value: 'eq' },
  { label: 'Не равно', value: 'ne' }
]

const genreOptions: MusicGenre[] = [MusicGenre.PROGRESSIVE_ROCK, MusicGenre.POP, MusicGenre.MATH_ROCK]

const filters = ref({
  name: {
    value: '',
    operator: 'contains' as string
  },
  genre: {
    value: null as MusicGenre | null,
    operator: 'eq' as string
  },
  numberOfParticipants: {
    value: null as number | null,
    operator: 'eq' as string
  },
  albumsCount: {
    value: null as number | null,
    operator: 'gte' as string
  },
  coordinatesX: {
    value: null as number | null,
    operator: 'eq' as string
  },
  coordinatesY: {
    value: null as number | null,
    operator: 'eq' as string
  },
  labelSales: {
    value: null as number | null,
    operator: 'gt' as string
  }
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.name.value) count++
  if (filters.value.genre.value) count++
  if (filters.value.numberOfParticipants.value !== null) count++
  if (filters.value.albumsCount.value !== null) count++
  if (filters.value.coordinatesX.value !== null) count++
  if (filters.value.coordinatesY.value !== null) count++
  if (filters.value.labelSales.value !== null) count++
  return count
})

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'name',
    label: 'Название',
    field: 'name',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'genre',
    label: 'Жанр',
    field: 'genre',
    sortable: true,
    align: 'center' as const
  },
  {
    name: 'numberOfParticipants',
    label: 'Участники',
    field: 'numberOfParticipants',
    sortable: true,
    align: 'center' as const
  },
  {
    name: 'albumsCount',
    label: 'Альбомы',
    field: 'albumsCount',
    sortable: true,
    align: 'center' as const
  },
  {
    name: 'coordinates',
    label: 'Координаты',
    field: 'coordinates',
    align: 'center' as const
  },
  {
    name: 'label',
    label: 'Продажи',
    field: 'label',
    sortable: true,
    align: 'center' as const
  },
  {
    name: 'creationDate',
    label: 'Дата создания',
    field: 'creationDate',
    sortable: true,
    align: 'center' as const
  },
  {
    name: 'actions',
    label: 'Действия',
    field: 'actions',
    align: 'center' as const
  }
]

onMounted(() => {
  loadBands()
})

async function loadBands() {
  loading.value = true
  try {
    const sort = buildSortParam()
    const filterParams = buildFiltersParam()
    
    
    const response = await bandsApi.getAll(
      pagination.value.page - 1,
      pagination.value.rowsPerPage,
      sort,
      filterParams
    )
    
    bands.value = response.bands
    pagination.value.rowsNumber = response.pagination.totalElements
    
    loadStatistics()
  } catch (error) {
    console.error('Failed to load bands:', error)
  } finally {
    loading.value = false
  }
}

async function loadStatistics() {
  try {
    const stats = await bandsApi.getAverageParticipants()
    averageParticipants.value = stats.average
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

function buildSortParam(): string[] {
  if (!pagination.value.sortBy) return []
  const direction = pagination.value.descending ? 'desc' : 'asc'
  return [`${pagination.value.sortBy},${direction}`]
}

function buildFiltersParam(): string[] {
  const filterParams: string[] = []
  
  if (filters.value.name.value) {
    filterParams.push(`name:${filters.value.name.operator}:${filters.value.name.value}`)
  }
  
  if (filters.value.genre.value) {
    filterParams.push(`genre:${filters.value.genre.operator}:${filters.value.genre.value}`)
  }
  
  if (filters.value.numberOfParticipants.value !== null && filters.value.numberOfParticipants.value !== undefined) {
    filterParams.push(`numberOfParticipants:${filters.value.numberOfParticipants.operator}:${filters.value.numberOfParticipants.value}`)
  }
  
  if (filters.value.albumsCount.value !== null && filters.value.albumsCount.value !== undefined) {
    filterParams.push(`albumsCount:${filters.value.albumsCount.operator}:${filters.value.albumsCount.value}`)
  }
  
  if (filters.value.coordinatesX.value !== null && filters.value.coordinatesX.value !== undefined) {
    filterParams.push(`coordinates.x:${filters.value.coordinatesX.operator}:${filters.value.coordinatesX.value}`)
  }
  
  if (filters.value.coordinatesY.value !== null && filters.value.coordinatesY.value !== undefined) {
    filterParams.push(`coordinates.y:${filters.value.coordinatesY.operator}:${filters.value.coordinatesY.value}`)
  }
  
  if (filters.value.labelSales.value !== null && filters.value.labelSales.value !== undefined) {
    filterParams.push(`label.sales:${filters.value.labelSales.operator}:${filters.value.labelSales.value}`)
  }
  
  return filterParams
}

function onRequest(props: any) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  
  loadBands()
}

function applyFilters() {
  pagination.value.page = 1
  loadBands()
}

function resetFilters() {
  filters.value = {
    name: { value: '', operator: 'contains' },
    genre: { value: null, operator: 'eq' },
    numberOfParticipants: { value: null, operator: 'eq' },
    albumsCount: { value: null, operator: 'gte' },
    coordinatesX: { value: null, operator: 'eq' },
    coordinatesY: { value: null, operator: 'eq' },
    labelSales: { value: null, operator: 'gt' }
  }
  pagination.value.page = 1
  loadBands()
}

function openCreateDialog() {
  selectedBand.value = null
  showCreateDialog.value = true
}

function editBand(band: MusicBand) {
  selectedBand.value = band
  showCreateDialog.value = true
}

function addSingle(band: MusicBand) {
  selectedBand.value = band
  showSingleDialog.value = true
}

function addParticipant(band: MusicBand) {
  selectedBand.value = band
  showParticipantDialog.value = true
}

function confirmDelete(band: MusicBand) {
  $q.dialog({
    title: 'Подтверждение',
    message: `Вы уверены, что хотите удалить группу "${band.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      if (band.id) {
        await bandsApi.delete(band.id)
        $q.notify({
          type: 'positive',
          message: 'Группа успешно удалена',
          position: 'top'
        })
        loadBands()
      }
    } catch (error) {
      console.error('Failed to delete band:', error)
    }
  })
}

async function handleSaveBand() {
  showCreateDialog.value = false
  selectedBand.value = null
  await loadBands()
}

async function handleAddSingle() {
  showSingleDialog.value = false
  selectedBand.value = null
  await loadBands()
}

async function handleAddParticipant() {
  showParticipantDialog.value = false
  selectedBand.value = null
  await loadBands()
}

function formatGenre(genre: string): string {
  return genre.replace(/_/g, ' ')
}

function getGenreColor(genre: string): string {
  const colors: Record<string, string> = {
    'PROGRESSIVE_ROCK': 'purple',
    'POP': 'pink',
    'MATH_ROCK': 'orange'
  }
  return colors[genre] || 'grey'
}
</script>