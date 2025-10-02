<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row justify-between items-center">
      <div class="text-h4">Music Bands</div>
      <q-btn 
        color="primary" 
        label="Создать группу" 
        icon="add"
        @click="showCreateDialog = true"
      />
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md">
          <q-input
            v-model="filterName"
            label="Название"
            outlined
            dense
            style="width: 200px"
          />
          <q-select
            v-model="filterGenre"
            :options="genreOptions"
            label="Жанр"
            outlined
            dense
            clearable
            style="width: 200px"
          />
          <q-btn 
            color="primary" 
            label="Применить" 
            @click="applyFilters"
          />
          <q-btn 
            color="grey" 
            label="Сбросить" 
            flat
            @click="resetFilters"
          />
        </div>
      </q-card-section>
    </q-card>

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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import type { MusicBand, MusicGenre } from '@/types/models'
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

const filterName = ref('')
const filterGenre = ref<MusicGenre | null>(null)
const genreOptions = ['PROGRESSIVE_ROCK', 'POP', 'MATH_ROCK']

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

const averageParticipants = ref(0)

async function loadBands() {
  loading.value = true
  try {
    const sort = buildSortParam()
    const filters = buildFiltersParam()
    
    const response = await bandsApi.getAll(
      pagination.value.page - 1,
      pagination.value.rowsPerPage,
      sort,
      filters
    )
    
    bands.value = response.bands
    console.log(bands.value)
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
  const filters: string[] = []
  
  if (filterName.value) {
    filters.push(`name:contains:${filterName.value}`)
  }
  
  if (filterGenre.value) {
    filters.push(`genre:eq:${filterGenre.value}`)
  }
  
  return filters
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
  filterName.value = ''
  filterGenre.value = null
  pagination.value.page = 1
  loadBands()
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