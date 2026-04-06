export type CyberPugAttribute = {
  label: string
  value: string
}

export type CyberPug = {
  id: string
  name: string
  callsign: string
  designation: string
  image: string
  attributes: CyberPugAttribute[]
}
