/**
 * Properties of an organization
 */
export interface Organization {
    organization_id: number
    name: string
    email: string
    phone: string
    website: string
    address: string
    org_type: string
    activity_areas: string
}

export interface OrganizationPaginated {
  next: string
  previous: string
  count: number
  page_size: number
  results: Organization[]
}

export const ORG_TYPES = [
    {
      name: "Partenaire technique et financier",
      value: "tech_fin_partner"
    },
    {
      name: "Organisme public",
      value: "public"
    },
    {
      name: "ONG",
      value: "ngo"
    },
    {
      name: "Projet - Programme",
      value: "project"
    },
    {
      name: "Bureau d'étude",
      value: "design_office"
    },
    {
      name: "Entreprise",
      value: "enterprise"
    },
    {
      name: "Association",
      value: "association"
    },

  ]
