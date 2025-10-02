import type { MusicBand, PaginationInfo, BandsResponse, MusicGenre, Single, Participant } from '@/types/models'

function getTextContent(element: Element | null, selector: string): string | null {
  if (!element) return null
  const found = element.querySelector(selector)
  return found?.textContent || null
}

function getNumberContent(element: Element | null, selector: string): number | null {
  const text = getTextContent(element, selector)
  if (!text) return null
  const num = parseFloat(text)
  return isNaN(num) ? null : num
}

export function parseXmlBands(xmlString: string): BandsResponse {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  
  const bands: MusicBand[] = []
  const bandElements = xmlDoc.querySelectorAll('musicBand')
  
  bandElements.forEach(band => {
    const labelSales = getNumberContent(band, 'label sales')
    
    bands.push({
      id: getNumberContent(band, 'id'),
      name: getTextContent(band, 'name') || '',
      numberOfParticipants: getNumberContent(band, 'numberOfParticipants') || 0,
      albumsCount: getNumberContent(band, 'albumsCount'),
      genre: (getTextContent(band, 'genre') as MusicGenre) || 'POP',
      creationDate: getTextContent(band, 'creationDate'),
      coordinates: {
        x: getNumberContent(band, 'coordinates x'),
        y: getNumberContent(band, 'coordinates y') || 0
      },
      label: labelSales !== null ? { sales: labelSales } : null
    })
  })
  
  const pagination: PaginationInfo = {
    totalElements: getNumberContent(xmlDoc.documentElement, 'totalElements') || 0,
    totalPages: getNumberContent(xmlDoc.documentElement, 'totalPages') || 0,
    currentPage: getNumberContent(xmlDoc.documentElement, 'currentPage') || 0,
    pageSize: getNumberContent(xmlDoc.documentElement, 'pageSize') || 20
  }
  
  return { bands, pagination }
}

export function parseXmlBand(xmlString: string): MusicBand | null {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  const band = xmlDoc.querySelector('musicBand')
  
  if (!band) return null
  
  const labelSales = getNumberContent(band, 'label sales')
  
  return {
    id: getNumberContent(band, 'id'),
    name: getTextContent(band, 'name') || '',
    numberOfParticipants: getNumberContent(band, 'numberOfParticipants') || 0,
    albumsCount: getNumberContent(band, 'albumsCount'),
    genre: (getTextContent(band, 'genre') as MusicGenre) || 'POP',
    creationDate: getTextContent(band, 'creationDate'),
    coordinates: {
      x: getNumberContent(band, 'coordinates x'),
      y: getNumberContent(band, 'coordinates y') || 0
    },
    label: labelSales !== null ? { sales: labelSales } : null
  }
}

export function buildBandXml(band: Partial<MusicBand>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?><musicBand>'
  
  if (band.name) xml += `<name>${band.name}</name>`
  
  if (band.coordinates) {
    xml += '<coordinates>'
    if (band.coordinates.x !== null && band.coordinates.x !== undefined) {
      xml += `<x>${band.coordinates.x}</x>`
    }
    xml += `<y>${band.coordinates.y}</y>`
    xml += '</coordinates>'
  }
  
  if (band.numberOfParticipants) {
    xml += `<numberOfParticipants>${band.numberOfParticipants}</numberOfParticipants>`
  }
  
  if (band.albumsCount) {
    xml += `<albumsCount>${band.albumsCount}</albumsCount>`
  }
  
  if (band.genre) {
    xml += `<genre>${band.genre}</genre>`
  }
  
  if (band.label?.sales) {
    xml += `<label><sales>${band.label.sales}</sales></label>`
  }
  
  xml += '</musicBand>'
  return xml
}

export function buildSingleXml(single: Partial<Single>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?><single>'
  
  if (single.title) xml += `<title>${single.title}</title>`
  if (single.duration) xml += `<duration>${single.duration}</duration>`
  if (single.releaseDate) xml += `<releaseDate>${single.releaseDate}</releaseDate>`
  if (single.chartPosition) xml += `<chartPosition>${single.chartPosition}</chartPosition>`
  
  xml += '</single>'
  return xml
}

export function buildParticipantXml(participant: Partial<Participant>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?><participant>'
  
  if (participant.name) xml += `<n>${participant.name}</n>`
  if (participant.role) xml += `<role>${participant.role}</role>`
  if (participant.joinDate) xml += `<joinDate>${participant.joinDate}</joinDate>`
  if (participant.instrument) xml += `<instrument>${participant.instrument}</instrument>`
  
  xml += '</participant>'
  return xml
}