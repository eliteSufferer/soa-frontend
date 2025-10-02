export interface Coordinates {
    x: number | null
    y: number
  }
  
  export interface Label {
    sales: number | null
  }
  
  export enum MusicGenre {
    PROGRESSIVE_ROCK = 'PROGRESSIVE_ROCK',
    POP = 'POP',
    MATH_ROCK = 'MATH_ROCK'
  }
  
  export interface MusicBand {
    id: number | null
    name: string
    coordinates: Coordinates
    creationDate: string | null
    numberOfParticipants: number
    albumsCount: number | null
    genre: MusicGenre
    label: Label | null
  }
  
  export interface PaginationInfo {
    totalElements: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
  
  export interface BandsResponse {
    bands: MusicBand[]
    pagination: PaginationInfo
  }
  
  export interface Single {
    id: number | null
    title: string
    duration: number
    releaseDate: string
    chartPosition: number | null
    bandId: number | null
  }
  
  export interface Participant {
    id: number | null
    name: string
    role: string
    joinDate: string
    instrument: string | null
    bandId: number | null
  }
  
  export interface ApiError {
    code: number
    message: string
    details: string
    timestamp?: string
  }