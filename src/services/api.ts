import axios, { AxiosInstance } from 'axios'
import type { BandsResponse, MusicBand } from '@/types/models'
import { parseXmlBands, parseXmlBand } from '@/utils/xmlParser'

const isDev = import.meta.env.DEV


const mainApi: AxiosInstance = axios.create({
  baseURL: isDev ? '/api/v1' : '/api/v1',
  headers: {
    'Content-Type': 'application/xml',
    'Accept': 'application/xml'
  }
})

const grammyApi: AxiosInstance = axios.create({
  baseURL: isDev ? '/grammy/band' : 'https://localhost:8181/grammy/band',
  headers: {
    'Content-Type': 'application/xml',
    'Accept': 'application/xml'
  }
})

function handleError(error: any): never {
  let message = 'Произошла ошибка'
  
  if (error.response?.data) {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(error.response.data, 'text/xml')
      const errorMessage = xmlDoc.querySelector('message')?.textContent
      const errorDetails = xmlDoc.querySelector('details')?.textContent
      
      message = errorMessage || message
      if (errorDetails) message += ': ' + errorDetails
    } catch {
      message = 'Ошибка обработки ответа сервера'
    }
  } else if (error.message) {
    message = error.message
  }
  
  console.error('API Error:', message)
  
  throw error
}

mainApi.interceptors.response.use(
  response => response,
  error => handleError(error)
)

grammyApi.interceptors.response.use(
  response => response,
  error => handleError(error)
)

export const bandsApi = {
  async getAll(page = 0, size = 20, sort: string[] = [], filters: string[] = []): Promise<BandsResponse> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('size', size.toString())
    sort.forEach(s => params.append('sort', s))
    filters.forEach(f => params.append('filter', f))
    
    const response = await mainApi.get(`/bands?${params.toString()}`)
    return parseXmlBands(response.data)
  },
  
  async getById(id: number): Promise<MusicBand | null> {
    const response = await mainApi.get(`/bands/${id}`)
    return parseXmlBand(response.data)
  },
  
  async create(xml: string): Promise<MusicBand | null> {
    const response = await mainApi.post('/bands', xml)
    return parseXmlBand(response.data)
  },
  
  async update(id: number, xml: string): Promise<MusicBand | null> {
    const response = await mainApi.put(`/bands/${id}`, xml)
    return parseXmlBand(response.data)
  },
  
  async patch(id: number, xml: string): Promise<MusicBand | null> {
    const response = await mainApi.patch(`/bands/${id}`, xml)
    return parseXmlBand(response.data)
  },
  
  async delete(id: number): Promise<void> {
    await mainApi.delete(`/bands/${id}`)
  },
  
  async getAverageParticipants(): Promise<{ average: number, total: number }> {
    const response = await mainApi.get('/bands/statistics/average-participants')
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(response.data, 'text/xml')
    
    return {
      average: parseFloat(xmlDoc.querySelector('averageParticipants')?.textContent || '0'),
      total: parseInt(xmlDoc.querySelector('totalBands')?.textContent || '0')
    }
  }
}

export const grammyApiService = {
  async addSingle(bandId: number, xml: string): Promise<void> {
    await grammyApi.post(`/${bandId}/singles/add`, xml)
  },
  
  async addParticipant(bandId: number, xml: string): Promise<void> {
    await grammyApi.post(`/${bandId}/participants/add`, xml)
  }
}